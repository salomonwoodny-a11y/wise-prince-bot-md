import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
} from "@whiskeysockets/baileys";

import pino from "pino";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import { randomBytes } from "crypto";

import { import { attachBotHandlers } from "./src/bot.js";

const sessions = new Map();

const DATA_DIR = path.join(process.cwd(), "data", "sessions");

fs.mkdirSync(DATA_DIR, { recursive: true });

function generateSessionId() {
  return randomBytes(4).toString("hex").toUpperCase();
}

export async function startSession() {
  let sessionId;

  do {
    sessionId = generateSessionId();
  } while (sessions.has(sessionId));

  const sessionPath = path.join(DATA_DIR, sessionId);
  const authPath = path.join(sessionPath, "auth");

  fs.mkdirSync(authPath, { recursive: true });

  const { state, saveCreds } =
    await useMultiFileAuthState(authPath);

  const session = {
    id: sessionId,
    status: "connecting",
    qr: null,
    pairingCode: null,
    socket: null
  };

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false
  });

  session.socket = sock;
  sessions.set(sessionId, session);

  sock.ev.on("creds.update", saveCreds);

  attachBotHandlers(sock, sessionId);

  sock.ev.on("connection.update", async (update) => {
    const { connection, qr, lastDisconnect } = update;

    if (qr) {
      session.qr = await QRCode.toDataURL(qr);
    }

    if (connection === "open") {
      session.status = "connected";
      session.qr = null;
    }

    if (connection === "close") {
      session.status = "disconnected";

      const reason =
        lastDisconnect?.error?.output?.statusCode;

      if (reason === DisconnectReason.loggedOut) {
        sessions.delete(sessionId);
      }
    }
  });

  return {
    sessionId,
    status: session.status
  };
}

export async function requestPairingCode(sessionId, phoneNumber) {
  const session = sessions.get(sessionId);

  if (!session) {
    throw new Error("Session introuvable");
  }

  const number = phoneNumber.replace(/\D/g, "");

  const code = await session.socket.requestPairingCode(number);

  session.pairingCode = code;

  return code;
}

export function getSession(sessionId) {
  return sessions.get(sessionId) || null;
}

export function getAllSessions() {
  return Array.from(sessions.values()).map(session => ({
    id: session.id,
    status: session.status,
    qr: session.qr,
    pairingCode: session.pairingCode
  }));
}

export async function stopSession(sessionId) {
  const session = sessions.get(sessionId);

  if (!session) {
    return false;
  }

  session.socket.end(undefined);
  sessions.delete(sessionId);

  return true;
             }
