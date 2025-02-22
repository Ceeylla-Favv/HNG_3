const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

let genAI;

const formatMessage = async (message) => {
  try {
    if (!genAI) {
      genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }

       const prompt = `
You are an AI that extracts scheduling details from messages.
If the message is about scheduling, return this JSON format:

{
  "content": "The actual message to be sent",
  "recipient": "A valid email or phone number (if missing, infer from message or use 'default@recipient.com')",
  "sendAt": "A valid future UTC date-time in YYYY-MM-DD HH:mm:ss format"
}

**Rules:**
1. Convert any mentioned time to **UTC**.
2. If no date is given, assume it is **today** at the mentioned time.
3. **If the time is already in the past, schedule it for tomorrow.**
4. If no time is given, schedule it for **the next hour**.
5. **If no recipient is explicitly mentioned, use 'default@recipient.com'.**

**Current Date:** ${new Date().toISOString().split("T")[0]} (YYYY-MM-DD)

Also, generate a confirmation message:
{
  "confirmationMessage": "Your message ('{content}') has been scheduled for {sendAt} UTC."
}

**If the message is NOT about scheduling, return:**
{
  "originalMessage": "<user's original message>"
}

<userMessage>${message}</userMessage>
`;
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const analysisText = response.text();

    console.log("Raw AI response:", analysisText);

    let parsedResponse;

   
    const firstJsonMatch = analysisText.match(/\{[\s\S]*?\}/);
    if (!firstJsonMatch) {
      console.error("No valid JSON found in AI response");
      return { originalMessage: message };
    }

    try {
      parsedResponse = JSON.parse(firstJsonMatch[0].trim()); 
    } catch (error) {
      console.error("JSON Parsing Error:", error);
      console.error("Faulty AI Response:", analysisText);
      return { originalMessage: message };
    }

    console.log("Parsed response:", parsedResponse);

    if (!parsedResponse.recipient) {
      parsedResponse.recipient = "default@recipient.com";
    }

    if (
      parsedResponse.content &&
      parsedResponse.recipient &&
      parsedResponse.sendAt
    ) {
      return {
        content: parsedResponse.content,
        recipient: parsedResponse.recipient,
        sendAt: parsedResponse.sendAt,
        confirmationMessage: `Your message ('${parsedResponse.content}') has been scheduled for ${parsedResponse.sendAt}.`,
      };
    }

    return { originalMessage: message };
  } catch (error) {
    console.error("Error formatting message:", error);
    return { originalMessage: message };
  }
};

module.exports = formatMessage;
