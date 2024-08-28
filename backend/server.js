require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

async function processIkigai(responses) {
    const prompt = `
    This person has provided the following responses about their Ikigai:
    1. Activities they lose track of time doing: ${responses[0]}
    2. Skills or talents they excel at: ${responses[1]}
    3. Values or causes that matter most to them: ${responses[2]}
    4. Change they would like to bring to the world: ${responses[3]}
    5. What they would do if money wasn't a concern: ${responses[4]}

    Based on these inputs, provide:
    1. A brief summary (2-3 sentences) of their Ikigai.
    2. A detailed analysis of their Ikigai, including:
       - How their passions align with their skills
       - How their values connect with potential career paths
       - Specific career recommendations
       - Steps they can take to align their life with their Ikigai

    Format your response as follows:
    SUMMARY:
    [Your brief summary here]

    DETAILED REPORT:
    [Your detailed analysis here]
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the response
    const summaryMatch = text.match(/SUMMARY:\s*([\s\S]*?)\s*DETAILED REPORT:/);
    const detailedReportMatch = text.match(/DETAILED REPORT:\s*([\s\S]*)/);

    return {
        summary: summaryMatch ? summaryMatch[1].trim() : "Summary not found.",
        detailed_report: detailedReportMatch ? detailedReportMatch[1].trim() : "Detailed report not found."
    };
}

app.post('/api/process-ikigai', async (req, res) => {
    try {
        const { responses } = req.body;
        
        if (!responses || responses.length !== 5) {
            return res.status(400).json({ message: "Invalid input. Please provide answers to all 5 questions." });
        }

        const ikigaiData = await processIkigai(responses);

        res.json({ 
            summary: ikigaiData.summary,
            detailed_report: ikigaiData.detailed_report
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: "An error occurred while processing your Ikigai. Please try again later." });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});