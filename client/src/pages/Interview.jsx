import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend, FiVideo, FiMic, FiArrowLeft, FiCpu, FiMessageSquare, FiPhoneOff, FiAward, FiTrendingUp, FiCheckCircle, FiMonitor, FiWifi, FiMicOff } from "react-icons/fi";
import { toast } from "react-hot-toast";
import io from "socket.io-client";
import apiClient from "../utils/apiClient";
import femaleAI from "../assets/femaleAI.mp4";

const Waveform = () => (
  <div className="waveform-container">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="waveform-bar" style={{ animationDelay: `${i * 0.1}s`, height: `${Math.random() * 60 + 40}%` }} />
    ))}
  </div>
);

// --- Permission Gate Component ---
// Captures streams once and passes them down to prevent double-prompting
const PermissionGate = ({ onComplete }) => {
  const [status, setStatus] = useState({ internet: false, camera: false, mic: false, screen: false });
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    setStatus(s => ({ ...s, internet: navigator.onLine }));
    const handleOnline = () => setStatus(s => ({ ...s, internet: true }));
    const handleOffline = () => setStatus(s => ({ ...s, internet: false }));
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, []);

  const requestPermissions = async () => {
    setChecking(true);
    let camMicStream = null;
    let screenStream = null;
    let cam = false, mic = false, screen = false;

    try {
      camMicStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      cam = camMicStream.getVideoTracks().length > 0;
      mic = camMicStream.getAudioTracks().length > 0;
    } catch (e) {
      toast.dismiss();
      toast.error("Camera/Mic access denied.\nPlease click the Lock 🔒 icon in your browser's URL bar, select 'Allow' for Camera and Microphone, and try again.", { id: 'cam-err', duration: 8000, unmount: null, style: { maxWidth: '500px' } });
    }

    try {
      if (cam && mic) {
        screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screen = screenStream.getVideoTracks().length > 0;
      }
    } catch (e) {
      if (cam && mic) {
        toast.dismiss();
        toast.error("Screenshare is strictly required to enter the Arena. Please select a screen or window to share.", { id: 'screen-err', duration: 6000 });
      }
    }

    setStatus(s => ({ ...s, camera: cam, mic: mic, screen: screen }));
    setChecking(false);

    if (navigator.onLine && cam && mic && screen) {
      toast.success("Ready! Initializing Arena...");
      setTimeout(() => onComplete(camMicStream, screenStream), 1000);
    } else {
      if (camMicStream) camMicStream.getTracks().forEach(t => t.stop());
      if (screenStream) screenStream.getTracks().forEach(t => t.stop());
    }
  };

  const getStatusColor = (isReady) => isReady ? "text-green-400 bg-green-400/10 border-green-400/20" : "text-slate-400 bg-white/5 border-white/10";

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-8 bg-mesh font-sans">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card max-w-lg w-full p-12 rounded-[3.5rem] border-white/10 relative overflow-hidden text-center bg-slate-900/60 shadow-2xl">
        <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">Verification Check</h2>
        <p className="text-slate-400 font-medium mb-10 text-sm italic">"Industry-standard secure environments strictly require live telemetry."</p>

        <div className="space-y-4 mb-10 text-left">
          <div className={`p-5 rounded-2xl border flex items-center justify-between ${getStatusColor(status.internet)}`}>
            <span className="font-bold uppercase tracking-widest text-[10px] flex items-center gap-3"><FiWifi size={18} /> Network Uplink</span>
            {status.internet ? <FiCheckCircle /> : <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
          </div>
          <div className={`p-5 rounded-2xl border flex items-center justify-between ${getStatusColor(status.camera)}`}>
            <span className="font-bold uppercase tracking-widest text-[10px] flex items-center gap-3"><FiVideo size={18} /> Biometric Camera</span>
            {status.camera ? <FiCheckCircle /> : <span className="w-2 h-2 rounded-full bg-amber-500" />}
          </div>
          <div className={`p-5 rounded-2xl border flex items-center justify-between ${getStatusColor(status.mic)}`}>
            <span className="font-bold uppercase tracking-widest text-[10px] flex items-center gap-3"><FiMic size={18} /> Audio Feed</span>
            {status.mic ? <FiCheckCircle /> : <span className="w-2 h-2 rounded-full bg-amber-500" />}
          </div>
          <div className={`p-5 rounded-2xl border flex items-center justify-between ${getStatusColor(status.screen)}`}>
            <span className="font-bold uppercase tracking-widest text-[10px] flex items-center gap-3"><FiMonitor size={18} /> Strategic Screenshare</span>
            {status.screen ? <FiCheckCircle /> : <span className="w-2 h-2 rounded-full bg-amber-500" />}
          </div>
        </div>

        <button onClick={requestPermissions} disabled={checking} className="w-full py-6 bg-indigo-600 rounded-[2rem] font-black uppercase text-sm tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl disabled:opacity-50 mb-4">
          {checking ? "Analyzing Environment..." : "Authorize Systems"}
        </button>

        <button onClick={() => {
          toast.success("Bypassing Telemetry for Text-Only Mode.");
          onComplete(null, null);
        }} className="w-full py-4 glass border border-white/10 text-slate-400 hover:text-white rounded-[2rem] font-bold text-[10px] uppercase tracking-widest transition-all">
          Bypass Telemetry (Text-Only Mode)
        </button>
      </motion.div>
    </div>
  );
};

