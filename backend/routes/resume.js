import express from "express";
import multer from "multer";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { analyzeResume } from "../utils/openrouter.js";

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
});

async function extractTextFromPDF(buffer) {
    const pdf = await getDocument({
        data: new Uint8Array(buffer),
    }).promise;

    let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();

        text +=
            content.items
                .map((item) => ("str" in item ? item.str : ""))
                .join(" ") + "\n";
    }

    return text;
}

router.post("/upload", upload.single("resume"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: "No resume uploaded.",
            });
        }

        const resumeText = await extractTextFromPDF(req.file.buffer);

        const jobDescription = req.body.jobDescription || "";

        const aiResponse = await analyzeResume(
            resumeText,
            jobDescription
        );

        let analysis;

        try {
            const cleaned = aiResponse
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();

            analysis = JSON.parse(cleaned);
        } catch (err) {
            console.error("JSON Parse Error:", err);

            return res.status(500).json({
                error: "AI returned invalid JSON.",
                raw: aiResponse,
            });
        }

        res.json({
            message: "Resume analyzed successfully!",
            filename: req.file.originalname,
            analysis,
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to process resume.",
        });
    }
});

export default router;