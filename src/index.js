import express from 'express';
import dotenv from 'dotenv';
import { CURRENT_URL } from './constants.js';
import { Helper } from './lib/helper.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Basic Route
app.get("/", (req, res) => {
    res.send("Hello, World! Welcome to your Node.js server.");
});

app.post("/login/bot", async (req, res) => {
    let urlToBeLoggedIn = CURRENT_URL;
    try {
        let helperInstance = new Helper();
        let htmlData = await helperInstance.fetchPuppeteeHTML(urlToBeLoggedIn);
        console.log("Fetched HTML data - ", htmlData);
        res.status(200).send("HTML Fetched Successfully");
    } catch (err) {
        console.log("Error found in - ", err);
        res.status(500).send("Error fetching HTML");
    }
});

// Start the Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
