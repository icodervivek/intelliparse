import { NextResponse } from "next/server";
import pdf from "pdf-parse-new";
import OpenAI from "openai";

// Initialize Groq client
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export const runtime = "nodejs";

export async function POST(req) {
  try {
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

    // Generate Summary
    const summaryResponse = await client.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "user",
          content: `You are a document summarizer. Read the following text and write a concise paragraph summary in 4-5 sentences MAX. 
  
DO NOT list bullet points.
DO NOT copy the original text.
Write it as a flowing paragraph in your own words.
Focus only on the most important highlights.

Text:
${pdfText}

Summary:`,
        },
      ],
    });

    // Generate FAQs
    const faqsResponse = await client.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "user",
          content: `You are a helpful assistant. Based on the following PDF text, generate a list of maximum frequently asked questions with answers in pure JSON format.

Rules:
- Do not include any explanation or extra text.
- Output ONLY a JSON array.
- Do not wrap the response in \`\`\`json or \`\`\`.
- Use this format exactly:

[
  {
    "faq_id": 1,
    "question": "What is ...?",
    "answer": "..."
  }
]

Text:
${pdfText}`,
        },
      ],
    });

    // Clean and parse FAQs JSON
    const cleanJsonOutput = (raw) =>
      raw
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    let faqsJson = [];
    try {
      const rawFaqs = faqsResponse.choices[0].message.content;
      faqsJson = JSON.parse(cleanJsonOutput(rawFaqs));
      if (!Array.isArray(faqsJson)) throw new Error("Not an array");
    } catch (err) {
      console.warn("JSON parse failed, returning raw text.");
      faqsJson = [
        {
          faq_id: 1,
          question: "FAQs could not be generated correctly.",
          answer: faqsResponse.choices[0].message.content.trim(),
        },
      ];
    }

    return NextResponse.json({
      summary: summaryResponse.choices[0].message.content.trim(),
      faqs: faqsJson,
    });
  } catch (err) {
    console.error("Processing error:", err.response?.data || err.message);
    return NextResponse.json(
      { error: "Failed to process uploaded PDF." },
      { status: 500 },
    );
  }
}
