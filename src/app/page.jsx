"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center 
                    bg-gradient-to-br from-black via-gray-900 to-gray-800">

      <div className="text-center px-6">

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Resume Filtration System 🚀
        </h1>

        <p className="text-gray-400 mb-10 text-lg">
          Smart AI-powered resume ranking for Arista's HR Department.
        </p>

        <button
          onClick={() => router.push("/login")}
          className="bg-white text-black px-8 py-3 rounded-lg 
                     font-semibold hover:bg-gray-200 transition"
        >
          Analyze Now
        </button>
        
        {/* Footer */}
         <footer className="text-center py-4 text-gray-500 text-sm">
         © 2026 AristaSystems.in Built with ❤️
         </footer>
     
      </div>
    </div>
  );
}