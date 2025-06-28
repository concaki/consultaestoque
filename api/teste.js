import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  try {
    const token = await redis.get('bling_access');
    res.status(200).json({ bling_access: token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
