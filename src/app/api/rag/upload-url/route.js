// /app/api/rag/upload-url/route.ts
export const runtime = "nodejs";

import "dotenv/config";
import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RecursiveUrlLoader } from "@langchain/community/document_loaders/web/recursive_url";
import { compile } from "html-to-text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const compiledConvert = compile({ wordwrap: 130 });

export async function POST(req) {
  try {
    // Get formData and type guard
    const data = await req.formData();
    const urlValue = data.get("url");

    if (!urlValue || typeof urlValue !== "string") {
      return new Response(
        JSON.stringify({ status: "error", message: "URL is required" }),
        { headers: { "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Validate URL
    let validUrl;
    try {
      validUrl = new URL(urlValue);
      if (!validUrl.protocol.startsWith("http")) {
        throw new Error("Invalid protocol");
      }
    } catch {
      return new Response(
        JSON.stringify({
          status: "error",
          message: "Invalid URL format. Use HTTP/HTTPS URLs only.",
        }),
        { headers: { "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log("Crawling URL:", validUrl.toString());

    // Recursive loader to fetch main URL + internal pages
    const loader = new RecursiveUrlLoader(validUrl.toString(), {
      extractor: compiledConvert,
      maxDepth: 8, // Adjust depth if needed
    });

    const docs = await loader.load();
    console.log(`Fetched ${docs.length} documents (pages)`);

    if (!docs.length) {
      return new Response(
        JSON.stringify({
          status: "error",
          message: "No content found on this site or pages are JavaScript-only.",
        }),
        { headers: { "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Split each page into smaller chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const splitDocs = await textSplitter.splitDocuments(docs);
    console.log(`Split into ${splitDocs.length} chunks`);

    // Validate environment
    if (!process.env.GOOGLE_API_KEY)
      throw new Error("GOOGLE_API_KEY is not configured");
    if (!process.env.QDRANT_URL)
      throw new Error("QDRANT_URL is not configured");

    // Initialize embeddings
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_API_KEY,
      model: "text-embedding-004",
    });

    console.log("Storing in Qdrant...");

    await QdrantVectorStore.fromDocuments(splitDocs, embeddings, {
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
      collectionName: "url-store",
    });

    console.log("Indexing completed successfully!");

    return new Response(
      JSON.stringify({
        status: "success",
        message: "URL and internal pages indexed successfully!",
        documentsProcessed: splitDocs.length,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Server error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return new Response(
      JSON.stringify({
        status: "error",
        message: `Server error: ${errorMessage}`,
      }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
}
