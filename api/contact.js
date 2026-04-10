module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { demo, sonuclar, type } = req.body;

    const seviyeEtiket = {
      tanima:   '\u004d\u00fc\u015f\u0074\u0065\u0072\u0069 \u0054\u0061\u006e\u0131\u006d\u0061 \ud83e\udde0',
      iliski:   '\u004d\u00fc\u015f\u0074\u0065\u0072\u0069\u0079\u006c\u0065 \u0130\u006c\u0069\u015f\u006b\u0069 \ud83e\udd1d',
      yaklasim: '\u004d\u00fc\u015f\u0074\u0065\u0072\u0069 \u0059\u0061\u006b\u006c\u0061\u015f\u0131\u006d\u0131 \ud83c\udfaf',
    };

    const skorSatirlari = Object.entries(sonuclar).map(function(entry) {
      const alan = entry[0], s = entry[1];
      return '<tr><td style="padding:8px 16px 8px 0;color:#6b7280;font-size:14px;">' + (seviyeEtiket[alan] || alan) + '</td><td style="padding:8px 0;font-size:14px;font-weight:700;color:#2e304c;">' + s.seviye + '</td></tr>';
    }).join('');

    const kisiTablosu = '<table style="width:100%;border-collapse:collapse;margin-bottom:24px;">'
      + '<tr><td style="padding:6px 12px 6px 0;color:#6b7280;font-size:14px;">E-posta</td><td style="padding:6px 0;font-size:14px;font-weight:700;color:#d5354d;">' + (demo.email || 'Girilmedi') + '</td></tr>'
      + '<tr><td style="padding:6px 12px 6px 0;color:#6b7280;font-size:14px;">' + 'Sekt\u00f6r' + '</td><td style="padding:6px 0;font-size:14px;color:#2e304c;">' + (demo.sektor || '-') + '</td></tr>'
      + '<tr><td style="padding:6px 12px 6px 0;color:#6b7280;font-size:14px;">Pozisyon</td><td style="padding:6px 0;font-size:14px;color:#2e304c;">' + (demo.pozisyon || '-') + '</td></tr>'
      + '<tr><td style="padding:6px 12px 6px 0;color:#6b7280;font-size:14px;">Departman</td><td style="padding:6px 0;font-size:14px;color:#2e304c;">' + (demo.departman || '-') + '</td></tr>'
      + '<tr><td style="padding:6px 12px 6px 0;color:#6b7280;font-size:14px;">' + '\u00c7al\u0131\u015fma y\u0131l\u0131' + '</td><td style="padding:6px 0;font-size:14px;color:#2e304c;">' + (demo.yil || '-') + '</td></tr>'
      + '<tr><td style="padding:6px 12px 6px 0;color:#6b7280;font-size:14px;">' + '\u015eirket b\u00fcy\u00fckl\u00fc\u011f\u00fc' + '</td><td style="padding:6px 0;font-size:14px;color:#2e304c;">' + (demo.sirket || '-') + '</td></tr>'
      + '</table>';

    const footer = '<div style="background:#f5f5f2;padding:16px 32px;text-align:center;"><p style="margin:0;font-size:12px;color:#9ca3af;">G\u00fc\u00e7ok M\u00fc\u015fteri Olgunluk Anketi</p></div>';

    const header = function(baslik) {
      return '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e2dc;"><div style="background:#2e304c;padding:24px 32px;"><h1 style="margin:0;font-size:22px;color:#fff;font-weight:700;">' + baslik + '</h1></div><div style="padding:28px 32px;">';
    };

    const send = async function(to, subject, html) {
      return fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.RESEND_API_KEY },
        body: JSON.stringify({ from: 'G\u00fc\u00e7ok Anket <anket@gucok.com>', to: [to], subject: subject, html: html }),
      });
    };

    if (type === 'gorusme') {
      const html = header('Yeni g\u00f6r\u00fc\u015fme talebi') + kisiTablosu + '<table style="width:100%;border-collapse:collapse;">' + skorSatirlari + '</table></div>' + footer + '</div>';
      await send('ezgi@gucok.com', 'Yeni g\u00f6r\u00fc\u015fme talebi \u2014 ' + (demo.sektor || 'Anket'), html);
    }

    if (type === 'result') {
      const htmlEzgi = header('Anket Tamamland\u0131') + kisiTablosu + '<table style="width:100%;border-collapse:collapse;">' + skorSatirlari + '</table></div>' + footer + '</div>';
      await send('ezgi@gucok.com', 'Anket Tamamland\u0131 \u2014 ' + (demo.sektor || '-'), htmlEzgi);

      if (demo.email) {
        const htmlKatilimci = header('Anket bitti. As\u0131l soru: Nereden ba\u015flamal\u0131s\u0131n?')
          + '<p style="font-size:14px;color:#6b7280;margin:0 0 20px;line-height:1.6;">Sonu\u00e7lar\u0131n\u0131z:</p>'
          + '<table style="width:100%;border-collapse:collapse;margin-bottom:28px;">' + skorSatirlari + '</table>'
          + '<p style="font-size:14px;color:#2e304c;line-height:1.7;margin:0 0 24px;">Her sonu\u00e7 hem m\u00fc\u015fteriniz hem de firman\u0131z i\u00e7in f\u0131rsat bar\u0131nd\u0131r\u0131yor. 30 dakikada hangisinden ba\u015flamak istedi\u011finizi konu\u015falım.</p>'
          + '<div style="text-align:center;margin-bottom:16px;"><a href="https://websurveyfinal.vercel.app/thanks.html" style="display:inline-block;padding:13px 32px;background:#d5354d;color:#fff;border-radius:8px;font-size:15px;font-weight:700;text-decoration:none;">\u00dcretsiz G\u00f6r\u00fc\u015fme Planla \u2192</a></div>'
          + '<div style="text-align:center;"><a href="https://www.gucok.com" style="font-size:13px;color:#6b7280;text-decoration:none;">G\u00fc\u00e7ok hakk\u0131nda daha fazla bilgi almak i\u00e7in \u2192</a></div>'
          + '</div>' + footer + '</div>';
        await send(demo.email, 'Anket bitti. As\u0131l soru: Nereden ba\u015flamal\u0131s\u0131n? \ud83d\udc47', htmlKatilimci);
      }
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
