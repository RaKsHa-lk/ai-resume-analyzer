import axios from "axios";

export async function analyzeResume(resumeText, jobDescription = "") {

    const prompt = `
You are an expert ATS Resume Analyzer.

Analyze the resume against the job description.

Return ONLY valid JSON.

Do NOT use markdown.
Do NOT write explanations.

Use EXACTLY this format:

{
  "atsScore": 85,
  "jobMatch": 80,
  "summary": "string",
  "strengths": [],
  "weaknesses": [],
  "matchingSkills": [],
  "missingSkills": [],
  "missingKeywords": [],
  "suggestions": []
}

Job Description:

${jobDescription || "No job description provided."}

Resume:

${resumeText}
`;

    try {

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "deepseek/deepseek-chat",

                messages: [
                    {
                        role: "user",
                        content: prompt,
                    },
                ],

                temperature: 0.3,

                response_format: {
                    type: "json_object",
                },
            },

            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:5173",
                    "X-Title": "AI Resume Analyzer",
                },
            }
        );

        return response.data.choices[0].message.content;

    } catch (error) {

        console.log("========== OPENROUTER ERROR ==========");
        console.log(error.response?.data || error.message);
        console.log("======================================");

        throw error;
    }
}