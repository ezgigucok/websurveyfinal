export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const payload = req.body;

    const r = await fetch(`${process.env.SUPABASE_URL}/rest/v1/anket_sonuclari`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        tarih:       payload.tarih,
        email:       payload.demo?.email || null,
        kvkk:        payload.demo?.kvkk || false,
        sektor:      payload.demo?.sektor || null,
        cinsiyet:    payload.demo?.cinsiyet || null,
        departman:   payload.demo?.departman || null,
        calisma_yil: payload.demo?.yil || null,
        sirket_boyut:payload.demo?.sirket || null,
        tanima_skor: payload.sonuclar?.Tanıma?.skor || null,
        tanima_seviye: payload.sonuclar?.Tanıma?.seviye || null,
        iliski_skor: payload.sonuclar?.İlişki?.skor || null,
        iliski_seviye: payload.sonuclar?.İlişki?.seviye || null,
        yaklasim_skor: payload.sonuclar?.Yaklaşım?.skor || null,
        yaklasim_seviye: payload.sonuclar?.Yaklaşım?.seviye || null,
        cevaplar:    JSON.stringify(payload.cevaplar),
      }),
    });

    if (!r.ok) {
      const err = await r.text();
      return res.status(500).json({ error: err });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
async function gorusmePlanla() {
  const btn = document.getElementById("gorus-btn");
  btn.textContent = "Gönderiliyor...";
  btn.disabled = true;
  try {
    await fetch("https://websurveyfinal.vercel.app/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ demo, sonuclar: window._sonuclar })
    });
    btn.textContent = "Mesajınız iletildi ✓";
  } catch(e) {
    btn.textContent = "Hata oluştu, tekrar deneyin";
    btn.disabled = false;
  }
}
