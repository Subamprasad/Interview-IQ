import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import UploadResume from "./pages/UploadResume";
import Interview from "./pages/Interview";
import Report from "./pages/Report";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/auth" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="bottom-right" toastOptions={{ className: 'toast-glass' }} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/upload-resume" element={<PrivateRoute><UploadResume /></PrivateRoute>} />
        <Route path="/interview/:id" element={<PrivateRoute><Interview /></PrivateRoute>} />
        <Route path="/report/:id" element={<PrivateRoute><Report /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;