import { Telegraf } from "telegraf";
import fs from "fs";
import { BOT_TOKEN, CHAT_IDS, ADMIN_ID } from "./config.js";

const bot = new Telegraf(BOT_TOKEN);

/* =========================
   FILE SYSTEM
   ========================= */

const USERS_FILE = "./users.json";
const BLOCK_FILE = "./blocked.json";

function read(file, def) {
  try {
    if (!fs.existsSync(file)) return def;
    return JSON.parse(fs.readFileSync(file));
  } catch {
    return def;
  }
}

function write(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

/* =========================
   USER SYSTEM
   ========================= */

function addUser(id) {
  const users = read(USERS_FILE, []);
  if (!users.includes(id)) {
    users.push(id);
    write(USERS_FILE, users);
  }
}

function isBlocked(id) {
  const blocked = read(BLOCK_FILE, []);
  return blocked.includes(id);
}

/* =========================
   ADMIN CHECK
   ========================= */

function isAdmin(id) {
  return id == ADMIN_ID;
}

function deny(ctx) {
  ctx.reply(
    "❌ Access Denied 🚫\n\n👑 This command is only for Admin"
  );
}

/* =========================
   SEND FUNCTIONS
   ========================= */

async function sendToGroup(text) {
  for (let id of CHAT_IDS) {
    await bot.telegram.sendMessage(id, text);
  }
}

async function sendToUsers(text) {
  const users = read(USERS_FILE, []);
  const blocked = read(BLOCK_FILE, []);

  for (let id of users) {
    if (!blocked.includes(id)) {
      try {
        await bot.telegram.sendMessage(id, text);
      } catch {}
    }
  }
}

/* =========================
   START COMMAND
   ========================= */

bot.start((ctx) => {
  addUser(ctx.chat.id);

  const username = ctx.from.username
    ? `@${ctx.from.username}`
    : ctx.from.first_name || "User";

  ctx.reply(`
🌸 Assalamu Alaikum 𝗦𝗺𝗮𝗿𝘁 𝗠𝗲𝘁𝗵𝗼𝗱 (${username}) 🌸  

🤖✨ Welcome to Smart Method Live Support Bot  

Now you can contact our live support anytime.  

📝 Write your question here,  
our support team will reply soon InshaAllah.  
━━━━━━━━━━━━━━━  

📌 Official Channel:  
👉 @Global_Method_Channel  
━━━━━━━━━━━━━━━  

❤️ Thank you for being with Smart Method Family
`);
});

/* =========================
   PANEL (ADMIN ONLY)
   ========================= */

bot.command("panel", (ctx) => {
  if (!isAdmin(ctx.chat.id)) return deny(ctx);

  ctx.reply("🚀 Coming Soon Panel 🔥");
});

/* =========================
   BOARDCHAT (ADMIN ONLY)
   ========================= */

let waiting = {};

bot.command("boardchat", (ctx) => {
  if (!isAdmin(ctx.chat.id)) return deny(ctx);

  waiting[ctx.chat.id] = "boardchat";
  ctx.reply("✍️ Send broadcast message");
});

/* =========================
   BLOCK / UNBLOCK
   ========================= */

bot.command("block", (ctx) => {
  if (!isAdmin(ctx.chat.id)) return deny(ctx);

  const username = ctx.message.text.split(" ")[1];
  if (!username) return ctx.reply("Usage: /block username");

  const blocked = read(BLOCK_FILE, []);
  if (!blocked.includes(username)) blocked.push(username);

  write(BLOCK_FILE, blocked);
  ctx.reply(`🚫 Blocked: ${username}`);
});

bot.command("unblock", (ctx) => {
  if (!isAdmin(ctx.chat.id)) return deny(ctx);

  const username = ctx.message.text.split(" ")[1];
  if (!username) return ctx.reply("Usage: /unblock username");

  let blocked = read(BLOCK_FILE, []);
  blocked = blocked.filter(u => u !== username);

  write(BLOCK_FILE, blocked);
  ctx.reply(`✅ Unblocked: ${username}`);
});

/* =========================
   TEXT HANDLER (BOARDCHAT)
   ========================= */

bot.on("text", async (ctx) => {
  const id = ctx.chat.id;

  if (isBlocked(id)) return;

  if (waiting[id] === "boardchat") {
    waiting[id] = false;

    const msg = ctx.message.text;

    await sendToGroup("📢 Board Message:\n\n" + msg);
    await sendToUsers("📢 Board Message:\n\n" + msg);

    ctx.reply("✅ Sent successfully");
  }
});

/* =========================
   🔥 AUTO RANDOM GROUP MESSAGE (2 MIN)
   ========================= */

const randomMessages = [
  "📢 Stay connected with Smart Method 🔥",
  "🚀 New update coming soon...",
  "💡 Learn something new daily",
  "📡 System running smoothly ✅",
  "⚡ Smart Method Live Support ON",
  "🔥 Don’t miss updates",
  "🤖 Auto system active"
];

async function autoSend() {
  const msg =
    randomMessages[Math.floor(Math.random() * randomMessages.length)];

  await sendToGroup(msg);
  console.log("Auto sent:", msg);
}

setInterval(autoSend, 120000);

/* ========================= */

bot.launch();
console.log("Bot running...");
