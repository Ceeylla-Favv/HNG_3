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
  "recipient": "A valid email (if missing, infer from message or use 'default@recipient.com')",
  "sendAt": "A valid future UTC date-time in YYYY-MM-DD HH:mm:ss UTC"
}

**Rules:**
1. Extract the recipient’s **exact email or phone number** from the message **without changing it**.
2. If the email is missing, infer it but do NOT modify an explicitly mentioned email.
3. Convert any mentioned time to **UTC**.
4. If no date is given, assume it is **today** at the mentioned time.
5. **If the time is already in the past, schedule it for tomorrow.**
6. If no time is given, schedule it for **the next hour**.
7. Convert **sendAt** to **a human-readable confirmation message**.
8. **If no recipient is found, use 'default@recipient.com'.**


**Examples:**  
✅ "Remind Sarah at 3 PM to complete the project." → {"recipient": "sarah@example.com"}  
✅ "Send a message to John tomorrow at 10 AM." → {"recipient": "john@company.com"}  
✅ "Schedule a reminder for me at 5 PM." → {"recipient": "default@recipient.com"}  

**Current Date:** ${new Date().toISOString().split("T")[0]} (YYYY-MM-DD)

Also, generate a confirmation message:
{
  "confirmationMessage": "Your message ('{content}') to ('{recipient'}) has been scheduled for {sendAt} UTC."
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
        confirmationMessage: `Your message ('${parsedResponse.content}') to ('${parsedResponse.recipient}') has been scheduled for ${parsedResponse.sendAt}.`,
      };
    }

    return { originalMessage: message };
  } catch (error) {
    console.error("Error formatting message:", error);
    return { originalMessage: message };
  }
};

module.exports = formatMessage;
