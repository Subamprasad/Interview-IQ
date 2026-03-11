import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiLock, FiUser, FiArrowLeft, FiAlertCircle, FiLoader, FiShield, FiCpu, FiGithub } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const payload = isLogin ? { email, password } : { name, email, password };
      const { data } = await axios.post(`${API_URL}${endpoint}`, payload);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success(isLogin ? "Login successful." : "Registration successful.", { icon: '🚀' });
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.message || "Authentication failed. Please try again.";
      toast.error(msg, { icon: '❌' });

      // Resilient Dev Shortcut
      if (err.response?.status === 503) {
        toast.info("Database cluster offline. Switching to Demo Mode.", { duration: 5000 });
        setEmail("demo@interviewiq.com");
        setPassword("password123");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      await executeGoogleLogin(decoded.name, decoded.email, decoded.sub, decoded.picture);
    } catch (err) {
      toast.error("Google authentication protocol failed.");
    }
  };

  const executeGoogleLogin = async (googleName, googleEmail, googleId, picture) => {
    try {
      const { data } = await axios.post(`${API_URL}/api/auth/google-login`, {
        name: googleName,
        email: googleEmail,
        googleId: googleId,
        picture: picture
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("Google Login Successful.", { icon: '🌐' });
      navigate("/dashboard");
    } catch (err) {
      toast.error("Uplink synchronization failed.");
    }
  };

  const handleSimulatedGoogleLogin = () => {
    // Use the email entered in the form, or fall back to a demo identity
    const simulatedEmail = email || "subamprasad4311@gmail.com";
    const simulatedName = name || "Subam Prasad";
    toast.loading("Simulating Google Authentication...", { duration: 2000 });
    setTimeout(() => {
      executeGoogleLogin(simulatedName, simulatedEmail, "sim_google_" + Date.now(), "https://ui-avatars.com/api/?name=" + simulatedName + "&background=6366f1&color=fff");
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white p-6 relative overflow-hidden bg-mesh font-sans">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-500/5 rounded-full blur-[140px] -z-10 animate-pulse" />

      <Link to="/" className="absolute top-10 left-10 inline-flex items-center gap-3 text-slate-500 hover:text-white transition-all font-black uppercase tracking-widest text-[10px] glass px-4 py-2 rounded-xl group">
        <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Home
      </Link>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        <div className="glass-card shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] bg-slate-950/60">
          <header className="text-center mb-10">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-400 border border-white/10 group-hover:rotate-6 transition-transform">
              {isLogin ? <FiShield size={32} /> : <FiCpu size={32} />}
            </div>
            <h2 className="text-4xl font-black mb-3 uppercase tracking-tighter">{isLogin ? "Login" : "Register"}</h2>
            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">
              {isLogin ? "Sign in to your account" : "Create a new account"}
            </p>
          </header>

          <div className="flex flex-col gap-4 mb-10">
            <div className="flex flex-col items-center bg-white rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform p-1 relative group cursor-pointer" onClick={handleSimulatedGoogleLogin}>
              <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <button type="button" className="w-full flex items-center justify-center gap-3 py-3 text-slate-900 font-bold">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google (Simulated)
              </button>
            </div>
            <div className="flex items-center gap-4 py-2">
              <div className="h-px bg-white/10 flex-1" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">OR EMAIL</span>
              <div className="h-px bg-white/10 flex-1" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2 ml-2">Full Identity</label>
                  <div className="relative group">
                    <FiUser className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Candidate Name"
                      className="w-full pl-16 pr-6 py-5 rounded-[1.75rem] bg-white/5 border border-white/10 focus:border-indigo-500/40 outline-none transition-all font-semibold text-sm"
                      required
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2 ml-2">Email Destination</label>
              <div className="relative group">
                <FiMail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full pl-16 pr-6 py-5 rounded-[1.75rem] bg-white/5 border border-white/10 focus:border-indigo-500/40 outline-none transition-all font-semibold text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2 ml-2">Access Key</label>
              <div className="relative group">
                <FiLock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-16 pr-6 py-5 rounded-[1.75rem] bg-white/5 border border-white/10 focus:border-indigo-500/40 outline-none transition-all font-semibold text-sm"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-6 rounded-[2.25rem] bg-white text-slate-950 font-black text-sm uppercase tracking-widest disabled:opacity-50 transition-all shadow-2xl flex items-center justify-center gap-3 mt-8 hover:scale-105 active:scale-95"
            >
              {loading ? (
                <FiLoader className="animate-spin text-2xl" />
              ) : (
                <>
                  {isLogin ? "Login" : "Register"}
                </>
              )}
            </button>
          </form>

          <footer className="mt-10 text-center">
            <p className="text-slate-500 font-bold uppercase tracking-[0.1em] text-[10px]">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => { setIsLogin(!isLogin); }}
                className="text-indigo-400 hover:text-indigo-300 transition-colors font-black ml-1"
              >
                {isLogin ? "Sign Up" : "Login"}
              </button>
            </p>
          </footer>
        </div>
      </motion.div>
    </div>
  );
}

export default Auth;
