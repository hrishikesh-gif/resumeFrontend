"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `http://localhost:8000/resumes/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await res.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching detail:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "⚠️ Are you sure you want to delete this analysis? This action cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:8000/resumes/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        alert("✅ Analysis deleted successfully");
        router.push("/dashboard/history");
      } else {
        alert("❌ Failed to delete analysis");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Something went wrong");
    }
  };

  /* ✅ UPDATED DOWNLOAD FUNCTION */
  const handleDownload = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:8000/resumes/${id}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;

      const contentDisposition =
        response.headers.get("Content-Disposition");

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
      console.error("Download error:", error);
      alert("❌ Download failed");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!data) return <div className="p-6">No data found.</div>;

  if (data.status === "processing") {
    return (
      <div className="p-6">
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => router.back()}
            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
          >
            ← Back
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Dashboard
          </button>
        </div>

        <h2 className="text-xl font-semibold">
          Analysis still processing...
        </h2>
      </div>
    );
  }

  if (data.status === "failed") {
    return (
      <div className="p-6">
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => router.back()}
            className="bg-green-200 px-4 py-2 text-black rounded hover:bg-gray-300"
          >
            Back
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Dashboard
          </button>
        </div>

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

      {/* ✅ UPDATED DOWNLOAD BUTTON */}
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