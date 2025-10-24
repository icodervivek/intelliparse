export const runtime = "nodejs"; 
import "dotenv/config";
import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RecursiveUrlLoader } from "@langchain/community/document_loaders/web/recursive_url";
import { compile } from "html-to-text";

const compiledConvert = compile({ wordwrap: 130 });

export async function POST(req) {
  try {
    const data = await req.formData();
    const url = data.get("url");

    if (!url) {
      return new Response(JSON.stringify({ status: "error", message: "URL is required" }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });
    }

    const loader = new RecursiveUrlLoader(url.toString(), {
      extractor: compiledConvert,
      maxDepth: 5, // you can adjust depth
    });

    const docs = await loader.load();

    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_API_KEY,
      model: "text-embedding-004",
    });

    await QdrantVectorStore.fromDocuments(docs, embeddings, {
      url: process.env.QDRANT_URL,
      collectionName: "url-store",
    });

    return new Response(JSON.stringify({ status: "success", message: "URL indexed successfully!" }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ status: "error", message: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}