// --- Main Interview Component ---
function Interview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [streams, setStreams] = useState(null); // Holds the { camMic, screen } streams passed from gate
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState("");
  const [processing, setProcessing] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [complete, setComplete] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const socketRef = useRef();
  const femaleVideoRef = useRef(null);
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  // Initialize Interview immediately once streams are passed
  useEffect(() => {
    if (!streams) return;
    fetchInterview();
    setupSpeechRecognition();

    socketRef.current = io(import.meta.env.VITE_API_URL || "http://localhost:5000");
    socketRef.current.emit("join_interview", id);
    socketRef.current.on("ai_typing", ({ typing }) => setIsTyping(typing));

    return () => {
      socketRef.current.disconnect();
      synthRef.current.cancel();
      // Cleanup streams when unmounting
      if (streams.camMic) streams.camMic.getTracks().forEach(t => t.stop());
      if (streams.screen) streams.screen.getTracks().forEach(t => t.stop());
    };
  }, [id, streams]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [interview?.history, isTyping]);

  useEffect(() => {
    // Speak the latest question
    if (interview && interview.history.length > 0 && streams) {
      const lastTurn = interview.history[interview.history.length - 1];
      if (!lastTurn.answer && !processing && !isTyping) {
        speakText(lastTurn.question);
      } else {
        if (femaleVideoRef.current && !isTyping && !processing) femaleVideoRef.current.pause();
      }
    }
  }, [interview, processing, isTyping, streams]);

  const speakText = (text) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Strictly enforce a female voice
    const voices = synthRef.current.getVoices();
    let femaleVoice = voices.find(v =>
      v.name.toLowerCase().includes("female") ||
      v.name.toLowerCase().includes("samantha") ||
      v.name.toLowerCase().includes("zira") ||
      v.name.toLowerCase().includes("victoria") ||
      v.name.toLowerCase().includes("karen") ||
      v.name.toLowerCase().includes("hazel")
    );
    // Fallback: If no explicit female name is found, take the first voice that IS NOT David, Mark, or specifically labeled 'male'
    if (!femaleVoice) {
      femaleVoice = voices.find(v =>
        !v.name.toLowerCase().includes("david") &&
        !v.name.toLowerCase().includes("mark") &&
        !v.name.toLowerCase().includes("male") &&
        !v.name.toLowerCase().includes("guy")
      );
    }

    if (femaleVoice) utterance.voice = femaleVoice;

    utterance.onstart = () => {
      if (femaleVideoRef.current) femaleVideoRef.current.play();
    };

    utterance.onend = () => {
      if (femaleVideoRef.current) femaleVideoRef.current.pause();
      // Auto-start mic after AI finishes
      if (recognitionRef.current && !processing && !complete) {
        try {
          setAnswer("");
          recognitionRef.current.start();
          setIsListening(true);
          toast.success("Mic auto-activated. AI is listening...", { icon: '🎙️' });
        } catch (e) { }
      }
    };

    synthRef.current.speak(utterance);
  };

  const setupSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true; // Essential for real-time typing effect
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let fullText = "";
        for (let j = 0; j < event.results.length; j++) fullText += event.results[j][0].transcript;
        setAnswer(fullText);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event);
        if (event.error !== 'no-speech') setIsListening(false);
      };

      recognition.onstart = () => setIsListening(true);

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      synthRef.current?.cancel();
      setAnswer("");
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        toast.success("Mic active. AI is listening...");
      } catch (e) { }
    }
  };

  const fetchInterview = async () => {
    try {
      const { data } = await apiClient.get(`/api/interview/${id}`);
      setInterview(data);
      if (data.status === "completed") setComplete(true);
    } catch (err) {
      toast.error("Arena synchronization offline.", { icon: '📡' });
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (e) => {
    e?.preventDefault();
    if (!answer.trim() || processing) return;

    if (isListening) recognitionRef.current?.stop();
    synthRef.current?.cancel();

    setProcessing(true);
    const originalAnswer = answer;
    setAnswer("");

    try {
      const { data } = await apiClient.post(`/api/interview/answer/${id}`, { answer: originalAnswer });
      setInterview(data);
    } catch (err) {
      toast.error("Signal loss detected. Retrying...");
      setAnswer(originalAnswer);
    } finally {
      setProcessing(false);
    }
  };

  const handleEvaluate = async () => {
    if (isListening) recognitionRef.current?.stop();
    synthRef.current?.cancel();
    setEvaluating(true);
    try {
      const { data } = await apiClient.get(`/api/interview/evaluate/${id}`);
      setInterview(data);
      setComplete(true);
      toast.success("AI Synthesis Complete", { icon: '📊' });
    } catch (err) {
      toast.error("Synthesis failed. Cloud compute error.");
    } finally {
      setEvaluating(false);
    }
  };

  // Pre-requisite checks
  if (!streams) return <PermissionGate onComplete={(camMic, screen) => setStreams({ camMic, screen })} />;

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-12">
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 glass-card h-[700px] skeleton" />
        <div className="lg:col-span-4 glass-card h-[700px] skeleton" />
      </div>
    </div>
  );

  if (complete) return <CompletionScreen interview={interview} navigate={navigate} />;

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-6 font-sans bg-mesh relative overflow-hidden flex flex-col h-screen max-h-screen">
      <div className="max-w-[1920px] mx-auto w-full h-full flex flex-col">

        <header className="flex justify-between items-center mb-4 shrink-0 px-2 flex-none">
          <div className="flex items-center gap-6">
            <button onClick={() => navigate("/dashboard")} className="w-10 h-10 glass rounded-xl flex items-center justify-center hover:bg-white/5 transition-all text-slate-400 hover:text-white border border-white/5">
              <FiArrowLeft size={16} />
            </button>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-center gap-3 mb-0.5">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-indigo-400">Simulation Active</span>
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tighter">{interview.jobRole} Arena</h2>
            </motion.div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border bg-green-500/10 text-green-400 border-green-500/20">
              <FiMonitor size={12} /> Screen Active
            </div>
            <button onClick={handleEvaluate} className="px-6 py-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center gap-2 active:scale-95">
              <FiPhoneOff size={12} /> Terminate
            </button>
          </div>
        </header>

        {/* Core Layout Split */}
        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden h-full">

          {/* Left Side: Massive AI Video Display */}
          <div className="lg:w-[60%] flex flex-col h-full relative">
            <div className="flex-1 rounded-3xl border border-white/10 relative bg-slate-900/60 overflow-hidden group shadow-[0_0_50px_-15px_rgba(99,102,241,0.2)]">
              <div className="absolute inset-0 bg-[#0a0f1d] flex items-center justify-center">
                <video ref={femaleVideoRef} src={femaleAI} loop muted className="w-full h-full object-cover opacity-90 transition-transform duration-[20s] ease-linear group-hover:scale-105" />

                {/* Custom Vignette & Premium Light Bleeds */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent z-10" />
                <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#020617]/80 to-transparent z-10" />
                <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-[#020617]/80 to-transparent z-10" />
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-3xl z-20 pointer-events-none" />

                <div className="absolute bottom-10 left-10 text-left z-30">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-indigo-600 rounded-md text-[9px] font-black uppercase tracking-widest inline-block shadow-lg shadow-indigo-600/40">AI Interviewer</span>
                    {(isTyping || processing) && <Waveform />}
                  </div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter text-white drop-shadow-md">Sarah Thompson Agent</h3>
                  <p className="text-indigo-300 font-bold text-xs uppercase tracking-[0.2em] font-mono mt-1">Lead Talent Engine</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Sleek Interaction Feed */}
          <div className="lg:w-[40%] flex flex-col rounded-3xl bg-[#0a0f1d]/80 border border-white/5 shadow-2xl overflow-hidden h-full backdrop-blur-xl relative">

            {/* Header */}
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between shrink-0 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                  <FiMessageSquare size={14} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-200">Neural Transcript</h4>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Live Communication Link</p>
                </div>
              </div>
              <div className="px-3 py-1.5 bg-white/5 rounded-md border border-white/5 text-[10px] font-black text-slate-400 font-mono tracking-widest">
                {interview.history.length}/10 Qs
              </div>
            </div>

            {/* Chat Feed */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8 scroll-smooth">
              {interview.history.map((turn, i) => (
                <div key={i} className="space-y-6">
                  {/* AI Message */}
                  <div className="flex flex-col items-start w-full pr-8">
                    <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1.5 ml-1">Sarah Thompson</span>
                    <div className="px-5 py-4 bg-[#1e243b]/40 border border-indigo-500/20 rounded-2xl rounded-tl-sm font-medium leading-[1.6] text-[13px] shadow-sm text-slate-300 backdrop-blur-sm relative group w-full overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                      {turn.question}
                    </div>
                  </div>

                  {/* Candidate Message */}
                  {turn.answer && (
                    <div className="flex flex-col items-end w-full pl-8 ml-auto">
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5 mr-1">Candidate</span>
                      <div className="px-5 py-4 bg-white/[0.03] border border-white/10 rounded-2xl rounded-tr-sm font-medium leading-[1.6] text-[13px] shadow-sm text-slate-300 backdrop-blur-sm relative group w-full overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/5 to-transparent translate-x-[100%] group-hover:translate-x-[-100%] transition-transform duration-1000" />
                        {turn.answer}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-start pr-8">
                  <span className="text-[8px] font-black text-indigo-400 animate-pulse uppercase tracking-widest mb-1.5 ml-1">Calculating Response...</span>
                  <div className="px-5 py-4 bg-[#1e243b]/40 border border-indigo-500/20 rounded-2xl rounded-tl-sm flex gap-2 items-center h-[54px]">
                    <span className="w-1.5 h-1.5 bg-indigo-500/50 rounded-full animate-ping" />
                    <span className="w-1.5 h-1.5 bg-indigo-500/70 rounded-full animate-ping" style={{ animationDelay: '0.2s' }} />
                    <span className="w-1.5 h-1.5 bg-indigo-500/90 rounded-full animate-ping" style={{ animationDelay: '0.4s' }} />
                  </div>
                </motion.div>
              )}
              <div ref={chatEndRef} className="h-4" />
            </div>

            {/* Answer Input Area */}
            <form onSubmit={submitAnswer} className="p-5 bg-[#0a0f1d] border-t border-white/5 shrink-0 flex flex-col gap-3 relative z-20">
              <div className="flex justify-between items-center px-1">
                <span className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em]">Your Response</span>
                <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-1.5 py-1 px-2 rounded bg-black/50">
                  {isListening ? <><span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" /> Active Sync...</> : "Idle"}
                </p>
              </div>

              <div className="relative flex items-end gap-3">
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center transition-all ${isListening ? 'bg-red-500/10 text-red-500 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)] hover:bg-red-500/20' : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10'}`}
                >
                  {isListening ? <FiMicOff size={16} /> : <FiMic size={16} />}
                </button>

                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder={isListening ? "Dictating your answer in real-time..." : "Type or dictate your technical response..."}
                  rows="2"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-[13px] font-medium focus:outline-none focus:border-indigo-500/50 focus:bg-white/5 transition-colors custom-scrollbar resize-none placeholder-slate-600"
                />

                <button
                  type="submit"
                  disabled={processing || !answer.trim()}
                  className="w-12 h-12 shrink-0 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-500 active:scale-95 transition-all shadow-lg disabled:opacity-40 disabled:active:scale-100 disabled:hover:bg-indigo-600"
                >
                  <FiSend size={14} className="mr-0.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {evaluating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-[40px] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-32 h-32 rounded-full border-4 border-indigo-500/10 mb-8 relative">
              <div className="absolute inset-0 w-32 h-32 rounded-full border-t-4 border-indigo-500 animate-spin" />
              <FiTrendingUp className="absolute inset-0 m-auto text-4xl text-indigo-400 animate-pulse" />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">Neural Evaluation</h2>
            <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] animate-pulse">Drafting strategic audit report...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Completion Screen Component ---
const CompletionScreen = ({ interview, navigate }) => (
  <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-8 font-sans bg-mesh relative overflow-y-auto">
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-5xl glass-card rounded-[4rem] p-16 text-center relative overflow-hidden my-20 border-white/10 bg-slate-900/50">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-indigo-500/10 rounded-full blur-[120px] -z-10" />
      <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-10 text-white shadow-2xl shadow-indigo-600/40">
        <FiAward size={48} />
      </div>
      <h2 className="text-5xl md:text-6xl font-black mb-6 uppercase tracking-tighter italic">Mission Accomplished</h2>
      <p className="text-slate-400 text-lg font-medium mb-16">Strategic analysis for the <span className="text-indigo-400 font-black">{interview.jobRole}</span> role is now complete.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 text-left">
        <div className="space-y-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center font-black text-4xl shadow-2xl shadow-indigo-600/30">{interview.score}</div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-1">Total Audit Score</h4>
              <p className="text-indigo-400 font-black uppercase tracking-widest text-sm">Strategic Tier Assessed</p>
            </div>
          </div>
          <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
            <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4">
              <FiCheckCircle className="text-green-500" /> Executive Summary
            </h4>
            <div className="text-sm font-medium leading-relaxed text-slate-300 italic">"{interview.feedback}"</div>
          </div>
        </div>

        <div className="p-8 bg-indigo-600 rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(79,70,229,0.3)] flex flex-col relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-white/10 rounded-full blur-[80px]" />
          <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-6"><FiTrendingUp /> Technical Output</h4>
          <p className="text-lg font-bold leading-relaxed mb-10 text-white">Your neural telemetry has been logged successfully. The audit breakdown is prepared for export.</p>
          <div className="flex items-center gap-4 mt-auto pt-6 border-t border-white/10">
            <div className="w-12 h-12 rounded-[1rem] bg-white/20 flex items-center justify-center text-xl"><FiCpu /></div>
            <div>
              <p className="font-black uppercase tracking-widest text-xs text-white">System Automated</p>
              <p className="text-white/60 text-[9px] font-bold uppercase tracking-widest">Interview Engine Offline</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-6">
        <button onClick={() => navigate("/dashboard")} className="px-12 py-5 bg-white text-slate-950 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">Arena Return</button>
        <button onClick={() => navigate(`/report/${interview._id}`)} className="px-12 py-5 glass hover:bg-white/5 rounded-[2rem] font-black text-sm uppercase border-white/20 transition-all">Neural Audit</button>
      </div>
    </motion.div>
  </div>
);

export default Interview;
