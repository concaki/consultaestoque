import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  try {
    await redis.set("teste", "ok");
    const valor = await redis.get("teste");
    res.status(200).json({ success: true, valor });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
}
