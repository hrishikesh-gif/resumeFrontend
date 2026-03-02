"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { apiErrorToMessage } from "@/lib/apiError";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".pdf", ".docx"];

export default function Dashboard() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [jobRole, setJobRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState(null);

  const canSubmit = !loading && jobDescription.trim().length > 0 && files.length > 0;

  const validateFiles = (selectedFiles) => {
    for (const file of selectedFiles) {
      const name = file.name.toLowerCase();
      const hasAllowedExtension = ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
      if (!hasAllowedExtension) {
        return `Unsupported file type: ${file.name}. Use PDF or DOCX only.`;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        return `File too large: ${file.name}. Max allowed size is ${MAX_FILE_SIZE_BYTES} bytes.`;
      }
    }
    return null;
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch {
        router.push("/login");
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const pollAnalysisStatus = (analysisId) => {
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/resumes/${analysisId}`);
        const data = res.data;

        if (data.status === "completed") {
          clearInterval(interval);
          alert("Analysis completed");
          router.push(`/dashboard/history/${analysisId}`);
          return;
        }
      } catch (err) {
        clearInterval(interval);

        if (err?.response?.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        alert(apiErrorToMessage(err, "Polling failed"));
      }
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!jobDescription.trim() || files.length === 0) {
      alert("Job description and at least one resume are required.");
      return;
    }

    const validationError = validateFiles(files);
    if (validationError) {
      alert(validationError);
      return;
    }

    setLoading(true);
    setAnalysisStatus("processing");

    try {
      const formData = new FormData();
      formData.append("job_role", jobRole);
      formData.append("job_description", jobDescription);
      files.forEach((file) => formData.append("files", file));

      const res = await api.post("/resumes/analyze", formData);
      pollAnalysisStatus(res.data.analysis_id);

      setJobRole("");
      setJobDescription("");
      setFiles([]);
    } catch (err) {
      alert(apiErrorToMessage(err, "Failed to start analysis"));
      setAnalysisStatus(null);
    } finally {
      setLoading(false);
    }
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
      <div className="flex justify-between items-center p-6 border-b border-neutral-800">
        <h1 className="text-lg font-semibold">Welcome, {user.name}</h1>

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

      <div className="flex justify-center mt-16 px-4">
        <div className="w-full max-w-xl bg-neutral-900 p-8 rounded shadow">
          <h2 className="text-2xl font-bold mb-6 text-center">Resume Analyzer</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-2 text-sm text-gray-400">Job Role</label>
              <input
                type="text"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded"
                placeholder="Frontend Developer"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm text-gray-400">Job Description *</label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded h-32"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm text-gray-400">
                Upload resumes (PDF, DOCX only, max 5 MB each) *
              </label>
              <input
                type="file"
                multiple
                accept=".pdf,.docx"
                onChange={(e) => {
                  const selectedFiles = Array.from(e.target.files || []);
                  const validationError = validateFiles(selectedFiles);
                  if (validationError) {
                    alert(validationError);
                    e.target.value = "";
                    setFiles([]);
                    return;
                  }
                  setFiles(selectedFiles);
                }}
                className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full bg-yellow-600 hover:bg-green-500 text-black py-3 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting..." : "Analyze Resume"}
            </button>

            {analysisStatus === "processing" && (
              <p className="text-yellow-400 text-center mt-3">
                Processing resumes... Please wait
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
