export const runtime = "nodejs";
import "dotenv/config";
import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "langchain/document";

export async function POST(req) {
  try {
    const data = await req.formData();
    const url = data.get("url");

    if (!url) {
      return new Response(
        JSON.stringify({ status: "error", message: "URL is required" }),
        { headers: { "Content-Type": "application/json" }, status: 400 }
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
          message: "Invalid URL format. Use HTTP/HTTPS URLs only." 
        }),
        { headers: { "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log("Fetching URL:", url.toString());

    // Fetch HTML content
    let html;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

      const response = await fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      html = await response.text();
      console.log("Fetched HTML, length:", html.length);
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);
      
      let errorMessage = "Failed to load URL.";
      const errorMsg = fetchError?.message || "";
      
      if (errorMsg.includes("aborted") || fetchError?.name === "AbortError") {
        errorMessage = "Request timeout (20s). The website is too slow to load.";
      } else if (errorMsg.includes("ENOTFOUND") || errorMsg.includes("getaddrinfo")) {
        errorMessage = "Website not found. Check if the URL is correct.";
      } else if (errorMsg.includes("ECONNREFUSED")) {
        errorMessage = "Connection refused. The website might be down.";
      } else if (errorMsg.includes("403")) {
        errorMessage = "Access forbidden (403). Website blocks automated access.";
      } else if (errorMsg.includes("404")) {
        errorMessage = "Page not found (404). Check the URL.";
      } else if (errorMsg.includes("500") || errorMsg.includes("502") || errorMsg.includes("503")) {
        errorMessage = "Website server error. Try again later.";
      } else if (errorMsg.includes("certificate") || errorMsg.includes("SSL")) {
        errorMessage = "SSL certificate error. The website has security issues.";
      } else {
        errorMessage = `Failed to load: ${errorMsg}`;
      }
      
      return new Response(
        JSON.stringify({ status: "error", message: errorMessage }),
        { headers: { "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Extract text from HTML
    const text = html
      // Remove script tags
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Remove style tags
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      // Remove HTML comments
      .replace(/<!--[\s\S]*?-->/g, '')
      // Remove all other HTML tags
      .replace(/<[^>]+>/g, ' ')
      // Decode common HTML entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim();

    if (!text || text.length < 50) {
      return new Response(
        JSON.stringify({
          status: "error",
          message: "No text content found on this page. The page might be empty or JavaScript-only.",
        }),
        { headers: { "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log("Extracted text, length:", text.length);

    // Create document
    const doc = new Document({
      pageContent: text,
      metadata: { 
        source: url.toString(),
        title: html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || "Untitled",
      },
    });

    // Split into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    
    const splitDocs = await textSplitter.splitDocuments([doc]);
    console.log("Split into", splitDocs.length, "chunks");

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

    console.log("Storing in Qdrant...");

    // Store in Qdrant
    await QdrantVectorStore.fromDocuments(splitDocs, embeddings, {
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
      collectionName: "url-store",
    });

    console.log("Successfully stored!");

    return new Response(
      JSON.stringify({
        status: "success",
        message: "URL indexed successfully!",
        documentsProcessed: splitDocs.length,
        textLength: text.length,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Server error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return new Response(
      JSON.stringify({ 
        status: "error", 
        message: `Server error: ${errorMessage}`
      }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
}