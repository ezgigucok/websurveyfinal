export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { demo, sonuclar, type } = req.body;

    const seviyeEtiket = {
      tanima:   { label: "Müşteri Tanıma 🧠", low:"Kısmen", mid:"İyi", high:"Çok İyi" },
      iliski:   { label: "Müşteriyle İlişki 🤝", low:"Kopuk", mid:"Yönetilebilir", high:"Oturmuş" },
      yaklasim: { label: "Müşteri Yaklaşımı 🎯", low:"Değişken", mid:"Dikkatli", high:"Belirleyici" },
    };

    const skorSatirlari = Object.entries(sonuclar).map(([alan, s]) => {
      const meta = seviyeEtiket[alan];
      return `<tr>
        <td style="padding:8px 16px 8px 0;color:#6b7280;font-size:14px;">${meta?.label || alan}</td>
        <td style="padding:8px 0;font-size:14px;font-weight:700;color:#2e304c;">${s.seviye}</td>
      </tr>`;
    }).join("");

    const skorSatirlariMail = Object.entries(sonuclar).map(([alan, s]) => {
      const meta = seviyeEtiket[alan];
      return `<tr>
        <td style="padding:10px 16px 10px 0;font-size:15px;color:#2e304c;">${meta?.label || alan}</td>
        <td style="padding:10px 0;font-size:15px;font-weight:700;color:#2e304c;">${s.seviye}</td>
      </tr>`;
    }).join("");

    // Mail to ezgi
    if (type !== "result") {
      const ezgiHtml = `
<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e2dc;">
  <div style="background:#2e304c;padding:24px 32px;">
    <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.5);letter-spacing:0.08em;text-transform:uppercase;">Güçok Anket</p>
    <h1 style="margin:6px 0 0;font-size:22px;color:#ffffff;font-weight:700;">Yeni görüşme talebi</h1>
  </div>
  <div style="padding:28px 32px;">
    <h2 style="font-size:14px;font-weight:700;color:#2e304c;margin:0 0 12px;">Kişi bilgileri</h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      <tr><td style="padding:6px 12px 6px 0;color:#6b7280;font-size:14px;">E-posta</td><td style="padding:6px 0;font-size:14px;font-weight:700;color:#d5354d;">${demo.email || "Girilmedi"}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;color:#6b7280;font-size:14px;">Sektör</td><td style="padding:6px 0;font-size:14px;color:#2e304c;">${demo.sektor || "-"}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;color:#6b7280;font-size:14px;">Pozisyon</td><td style="padding:6px 0;font-size:14px;color:#2e304c;">${demo.pozisyon || "-"}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;color:#6b7280;font-size:14px;">Departman</td><td style="padding:6px 0;font-size:14px;color:#2e304c;">${demo.departman || "-"}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;color:#6b7280;font-size:14px;">Çalışma yılı</td><td style="padding:6px 0;font-size:14px;color:#2e304c;">${demo.yil || "-"}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;color:#6b7280;font-size:14px;">Şirket büyüklüğü</td><td style="padding:6px 0;font-size:14px;color:#2e304c;">${demo.sirket || "-"}</td></tr>
    </table>
    <h2 style="font-size:14px;font-weight:700;color:#2e304c;margin:0 0 12px;">Anket sonuçları</h2>
    <table style="width:100%;border-collapse:collapse;">${skorSatirlari}</table>
  </div>
  <div style="background:#f5f5f2;padding:16px 32px;text-align:center;">
    <p style="margin:0;font-size:12px;color:#9ca3af;">Bu mail Güçok Müşteri Olgunluk Anketi tarafından otomatik gönderilmiştir.</p>
  </div>
</div>`;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.RESEND_API_KEY}` },
        body: JSON.stringify({
          from: "Güçok Anket <anket@gucok.com>",
          to: ["ezgi@gucok.com"],
          subject: "Yeni görüşme talebi — " + (demo.sektor || "Anket"),
          html: ezgiHtml,
        }),
      });
    }

    // Mail to participant
    if (demo.email && type === "result") {
      const participantHtml = `
<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e2dc;">
  <div style="background:#2e304c;padding:24px 32px;">
    <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.5);letter-spacing:0.08em;text-transform:uppercase;">Güçok Müşteri Olgunluk Anketi</p>
    <h1 style="margin:6px 0 0;font-size:20px;color:#ffffff;font-weight:700;">Anket bitti. Asıl soru: Nereden başlamalısın?</h1>
  </div>
  <div style="padding:28px 32px;">
    <p style="font-size:14px;color:#6b7280;margin:0 0 20px;line-height:1.6;">İşte sonuçlarınız:</p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">${skorSatirlariMail}</table>
    <p style="font-size:14px;color:#2e304c;line-height:1.7;margin:0 0 24px;">Her sonuç hem müşteriniz hem de firmanız için fırsat barındırıyor. 30 dakikada hangisinden başlayacağınızı konuşalım.</p>
    <div style="text-align:center;margin-bottom:16px;">
      <a href="https://www.gucok.com/iletisim" style="display:inline-block;padding:13px 32px;background:#d5354d;color:#ffffff;border-radius:8px;font-size:15px;font-weight:700;text-decoration:none;">Ücretsiz Görüşme Planla →</a>
    </div>
    <div style="text-align:center;">
      <a href="https://www.gucok.com" style="font-size:13px;color:#6b7280;text-decoration:none;">Güçok hakkında daha fazla bilgi almak için →</a>
    </div>
  </div>
  <div style="background:#f5f5f2;padding:16px 32px;text-align:center;">
    <p style="margin:0;font-size:12px;color:#9ca3af;">Bu mail Güçok Müşteri Olgunluk Anketi tarafından otomatik gönderilmiştir.</p>
  </div>
</div>`;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.RESEND_API_KEY}` },
        body: JSON.stringify({
          from: "Güçok <anket@gucok.com>",
          to: [demo.email],
          subject: "Anket bitti. Asıl soru: Nereden başlamalısın? 👇",
          html: participantHtml,
        }),
      });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
