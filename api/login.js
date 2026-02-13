export default function handler(req, res) {
    const clientId = process.env.BLING_CLIENT_ID;
    const redirectUri = 'https://' + req.headers.host + '/api/callback';

    // State is optional but good for security. For simplicity in this quick tool, we might omit or use a simple one.
    const state = 'sclea';

    const blingAuthUrl = `https://www.bling.com.br/Api/v3/oauth/authorize?response_type=code&client_id=${clientId}&state=${state}&redirect_uri=${encodeURIComponent(redirectUri)}`;

    res.redirect(blingAuthUrl);
}
