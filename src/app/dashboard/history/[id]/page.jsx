"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function DetailPage() {
  const { id } = useParams();
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
      <div className="p-6 text-red-600">
        Analysis failed. Please try again.
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        {data.job_role} - Results
      </h1>

      <p className="mb-4">
        Total Resumes: {data.total_resumes}
      </p>

      <a
        href={`http://localhost:8000/resumes/${id}/download`}
        target="_blank"
        className="inline-block mb-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Download Excel
      </a>

      <div className="space-y-4">
        {data.results &&
          data.results.map((candidate) => (
            <div
              key={candidate.file_name}
              className="border p-4 rounded shadow"
            >
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
            </div>
          ))}
      </div>
    </div>
  );
}