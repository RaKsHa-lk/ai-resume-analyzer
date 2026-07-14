import express from "express";
import cors from "cors";
import resumeRoutes from "./routes/resume.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/resume", resumeRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "AI Resume Analyzer Backend is Running 🚀",
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
