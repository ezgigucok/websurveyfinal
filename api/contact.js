export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { demo, sonuclar } = req.body;

    const seviyeMetin = (alan, s) => {
      const etiket = { Tanima: "Müşteri Tanıma", Iliski: "Müşteri İlişkisi", Yaklasim: "Müşteri Yaklaşımı" };
      return `<tr><td style="padding:6px 12px 6px 0;color:#6b7280;font-size:14px;">${etiket[alan] || alan}</td><td style="padding:6px 0;font-size:14px;font-weight:600;color:#2e304c;">${s.seviye} (${s.skor} puan)</td></tr>`;
    };

    const skorTablosu = Object.entries(sonuclar).map(([alan, s]) => seviyeMetin(alan, s)).join("");

    const html = `
<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e2dc;">
  <div style="background:#2e304c;padding:24px 32px;">
    <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.6);letter-spacing:0.08em;text-transform:uppercase;">Güçok Anket</p>
    <h1 style="margin:6px 0 0;font-size:22px;color:#ffffff;font-weight:700;">Yeni görüşme talebi</h1>
  </div>
  <div style="padding:28px 32px;">
    <h2 style="font-size:15px;font-weight:700;color:#2e304c;margin:0 0 14px;">Kişi bilgileri</h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      <tr><td style="padding:6px 12px 6px 0;color:#6b7280;font-size:14px;">E-posta</td><td style="padding:6px 0;font-size:14px;font-weight:600;color:#d5354d;">${demo.email || "Girilmedi"}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;color:#6b7280;font-size:14px;">Sektör</td><td style="padding:6px 0;font-size:14px;color:#2e304c;">${demo.sektor || "-"}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;color:#6b7280;font-size:14px;">Departman</td><td style="padding:6px 0;font-size:14px;color:#2e304c;">${demo.departman || "-"}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;color:#6b7280;font-size:14px;">Çalışma yılı</td><td style="padding:6px 0;font-size:14px;color:#2e304c;">${demo.yil || "-"}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;color:#6b7280;font-size:14px;">Şirket büyüklüğü</td><td style="padding:6px 0;font-size:14px;color:#2e304c;">${demo.sirket || "-"}</td></tr>
    </table>
    <h2 style="font-size:15px;font-weight:700;color:#2e304c;margin:0 0 14px;">Anket sonuçları</h2>
    <table style="width:100%;border-collapse:collapse;">
      ${skorTablosu}
    </table>
  </div>
  <div style="background:#f5f5f2;padding:16px 32px;text-align:center;">
    <p style="margin:0;font-size:12px;color:#9ca3af;">Bu mail Güçok Müşteri Olgunluk Anketi tarafından otomatik gönderilmiştir.</p>
  </div>
</div>`;

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Güçok Anket <anket@gucok.com>",
        to: ["ezgi@gucok.com"],
        subject: "Yeni görüşme talebi — " + (demo.sektor || "Anket"),
        html,
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
