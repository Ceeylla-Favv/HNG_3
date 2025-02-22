const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDb = require('./db/connectDb');
const router = require('./routes/scheduleRoutes');
const scheduleMessage = require('./services/scheduler');

dotenv.config();


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false}));


app.use(cors({
    origin: "*"
}));



app.use("/", router);

app.get('/', (req, res) => {
    res.status(200).json({ info: "API is working"})
});

const port = 4832;

app.listen(port, async () => {
    console.log(`server is working at port ${port}`);
    await connectDb();
    scheduleMessage();
})