import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

async function sendTelegramMessage(text) {
  const chatId = '-4245784707';
  const botToken = '7499467445:AAFDoifgSlyCjbsVpZjqlzOLpIXi0NKaMn8';
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
  });
}

export default async function handler(req, res) {
  try {
    const refreshToken = await redis.get('bling_refresh_token');
    const clientId = process.env.BLING_CLIENT_ID;
    const clientSecret = process.env.BLING_CLIENT_SECRET;

    const response = await fetch('https://www.bling.com.br/Api/v3/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret
      })
    });

    const data = await response.json();

    if (data.access_token) {
      await redis.set('bling_access_token', data.access_token);
      await sendTelegramMessage(`✅ *Token atualizado com sucesso!*\n🕒 ${new Date().toLocaleString('pt-BR')}`);
      return res.status(200).json({ success: true, token: data.access_token });
    } else {
      await sendTelegramMessage(`❌ *Erro ao atualizar token do Bling!*\nMensagem: ${JSON.stringify(data)}\n🕒 ${new Date().toLocaleString('pt-BR')}`);
      return res.status(500).json({ success: false, error: data });
    }
  } catch (err) {
    await sendTelegramMessage(`❌ *Falha inesperada ao atualizar token!*\nMensagem: ${err.message}\n🕒 ${new Date().toLocaleString('pt-BR')}`);
    return res.status(500).json({ success: false, error: err.message });
  }
}
