import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft, FiAward, FiCheckCircle, FiTrendingUp, FiClock, FiFileText, FiBarChart2, FiDownload } from "react-icons/fi";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { toast } from "react-hot-toast";
import apiClient from "../utils/apiClient";

function Report() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [interview, setInterview] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInterview();
    }, [id]);

    const fetchInterview = async () => {
        try {
            const { data } = await apiClient.get(`/api/interview/${id}`);
            setInterview(data);
        } catch (err) {
            console.error("Error fetching report:", err);
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = async () => {
        const element = document.getElementById("report-content");
        if (!element) return;

        try {
            const { default: jsPDF } = await import("jspdf");
            const { default: html2canvas } = await import("html2canvas");

            const canvas = await html2canvas(element, {
                scale: 2,
                backgroundColor: "#020617",
                logging: false,
                useCORS: true
            });

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`InterviewIQ_Audit_${interview.jobRole.replace(/\s+/g, '_')}.pdf`);
            toast.success("Strategic Audit downloaded successfully.", { icon: '⤓' });
        } catch (error) {
            console.error("PDF Generation Error:", error);
            toast.error("Failed to generate PDF audit.");
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!interview) return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6">
            <h2 className="text-2xl font-black mb-4">Report Not Found</h2>
            <button onClick={() => navigate("/dashboard")} className="px-6 py-3 bg-indigo-600 rounded-xl font-bold">Back to Dashboard</button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#020617] text-white font-sans p-6 md:p-12">
            <div className="max-w-6xl mx-auto" id="report-content">
                {/* Navigation */}
                <button
                    onClick={() => navigate("/dashboard")}
                    data-html2canvas-ignore="true"
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-12 transition-colors font-black uppercase tracking-widest text-xs"
                >
                    <FiArrowLeft /> Back to Command Center
                </button>

                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass border border-white/10 rounded-[3rem] p-10 md:p-16 mb-10 overflow-hidden relative"
                >
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] -z-10" />

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-4 py-1 bg-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Detailed Analysis</span>
                                <span className="text-slate-500 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                                    <FiClock /> {new Date(interview.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-4">{interview.jobRole}</h1>
                            <p className="text-slate-400 text-lg font-medium max-w-xl line-clamp-2">{interview.feedback}</p>
                        </div>

                        <div className="flex flex-col items-center gap-4 p-8 glass bg-white/5 rounded-[2.5rem] border-white/10 min-w-[240px]">
                            <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Overall Proficiency</div>
                            <div className="text-7xl font-black text-indigo-400">{interview.score}</div>
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-4">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${interview.score}%` }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                    className="h-full bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Detailed Feedback */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-1 space-y-10"
                    >
                        <div className="glass border border-white/10 rounded-[2.5rem] p-10">
                            <h3 className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.3em] text-slate-500 mb-8">
                                <FiBarChart2 className="text-indigo-400" /> Neural Metrics
                            </h3>

                            <div className="h-64 w-full mb-8 relative z-10 bg-slate-900/40 rounded-3xl border border-white/5 shadow-inner">
                                {interview.metrics ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="65%" data={[
                                            { subject: 'Accuracy', A: interview.metrics.accuracy || 0, fullMark: 100 },
                                            { subject: 'Communication', A: interview.metrics.communication || 0, fullMark: 100 },
                                            { subject: 'Problem Solving', A: interview.metrics.problemSolving || parseInt(interview.score), fullMark: 100 },
                                            { subject: 'Technical Depth', A: interview.metrics.technicalDepth || 0, fullMark: 100 },
                                            { subject: 'Relevance', A: interview.metrics.relevance || 0, fullMark: 100 },
                                        ]}>
                                            <PolarGrid stroke="#ffffff20" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#ffffff50', fontSize: 9 }} stroke="#ffffff20" />
                                            <Radar name="Candidate" dataKey="A" stroke="#818cf8" strokeWidth={2} fill="#6366f1" fillOpacity={0.4} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs font-bold uppercase tracking-widest gap-2">
                                        <FiClock size={24} className="animate-spin text-indigo-500" />
                                        Generating Visuals...
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 relative overflow-hidden flex items-center justify-between">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Audit Score</h4>
                                    <span className="font-mono font-black text-indigo-400 text-lg">{interview.score}%</span>
                                </div>
                            </div>
                        </div>

                        <button onClick={() => window.print()} className="w-full py-6 glass border border-white/10 rounded-[2rem] flex items-center justify-center gap-4 font-black uppercase tracking-[0.2em] hover:bg-white/5 transition-all text-sm">
                            <FiDownload /> Download Full Audit
                        </button>
                    </motion.div>

                    {/* Transcript Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="lg:col-span-2 glass border border-white/10 rounded-[2.5rem] p-10 md:p-14"
                    >
                        <h3 className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.3em] text-slate-500 mb-12">
                            <FiFileText className="text-indigo-400" /> Session Transcript
                        </h3>

                        <div className="space-y-12">
                            {interview.history.map((turn, i) => (
                                <div key={i} className="relative pl-12">
                                    <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-slate-500">
                                        {i + 1}
                                    </div>
                                    <div className="space-y-6">
                                        <div className="space-y-2 text-left">
                                            <span className="text-[9px] font-black text-indigo-400/60 uppercase tracking-widest">AI Interviewer</span>
                                            <p className="text-lg font-bold leading-relaxed text-slate-100">{turn.question}</p>
                                        </div>
                                        {turn.answer && (
                                            <div className="p-6 bg-indigo-600/10 border border-indigo-600/20 rounded-3xl text-sm font-medium leading-relaxed text-slate-300">
                                                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block mb-1">Your Response</span>
                                                "{turn.answer}"
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

export default Report;
