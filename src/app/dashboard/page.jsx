"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function Dashboard() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [jobRole, setJobRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState(null);

  // ==============================
  // Get Logged In User
  // ==============================
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch (err) {
        router.push("/login");
      }
    };

    fetchUser();
  }, [router]);

  // ==============================
  // Logout
  // ==============================
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  // ==============================
  // Polling Function
  // ==============================
  const pollAnalysisStatus = (analysisId) => {
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/resumes/${analysisId}`);
        const data = res.data;

        if (data.status === "completed") {
          clearInterval(interval);
          alert("Analysis Completed ✅");
          router.push(`/dashboard/history/${analysisId}`);
        }

        if (data.status === "failed") {
          clearInterval(interval);
          alert("Analysis Failed ❌");
        }

      } catch (err) {
        clearInterval(interval);
        console.error("Polling error:", err);
      }
    }, 3000); // check every 3 seconds
  };

  // ==============================
  // Submit Resume
  // ==============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!jobDescription || files.length === 0) {
      alert("Job description and resume required ❌");
      return;
    }

    setLoading(true);
    setAnalysisStatus("processing");

    try {
      const formData = new FormData();
      formData.append("job_role", jobRole);
      formData.append("job_description", jobDescription);

      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      const res = await api.post("/resumes/analyze", formData);

      const analysisId = res.data.analysis_id;

      // Start polling
      pollAnalysisStatus(analysisId);

      setJobRole("");
      setJobDescription("");
      setFiles([]);

    } catch (err) {
      console.error(err);
      alert("Something went wrong ❌");
      setAnalysisStatus(null);
    }

    setLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">

      {/* ================= TOP NAV ================= */}
      <div className="flex justify-between items-center p-6 border-b border-neutral-800">

        <h1 className="text-lg font-semibold">
          Welcome, {user.name}
        </h1>

        <div className="flex gap-4">
          <button
            onClick={() => router.push("/dashboard/history")}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            View History
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </div>

      {/* ================= MAIN SECTION ================= */}
      <div className="flex justify-center mt-16 px-4">
        <div className="w-full max-w-xl bg-neutral-900 p-8 rounded shadow">

          <h2 className="text-2xl font-bold mb-6 text-center">
            Resume Analyzer
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block mb-2 text-sm text-gray-400">
                Job Role
              </label>
              <input
                type="text"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded"
                placeholder="Frontend Developer"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm text-gray-400">
                Job Description *
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded h-32"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm text-gray-400">
                Upload Resume *
              </label>
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx"
                onChange={(e) => setFiles(e.target.files)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-black py-3 rounded font-semibold"
            >
              {loading ? "Submitting..." : "Analyze Resume"}
            </button>

            {/* 🔥 SHOW STATUS BELOW BUTTON */}
            {analysisStatus === "processing" && (
              <p className="text-yellow-400 text-center mt-3">
                Processing resumes... Please wait ⏳
              </p>
            )}

          </form>

        </div>
      </div>
    </div>
  );
}