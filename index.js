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

// Command
bot.command("get", async (ctx) => {
  const data = await fetchData();
  await sendToGroup("📡 Panel Data:\n\n" + data);
  ctx.reply("✅ Sent to group");
});

bot.launch();

console.log("Bot running...");
