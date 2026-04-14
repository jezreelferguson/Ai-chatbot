const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();
const cors = require("cors");
app.use(
  cors({
    origin: ["https://ferguson-dev.vercel.app", "https://ferguson-dev.netlify.app"],
    methods: ["GET", "POST"],
    credentials: true,
  }),
);
app.use(express.json());

const axios = require("axios");
const profile = require("./profile.json");

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ response: "Message is required" });
  }

  const systemPrompt = `
    You are an AI assistant for ${profile.name}.
    Only answer questions about him using this info:
    ${JSON.stringify(profile)}
    If asked something unrelated, say:
    "I can only answer questions about ${profile.name}."
  `;

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    const data = response.data;
    res.json({ reply: data.choices[0].message.content });
  } catch (err) {
    console.error("ERROR:", err.response?.data || err.message);
    res.status(500).json({ response: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port: http://localhost:${PORT}`);
});
