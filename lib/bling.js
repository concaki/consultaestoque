import redis from './redis.js';
import { sendTelegramMessage } from './telegram.js';

const BLING_CLIENT_ID = process.env.BLING_CLIENT_ID;
const BLING_CLIENT_SECRET = process.env.BLING_CLIENT_SECRET;

export async function refreshBlingToken() {
    try {
        const refreshToken = await redis.get('bling_refresh_token');

        if (!refreshToken) {
            throw new Error('Nenhum refresh_token encontrado no Redis.');
        }

        const response = await fetch('https://www.bling.com.br/Api/v3/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                client_id: BLING_CLIENT_ID,
                client_secret: BLING_CLIENT_SECRET
            })
        });

        const data = await response.json();

        if (data.access_token) {
            await redis.set('bling_access_token', data.access_token);
            if (data.refresh_token) {
                await redis.set('bling_refresh_token', data.refresh_token);
            }
            await sendTelegramMessage(`✅ *Token atualizado com sucesso!*\n🕒 ${new Date().toLocaleString('pt-BR')}`);
            return data;
        } else {
            const errorMsg = JSON.stringify(data);
            await sendTelegramMessage(`❌ *Erro ao atualizar token do Bling!*\nMensagem: ${errorMsg}\n🕒 ${new Date().toLocaleString('pt-BR')}`);
            throw new Error(errorMsg);
        }
    } catch (err) {
        console.error('Erro no refreshBlingToken:', err);
        throw err;
    }
}

export async function getBlingToken() {
    let token = await redis.get('bling_access_token');
    if (!token) {
        console.log('Token não encontrado no cache (ou expirado), tentando refresh...');
        const result = await refreshBlingToken();
        token = result.access_token;
    }
    return token;
}

export async function fetchBling(url, options = {}) {
    let token = await getBlingToken();

    const makeRequest = async (t) => {
        return fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${t}`,
                'Content-Type': 'application/json'
            }
        });
    };

    let response = await makeRequest(token);

    if (response.status === 401) {
        console.log('Recebido 401 do Bling. Tentando renovar token e reenviar...');
        try {
            const result = await refreshBlingToken();
            token = result.access_token;
            response = await makeRequest(token);
        } catch (error) {
            console.error('Falha ao renovar token após 401:', error);
        }
    }

    return response;
}
