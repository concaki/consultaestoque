// api/consulta.js
export default async function handler(req, res) {
  const { sku } = req.query;
  const token = process.env.BLING_TOKEN;

  if (!sku) {
    return res.status(400).json({ error: 'SKU é obrigatório.' });
  }

  try {
    // Requisição para os dados do produto
    const produtoRes = await fetch(`https://api.bling.com.br/Api/v3/produtos?i&codigos[]=${sku}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const produto = await produtoRes.json();

    // Requisição para o estoque
    const estoqueRes = await fetch(`https://api.bling.com.br/Api/v3/estoques/saldos?i&codigos[]=${sku}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const estoque = await estoqueRes.json();

    res.status(200).json({ produto, estoque });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao buscar dados.' });
  }
}
