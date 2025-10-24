export const runtime = "nodejs";
import "dotenv/config";
import { promises as fs } from "fs";
import path from "path";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

export async function POST(req) {
  try {
    // Parse form data (multipart/form-data)
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return new Response(
        JSON.stringify({ status: "error", message: "No PDF file uploaded" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Save uploaded PDF temporarily
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempDir = path.join(process.cwd(), "temp_uploads");
    await fs.mkdir(tempDir, { recursive: true });

    const filePath = path.join(tempDir, file.name);
    await fs.writeFile(filePath, buffer);

    // Load PDF content using LangChain loader
    const loader = new PDFLoader(filePath);
    const docs = await loader.load();

    // Initialize embeddings
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_API_KEY,
      model: "text-embedding-004",
    });

    // Store embeddings in Qdrant
    await QdrantVectorStore.fromDocuments(docs, embeddings, {
      url: process.env.QDRANT_URL,
      collectionName: "pdf-store",
    });

    // Delete temp file after processing
    await fs.unlink(filePath);

    return new Response(
      JSON.stringify({
        status: "success",
        message: "PDF file indexed successfully!",
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("UploadPDF Error:", error);
    return new Response(
      JSON.stringify({
        status: "error",
        message: error.message || "Failed to process PDF",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
