import { Telegraf } from "telegraf";
import fs from "fs";
import { BOT_TOKEN, CHAT_IDS } from "./config.js";

const bot = new Telegraf(BOT_TOKEN);

const USERS_FILE = "./users.json";

/* =========================
   USERS SYSTEM
   ========================= */

function loadUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) return [];
    return JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
  } catch {
    return [];
  }
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function addUser(id) {
  const users = loadUsers();
  if (!users.includes(id)) {
    users.push(id);
    saveUsers(users);
  }
}

/* =========================
   SEND FUNCTIONS
   ========================= */

async function sendToGroup(text) {
  for (let id of CHAT_IDS) {
    await bot.telegram.sendMessage(id, text);
  }
}

async function sendToAllUsers(text) {
  const users = loadUsers();
  for (let id of users) {
    try {
      await bot.telegram.sendMessage(id, text);
    } catch (e) {
      console.log("Failed user:", id);
    }
  }
}

/* =========================
   START COMMAND
   ========================= */

bot.start((ctx) => {
  addUser(ctx.chat.id);
  ctx.reply("✅ Bot started. You will receive messages.");
});

/* =========================
   BOARDCHAT ONLY
   ========================= */

let waiting = {};

bot.command("boardchat", async (ctx) => {
  waiting[ctx.chat.id] = true;
  ctx.reply("✍️ এখন মেসেজ লিখো (Group + All Users এ যাবে)");
});

bot.on("text", async (ctx) => {
  const id = ctx.chat.id;

  if (waiting[id]) {
    waiting[id] = false;

    const msg = ctx.message.text;

    await sendToGroup("📢 Board Message:\n\n" + msg);
    await sendToAllUsers("📢 Board Message:\n\n" + msg);

    ctx.reply("✅ Sent to Group + Users");
  }
});

/* =========================
   BOT START
   ========================= */

bot.launch();
console.log("Bot running...");
