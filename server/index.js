const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.static('public'));

app.get('/consulta', async (req, res) => {
  const sku = req.query.sku;
  const token = process.env.BLING_TOKEN;
  if (!sku || !token) {
    return res.status(400).json({ error: 'SKU ou Token não informado' });
  }

  try {
    const headers = { Authorization: `Bearer ${token}` };
    const [prodRes, estoqueRes] = await Promise.all([
      fetch(`https://api.bling.com.br/Api/v3/produtos?i&codigos[]="${sku}"`, { headers }),
      fetch(`https://api.bling.com.br/Api/v3/estoques/saldos?i&codigos[]="${sku}"`, { headers })
    ]);

    const produto = await prodRes.json();
    const estoque = await estoqueRes.json();

    res.json({ produto, estoque });
  } catch (err) {
    res.status(500).json({ error: 'Erro na consulta', detalhe: err.message });
  }
});

app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));
