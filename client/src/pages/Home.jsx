import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { FiArrowRight, FiCheckCircle, FiPlay, FiGithub, FiZap, FiShield, FiMic, FiAward, FiCpu, FiTrendingUp } from "react-icons/fi";
import hrImg from "../assets/HR.png";
import techImg from "../assets/tech.png";
import confiImg from "../assets/confi.png";
import resumeImg from "../assets/resume.png";
import pdfImg from "../assets/pdf.png";
import img1 from "../assets/img1.png";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ${scrolled ? 'py-4' : 'py-8'}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className={`glass border border-white/10 rounded-[2rem] px-8 py-4 flex items-center justify-between transition-all duration-500 ${scrolled ? 'bg-slate-950/80 shadow-2xl' : 'bg-transparent'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-cyan-400 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-indigo-500/20">IQ</div>
            <span className="text-xl font-black tracking-tighter uppercase text-white">InterviewIQ</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-white/60">
            <a href="#features" className="hover:text-indigo-400 transition-colors">Intelligence</a>
            <a href="#demo" className="hover:text-indigo-400 transition-colors">Arena</a>
            <a href="#pricing" className="hover:text-indigo-400 transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth" className="text-xs font-black uppercase tracking-widest text-white/80 hover:text-white transition-colors">Log In</Link>
            <Link to="/auth" className="px-6 py-3 bg-white text-slate-950 rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl">Get Started</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

function Home() {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30 overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <motion.div
          style={{ opacity, scale }}
          className="max-w-7xl mx-auto text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md"
          >
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Powered by Gemini 1.5 & Back4App</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl lg:text-9xl font-black mb-8 leading-[1] tracking-tighter"
          >
            THE ULTIMATE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-500">INTERVIEW ARENA</span>
          </motion.h1>

          <p
            className="text-slate-400 text-lg md:text-2xl font-medium max-w-3xl mx-auto mb-16 leading-relaxed"
          >
            Experience hyper-realistic AI simulations that mirror elite tech interviews. adapt, learn, and dominate your next career move with industry-standard audits.
          </p>

          <div
            className="flex flex-wrap items-center justify-center gap-6 mb-20"
          >
            <button
              onClick={() => navigate("/auth")}
              className="group relative px-10 py-6 bg-white text-slate-950 rounded-[2rem] font-black text-lg uppercase tracking-widest overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-indigo-500/20"
            >
              <span className="relative z-10 flex items-center gap-3">
                Join the Arena <FiPlay className="fill-current" />
              </span>
            </button>
            <button className="px-10 py-6 glass border-white/10 rounded-[2rem] font-black text-lg uppercase tracking-widest hover:bg-white/5 transition-all flex items-center gap-3 group">
              Watch Showcase <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative max-w-5xl mx-auto"
          >
            <div className="glass overflow-hidden rounded-[3rem] border-white/10 shadow-2xl">
              <img src={img1} className="w-full opacity-80" alt="Platform Preview" />
            </div>
            <div className="absolute -bottom-10 -right-10 w-48 h-48 glass rounded-[2rem] border-white/10 p-6 hidden md:block">
              <div className="w-full h-full bg-indigo-600 rounded-2xl flex flex-col items-center justify-center text-center">
                <FiAward className="text-3xl mb-2" />
                <span className="text-[10px] font-black uppercase tracking-widest leading-tight">Industry <br /> Certified</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <FeatureCard
              image={techImg}
              icon={<FiCpu className="text-indigo-400" />}
              title="Adaptive AI"
              description="Questions evolve based on your technical depth, just like a real Senior Recruiter."
            />
            <FeatureCard
              image={hrImg}
              icon={<FiShield className="text-cyan-400" />}
              title="Elite Security"
              description="Enterprise-grade authentication and data handling with Back4App integration."
            />
            <FeatureCard
              image={confiImg}
              icon={<FiTrendingUp className="text-amber-400" />}
              title="Audit Reports"
              description="Get a 100-point breakdown of your performance with actionable growth tips."
            />
            <FeatureCard
              image={resumeImg}
              icon={<FiZap className="text-indigo-400" />}
              title="Resume Pulse"
              description="AI analyzes your resume to craft personalized challenges for your role."
            />
            <FeatureCard
              image={pdfImg}
              icon={<FiAward className="text-indigo-400" />}
              title="PDF Intelligence"
              description="Upload certificates and past evaluations for a deeper AI context."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-black">IQ</div>
            <span className="text-sm font-black uppercase tracking-widest">InterviewIQ Elite v2.0</span>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">© 2026 Developed for Industry Excellence</p>
        </div>
      </footer>
    </div>
  );
}

const FeatureCard = ({ image, icon, title, description }) => (
  <motion.div
    whileHover={{ y: -10 }}
    className="glass rounded-[3rem] border-white/5 group hover:border-indigo-500/30 transition-all duration-500 overflow-hidden"
  >
    <div className="h-48 overflow-hidden relative">
      <img src={image} className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" alt={title} />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
    </div>
    <div className="p-10">
      <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 text-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
        {icon}
      </div>
      <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">{title}</h3>
      <p className="text-slate-400 font-medium leading-relaxed">{description}</p>
    </div>
  </motion.div>
);

export default Home;
