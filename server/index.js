require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
let pdf = require("pdf-parse");
const fs = require("fs");
const axios = require("axios");
const db = require("./db");


if (typeof pdf !== "function" && pdf.default) {
  pdf = pdf.default;
}

const app = express();


app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "DELETE"]
}));

app.use(express.json());


const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 } 
});



app.post("/analyze", upload.single("resume"), async (req, res) => {

  console.log("---- ANALYZE API HIT ----");

  try {

    if (!req.file)
      return res.status(400).json({ error: "No file uploaded" });

    const filePath = req.file.path;

    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdf(dataBuffer);

    if (!pdfData.text || pdfData.text.trim().length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({
        error: "PDF has no readable text. Export resume from Word/Google Docs."
      });
    }

  
    const resumeText = pdfData.text.substring(0, 6000);

    console.log("Sending to GROQ AI...");

    
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: `
You are an ATS Resume Analyzer.

Return STRICT JSON only.
No explanation, no markdown.

FORMAT:
{
  "score": "number from 0 to 100",
  "missing_skills": "comma separated skills in plain text",
  "suggestions": "clear paragraph explaining how to improve resume"
}
`
          },
          {
            role: "user",
            content: resumeText
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("AI Response received");


    const aiText = response.data.choices[0].message.content;
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      fs.unlinkSync(filePath);
      return res.status(500).json({ error: "AI returned invalid format" });
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      fs.unlinkSync(filePath);
      return res.status(500).json({ error: "AI JSON parsing failed" });
    }




    const normalize = (val) => {
      if (!val) return "";

      if (typeof val === "string") return val;

      if (typeof val === "number") return String(val);

      if (Array.isArray(val)) return val.join(", ");

   
      if (typeof val === "object") {
        let text = "";

        if (val.title) text += val.title + ": ";
        if (val.description) text += val.description + " ";

        if (val.resources && Array.isArray(val.resources)) {
          text += "Resources: " + val.resources.join(", ");
        }

        return text.trim();
      }

      return String(val);
    };

    const result = {
      score: normalize(parsed.score) || "0",
      missing_skills: normalize(parsed.missing_skills),
      suggestions: normalize(parsed.suggestions)
    };

    console.log("Final Clean Result:", result);

    db.run(
      `INSERT INTO reports(filename, score, skills_missing, suggestions) VALUES(?,?,?,?)`,
      [req.file.originalname, result.score, result.missing_skills, result.suggestions],
      (err) => {
        if (err) console.log("DB Error:", err.message);
      }
    );

  
    fs.unlinkSync(filePath);

 
    res.json(result);

  } catch (err) {

    console.log("SERVER ERROR:");
    if (err.response) {
      console.log(err.response.data);
    } else {
      console.log(err.message);
    }

    if (req.file && fs.existsSync(req.file.path))
      fs.unlinkSync(req.file.path);

    res.status(500).json({ error: "Backend crashed" });
  }
});



app.get("/history", (req, res) => {
  db.all(
    "SELECT * FROM reports ORDER BY created_at DESC",
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json(rows);
    }
  );
});


app.get("/report/:id", (req, res) => {
  db.get("SELECT * FROM reports WHERE id = ?", [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!row) return res.status(404).json({ error: "Report not found" });
    res.json(row);
  });
});

app.delete("/report/:id", (req, res) => {
  db.run("DELETE FROM reports WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: "Delete failed" });
    res.json({ message: "Deleted successfully" });
  });
});



app.listen(5000, () =>
  console.log("Server running at http://localhost:5000")
);
