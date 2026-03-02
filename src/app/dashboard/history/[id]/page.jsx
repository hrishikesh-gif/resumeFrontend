"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { apiErrorToMessage } from "@/lib/apiError";

/* ================= Candidate Card Component ================= */
function CandidateCard({ candidate }) {
  const [showAll, setShowAll] = useState(false);

  const skills = candidate.matched_skills || [];
  const visibleSkills = showAll ? skills : skills.slice(0, 3);

  return (
    <div className="border p-4 rounded shadow">
      <div className="flex justify-between">
        <h2 className="font-semibold text-lg">
          {candidate.name}
        </h2>
        <span className="font-bold text-blue-600">
          {candidate.match_score}%
        </span>
      </div>

      <p>Email: {candidate.email}</p>
      <p>Contact: {candidate.contact_number}</p>
      <p>
        Priority:{" "}
        <span className="font-medium">
          {candidate.interview_priority}
        </span>
      </p>

      {skills.length > 0 && (
        <div className="mt-3">
          <p className="font-medium">Matched Skills:</p>

          <ul className="list-disc list-inside mt-1 text-sm text-gray-300">
            {visibleSkills.map((skill, index) => (
              <li key={index}>{skill}</li>
            ))}
          </ul>

          {skills.length > 3 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-blue-600 text-sm mt-1 hover:underline"
            >
              {showAll ? "Show Less" : "Show More"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ================= Detail Page ================= */

export default function DetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/resumes/${id}`);
        setData(res.data);
      } catch (err) {
        const status = err?.response?.status;

        if (status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }
        if (status === 403) {
          setError("🚫 Access denied.");
          return;
        }
        if (status === 404) {
          setError("❌ Analysis not found.");
          return;
        }
        if (status === 429) {
          setError("⚠️ Quota exceeded. Please try again later.");
          return;
        }
        if (status === 500) {
          setError("🔥 Server error. Please retry.");
          return;
        }

        setError("Network error. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id, router]);

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "⚠️ Are you sure you want to delete this analysis? This action cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/resumes/${id}`);

      alert("✅ Analysis deleted successfully");
      router.push("/dashboard/history");
    } catch (error) {
      if (error?.response?.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }
      alert(apiErrorToMessage(error, "Failed to delete analysis"));
    }
  };

  const handleDownload = async () => {
    try {
      const response = await api.get(`/resumes/${id}/download`, {
        responseType: "blob",
      });
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;

      const contentDisposition = response.headers["content-disposition"];

      let fileName = "analysis.xlsx";

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+)"?/);
        if (match?.[1]) {
          fileName = match[1];
        }
      }

      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      if (error?.response?.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }
      if (error?.response?.status === 429) {
        alert(apiErrorToMessage(error, "Quota exceeded. Cannot download."));
        return;
      }
      alert(apiErrorToMessage(error, "Download failed"));
    }
  };

  // 🔥 Error UI
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          {error}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => window.location.reload()}
            className="bg-yellow-500 text-white px-4 py-2 rounded"
          >
            Retry
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Dashboard
          </button>

          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    );
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (!data) return <div className="p-6">No data found.</div>;

  if (data.status === "processing") {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold">
          Analysis still processing...
        </h2>
      </div>
    );
  }

  if (data.status === "failed") {
    return (
      <div className="p-6">
        <div className="text-red-600">
          Analysis failed. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="bg-gray-200 px-4 py-2 text-black rounded hover:bg-gray-300"
          >
            Back
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Dashboard
          </button>
        </div>

        <button
          onClick={handleDelete}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Delete
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-4">
        {data.job_role} - Results
      </h1>

      <p className="mb-4">
        Total Resumes: {data.total_resumes}
      </p>

      <button
        onClick={handleDownload}
        className="inline-block mb-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Download Excel
      </button>

      <div className="space-y-4">
        {data.results &&
          data.results.map((candidate) => (
            <CandidateCard
              key={candidate.file_name}
              candidate={candidate}
            />
          ))}
      </div>
    </div>
  );
}
