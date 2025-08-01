import React, { useEffect, useState } from "react";
import axios from "axios";
import { Meteors } from "./Meteors";

axios.defaults.withCredentials = true; // Send cookies in every request

export function MeteorsDemo() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch profile on mount
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/profile"); // Update port if needed
        setProfile(res.data);
      } catch (err) {
        setError("You are not logged in");
        console.error(err);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="">
      <div className="relative m-2">
        <div className="absolute inset-0 h-full w-full scale-[0.80] transform rounded-full bg-red-500 bg-gradient-to-r from-blue-500 to-teal-500 blur-3xl" />
        <div className="relative flex h-full flex-col items-start justify-end overflow-hidden rounded-2xl border border-gray-800 bg-zinc-800 px-4 py-8 shadow-xl">
          <div className="mb-4 flex h-5 w-5 items-center justify-center rounded-full border border-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-2 w-2 text-gray-300"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25"
              />
            </svg>
          </div>

          <h1 className="relative z-50 mb-4 text-xl font-bold text-white">
            AI-Powered Document Parsing
          </h1>

          <p className="relative z-50 mb-4 text-base font-normal text-slate-500">
            Built with LangChain and Gemini 2.0, this tool analyzes PDF files
            and delivers structured insights like summaries and FAQs instantly.
          </p>

          {profile ? (
            <div className="text-white">
              <p className="text-sm text-green-400">Welcome, {profile.firstname} {profile.lastname}</p>
              <p className="text-sm text-gray-300">Email: {profile.email}</p>
            </div>
          ) : (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <Meteors number={50} />
        </div>
      </div>
    </div>
  );
}
