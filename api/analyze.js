export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { type, scores } = req.body;
    const { ov, cs, os, cAreaStr, oAreaStr, cComps, oComps } = scores;

    const prompts = {
      overall: `Sen keskin bir yönetim danışmanısın. 3 cümlelik genel değerlendirme yaz. Madde işareti yok. Türkçe.\n\nGenel: ${ov}/5\nMüşteri: ${cs}/5 — ${cAreaStr}\nOrganizasyon: ${os}/5 — ${oAreaStr}\n\nİki boyut arasındaki gerilimi veya uyumu adlandır.`,
      customer: `Yönetim danışmanısın. Müşteri olgunluğu hakkında 3 cümle. Sayılara özgü ol. Madde işareti yok. Türkçe.\n\nMüşteri: ${cs}/5\n${cAreaStr}\n${cComps.join(', ')}\n\nEn anlamlı 1-2 lens: dijital hazırlık, müşteri zekası, deneyim tasarımı, çok kanallılık, sadakat.`,
      org: `Yönetim danışmanısın. Organizasyon olgunluğu hakkında 3 cümle. Sayılara özgü ol. Madde işareti yok. Türkçe.\n\nOrganizasyon: ${os}/5\n${oAreaStr}\n${oComps.join(', ')}\n\nEn anlamlı 1-2 lens: çeviklik, sürdürülebilirlik, dijital operasyonlar, değişim kapasitesi, insan ve kültür.`
    };

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompts[type] }],
      }),
    });

    const data = await r.json();
    const text = data.content?.find(c => c.type === 'text')?.text || 'Yorum oluşturulamadı.';
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(500).json({ text: 'Sunucu hatası.' });
  }
}
