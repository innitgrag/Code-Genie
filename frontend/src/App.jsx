import { useState, useEffect } from "react";
import hljs from "highlight.js";
import Editor from "react-simple-code-editor";
import rehypehighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import axios from "axios";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

function App() {
  const [code, setCode] = useState(`/*Start writing code to be reviewed*/`);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleReview() {
    setLoading(true);
    setError("");
    try {
      const response = await axios.post("http://localhost:4000/ai/review", {
        code,
      });
      setReview(response.data);
    } catch (error) {
      console.error("Review fetch error:", error);
      setError("Failed to fetch review.");
      setReview("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      {/* Left section */}

      <div className="h-full w-6/12 p-4 flex flex-col bg-gray-900">
        <div className="p-4 flex flex-col justify-center items-center bg-gray-900 shadow-md rounded-b-lg">
  <h1 className="text-amber-50 text-3xl font-bold tracking-wide">
    Code Genie
  </h1>
  <p className="text-amber-50 tracking-wide"> Your Best AI Code Reviewer</p>
</div>

        <Editor
          value={code}
          onValueChange={(code) => setCode(code)}
          highlight={(code) => hljs.highlightAuto(code).value}
          padding={14}
          style={{
            backgroundColor: "#0f172a", // dark navy
            color: "#f0f4f8", // soft white
            fontFamily: '"Fira Code", monospace',
            fontSize: 15,
            borderRadius: "10px",
            flexGrow: 1,
            overflow: "auto",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        />

        <div className="flex justify-end mt-4">
          <button
            onClick={handleReview}
            disabled={loading}
            className={`text-white font-mono font-semibold text-lg px-6 py-3 rounded-lg shadow-md border-2 transition-colors
              ${
                loading
                  ? "bg-gray-400 border-gray-500 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-300 border-green-600"
              }`}
          >
            {loading ? "Reviewing..." : "Review"}
          </button>
        </div>
      </div>

      {error && <p className="text-red-400 mt-2">{error}</p>}

      {/* Right section */}
      <div className="h-full w-6/12 p-4 overflow-auto bg-gray-200 rounded-md shadow-inner">
        {loading ? (
          <p className="text-gray-700 font-semibold">Fetching review...</p>
        ) : (
          <Markdown
            rehypePlugins={[rehypehighlight]}
            remarkPlugins={[remarkGfm]}
            style={{
              fontFamily: "'Fira Code', monospace",
              fontSize: 14,
              color: "#c9d1d9",
              lineHeight: "3",
              whiteSpace: "pre-wrap",
            }}
          >
            {review}
          </Markdown>
        )}
      </div>
    </div>
  );
}

export default App;
