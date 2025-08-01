"use client";
import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { twMerge } from "tailwind-merge";
import { Label } from "./Label";
import { Input } from "./Input";
import { useNavigate } from "react-router-dom";
import { Bounce } from "react-toastify";
import { isAuthenticated } from "./auth";
import { useEffect } from "react";


export function SigninFormDemo() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:3000/api/signin", // update with your actual backend endpoint
        formData,
        {
          withCredentials: true,
        }
      );

      const token = res.data.token;
      localStorage.setItem("token", token); // ✅ Store the token

      toast.success(res.data.message || "Signin Successful", {
        position: "top-center",
        autoClose: 2000,
        transition: Bounce,
      });

      setTimeout(() => {
        navigate("/form"); // update to your redirect path
      }, 2000);
    } catch (err) {
      const msg =
        err.response?.data?.message || "Something went wrong during signin.";
      toast.error(msg);
    }
  };


   useEffect(() => {
    if (isAuthenticated()) {
      navigate("/form"); // or your desired protected route
    }
  }, []);

  return (
    <div className="shadow-input mx-auto w-full max-w-md rounded-none bg-white p-8  md:rounded-2xl md:p-8 dark:bg-black mt-5">
      <ToastContainer />
      <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
        Welcome to Intelliparse
      </h2>
      <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
        Login to your account!
      </p>
      <form className="my-8" onSubmit={handleSubmit}>
        <LabelInputContainer className="mb-4">
          <Label className="overflow-y-hidden" htmlFor="email">
            Email Address
          </Label>
          <Input
            id="email"
            placeholder="projectmayhem@fc.com"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
        </LabelInputContainer>
        <LabelInputContainer className="mb-4">
          <Label className="overflow-y-hidden" htmlFor="password">
            Password
          </Label>
          <Input
            id="password"
            placeholder="••••••••"
            type="password"
            value={formData.password}
            onChange={handleChange}
          />
        </LabelInputContainer>
        <button
          className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br overflow-y-hidden from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset] cursor-pointer"
          type="submit"
        >
          Sign In &larr;
          <BottomGradient />
        </button>
      </form>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({ children, className }) => {
  return (
    <div className={twMerge("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};
