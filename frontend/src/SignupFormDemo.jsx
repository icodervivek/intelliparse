"use client";
import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { twMerge } from "tailwind-merge";
import { Label } from "./Label";
import { Input } from "./Input";
import { Link, useNavigate } from "react-router-dom";
import { Bounce } from "react-toastify";
import { useEffect } from "react";
import { isAuthenticated } from "./auth";

export function SignupFormDemo() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
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
        `${import.meta.env.VITE_BACKEND_API}/api/signup`,
        formData
      );
      toast.success(res.data.message || "Signup Successful", {
        position: "top-center",
        autoClose: 2000,
        transition: Bounce,
      });
      setTimeout(() => {
        navigate("/signin");
      }, 2000);

      // Optionally redirect to signin
    } catch (err) {
      const msg =
        err.response?.data?.message || "Something went wrong during signup.";
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
        Create an account to login to our portal
      </p>
      <form className="my-8" onSubmit={handleSubmit}>
        <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
          <LabelInputContainer>
            <Label className="overflow-y-hidden" htmlFor="firstname">
              First name
            </Label>
            <Input
              id="firstname"
              placeholder="Tyler"
              type="text"
              value={formData.firstname}
              onChange={handleChange}
            />
          </LabelInputContainer>
          <LabelInputContainer>
            <Label className="overflow-y-hidden" htmlFor="lastname">
              Last name
            </Label>
            <Input
              id="lastname"
              placeholder="Durden"
              type="text"
              value={formData.lastname}
              onChange={handleChange}
            />
          </LabelInputContainer>
        </div>
        <LabelInputContainer className="mb-4">
          <Label className="overflow-y-hidden" htmlFor="email">
            Email Address
          </Label>
          <Input
            id="email"
            placeholder="projectmayhem@fc.com"
            type="email"
            className="overflow-y-hidden"
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
          Sign up &rarr;
          <BottomGradient />
        </button>
        <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />
        <h2 className="text-center">Already have an account?</h2>
        <Link to="/signin" className="cursor-pointer">
          <button className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br overflow-y-hidden from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset] my-4 cursor-pointer">
            Sign in &larr;
            <BottomGradient />
          </button>
        </Link>
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
