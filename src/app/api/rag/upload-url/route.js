export const runtime = "nodejs";
import "dotenv/config";
import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";

export async function POST(req) {
  try {
    const data = await req.formData();
    const url = data.get("url");

    if (!url) {
      return new Response(
        JSON.stringify({ status: "error", message: "URL is required" }),
        {
          headers: { "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Validate URL format
    let validUrl;
    try {
      validUrl = new URL(url.toString());
      if (!validUrl.protocol.startsWith('http')) {
        throw new Error('Invalid protocol');
      }
    } catch {
      return new Response(
        JSON.stringify({ 
          status: "error", 
          message: "Invalid URL format. Please provide a valid HTTP/HTTPS URL." 
        }),
        {
          headers: { "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Use CheerioWebBaseLoader instead of RecursiveUrlLoader for better reliability
    const loader = new CheerioWebBaseLoader(url.toString(), {
      selector: "body", // Load main content
    });

    let docs;
    try {
      // Add timeout for loading
      const loadPromise = loader.load();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("URL loading timeout")), 8000)
      );
      
      docs = await Promise.race([loadPromise, timeoutPromise]);
    } catch (loadError) {
      console.error("URL loading error:", loadError);
      return new Response(
        JSON.stringify({
          status: "error",
          message: "Failed to load URL. The website might be blocking automated access or taking too long to respond.",
        }),
        {
          headers: { "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    if (!docs || docs.length === 0) {
      return new Response(
        JSON.stringify({
          status: "error",
          message: "No content extracted from URL. The page might be empty or require authentication.",
        }),
        {
          headers: { "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Validate environment variables
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error("GOOGLE_API_KEY is not configured");
    }
    if (!process.env.QDRANT_URL) {
      throw new Error("QDRANT_URL is not configured");
    }

    // Initialize embeddings
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_API_KEY,
      model: "text-embedding-004",
    });

    // Store in Qdrant
    await QdrantVectorStore.fromDocuments(docs, embeddings, {
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY, // Add if using Qdrant Cloud
      collectionName: "url-store",
    });

    return new Response(
      JSON.stringify({
        status: "success",
        message: "URL indexed successfully!",
        documentsProcessed: docs.length,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("URL upload error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to process URL";
    
    return new Response(
      JSON.stringify({ 
        status: "error", 
        message: errorMessage 
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
}