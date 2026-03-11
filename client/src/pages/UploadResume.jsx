import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { FiUpload, FiFile, FiCheck, FiX, FiBriefcase, FiArrowLeft, FiLoader, FiInfo } from "react-icons/fi";
import apiClient from "../utils/apiClient";

function UploadResume() {
  const navigate = useNavigate();
  const [jobRole, setJobRole] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type === "application/pdf") {
      setFile(selected);
      setError("");
    } else {
      setError("Please select a valid PDF file.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !jobRole) return setError("All fields are required.");

    setLoading(true);
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobRole", jobRole);

    try {
      const { data } = await apiClient.post("/api/interview/start", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      navigate(`/interview/${data.interviewId}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to initialize session. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[120px] -z-10" />

      <button onClick={() => navigate("/dashboard")} className="absolute top-10 left-10 inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold uppercase tracking-widest text-xs">
        <FiArrowLeft /> Back to Dashboard
      </button>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="glass border border-white/10 rounded-[3rem] p-10 md:p-16 shadow-2xl">
          <header className="text-center mb-12">
            <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 text-indigo-400 border border-indigo-500/20">
              <FiBriefcase size={40} />
            </div>
            <h2 className="text-4xl font-black mb-4 tracking-tight uppercase">Initialize Session</h2>
            <p className="text-slate-400 text-lg font-medium">Power up your interview practice with AI context.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-10">
            <div>
              <label className="block text-xs font-black text-slate-500 mb-4 uppercase tracking-[0.2em]">Target Job Role</label>
              <div className="relative group">
                <FiBriefcase className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="text"
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full pl-16 pr-6 py-6 rounded-[2rem] bg-white/5 border border-white/10 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all font-bold text-lg"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-500 mb-4 uppercase tracking-[0.2em]">Your Professional Resume (PDF)</label>
              <div className={`relative rounded-[2rem] border-2 border-dashed transition-all p-12 text-center group ${file ? 'bg-indigo-500/5 border-indigo-500/50' : 'bg-white/5 border-white/10 hover:border-indigo-500/30'}`}>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <AnimatePresence mode="wait">
                  {file ? (
                    <motion.div
                      key="file"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex flex-col items-center gap-4"
                    >
                      <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                        <FiFile size={32} />
                      </div>
                      <div className="text-xl font-black uppercase tracking-tight">{file.name}</div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                        className="text-red-400 hover:text-red-300 font-bold text-sm underline uppercase tracking-widest"
                      >
                        Remove file
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex flex-col items-center gap-4"
                    >
                      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-slate-500 group-hover:text-indigo-400 transition-colors">
                        <FiUpload size={32} />
                      </div>
                      <div className="text-xl font-black uppercase tracking-tight text-slate-300">Drop your resume here</div>
                      <p className="text-slate-500 text-sm font-medium">Only PDF files are supported for best AI parsing</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold"
              >
                <FiX className="shrink-0" /> {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading || !file || !jobRole}
              className="w-full py-6 rounded-3xl bg-indigo-600 hover:bg-indigo-500 font-black text-xl disabled:opacity-50 transition-all shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-4 group overflow-hidden relative"
            >
              {loading ? (
                <div className="flex flex-col items-center gap-2">
                  <FiLoader className="animate-spin text-2xl" />
                  <span className="text-xs font-black">{uploadProgress}% Uploading</span>
                </div>
              ) : (
                <>
                  Start AI Interview <FiArrowLeft className="rotate-180 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest">
              <FiInfo /> Gemini 1.5 Enhanced Analysis
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default UploadResume;
