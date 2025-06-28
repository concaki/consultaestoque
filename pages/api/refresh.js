import fs from 'fs';
import path from 'path';

async function sendTelegramMessage(text) {
  const chatId = '-4245784707';
  const botToken = '7499467445:AAFDoifgSlyCjbsVpZjqlzOLpIXi0NKaMn8';
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown'
      })
    });
  } catch (err) {
    console.error('Erro ao enviar mensagem para o Telegram:', err.message);
  }
}

export default async function handler(req, res) {
  // Força o Vercel e navegador a não cachear a resposta
  res.setHeader('Cache-Control', 'no-store');

  console.log('🔁 Iniciando atualização do token em:', new Date().toLocaleString('pt-BR'));

  const refreshToken = process.env.BLING_REFRESH_TOKEN;
  const clientId = process.env.BLING_CLIENT_ID;
  const clientSecret = process.env.BLING_CLIENT_SECRET;

  try {
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
    console.log('🔍 Resposta da API Bling:', data);

    if (data.access_token) {
      const tokenPath = path.join('/tmp', 'token.json');
      fs.writeFileSync(tokenPath, JSON.stringify({ access_token: data.access_token }), 'utf-8');

      console.log('✅ Novo token salvo:', data.access_token);

      await sendTelegramMessage(`✅ *Token do Bling atualizado com sucesso!*\n🕒 ${new Date().toLocaleString('pt-BR')}`);

      return res.status(200).json({ success: true, token: data.access_token });
    } else {
      await sendTelegramMessage(`❌ *Erro ao atualizar token do Bling!*\nMensagem: ${JSON.stringify(data)}\n🕒 ${new Date().toLocaleString('pt-BR')}`);
      return res.status(500).json({ success: false, error: data });
    }
  } catch (error) {
    console.error('🔥 Erro inesperado ao tentar atualizar token:', error.message);
    await sendTelegramMessage(`❌ *Erro inesperado ao atualizar token!*\nErro: ${error.message}\n🕒 ${new Date().toLocaleString('pt-BR')}`);
    return res.status(500).json({ success: false, error: error.message });
  }
}
