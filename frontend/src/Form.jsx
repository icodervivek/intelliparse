import React, { useState } from "react";
import axios from "axios";

const Form = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [summary, setSummary] = useState("");
  const [faqs, setFaqs] = useState([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
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
      const response = await axios.post(
        "http://localhost:3000/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage("✅ File uploaded successfully!");
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
    <div className="min-h-screen bg-gradient-to-br mt-5 text-white flex flex-col items-center justify-center px-4">
      <div className="bg-white text-gray-900 shadow-lg rounded-2xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">📄 Intelliparse</h1>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <label
            htmlFor="pdf"
            className="block font-semibold text-sm text-gray-700"
          >
            Upload PDF:
          </label>
          <input
            type="file"
            id="pdf"
            accept="application/pdf"
            required
            onChange={handleFileChange}
            className="block w-full border border-gray-300 rounded-lg px-4 py-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
          />
          <button
            type="submit"
            disabled={uploading}
            className={`bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 cursor-pointer hover:bg-indigo-700 ${
              uploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
          {message && (
            <p className="text-sm text-center text-indigo-700 mt-2">
              {message}
            </p>
          )}
        </form>
      </div>

      {summary && (
        <div className="mt-6 p-4 bg-indigo-50 rounded-lg text-gray-800">
          <h2 className="text-lg font-bold mb-2">Summary:</h2>
          <p>{summary}</p>
        </div>
      )}

      {faqs.length > 0 && (
        <div className="mt-6 p-4 bg-indigo-50 rounded-lg text-gray-800">
          <h2 className="text-lg font-bold mb-2">FAQs:</h2>
          <ul className="space-y-2 list-disc list-inside">
            {faqs.map((faq) => (
              <li key={faq.faq_id}>
                <strong>{faq.question}</strong>
                <p>{faq.answer}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Form;
