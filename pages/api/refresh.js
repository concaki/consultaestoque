import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const refreshToken = process.env.BLING_REFRESH_TOKEN;
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
    const tokenPath = path.join('/tmp', 'token.json');
    fs.writeFileSync(tokenPath, JSON.stringify({ access_token: data.access_token }), 'utf-8');

    console.log('Novo token salvo:', data.access_token);
    res.status(200).json({ success: true, token: data.access_token });
  } else {
    res.status(500).json({ success: false, error: data });
  }
}
