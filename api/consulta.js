export default async function handler(req, res) {
  const { sku } = req.query;
  const token = process.env.BLING_TOKEN;

  if (!sku) return res.status(400).json({ error: 'SKU não informado' });

  try {
    const [resProduto, resEstoque] = await Promise.all([
      fetch(`https://api.bling.com.br/Api/v3/produtos?i&codigos[]="${sku}"`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetch(`https://api.bling.com.br/Api/v3/estoques/saldos?i&codigos[]="${sku}"`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
    ]);

    const produto = await resProduto.json();
    const estoque = await resEstoque.json();

    res.status(200).json({ produto, estoque });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao consultar API do Bling' });
  }
}
