import { NextResponse } from "next/server";
import pdf from "pdf-parse-new";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "@langchain/core/prompts";

// Initialize LangChain + Gemini
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

export const runtime = "nodejs";

export async function POST(req) {
  try {
    // Parse the form data
    const formData = await req.formData();
    const file = formData.get("pdf");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    // Convert uploaded file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract PDF text
    const data = await pdf(buffer);
    const pdfText = data.text;

    // Generate summary and FAQs
    const summaryResponse = await summaryChain.call({ text: pdfText });
    const faqsResponse = await faqsChain.call({ text: pdfText });

    // Clean and parse JSON
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

    return NextResponse.json({
      summary: summaryResponse.text.trim(),
      faqs: faqsJson,
    });
  } catch (err) {
    console.error("Processing error:", err);
    return NextResponse.json(
      { error: "Failed to process uploaded PDF." },
      { status: 500 }
    );
  }
}
