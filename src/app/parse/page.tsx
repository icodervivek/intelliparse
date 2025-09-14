"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FiUpload, FiCheckCircle, FiAlertCircle, FiLoader } from "react-icons/fi";

// FAQ type
interface FAQ {
  faq_id: number;
  question: string;
  answer: string;
}

const Form = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [summary, setSummary] = useState("");
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setMessage("Please select a PDF file.");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      setUploading(true);
      setMessage("");
      const response = await axios.post<{ summary: string; faqs: FAQ[] }>(
        "/api/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setMessage("File uploaded successfully!");
      setSummary(response.data.summary);
      setFaqs(response.data.faqs);
    } catch (error) {
      console.error("Upload failed:", error);
      setMessage("❌ Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="relative w-full min-h-screen bg-gradient-to-br from-blue-950 via-[#201f1f] to-[#201f1f] py-20 px-4 text-white overflow-hidden">
      {/* Gradient Glows */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-blue-500/60 rounded-full blur-[180px] opacity-40" />
        <div className="absolute -bottom-20 -left-20 w-[450px] h-[450px] bg-purple-500/50 rounded-full blur-[160px] opacity-30" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl mx-auto"
      >
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 text-center">
          Intelliparse –{" "}
          <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Smart PDF Analyzer
          </span>
        </h1>
        <p className="text-gray-300 sm:text-lg mb-10 px-2 text-center leading-relaxed">
          Upload any PDF document and let AI instantly generate a concise summary
          and FAQs with answers. Quick, precise, and perfect for understanding long documents.
        </p>

        {/* Upload Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-[#1a1a1a] rounded-3xl shadow-xl p-8 mb-10"
        >
          <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
            <label className="font-semibold text-gray-200 flex items-center gap-2">
              <FiUpload className="text-blue-400" />
              Select PDF file
            </label>
            <input
              type="file"
              accept="application/pdf"
              required
              onChange={handleFileChange}
              className="border border-gray-700 rounded-xl px-4 py-3 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:bg-blue-600 file:text-white file:font-semibold file:px-4 file:py-2 file:rounded-lg hover:file:bg-blue-700 cursor-pointer"
            />

            <button
              type="submit"
              disabled={uploading}
              className={`flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-blue-700/50 transition cursor-pointer ${
                uploading ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {uploading && <FiLoader className="animate-spin" />}
              {uploading ? "Uploading..." : "Upload"}
            </button>

            {message && (
              <p className="text-center text-sm mt-2 flex items-center justify-center gap-1 font-medium">
                {message.includes("❌") ? <FiAlertCircle className="text-red-500" /> : <FiCheckCircle className="text-green-500" />}
                {message}
              </p>
            )}
          </form>
        </motion.div>

        {/* Summary Card */}
        {summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#1a1a1a] p-6 rounded-2xl shadow-md border border-gray-800 text-gray-200 mb-6"
          >
            <h2 className="text-xl font-semibold mb-2">Summary</h2>
            <p>{summary}</p>
          </motion.div>
        )}

        {/* FAQs Card */}
        {faqs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#1a1a1a] p-6 rounded-2xl shadow-md border border-gray-800 text-gray-200"
          >
            <h2 className="text-xl font-semibold mb-4 text-left">FAQs</h2>
            <ul className="divide-y divide-gray-700">
              {faqs.map((faq) => (
                <li key={faq.faq_id} className="py-3 rounded-md px-2">
                  {/* Only the question header is clickable */}
                  <div
                    className="flex justify-between items-center cursor-pointer hover:bg-gray-900 transition p-2 rounded-md"
                    onClick={() => setOpenFaq(openFaq === faq.faq_id ? null : faq.faq_id)}
                  >
                    <span className="font-medium text-left">{faq.question}</span>
                    <span className="text-blue-400 font-bold">{openFaq === faq.faq_id ? "−" : "+"}</span>
                  </div>

                  {/* Answer content */}
                  <AnimatePresence>
                    {openFaq === faq.faq_id && (
                      <motion.p
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-2 text-left text-gray-300 px-2"
                      >
                        {faq.answer}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
};

export default Form;
