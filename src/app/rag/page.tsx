"use client";
import { useState, ChangeEvent, FormEvent, useEffect, useRef } from "react";
import axios from "axios";
import Linkify from "react-linkify";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUpload,
  FiLink,
  FiFileText,
  FiSend,
  FiLoader,
  FiCheckCircle,
  FiPaperclip,
  FiX,
  FiTrash2,
} from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import hljs from "highlight.js";
import { useUser } from "@clerk/nextjs";
import "highlight.js/styles/github-dark.css";
import "react-toastify/dist/ReactToastify.css";

const RAG = () => {
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showModal, setShowModal] = useState<"text" | "url" | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const STORAGE_KEY = user ? `rag_chat_${user.id}` : null;
  const [sources, setSources] = useState<
    { type: "pdf" | "text" | "url"; name: string; content?: string }[]
  >([]);
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([
    {
      sender: "ai",
      text: "Hi there! Need help? Upload a PDF, paste your text, or share a URL via the attachment icon for the best results.",
    },
  ]);
  const [userMessage, setUserMessage] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!STORAGE_KEY) return;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.messages) setMessages(parsed.messages);
      if (parsed.sources) setSources(parsed.sources);
    }
  }, [STORAGE_KEY]);

  useEffect(() => {
    if (!STORAGE_KEY) return;

    const dataToStore = {
      messages,
      sources,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
  }, [messages, sources, STORAGE_KEY]);

  const handleClearChat = () => {
    setMessages([
      {
        sender: "ai",
        text: "Hi there! Need help? Upload a PDF, paste your text, or share a URL via the attachment icon for the best results.",
      },
    ]);
    setSources([]);
    if (STORAGE_KEY) localStorage.removeItem(STORAGE_KEY);
  };

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    document.querySelectorAll("pre code").forEach((block) => {
      hljs.highlightElement(block as HTMLElement);
    });
  }, [messages]);

  // Utility to render messages with code highlighting
  const renderMessageContent = (text: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let html = text.replace(
      codeBlockRegex,
      (_, lang, code) =>
        `<pre><code class="language-${lang || "plaintext"}">${
          hljs.highlightAuto(code).value
        }</code></pre>`
    );

    // Inline code highlighting
    const inlineCodeRegex = /`([^`]+)`/g;
    html = html.replace(inlineCodeRegex, (_, code) => `<code>${code}</code>`);

    // 🔗 Convert plain URLs into clickable links
    const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;
    html = html.replace(
      urlRegex,
      (url) =>
        `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline hover:text-blue-300">${url}</a>`
    );

    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  // 📄 PDF Upload
  // 📄 PDF Upload with 5MB limit
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Validate file size (max 5MB for deployment platforms)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (selectedFile.size > maxSize) {
        const fileSizeMB = (selectedFile.size / (1024 * 1024)).toFixed(2);
        toast.error(
          `File too large (${fileSizeMB}MB). Maximum size is 5MB. Please compress your PDF or split it into smaller files.`,
          { autoClose: 5000 }
        );
        // Reset the file input
        e.target.value = "";
        return;
      }

      setFile(selectedFile);
      setSources((prev) => [...prev, { type: "pdf", name: selectedFile.name }]);
      setShowAttachmentMenu(false);
      setLoading(true);

      try {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const response = await axios.post("/api/rag/upload-pdf", formData, {
          timeout: 60000, // 60 second timeout
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        toast.success(response.data.message || "PDF uploaded successfully!");
      } catch (error) {
        console.error("Upload error:", error);
        let errorMessage = "Upload failed. Please try again.";

        if (axios.isAxiosError(error)) {
          if (
            error.response?.status === 413 ||
            error.response?.status === 403
          ) {
            errorMessage =
              "File size exceeds server limit (5MB). Please use a smaller PDF.";
          } else if (error.response?.status === 504) {
            errorMessage =
              "Upload timeout. The file might be too large or connection is slow.";
          } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.code === "ECONNABORTED") {
            errorMessage = "Upload timeout. Please try with a smaller file.";
          }
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        toast.error(errorMessage, { autoClose: 5000 });
      } finally {
        setLoading(false);
        // Reset file input for re-upload
        e.target.value = "";
      }
    }
  };

  // 🔗 Text/URL Submit
  // 🔗 Text/URL Submit
  const handleSubmitSource = async (e: FormEvent) => {
    e.preventDefault();
    if (!textInput && !urlInput) {
      toast.warning("Please provide a text or URL input.");
      return;
    }

    setLoading(true);

    // Show different loading message for URL
    if (showModal === "url") {
      toast.info("Loading URL... This may take 10-30 seconds.", {
        autoClose: false,
        toastId: "url-loading",
      });
    }

    try {
      const formData = new FormData();
      let endpoint = "";

      if (showModal === "text") {
        formData.append("text", textInput);
        endpoint = "/api/rag/upload-text";
      } else if (showModal === "url") {
        formData.append("url", urlInput);
        endpoint = "/api/rag/upload-url";
      }

      const response = await axios.post(endpoint, formData, {
        timeout: showModal === "url" ? 35000 : 60000, // 35s for URL, 60s for text
      });

      // Dismiss loading toast
      toast.dismiss("url-loading");

      toast.success(
        response.data.message ||
          `${
            showModal === "text" ? "Text" : "URL"
          } source uploaded successfully!`
      );
    } catch (error) {
      // Dismiss loading toast
      toast.dismiss("url-loading");

      console.error("Upload error:", error);
      let errorMessage = "Upload failed. Try again.";

      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNABORTED") {
          errorMessage =
            "Request timeout. The URL might be too slow or complex. Try a simpler page.";
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, { autoClose: 5000 });
    } finally {
      if (showModal === "text" && textInput.trim() !== "") {
        setSources((prev) => [
          ...prev,
          {
            type: "text",
            name: textInput.slice(0, 30) + (textInput.length > 30 ? "..." : ""),
            content: textInput,
          },
        ]);
      } else if (showModal === "url" && urlInput.trim() !== "") {
        setSources((prev) => [
          ...prev,
          { type: "url", name: urlInput, content: urlInput },
        ]);
      }

      setTextInput("");
      setUrlInput("");
      setShowModal(null);
      setLoading(false);
    }
  };

  // 💬 Chat Handler
  const handleChatSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userMessage.trim()) return;

    const newMsg = { sender: "user", text: userMessage };
    setMessages((prev) => [...prev, newMsg]);
    setUserMessage("");
    setLoading(true);

    try {
      const res = await axios.post("/api/rag/chat", { message: userMessage });
      const reply = res.data.reply || "AI response here...";
      setMessages((prev) => [...prev, { sender: "ai", text: reply }]);
    } catch {
      toast.error("Error: Unable to process your message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative w-full min-h-screen bg-gradient-to-br from-blue-950 via-[#201f1f] to-[#201f1f] py-10 sm:py-16 md:py-20 px-3 sm:px-6 md:px-10 text-white overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-[350px] sm:w-[450px] md:w-[500px] h-[350px] sm:h-[450px] md:h-[500px] bg-blue-500/60 rounded-full blur-[160px] opacity-40" />
        <div className="absolute -bottom-20 -left-20 w-[300px] sm:w-[400px] md:w-[450px] h-[300px] sm:h-[400px] md:h-[450px] bg-purple-500/50 rounded-full blur-[140px] opacity-30" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto bg-white/10 backdrop-blur-xl rounded-3xl shadow-xl p-4 sm:p-6 md:p-8"
      >
        {/* Header with Clear Button */}
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
            RAG Chat with AI Assistant
          </h1>
          <button
            className="p-2 sm:p-3 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition flex items-center gap-2 text-sm cursor-pointer"
            title="Clear chat history"
            onClick={handleClearChat}
          >
            <FiTrash2 size={18} />
            <span className="hidden sm:inline">Clear Chat</span>
          </button>
        </div>
        {/* Chat Section */}
        <div
          ref={chatContainerRef}
          className="border border-white/20 rounded-2xl p-3 sm:p-4 md:p-5 h-[550px] sm:h-[400px] md:h-[450px] overflow-y-auto bg-black/20 mb-4 space-y-3"
        >
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-3 py-2 sm:px-4 sm:py-2 rounded-xl ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white self-end"
                    : "bg-white/10 text-gray-200 self-start"
                } break-words whitespace-pre-wrap w-fit max-w-[80%] sm:max-w-[75%] md:max-w-[70%]`}
              >
                <div className="[&_a]:text-blue-400 [&_a]:hover:underline [&_a]:hover:text-blue-300">
                  {msg.sender === "ai" ? (
                    <Linkify
                      componentDecorator={(
                        decoratedHref,
                        decoratedText,
                        key
                      ) => (
                        <a
                          href={decoratedHref}
                          key={key}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {decoratedText}
                        </a>
                      )}
                    >
                      {renderMessageContent(msg.text)}
                    </Linkify>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="px-3 py-2 sm:px-4 sm:py-2 bg-white/10 rounded-xl flex items-center gap-2 text-gray-300 text-sm sm:text-base">
                <FiLoader className="animate-spin" /> Typing...
              </div>
            </div>
          )}

          <div className="mb-4 p-3 bg-white/10 rounded-2xl">
            <h3 className="text-sm sm:text-base font-semibold mb-2">
              Uploaded Contexts
            </h3>
            {sources.length === 0 ? (
              <p className="text-gray-400 text-xs sm:text-sm">
                No sources added yet.
              </p>
            ) : (
              <ul className="flex flex-col gap-2 max-h-36 overflow-y-auto">
                {sources.map((src, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between p-2 bg-white/10 rounded-lg text-xs sm:text-sm"
                  >
                    <div className="flex items-center gap-2">
                      {src.type === "pdf" && <FiFileText />}
                      {src.type === "text" && <FiFileText />}
                      {src.type === "url" && <FiLink />}
                      <span>{src.name}</span>
                    </div>
                    <button
                      onClick={() => {
                        setSources((prev) =>
                          prev.filter((_, index) => index !== i)
                        );
                        // Optional: Remove from backend too
                      }}
                      className="text-red-400 hover:text-red-500"
                    >
                      <FiTrash2 />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Chat Input + Attachments */}
        <div className="relative">
          <form
            onSubmit={handleChatSubmit}
            className="flex items-center gap-2 sm:gap-3 border border-white/20 rounded-xl p-2 sm:p-3 bg-white/10 relative"
          >
            {/* 📎 Attachment */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAttachmentMenu((prev) => !prev)}
                className="p-2 rounded-lg hover:bg-white/20 transition"
              >
                <FiPaperclip size={20} />
              </button>

              <AnimatePresence>
                {showAttachmentMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    transition={{ duration: 0.2 }}
                    className="absolute bottom-14 left-0 bg-black backdrop-blur-md rounded-xl p-3 flex flex-col gap-2 shadow-xl w-32 sm:w-36"
                  >
                    <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/20 cursor-pointer text-xs sm:text-sm">
                      <FiUpload /> PDF
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal("text");
                        setShowAttachmentMenu(false);
                      }}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/20 text-xs sm:text-sm"
                    >
                      <FiFileText /> Text
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal("url");
                        setShowAttachmentMenu(false);
                      }}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/20 text-xs sm:text-sm"
                    >
                      <FiLink /> URL
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Chat Input */}
            <input
              value={userMessage}
              onChange={(e) => {
                setUserMessage(e.target.value);
                if (showAttachmentMenu) setShowAttachmentMenu(false);
              }}
              onFocus={() => {
                if (showAttachmentMenu) setShowAttachmentMenu(false);
              }}
              placeholder="Type your message..."
              className="flex-1 bg-transparent outline-none text-white text-sm sm:text-base"
            />

            <button
              type="submit"
              className="p-2 sm:p-3 bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              <FiSend />
            </button>
          </form>
        </div>
      </motion.div>

      {/* 🪟 Modal for Text / URL */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(null)}
            />
            <motion.div
              className="fixed inset-0 flex items-center justify-center z-50 px-3"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-[#1e1e1e] border border-white/20 rounded-2xl p-5 sm:p-6 w-full max-w-md text-white relative shadow-2xl">
                <button
                  onClick={() => setShowModal(null)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-white"
                >
                  <FiX size={20} />
                </button>
                <h2 className="text-lg sm:text-xl font-semibold mb-4 text-center">
                  {showModal === "text"
                    ? "Upload Text Source"
                    : "Upload URL Source"}
                </h2>

                <form
                  onSubmit={handleSubmitSource}
                  className="flex flex-col gap-4"
                >
                  {showModal === "text" ? (
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Paste or write your text here..."
                      className="border border-white/30 rounded-lg p-3 w-full  text-sm sm:text-base"
                      rows={5}
                    />
                  ) : (
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="Enter a webpage URL..."
                      className="border border-white/30 rounded-lg p-3 w-full text-sm sm:text-base"
                    />
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 px-4 sm:px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    {loading ? (
                      <FiLoader className="animate-spin" />
                    ) : (
                      <FiCheckCircle />
                    )}
                    {loading ? "Uploading..." : "Submit"}
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 🧿 Toast Container (Black Theme) */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </section>
  );
};

export default RAG;
