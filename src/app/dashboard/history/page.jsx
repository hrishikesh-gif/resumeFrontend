"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          "http://localhost:8000/resumes/my-analyses",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        setAnalyses(data);
      } catch (error) {
        console.error("Error fetching analyses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyses();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Analysis History</h1>

      {analyses.length === 0 && <p>No past analyses found.</p>}

      <div className="space-y-4">
        {analyses.map((item) => (
          <div
            key={item.analysis_id}
            onClick={() =>
              router.push(`/dashboard/history/${item.analysis_id}`)
            }
            className="p-4 border rounded-lg shadow hover:shadow-lg cursor-pointer transition"
          >
            <div className="flex justify-between">
              <h2 className="text-lg font-semibold">
                {item.job_role || "Untitled Role"}
              </h2>

              <span
                className={`px-3 py-1 text-sm rounded-full ${
                  item.status === "completed"
                    ? "bg-green-100 text-green-700"
                    : item.status === "processing"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {item.status}
              </span>
            </div>

            <p className="text-sm text-gray-600 mt-2">
              Total Resumes: {item.total_resumes}
            </p>

            <p className="text-sm text-gray-500">
              {new Date(item.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}