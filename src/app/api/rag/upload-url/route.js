// /app/api/rag/upload-url/route.ts
export const runtime = "nodejs";
export const maxDuration = 300;

import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "langchain/document";

// Simple HTML to text converter
function htmlToText(html) {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Extract links from HTML
function extractLinks(html, baseUrl) {
  const links = new Set();
  const linkRegex = /<a[^>]+href=["']([^"']+)["']/gi;
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    try {
      const url = new URL(match[1], baseUrl);
      // Only internal links, no anchors, no files
      if (url.hostname === new URL(baseUrl).hostname && 
          !url.hash && 
          !url.pathname.match(/\.(pdf|jpg|png|gif|zip|exe|mp4|mp3)$/i)) {
        links.add(url.href);
      }
    } catch (e) {
      // Invalid URL, skip
    }
  }

  return Array.from(links);
}

// Crawl website recursively with timeout
async function crawlWebsite(startUrl, maxDepth = 2, maxPages = 30, timeoutMs = 240000) {
  const visited = new Set();
  const queue = [{ url: startUrl, depth: 0 }];
  const documents = [];
  const startTime = Date.now();

  console.log(`Starting crawl from ${startUrl} (maxDepth: ${maxDepth}, maxPages: ${maxPages})`);

  while (queue.length > 0 && documents.length < maxPages) {
    // Check timeout (leave 60s buffer for processing)
    if (Date.now() - startTime > timeoutMs) {
      console.log(`⚠️ Timeout reached. Stopping crawl with ${documents.length} pages.`);
      break;
    }
    const { url, depth } = queue.shift();

    // Skip if already visited or max depth reached
    if (visited.has(url) || depth > maxDepth) {
      continue;
    }

    visited.add(url);

    try {
      console.log(`[${documents.length + 1}] Crawling: ${url} (depth: ${depth})`);

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Bot/1.0)',
        },
        signal: AbortSignal.timeout(5000), // 5s timeout per page
      });

      if (!response.ok) {
        console.log(`  ✗ HTTP ${response.status}`);
        continue;
      }

      const html = await response.text();
      const text = htmlToText(html);

      // Only add if there's meaningful content
      if (text && text.length > 100) {
        documents.push(
          new Document({
            pageContent: text,
            metadata: { 
              source: url,
              depth: depth,
            },
          })
        );
        console.log(`  ✓ Added (${text.length} chars)`);
      }

      // Extract and queue new links if not at max depth
      if (depth < maxDepth && documents.length < maxPages) {
        const links = extractLinks(html, url);
        console.log(`  Found ${links.length} links`);
        
        for (const link of links) {
          if (!visited.has(link)) {
            queue.push({ url: link, depth: depth + 1 });
          }
        }
      }

      // Faster crawling - remove delay
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.log(`  ✗ Error: ${error.message}`);
    }
  }

  console.log(`Crawl complete: ${documents.length} pages indexed`);
  return documents;
}

export async function POST(req) {
  try {
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

    console.log("Starting website crawl:", validUrl.toString());

    // Crawl the website (reduced for Vercel timeout)
    const docs = await crawlWebsite(
      validUrl.toString(),
      1,  // maxDepth: only 1 level deep
      15  // maxPages: limit to 15 pages
    );

    if (!docs.length) {
      return new Response(
        JSON.stringify({
          status: "error",
          message: "No content found on this website.",
        }),
        { headers: { "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`Successfully crawled ${docs.length} pages`);

    // Split into chunks
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

    // Process in batches to avoid memory issues
    const BATCH_SIZE = 25;
    for (let i = 0; i < splitDocs.length; i += BATCH_SIZE) {
      const batch = splitDocs.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(splitDocs.length / BATCH_SIZE)}`);
      
      await QdrantVectorStore.fromDocuments(batch, embeddings, {
        url: process.env.QDRANT_URL,
        apiKey: process.env.QDRANT_API_KEY,
        collectionName: "url-store",
      });
    }

    console.log("Indexing completed successfully!");

    return new Response(
      JSON.stringify({
        status: "success",
        message: "Website indexed successfully!",
        pagesProcessed: docs.length,
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