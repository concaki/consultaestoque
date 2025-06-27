import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const { sku } = req.query;

  const tokenPath = path.join('/tmp', 'token.json');
  let accessToken = process.env.BLING_TOKEN;

  if (fs.existsSync(tokenPath)) {
    const data = JSON.parse(fs.readFileSync(tokenPath, 'utf-8'));
    if (data?.access_token) accessToken = data.access_token;
  }

  try {
    const headers = {
      Authorization: `Bearer ${accessToken}`
    };

    const produtoRes = await fetch(`https://api.bling.com.br/Api/v3/produtos?i&codigos[]=${sku}`, { headers });
    const estoqueRes = await fetch(`https://api.bling.com.br/Api/v3/estoques/saldos?i&codigos[]=${sku}`, { headers });

    const produto = await produtoRes.json();
    const estoque = await estoqueRes.json();

    res.status(200).json({ produto, estoque });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao consultar Bling', details: err.message });
  }
}
