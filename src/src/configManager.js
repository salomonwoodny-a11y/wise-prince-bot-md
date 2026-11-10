import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data", "sessions");

function getConfigPath(sessionId) {
  if (!/^[A-F0-9]{8}$/i.test(sessionId)) {
    throw new Error("Session ID pa valab.");
  }

  return path.join(DATA_DIR, sessionId, "config.json");
}

export function saveConfig(sessionId, config) {
  const configPath = getConfigPath(sessionId);
  const sessionFolder = path.dirname(configPath);

  if (!fs.existsSync(sessionFolder)) {
    throw new Error("Session sa a pa egziste.");
  }

  const allowedModes = ["PUBLIC", "PRIVATE"];

  if (!allowedModes.includes(config.mode)) {
    throw new Error("Mode la dwe PUBLIC oswa PRIVATE.");
  }

  const settings = {
    sessionId,
    prefix: config.prefix || ".",
    botNumber: config.botNumber || "",
    ownerNumber: config.ownerNumber || "",
    mode: config.mode,
    antiView: Boolean(config.antiView),
    antiLink: Boolean(config.antiLink),
    antiSpam: Boolean(config.antiSpam),
    antiDelete: Boolean(config.antiDelete),
    updatedAt: new Date().toISOString()
  };

  fs.writeFileSync(
    configPath,
    JSON.stringify(settings, null, 2)
  );

  return settings;
}

export function getConfig(sessionId) {
  const configPath = getConfigPath(sessionId);

  if (!fs.existsSync(configPath)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(configPath, "utf8"));
    }
