import { Telegraf } from "telegraf";
import fs from "fs";
import { BOT_TOKEN, CHAT_IDS } from "./config.js";

const bot = new Telegraf(BOT_TOKEN);

const USERS_FILE = "./users.json";

// Load users
function loadUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) return [];
    const data = fs.readFileSync(USERS_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Save users
function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Add user to list
function addUser(userId) {
  const users = loadUsers();
  if (!users.includes(userId)) {
    users.push(userId);
    saveUsers(users);
  }
}

// Send message to group
async function sendToGroup(text) {
  for (let id of CHAT_IDS) {
    await bot.telegram.sendMessage(id, text);
  }
}

// Send message to all users
async function sendToAllUsers(text) {
  const users = loadUsers();
  for (let userId of users) {
    try {
      await bot.telegram.sendMessage(userId, text);
    } catch (err) {
      console.log("Failed to send user:", userId);
    }
  }
}

/* =========================
   START COMMAND
   ========================= */

bot.start((ctx) => {
  addUser(ctx.chat.id);
  ctx.reply("✅ You have started the bot. Now you will receive broadcast messages.");
});

/* =========================
   BOARDCHAT COMMAND
   ========================= */

let waitingForMessage = {};

bot.command("Boardchat", async (ctx) => {
  waitingForMessage[ctx.chat.id] = true;
  ctx.reply("✍️ এখন মেসেজ লিখুন, আমি সেটা গ্রুপ এবং সকল ইউজারকে পাঠিয়ে দিবো।");
});

// When user sends message after Boardchat
bot.on("text", async (ctx) => {
  const userId = ctx.chat.id;

  if (waitingForMessage[userId]) {
    waitingForMessage[userId] = false;

    const msg = ctx.message.text;

    await sendToGroup("📢 Board Message:\n\n" + msg);
    await sendToAllUsers("📢 Board Message:\n\n" + msg);

    ctx.reply("✅ Message sent to Group + All Users");
  }
});

bot.launch();
console.log("Bot running...");
