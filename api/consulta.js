export default async function handler(req, res) {
  const sku = req.query.sku;
  const token = process.env.BLING_ACCESS_TOKEN; // Corrigido aqui

  if (!sku || !token) {
    return res.status(400).json({ error: 'SKU ou Token não informado' });
  }

  try {
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const [produtoResp, estoqueResp] = await Promise.all([
      fetch(`https://api.bling.com.br/Api/v3/produtos?i&codigos[]=${sku}`, { headers }),
      fetch(`https://api.bling.com.br/Api/v3/estoques/saldos?i&codigos[]=${sku}`, { headers }),
    ]);

    const produto = await produtoResp.json();
    const estoque = await estoqueResp.json();

    res.status(200).json({ produto, estoque });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao consultar APIs do Bling' });
  }
}
