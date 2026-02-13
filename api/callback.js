import redis from '../lib/redis.js';

export default async function handler(req, res) {
    const { code } = req.query;

    if (!code) {
        return res.status(400).send("Código de autorização não encontrado.");
    }

    const clientId = process.env.BLING_CLIENT_ID;
    const clientSecret = process.env.BLING_CLIENT_SECRET;
    const redirectUri = 'https://' + req.headers.host + '/api/callback';

    try {
        const response = await fetch("https://www.bling.com.br/Api/v3/oauth/token", {
            method: "POST",
            headers: {
                "Authorization": "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code: code,
                redirect_uri: redirectUri
            })
        });

        const data = await response.json();

        if (data.access_token) {
            // Salva no Redis automaticamente
            await redis.set('bling_access_token', data.access_token);
            await redis.set('bling_refresh_token', data.refresh_token);

            res.status(200).send(`
        <html>
          <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: green;">Autenticado com Sucesso!</h1>
            <p>Os tokens foram salvos no banco de dados.</p>
            <p>Access Token: ${data.access_token.substring(0, 10)}...</p>
            <p>Refresh Token: ${data.refresh_token.substring(0, 10)}...</p>
            <br>
            <a href="/">Voltar para Consulta</a>
          </body>
        </html>
      `);
        } else {
            res.status(500).json({
                message: "Erro ao trocar o código por token",
                erro: data
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}
