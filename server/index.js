/* eslint-disable no-undef */
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 8787;

app.use(cors());
app.use(bodyParser.json({ limit: "2mb" }));

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  return new OpenAI({ apiKey });
}

app.post("/api/openai/chat", async (req, res) => {
  try {
    const { model = "gpt-4o-mini", messages, tools } = req.body || {};
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "messages must be an array" });
    }
    const client = getClient();
    const completion = await client.chat.completions.create({ model, messages, tools });
    const message = completion.choices?.[0]?.message;
    if (!message) {
      return res.status(500).json({ error: "No message returned from OpenAI" });
    }
    return res.json({ message });
  } catch (err) {
    console.error("/api/openai/chat error:", err);
    return res.status(500).send(typeof err?.message === "string" ? err.message : "Server error");
  }
});

app.post("/api/openai/embeddings", async (req, res) => {
  try {
    const { model = "text-embedding-3-large", input } = req.body || {};
    if (typeof input !== "string" || input.length === 0) {
      return res.status(400).json({ error: "input must be a non-empty string" });
    }
    const client = getClient();
    const response = await client.embeddings.create({ model, input, encoding_format: "float" });
    const embedding = response.data?.[0]?.embedding;
    if (!embedding) {
      return res.status(500).json({ error: "No embedding returned from OpenAI" });
    }
    return res.json({ embedding });
  } catch (err) {
    console.error("/api/openai/embeddings error:", err);
    return res.status(500).send(typeof err?.message === "string" ? err.message : "Server error");
  }
});

app.listen(port, () => {
  console.log(`OpenAI proxy server listening on http://localhost:${port}`);
});