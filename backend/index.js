import express from "express";
import multer from "multer";
import pdf from "pdf-parse-new";
import dotenv from "dotenv";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "@langchain/core/prompts";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import router from "./routes/userRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
const PORT = process.env.PORT;
app.use(cors({
  origin: `${process.env.FRONTEND_API}`, 
  credentials: true, 
}));

// Multer setup: use memory storage to access file as a buffer
const storage = multer.memoryStorage();
const upload = multer({ storage });

mongoose
  .connect(process.env.URI)
  .then((data) => console.log(`Mongodb Connected...`))
  .catch((e) => console.log(`Something went wrong ` + e));

// LangChain + Gemini setup
const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0,
  apiKey: process.env.GOOGLE_API_KEY,
});

// Prompt templates
const summaryPrompt = new PromptTemplate({
  template: `You are a helpful assistant. Given the following extracted PDF text, generate a concise summary:\n\n{text}\n\nSummary:`,
  inputVariables: ["text"],
});

const faqsPrompt = new PromptTemplate({
  template: `You are a helpful assistant. Based on the following PDF text, generate a list of maximum frequently asked questions with answers in **pure JSON** format.

Rules:
- Do not include any explanation or extra text.
- Output ONLY a JSON array.
- Do not wrap the response in \`\`\`json or \`\`\`.
- Use this format exactly:

[
  {{
    "faq_id": 1,
    "question": "What is ...?",
    "answer": "..."
  }},
  ...
]

Text:
{text}`,
  inputVariables: ["text"],
});

const summaryChain = new LLMChain({ llm: model, prompt: summaryPrompt });
const faqsChain = new LLMChain({ llm: model, prompt: faqsPrompt });

// === Upload Endpoint ===
app.post("/upload", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded." });

    // Extract PDF text from uploaded buffer
    const data = await pdf(req.file.buffer);
    const pdfText = data.text;

    // Generate summary and FAQs
    const summaryResponse = await summaryChain.call({ text: pdfText });
    const faqsResponse = await faqsChain.call({ text: pdfText });

    const cleanJsonOutput = (raw) =>
      raw
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    let faqsJson = [];
    try {
      faqsJson = JSON.parse(cleanJsonOutput(faqsResponse.text));
      if (!Array.isArray(faqsJson)) throw new Error("Not an array");
    } catch (err) {
      console.warn("JSON parse failed, returning raw text.");
      faqsJson = [
        {
          faq_id: 1,
          question: "FAQs could not be generated correctly.",
          answer: faqsResponse.text.trim(),
        },
      ];
    }

    res.json({
      summary: summaryResponse.text.trim(),
      faqs: faqsJson,
    });
  } catch (err) {
    console.error("Processing error:", err);
    res.status(500).json({ error: "Failed to process uploaded PDF." });
  }
});

app.use("/api", router);


app.listen(PORT, () => {
  console.log(`✅ Server running at ${PORT}`);
});
