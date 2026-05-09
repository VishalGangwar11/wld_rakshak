import { NextRequest, NextResponse } from "next/server";

// Telegram alert sender
async function sendTelegramAlert(message: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn("Telegram credentials not set. Skipping alert.");
    return false;
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "HTML" }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { animal, threatLevel, confidence, latitude, longitude, region } = body;

    const message = [
      `🚨 <b>WILD RAKSHAK ALERT</b> 🚨`,
      ``,
      `⚠️ <b>Threat Level:</b> ${threatLevel}`,
      `🐾 <b>Animal:</b> ${animal}`,
      `📊 <b>Confidence:</b> ${Math.round(confidence * 100)}%`,
      `📍 <b>Location:</b> ${region}`,
      `🗺 <b>GPS:</b> ${latitude}, ${longitude}`,
      `🕒 <b>Time:</b> ${new Date().toISOString()}`,
      ``,
      `Please take immediate precautionary action.`,
    ].join("\n");

    const sent = await sendTelegramAlert(message);

    return NextResponse.json({
      success: true,
      telegramSent: sent,
      message: sent ? "Alert dispatched via Telegram" : "Alert logged (Telegram not configured)",
    });
  } catch (error) {
    return NextResponse.json({ error: "Alert failed" }, { status: 500 });
  }
}
