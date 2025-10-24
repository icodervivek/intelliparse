export const runtime = "nodejs";
import "dotenv/config";
import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Document } from "@langchain/core/documents";

export async function POST(req) {
  try {
    const data = await req.formData();
    const text = data.get("text");

    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ status: "error", message: "Text input is required" }),
        {
          headers: { "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Convert plain text into LangChain document format
    const docs = [new Document({ pageContent: text })];

    // Initialize embeddings model
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_API_KEY,
      model: "text-embedding-004",
    });

    // Store embedded text into Qdrant vector database
    await QdrantVectorStore.fromDocuments(docs, embeddings, {
      url: process.env.QDRANT_URL,
      collectionName: "text-store",
    });

    return new Response(
      JSON.stringify({
        status: "success",
        message: "Text indexed successfully!",
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("TextStore Error:", error);
    return new Response(
      JSON.stringify({
        status: "error",
        message: error.message || "Failed to process text input",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
}
