import jsPDF from "jspdf";
import { useState } from "react";

export default function Home() {
    const [file, setFile] = useState<File | null>(null);
    const [message, setMessage] = useState("");
    const [analysis, setAnalysis] = useState<any>(null);
    const [jobDescription, setJobDescription] = useState("");

    const downloadReport = () => {
        if (!analysis) return;

        const doc = new jsPDF();

        let y = 20;

        doc.setFontSize(22);
        doc.text("AI Resume Analysis Report", 20, y);

        y += 15;

        doc.setFontSize(16);
        doc.text(`ATS Score: ${analysis.atsScore}/100`, 20, y);

        if (analysis.jobMatch !== undefined) {
            y += 10;
            doc.text(`Job Match: ${analysis.jobMatch}%`, 20, y);
        }

        y += 15;

        doc.setFontSize(14);
        doc.text("Summary", 20, y);

        y += 8;

        const summary = doc.splitTextToSize(
            analysis.summary || "",
            170
        );

        doc.setFontSize(11);
        doc.text(summary, 20, y);

        y += summary.length * 6 + 10;

        function addList(title: string, items: string[]) {
            if (!items || items.length === 0) return;

            if (y > 260) {
                doc.addPage();
                y = 20;
            }

            doc.setFontSize(14);
            doc.text(title, 20, y);

            y += 8;

            doc.setFontSize(11);

            items.forEach((item) => {
                if (y > 270) {
                    doc.addPage();
                    y = 20;
                }

                const lines = doc.splitTextToSize("• " + item, 170);

                doc.text(lines, 25, y);

                y += lines.length * 6 + 2;
            });

            y += 8;
        }

        addList("Strengths", analysis.strengths);
        addList("Weaknesses", analysis.weaknesses);
        addList("Matching Skills", analysis.matchingSkills);
        addList("Missing Skills", analysis.missingSkills);
        addList("Missing Keywords", analysis.missingKeywords);
        addList("Suggestions", analysis.suggestions);

        doc.save("Resume-Analysis-Report.pdf");
    };

    async function uploadResume() {
        if (!file) {
            setMessage("Please choose a PDF first.");
            return;
        }

        const formData = new FormData();
        formData.append("resume", file);
        formData.append("jobDescription", jobDescription);

        try {
            setMessage("🔄 Analyzing your resume...");
            setAnalysis(null);
            const response = await fetch(
                "http://localhost:5000/api/resume/upload",
                {
                    method: "POST",
                    body: formData,
                }
            );

            const data = await response.json();

            console.log("Server Response:", data);

            if (!response.ok) {
                setMessage(data.error || "Upload failed.");
                return;
            }

            setMessage("✅ Analysis Complete!");
            setAnalysis(data.analysis);

        } catch (error) {
            console.error("Upload Error:", error);
            setMessage("❌ Cannot connect to backend.");
        }
    }

    const scoreColor =
        analysis?.atsScore >= 80
            ? "text-green-600"
            : analysis?.atsScore >= 60
                ? "text-yellow-500"
                : "text-red-500";

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-100 p-10">

            <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl p-10">

                <h1 className="text-5xl font-bold text-center text-blue-700 mb-3">
                    AI Resume Analyzer
                </h1>

                <p className="text-center text-gray-600 mb-10">
                    Upload your resume and receive AI-powered ATS feedback.
                </p>

                <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="block w-full rounded-xl border-2 border-blue-300 bg-gray-50 p-4 text-gray-800 mb-6"
                />

                <div className="mb-8">

                    <label className="block text-lg font-semibold text-gray-800 mb-3">
                        Job Description (Optional)
                    </label>

                    <textarea
                        rows={8}
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste the job description here..."
                        className="w-full rounded-xl border-2 border-blue-300 bg-blue-50 p-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                </div>

                <button
                    onClick={uploadResume}
                    className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 transition text-white font-bold py-4 text-lg shadow-lg"
                >
                    Analyze Resume
                </button>

                <div className="mt-6 text-center">
                    <p className="font-semibold text-lg text-gray-700">
                        {message}
                    </p>
                </div>

                {analysis && (
                    <div className="mt-10">

                        <div className="flex justify-center mb-10">

                            <div className="w-52 h-52 rounded-full border-8 border-green-500 flex items-center justify-center shadow-xl bg-gradient-to-br from-green-100 to-green-300">

                                <div className="text-center">

                                    <p className="text-lg font-semibold text-gray-700">
                                        ATS Score
                                    </p>

                                    <p className={`text-6xl font-bold ${scoreColor}`}>
                                        {analysis.atsScore}
                                    </p>

                                    <p className="text-gray-700 font-medium">
                                        /100
                                    </p>

                                </div>

                            </div>

                        </div>
                        {analysis.jobMatch && (
                            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl shadow-md p-6 mb-6">

                                <h2 className="text-2xl font-bold text-indigo-700 mb-3">
                                    🎯 Job Match
                                </h2>

                                <p className="text-5xl font-bold text-indigo-600">
                                    {analysis.jobMatch}%
                                </p>

                            </div>
                        )}

                        <div className="bg-blue-50 border border-blue-200 rounded-2xl shadow-md p-6 mb-6">

                            <h2 className="text-2xl font-bold text-blue-700 mb-3">
                                📝 Summary
                            </h2>

                            <p className="text-gray-700 leading-relaxed">
                                {analysis.summary}
                            </p>

                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-2xl shadow-md p-6 mb-6">

                            <h2 className="text-2xl font-bold text-green-700 mb-3">
                                💪 Strengths
                            </h2>

                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                {analysis.strengths?.map((item: string, index: number) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>

                        </div>

                        <div className="bg-red-50 border border-red-200 rounded-2xl shadow-md p-6 mb-6">

                            <h2 className="text-2xl font-bold text-red-700 mb-3">
                                ⚠️ Weaknesses
                            </h2>

                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                {analysis.weaknesses?.map((item: string, index: number) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>

                        </div>
                        {analysis.matchingSkills && (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl shadow-md p-6 mb-6">

                                <h2 className="text-2xl font-bold text-emerald-700 mb-3">
                                    ✅ Matching Skills
                                </h2>

                                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                    {analysis.matchingSkills.map((item: string, index: number) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>

                            </div>
                        )}

                        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl shadow-md p-6 mb-6">

                            <h2 className="text-2xl font-bold text-yellow-700 mb-3">
                                ❌ Missing Skills
                            </h2>

                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                {analysis.missingSkills?.map((item: string, index: number) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>

                        </div>

                        {analysis.missingKeywords && (
                            <div className="bg-orange-50 border border-orange-200 rounded-2xl shadow-md p-6 mb-6">

                                <h2 className="text-2xl font-bold text-orange-700 mb-3">
                                    🔍 Missing Keywords
                                </h2>

                                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                    {analysis.missingKeywords.map((item: string, index: number) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>

                            </div>
                        )}

                        <div className="bg-purple-50 border border-purple-200 rounded-2xl shadow-md p-6 mb-6">

                            <h2 className="text-2xl font-bold text-purple-700 mb-3">
                                💡 Suggestions
                            </h2>

                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                {analysis.suggestions?.map((item: string, index: number) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>

                        </div>

                        <div className="mt-10 flex justify-center">
                            <button
                                onClick={downloadReport}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg transition"
                            >
                                📄 Download Report
                            </button>
                        </div>

                    </div>
                )}

            </div>

        </main>
    );
}