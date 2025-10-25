export const runtime = "nodejs";
import "dotenv/config";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

export async function POST(req) {
  let filePath = null;
  
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

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return new Response(
        JSON.stringify({ status: "error", message: "Only PDF files are allowed" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Save uploaded PDF to /tmp directory (works in serverless environments)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Use OS temp directory or /tmp for serverless
    const tempDir = process.env.VERCEL ? "/tmp" : os.tmpdir();
    
    // Generate unique filename to avoid conflicts
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const safeFileName = `${timestamp}-${randomStr}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    filePath = path.join(tempDir, safeFileName);

    await fs.writeFile(filePath, buffer);

    // Load PDF content using LangChain loader
    const loader = new PDFLoader(filePath);
    const docs = await loader.load();

    if (!docs || docs.length === 0) {
      throw new Error("No content extracted from PDF");
    }

    // Initialize embeddings
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_API_KEY,
      model: "text-embedding-004",
    });

    // Validate Qdrant connection
    if (!process.env.QDRANT_URL) {
      throw new Error("QDRANT_URL environment variable is not set");
    }

    // Store embeddings in Qdrant
    await QdrantVectorStore.fromDocuments(docs, embeddings, {
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY, // Add if you're using Qdrant Cloud
      collectionName: "pdf-store",
    });

    return new Response(
      JSON.stringify({
        status: "success",
        message: "PDF file indexed successfully!",
        documentsProcessed: docs.length,
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
  } finally {
    // Clean up: Delete temp file after processing (success or failure)
    if (filePath) {
      try {
        await fs.unlink(filePath);
      } catch (cleanupError) {
        console.error("Failed to delete temp file:", cleanupError);
        // Don't throw - cleanup failure shouldn't break the response
      }
    }
  }
}