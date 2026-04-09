import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const uploadResume = async () => {
    if (!file) return alert("Upload a PDF first!");

    const formData = new FormData();
    formData.append("resume", file);

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/analyze", formData);
      setResult(res.data);
      loadHistory();
    } catch (err) {
      alert("Analysis failed");
    }

    setLoading(false);
  };

  const loadHistory = async () => {
    const res = await axios.get("http://localhost:5000/history");
    setHistory(res.data);
  };

  const viewReport = async (id) => {
    const res = await axios.get(`http://localhost:5000/report/${id}`);

    setResult({
      score: res.data.score,
      missing_skills: res.data.skills_missing,
      suggestions: res.data.suggestions
    });

    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const deleteReport = async (id) => {
    if (!window.confirm("Delete this report?")) return;

    await axios.delete(`http://localhost:5000/report/${id}`);
    loadHistory();
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <div className="min-h-screen text-white p-10">
      <h1 className="text-4xl font-bold text-center mb-10">
        AI Resume Analyzer
      </h1>

      <div className="bg-slate-800 rounded-2xl p-8 max-w-xl mx-auto shadow-xl">
        <input
          type="file"
          accept=".pdf"
          className="mb-6 w-full"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button
          onClick={uploadResume}
          className="w-full bg-indigo-500 hover:bg-indigo-600 transition p-3 rounded-xl font-semibold"
        >
          {loading ? "Analyzing..." : "Analyze Resume"}
        </button>
      </div>

      {result && (
        <div className="bg-slate-800 rounded-2xl p-8 max-w-3xl mx-auto mt-10 shadow-xl">
          <h2 className="text-2xl font-semibold mb-4 text-green-400">
            ATS Score: {result.score}
          </h2>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-yellow-300">Missing Skills</h3>
            <p className="text-gray-300 mt-2">{result.missing_skills}</p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-blue-300">Suggestions</h3>
            <p className="text-gray-300 mt-2">{result.suggestions}</p>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto mt-14">
        <h2 className="text-2xl font-bold mb-6">Previous Analyses</h2>

        {history.map((item) => (
          <div
            key={item.id}
            className="bg-slate-800 p-4 rounded-xl mb-4 flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{item.filename}</p>
              <p className="text-gray-400 text-sm">{item.created_at}</p>
              <p className="text-green-400 font-bold">Score: {item.score}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => viewReport(item.id)}
                className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg"
              >
                View
              </button>

              <button
                onClick={() => deleteReport(item.id)}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
