import { Telegraf } from "telegraf";
import axios from "axios";
import { BOT_TOKEN, CHAT_IDS, ALL_NUMBER_URL } from "./config.js";

const bot = new Telegraf(BOT_TOKEN);

// Panel data fetch function
async function fetchData() {
  try {
    const res = await axios.get(ALL_NUMBER_URL);
    return res.data;
  } catch (err) {
    return "❌ Error fetching data";
  }
}

// Send to group
async function sendToGroup(text) {
  for (let id of CHAT_IDS) {
    await bot.telegram.sendMessage(id, text);
  }
}

// Command (MANUAL)
bot.command("get", async (ctx) => {
  const data = await fetchData();
  await sendToGroup("📡 Panel Data:\n\n" + data);
  ctx.reply("✅ Sent to group");
});

/* =========================
   🔥 AUTO SYSTEM ADDED
   ========================= */

let lastData = "";

async function autoFetch() {
  const data = await fetchData();

  // prevent duplicate send
  if (data && data !== lastData && data !== "❌ Error fetching data") {
    lastData = data;

    await sendToGroup("📡 Panel Auto Update:\n\n" + data);
    console.log("Auto sent to group");
  }
}

// every 60 seconds check panel
setInterval(autoFetch, 60000);

/* ========================= */

bot.launch();

console.log("Bot running...");
