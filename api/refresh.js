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
  res.setHeader('Cache-Control', 'no-store');
  console.log('🔁 Iniciando refresh token em:', new Date().toLocaleString('pt-BR'));

  const refreshToken = process.env.BLING_REFRESH_TOKEN;
  const clientId = process.env.BLING_CLIENT_ID;
  const clientSecret = process.env.BLING_CLIENT_SECRET;

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const response = await fetch('https://www.bling.com.br/Api/v3/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${basicAuth}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      })
    });

    const data = await response.json();
    console.log('🔍 Resposta da API Bling:', data);

    if (data.access_token) {
      // Tokens
      const newAccessToken = data.access_token;
      const newRefreshToken = data.refresh_token || refreshToken;

      // 1. Salva no /tmp/token.json
      const tokenPath = path.join('/tmp', 'token.json');
      fs.writeFileSync(tokenPath, JSON.stringify({ access_token: newAccessToken, refresh_token: newRefreshToken }), 'utf-8');

      // 2. Sobrescreve o arquivo .env real
      const envPath = path.join(process.cwd(), '.env');
      const envContent =
        `BLING_TOKEN=${newAccessToken}\n` +
        `BLING_REFRESH_TOKEN=${newRefreshToken}\n` +
        `BLING_CLIENT_ID=${clientId}\n` +
        `BLING_CLIENT_SECRET=${clientSecret}\n`;

      fs.writeFileSync(envPath, envContent, 'utf-8');
      console.log('✅ .env atualizado com sucesso.');

      // 3. Notificação
      await sendTelegramMessage(
        `✅ *Token do Bling atualizado com sucesso!*\n` +
        `🆕 Novo access token e refresh token salvos em *.env*\n` +
        `🕒 ${new Date().toLocaleString('pt-BR')}`
      );

      return res.status(200).json({
        success: true,
        access_token: newAccessToken,
        refresh_token: newRefreshToken
      });
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
