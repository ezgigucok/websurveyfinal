module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { demo, sonuclar, type } = req.body;

    const seviyeEtiket = {
      tanima:   { label: "Musteri Tanima" },
      iliski:   { label: "Musteriyle Iliski" },
      yaklasim: { label: "Musteri Yaklasimi" },
    };

    const skorSatirlari = Object.entries(sonuclar).map(([alan, s]) => {
      const meta = seviyeEtiket[alan];
      return '<tr><td style="padding:8px 16px 8px 0;color:#6b7280;font-size:14px;">' + (meta ? meta.label : alan) + '</td><td style="padding:8px 0;font-size:14px;font-weight:700;color:#2e304c;">' + s.seviye + '</td></tr>';
    }).join("");

    const skorSatirlariMail = Object.entries(sonuclar).map(([alan, s]) => {
      const meta = seviyeEtiket[alan];
      return '<tr><td style="padding:10px 16px 10px 0;font-size:15px;color:#2e304c;">' + (meta ? meta.label : alan) + '</td><td style="padding:10px 0;font-size:15px;font-weight:700;color:#2e304c;">' + s.seviye + '</td></tr>';
    }).join("");

    const kisiTablosu = '<table style="width:100%;border-collapse:collapse;margin-bottom:24px;">'
      + '<tr><td style="padding:6px 12px 6px 0;color:#6b7280;font-size:14px;">E-posta</td><td style="padding:6px 0;font-size:14px;font-weight:700;color:#d5354d;">' + (demo.email || "Girilmedi") + '</td></tr>'
      + '<tr><td style="padding:6px 12px 6px 0;color:#6b7280;font-size:14px;">Sektor</td><td style="padding:6px 0;font-size:14px;color:#2e304c;">' + (demo.sektor || "-") + '</td></tr>'
      + '<tr><td style="padding:6px 12px 6px 0;color:#6b7280;font-size:14px;">Pozisyon</td><td style="padding:6px 0;font-size:14px;color:#2e304c;">' + (demo.pozisyon || "-") + '</td></tr>'
      + '<tr><td style="padding:6px 12px 6px 0;color:#6b7280;font-size:14px;">Departman</td><td style="padding:6px 0;font-size:14px;color:#2e304c;">' + (demo.departman || "-") + '</td></tr>'
      + '<tr><td style="padding:6px 12px 6px 0;color:#6b7280;font-size:14px;">Calisma yili</td><td style="padding:6px 0;font-size:14px;color:#2e304c;">' + (demo.yil || "-") + '</td></tr>'
      + '<tr><td style="padding:6px 12px 6px 0;color:#6b7280;font-size:14px;">Sirket buyuklugu</td><td style="padding:6px 0;font-size:14px;color:#2e304c;">' + (demo.sirket || "-") + '</td></tr>'
      + '</table>';

    const footer = '<div style="background:#f5f5f2;padding:16px 32px;text-align:center;"><p style="margin:0;font-size:12px;color:#9ca3af;">Gucok Musteri Olgunluk Anketi</p></div>';

    if (type !== "result") {
      const html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e2dc;"><div style="background:#2e304c;padding:24px 32px;"><h1 style="margin:0;font-size:22px;color:#fff;font-weight:700;">Yeni gorusme talebi</h1></div><div style="padding:28px 32px;">' + kisiTablosu + '<table style="width:100%;border-collapse:collapse;">' + skorSatirlari + '</table></div>' + footer + '</div>';
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + process.env.RESEND_API_KEY },
        body: JSON.stringify({ from: "Gucok Anket <anket@gucok.com>", to: ["ezgi@gucok.com"], subject: "Yeni gorusme talebi - " + (demo.sektor || "Anket"), html }),
      });
    }

    if (type === "result") {
      const html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e2dc;"><div style="background:#2e304c;padding:24px 32px;"><h1 style="margin:0;font-size:22px;color:#fff;font-weight:700;">Anket Tamamlandi</h1></div><div style="padding:28px 32px;">' + kisiTablosu + '<table style="width:100%;border-collapse:collapse;">' + skorSatirlari + '</table></div>' + footer + '</div>';
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + process.env.RESEND_API_KEY },
        body: JSON.stringify({ from: "Gucok Anket <anket@gucok.com>", to: ["ezgi@gucok.com"], subject: "Anket Tamamlandi - " + (demo.sektor || "-"), html }),
      });
    }

    if (demo.email && type === "result") {
      const html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e2dc;"><div style="background:#2e304c;padding:24px 32px;"><h1 style="margin:0;font-size:20px;color:#fff;font-weight:700;">Anket bitti. Asil soru: Nereden baslamalisin?</h1></div><div style="padding:28px 32px;"><p style="font-size:14px;color:#6b7280;margin:0 0 20px;line-height:1.6;">Sonuclariniz:</p><table style="width:100%;border-collapse:collapse;margin-bottom:28px;">' + skorSatirlariMail + '</table><p style="font-size:14px;color:#2e304c;line-height:1.7;margin:0 0 24px;">Her sonuc hem musteriniz hem de firmaniz icin firsat barindirio. 30 dakikada hangisinden baslayacaginizi konusalim.</p><div style="text-align:center;margin-bottom:16px;"><a href="https://websurveyfinal.vercel.app/thanks.html" style="display:inline-block;padding:13px 32px;background:#d5354d;color:#fff;border-radius:8px;font-size:15px;font-weight:700;text-decoration:none;">Ucretsiz Gorusme Planla</a></div><div style="text-align:center;"><a href="https://www.gucok.com" style="font-size:13px;color:#6b7280;text-decoration:none;">Gucok hakkinda daha fazla bilgi almak icin</a></div></div>' + footer + '</div>';
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + process.env.RESEND_API_KEY },
        body: JSON.stringify({ from: "Gucok <anket@gucok.com>", to: [demo.email], subject: "Anket bitti. Asil soru: Nereden baslamalisin?", html }),
      });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
