import { Telegraf } from "telegraf";
import puppeteer from "puppeteer";
import { BOT_TOKEN, CHAT_IDS, ALL_NUMBER_URL } from "./config.js";

const bot = new Telegraf(BOT_TOKEN);

/* =========================
   📡 FETCH AUDIO / DATA
   ========================= */

async function fetchAudio() {
  try {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.goto(ALL_NUMBER_URL, { waitUntil: "networkidle2" });

    // try to find audio/mp3 link in page
    const audioUrl = await page.evaluate(() => {
      const audio = document.querySelector("audio");
      if (audio && audio.src) return audio.src;

      // fallback: search mp3 in page
      const match = document.body.innerHTML.match(/https?:\/\/[^\\s"]+\\.mp3/);
      return match ? match[0] : null;
    });

    await browser.close();

    return audioUrl;

  } catch (err) {
    return null;
  }
}

/* =========================
   📤 SEND AUDIO TO GROUP
   ========================= */

async function sendAudioToGroup(url) {
  for (let id of CHAT_IDS) {
    await bot.telegram.sendAudio(id, url);
  }
}

/* =========================
   🟢 MANUAL COMMAND
   ========================= */

bot.command("get", async (ctx) => {
  const audio = await fetchAudio();

  if (audio) {
    await sendAudioToGroup(audio);
    ctx.reply("✅ Audio sent to group");
  } else {
    ctx.reply("❌ No audio found");
  }
});

/* =========================
   🔥 AUTO SYSTEM
   ========================= */

let lastAudio = "";

async function autoFetch() {
  const audio = await fetchAudio();

  if (audio && audio !== lastAudio) {
    lastAudio = audio;

    for (let id of CHAT_IDS) {
      await bot.telegram.sendAudio(id, audio);
    }

    console.log("🎧 Auto audio sent");
  }
}

setInterval(autoFetch, 60000);

/* ========================= */

bot.launch();
console.log("Bot running...");
