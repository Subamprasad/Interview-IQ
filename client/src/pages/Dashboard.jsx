import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiArrowRight, FiFileText, FiClock, FiAward, FiLogOut, FiBarChart2, FiCpu, FiUser } from "react-icons/fi";
import { toast } from "react-hot-toast";
import apiClient from "../utils/apiClient";
import historyImg from "../assets/history.png";

const DashboardSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {[1, 2, 3].map((i) => (
      <div key={i} className="glass-card h-80 skeleton" />
    ))}
  </div>
);

function Dashboard() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Industry-Tier User Identity System
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user.name || "Candidate";

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const { data } = await apiClient.get("/api/interview/user");
      setInterviews(data);
    } catch (err) {
      toast.error("Cloud synchronization failed. Retrying...", { icon: '🔄' });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    toast.success("Security session terminated.");
    navigate("/auth");
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12 relative overflow-hidden bg-mesh font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Intelligence Command</span>
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.6)]" />
            </div>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">
              {userName}'s Command Center
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-4 flex items-center gap-2">
              <FiUser className="text-indigo-400" /> Authorized Strategic Access Enabled
            </p>
          </motion.div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/upload-resume")}
              className="px-10 py-5 bg-white text-slate-950 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shadow-2xl shadow-indigo-500/20"
            >
              <FiPlus className="text-xl" /> New Simulation
            </button>
            <button
              onClick={logout}
              className="w-16 h-16 glass text-indigo-400 rounded-2xl flex items-center justify-center hover:bg-white/5 transition-all group"
            >
              <FiLogOut className="group-hover:rotate-12 transition-transform text-xl" />
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DashboardSkeleton />
            </motion.div>
          ) : interviews.length > 0 ? (
            <motion.div
              key="content"
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {interviews.map((session) => (
                <motion.div key={session._id} variants={item}>
                  <Link
                    to={session.status === "completed" ? `/report/${session._id}` : `/interview/${session._id}`}
                    className="block glass-card h-full group relative overflow-hidden border-white/5 hover:border-indigo-500/30"
                  >
                    <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-all duration-700 group-hover:scale-125">
                      <FiCpu size={140} />
                    </div>

                    <div className="flex justify-between items-start mb-10">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${session.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                        {session.status}
                      </span>
                      <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                        <FiClock /> {new Date(session.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <h3 className="text-3xl font-black uppercase tracking-tighter mb-3 group-hover:text-indigo-400 transition-colors">{session.jobRole}</h3>
                    <p className="text-slate-500 text-sm font-medium mb-12 line-clamp-2 leading-relaxed italic">"{session.feedback || "AI agent is currently calculating strategic follow-ups..."}"</p>

                    <div className="mt-auto flex items-center justify-between pt-8 border-t border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-2xl shadow-indigo-600/30">
                          {session.score || "—"}
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Efficiency</p>
                          <p className="text-xs font-bold text-white">Score Tier</p>
                        </div>
                      </div>
                      <div className="w-10 h-10 glass rounded-full flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all">
                        <FiArrowRight />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass p-24 rounded-[4rem] text-center border-white/5 bg-slate-900/40 overflow-hidden relative"
            >
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <img src={historyImg} className="w-full h-full object-cover" alt="History Background" />
              </div>
              <div className="relative z-10 text-center">
                <div className="w-24 h-24 bg-indigo-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-10 text-indigo-400 border border-indigo-500/20 shadow-inner">
                  <FiBarChart2 size={48} />
                </div>
                <h3 className="text-4xl font-black uppercase tracking-tighter mb-4">Strategic Void Detected</h3>
                <p className="text-slate-400 text-xl font-medium mb-12 max-w-lg mx-auto leading-relaxed">Your professional simulation history is empty. Initialize your first arena to receive elite AI performance audits.</p>
                <button
                  onClick={() => navigate("/upload-resume")}
                  className="px-14 py-6 bg-indigo-600 rounded-[2.5rem] font-black text-lg uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/30 hover:scale-105 active:scale-95"
                >
                  Initialize Primary Arena
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Dashboard;
