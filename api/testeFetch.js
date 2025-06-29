export default async function handler(req, res) {
  try {
    const response = await fetch("https://polite-fowl-10598.upstash.io/get/teste", {
      headers: {
        Authorization: "Bearer upstash:ASlmAAIjcDE5YTcyMWU3ZDMwNDE0OTVhYmEwMDJiZjdhNTI4OGZhN3AxMA"
      }
    });

    const json = await response.json();
    res.status(200).json({ success: true, result: json });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
