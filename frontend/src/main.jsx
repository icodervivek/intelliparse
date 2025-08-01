import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { WobbleCardDemo } from "./WobbleCardDemo.jsx";
import Signup from "./Signup.jsx";
import Signin from "./Signin.jsx";
import Formpage from "./Formpage.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/signin" element={<Signin />} />
      <Route
        path="/form"
        element={
          <ProtectedRoute>
            <Formpage />
          </ProtectedRoute>
        }
      />
    </Routes>
  </BrowserRouter>
);
