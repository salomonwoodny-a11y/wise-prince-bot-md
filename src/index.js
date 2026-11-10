import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import {
  startSession,
  getSession,
  getAllSessions,
  requestPairingCode,
  stopSession
} from "./sessionManager.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("👑 WISE PRINCE ✝️ BOT PLATFORM IS RUNNING!");
});

app.get("/api/status", (req, res) => {
  res.json({
    name: "WISE PRINCE",
    status: "online",
    version: "1.0.0"
  });
});

// CREATE WHATSAPP SESSION
app.post("/api/session/create", async (req, res) => {
  try {
    const session = await startSession();
    res.json(session);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// CHECK SESSION
app.get("/api/session/:id", (req, res) => {
  const session = getSession(req.params.id);

  if (!session) {
    return res.status(404).json({
      error: "Session introuvable"
    });
  }

  res.json({
    sessionId: session.id,
    status: session.status,
    qr: session.qr
  });
});

// WHATSAPP PAIRING CODE
app.post("/api/session/:id/pair", async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        error: "Antre nimewo WhatsApp la."
      });
    }

    const code = await requestPairingCode(
      req.params.id,
      phoneNumber
    );

    res.json({
      pairingCode: code
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// LIST ALL SESSIONS
app.get("/api/sessions", (req, res) => {
  res.json(getAllSessions());
});

// STOP SESSION
app.delete("/api/session/:id", async (req, res) => {
  try {
    const stopped = await stopSession(req.params.id);
    res.json({ stopped });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`👑 WISE PRINCE running on port ${PORT}`);
});
