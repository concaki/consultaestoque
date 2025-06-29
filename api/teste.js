import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  try {
    await redis.set("chaveTeste", "valorOK");
    const resultado = await redis.get("chaveTeste");
    res.status(200).json({ success: true, resultado });
  } catch (e) {
    res.status(500).json({ success: false, erro: e.message });
  }
}
