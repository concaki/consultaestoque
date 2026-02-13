import { fetchBling } from '../lib/bling.js';

export default async function handler(req, res) {
  const { sku } = req.query;

  if (!sku) {
    return res.status(400).json({ error: 'SKU não informado' });
  }

  try {
    const [produtoResp, estoqueResp] = await Promise.all([
      fetchBling(`https://api.bling.com.br/Api/v3/produtos?i&codigos[]=${sku}`),
      fetchBling(`https://api.bling.com.br/Api/v3/estoques/saldos?i&codigos[]=${sku}`),
    ]);

    if (!produtoResp.ok || !estoqueResp.ok) {
      if (produtoResp.status === 401 || estoqueResp.status === 401) {
        return res.status(401).json({ error: 'Erro de autenticação com o Bling mesmo após refresh.' });
      }
    }

    if (!produtoResp.ok) {
      const err = await produtoResp.text();
      console.error('Erro produtos:', err);
    }
    if (!estoqueResp.ok) {
      const err = await estoqueResp.text();
      console.error('Erro estoque:', err);
    }

    const produto = produtoResp.ok ? await produtoResp.json() : { data: [] };
    const estoque = estoqueResp.ok ? await estoqueResp.json() : { data: [] };

    res.status(200).json({ produto, estoque });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao consultar APIs do Bling' });
  }
}
