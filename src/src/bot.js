import { getConfig } from "./configManager.js";

const startTime = Date.now();

function formatUptime() {
  const seconds = Math.floor((Date.now() - startTime) / 1000);

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  return `${days}d ${hours}h ${minutes}m`;
}

function getMessageText(message) {
  return (
    message.conversation ||
    message.extendedTextMessage?.text ||
    message.imageMessage?.caption ||
    message.videoMessage?.caption ||
    ""
  );
}

export function attachBotHandlers(sock, sessionId) {
  sock.ev.on("messages.upsert", async ({ messages }) => {
    for (const msg of messages) {
      try {
        if (!msg.message || msg.key.fromMe) continue;

        const jid = msg.key.remoteJid;

        if (!jid || jid === "status@broadcast") continue;

        const config = getConfig(sessionId);

        if (!config) continue;

        const text = getMessageText(msg.message).trim();
        const prefix = config.prefix || ".";

        if (!text.startsWith(prefix)) continue;

        const args = text.slice(prefix.length).trim().split(/\s+/);
        const command = args.shift()?.toLowerCase();

        if (!command) continue;

        const reply = async (message) => {
          await sock.sendMessage(jid, { text: message }, {
            quoted: msg
          });
        };

        switch (command) {
          case "menu":
            await reply(
`👑 WISE PRINCE ✝️
━━━━━━━━━━━━━━
🤖 GENERAL
${prefix}menu
${prefix}ping
${prefix}alive
${prefix}runtime
${prefix}id
${prefix}owner
${prefix}botinfo
${prefix}version
━━━━━━━━━━━━━━
⚙️ MODE: ${config.mode}
🔰 PREFIX: ${prefix}
👑 WISE PRINCE
Ti moun li, granmoun konprann.`
            );
            break;

          case "ping":
            await reply("🏓 PONG! WISE PRINCE aktif.");
            break;

          case "alive":
            await reply("👑 WISE PRINCE BOT IS ALIVE! ✅");
            break;

          case "runtime":
          case "uptime":
            await reply(`⏱️ Bot Uptime: ${formatUptime()}`);
            break;

          case "id":
            await reply(`🆔 Chat ID: ${jid}`);
            break;

          case "owner":
            await reply(
              `👑 OWNER: ${config.ownerNumber || "Pa konfigire"}`
            );
            break;

          case "botinfo":
            await reply(
`🤖 WISE PRINCE BOT
━━━━━━━━━━━━━━
📌 Session: ${sessionId}
⚙️ Mode: ${config.mode}
🔰 Prefix: ${prefix}
📡 Status: Active`
            );
            break;

          case "version":
            await reply("WISE PRINCE VERSION 1.0.0");
            break;

          default:
            await reply
