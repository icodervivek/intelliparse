import { NextResponse } from "next/server";
import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { OpenAI } from "openai";
import path from "path";
import "dotenv/config";

const client = new OpenAI({
  apiKey: process.env.GOOGLE_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

// 🧠 Define all 4 System Prompts (UPDATED to allow code blocks)
const SYSTEM_PROMPTS = {
  default: `
You are an intelligent and helpful assistant for Intelliparse.  
Provide clear, accurate, and informative answers based on the available information.  
If no specific data source or context is found, respond politely using general reasoning, and clearly mention that no direct context is available and ask the user to upload the context by clicking the attachment icon below. The user can add a PDF, paste text, or provide a URL.
IMPORTANT & STRICTLY FOLLOW - In case you don't have any context of the user query, you may also suggest to the user: "To get the most accurate responses, upload your context by clicking the attachment icon below. You can add a PDF, paste text, or provide a URL."

When sharing code, wrap it in markdown code blocks using triple backticks with language identifier:
\`\`\`javascript
// code here
\`\`\`

\`\`\`cpp
// code here
\`\`\`

\`\`\`c
// code here
\`\`\`

\`\`\`java
// code here
\`\`\`

\`\`\`python
// code here
\`\`\`

\`\`\`go
// code here
\`\`\`

For inline code, use single backticks: \`variableName\`
Do not enclose URLs in [] or ().
Only output plain text URLs.
`,

  pdf: `
You are an assistant specialized in analyzing PDFs uploaded by the user.
Use only the extracted PDF text provided in the retrieved context to answer.
Focus on summarization, explanation, and factual reasoning directly from the PDF.
Clearly mention the **page number(s)** from which each answer portion is derived.
Never add information that is not in the context.

When sharing code from the PDF, wrap it in markdown code blocks using triple backticks with language identifier:
\`\`\`javascript
// code here
\`\`\`

For inline code, use single backticks: \`variableName\`
Do not enclose URLs in [] or ().
Only output plain text URLs.
`,

  url: `
You are an assistant specialized in understanding web content and URLs.
Use the retrieved website or page content context to explain or summarize key information.
Always include the **source URL(s)** at the end of your answer.
Do not add any data not present in the context.

When sharing code, wrap it in markdown code blocks using triple backticks with language identifier:
\`\`\`javascript
// code here
\`\`\`

For inline code, use single backticks: \`variableName\`
Do not enclose URLs in [] or ().
Only output plain text URLs.
`,

  text: `
You are an assistant specialized in understanding custom text documents provided by the user.
Use only the text context to answer questions accurately.
Be clear, direct, and faithful to the source content.

When sharing code, wrap it in markdown code blocks using triple backticks with language identifier:
\`\`\`javascript
// code here
\`\`\`

For inline code, use single backticks: \`variableName\`
Do not enclose URLs in [] or ().
Only output plain text URLs.
`,
};

export async function POST(req) {
  try {
    const body = await req.json();
    const userMessage = body.message;

    if (!userMessage) {
      return NextResponse.json(
        { error: "No message provided" },
        { status: 400 }
      );
    }

    const userModifiedQuery = await client.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "system",
          content: `
      You are an expert query refiner for a Retrieval-Augmented Generation (RAG) system. 
Your task is to rewrite the user's query for semantic search, ensuring that it:

1. Strictly preserves the original intent and meaning of the user's query.
2. Expands abbreviations or vague terms into clear and precise keywords.
3. Produces a semantically rich query optimized for embedding-based retrieval.
4. Does NOT introduce any new topics, concepts, or information not present in the original query.
5. Does NOT attempt to answer the query — only reformulate it for better search results.
6. Focuses solely on the content and context implied by the user's input.
`,
        },
        {
          role: "user",
          content: `Original query: "${userMessage}"\n\nRewrite this query to be precise, clear, and fully optimized for semantic search. Only include relevant terms from the original query; do NOT add unrelated concepts.`,
        },
      ],
    });

    const refinedQuery = userModifiedQuery.choices[0].message.content.trim();

    // Initialize embedding model
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_API_KEY,
      model: "text-embedding-004",
    });

    const collections = ["pdf-store", "url-store", "text-store"];
    const allResults = [];

    for (const collectionName of collections) {
      try {
        const vectorStore = await QdrantVectorStore.fromExistingCollection(
          embeddings,
          {
            url: process.env.QDRANT_URL,
            collectionName,
          }
        );

        const retriever = vectorStore.asRetriever({ k: 5 });
        const chunks = await retriever.invoke(refinedQuery);

        if (chunks && chunks.length > 0) {
          allResults.push({ collection: collectionName, chunks });
        }
      } catch (err) {
        console.warn(`Skipping ${collectionName}: ${err.message}`);
      }
    }

    // 🧩 Combine retrieved context with better formatting
    const combinedContext = allResults
      .flatMap((r) =>
        r.chunks.map((chunk, i) => {
          if (r.collection === "pdf-store") {
            const page = chunk.metadata?.loc?.pageNumber ?? "Unknown";
            const filePath = chunk.metadata?.source ?? "Unknown PDF";
            const fileName = path.basename(filePath);
            const metaLine = `PDF: ${fileName}, Page: ${page}`;
            return `(PDF: ${fileName} - Page: ${page})\n${metaLine}\n${chunk.pageContent}`;
          } else if (r.collection === "url-store") {
            const source = chunk.metadata?.source?.trim() || "Unknown URL";
            const metaLine = `Source URL: ${source}`;
            return `(URL - ${source})\n${metaLine}\n${chunk.pageContent}`;
          } else {
            const textSource = chunk.metadata?.source?.trim() || "Custom Text";
            const metaLine = `Text Source: ${textSource}`;
            return `(Text - ${textSource})\n${metaLine}\n${chunk.pageContent}`;
          }
        })
      )
      .join("\n\n---\n\n");

    // Determine which system prompt to use
    let selectedPrompt = SYSTEM_PROMPTS.default;
    const foundCollections = allResults.map((r) => r.collection);

    if (
      foundCollections.includes("pdf-store") &&
      foundCollections.length === 1
    ) {
      selectedPrompt = SYSTEM_PROMPTS.pdf;
    } else if (
      foundCollections.includes("url-store") &&
      foundCollections.length === 1
    ) {
      selectedPrompt = SYSTEM_PROMPTS.url;
    } else if (
      foundCollections.includes("text-store") &&
      foundCollections.length === 1
    ) {
      selectedPrompt = SYSTEM_PROMPTS.text;
    } else if (foundCollections.length > 1) {
      // Combined data sources
      selectedPrompt = `
You are an intelligent assistant for Intelliparse.
Multiple data sources (PDFs, URLs, Texts) have been retrieved.
When responding, indicate clearly which part of your answer is based on which source type:
PDFs → mention page numbers
URLs → show the link(s)
Texts → specify custom text source name if available
Only use data from the provided context — never fabricate.

When sharing code, wrap it in markdown code blocks using triple backticks with language identifier:
\`\`\`javascript
// code here
\`\`\`

For inline code, use single backticks: \`variableName\`
`;
    }

    // Handle no context case
    if (!combinedContext.trim()) {
      return NextResponse.json({
        reply:
          "No relevant context found in uploaded files, URLs, or text. Please upload or provide data first.",
      });
    }

    // Final combined system prompt
    const SYSTEM_PROMPT = `${selectedPrompt}\n\n### Retrieved Context:\n${combinedContext}`;

    // Generate grounded answer
    const response = await client.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: refinedQuery },
      ],
    });

    let reply =
      response?.choices?.[0]?.message?.content ||
      "No response generated from AI.";

    // FIXED: Only clean up markdown links, preserve code blocks and other formatting
    reply = reply.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, "$2");
    
    // Remove bold/italic markers but preserve backticks for code
    reply = reply.replace(/\*\*([^*]+)\*\*/g, "$1"); // bold
    reply = reply.replace(/\*([^*]+)\*/g, "$1"); // italic
    
    // Clean up extra whitespace but preserve code block indentation
    reply = reply.replace(/[ ]{2,}/g, " ");

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Error in RAG Chat Route:", err);
    return NextResponse.json(
      { reply: "Error processing your message. Please try again later." },
      { status: 500 }
    );
  }
}