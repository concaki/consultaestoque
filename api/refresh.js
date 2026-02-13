import { refreshBlingToken } from '../lib/bling.js';

export default async function handler(req, res) {
  try {
    const newToken = await refreshBlingToken();
    return res.status(200).json({ success: true, token: newToken });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
