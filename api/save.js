export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { demo, cevaplar, sonuclar, tarih } = req.body;

    // Cevaplar dizisini { t1: "evet", i2: "hayir", ... } formatına çevir
    const cevapMap = {};
    if (Array.isArray(cevaplar)) {
      cevaplar.forEach(function(c) { cevapMap[c.id] = c.cevap; });
    }

    // Toplam skoru ve profili hesapla
    const maxlar = { tanima: 42, iliski: 39, yaklasim: 18 };
    const agirliklar = { tanima: 0.40, iliski: 0.35, yaklasim: 0.25 };
    let toplamSkor = 0;
    ['tanima', 'iliski', 'yaklasim'].forEach(function(a) {
      if (sonuclar[a]) {
        const norm = (sonuclar[a].skor / maxlar[a]) * 5;
        toplamSkor += norm * agirliklar[a];
      }
    });
    toplamSkor = Math.round(toplamSkor * 10) / 10;

    let profil = 'Uzak';
    if (toplamSkor >= 4) profil = 'Sadık';
    else if (toplamSkor >= 3) profil = 'Memnun';
    else if (toplamSkor >= 2) profil = 'Kararsız';

    const payload = {
      tarih:           tarih || new Date().toISOString(),
      kvkk:            demo?.kvkk || false,
      email:           demo?.email || null,
      sektor:          demo?.sektor || null,
      pozisyon:        demo?.pozisyon || null,
      departman:       demo?.departman || null,
      calisma_yil:     demo?.yil || null,
      sirket_boyut:    demo?.sirket || null,
      tanima_seviye:   sonuclar?.tanima?.seviye || null,
      iliski_seviye:   sonuclar?.iliski?.seviye || null,
      yaklasim_seviye: sonuclar?.yaklasim?.seviye || null,
      toplam_skor:     toplamSkor,
      profil:          profil,
      t1: cevapMap['t1'] || null,
      t2: cevapMap['t2'] || null,
      t3: cevapMap['t3'] || null,
      t4: cevapMap['t4'] || null,
      t5: cevapMap['t5'] || null,
      t6: cevapMap['t6'] || null,
      i1: cevapMap['i1'] || null,
      i2: cevapMap['i2'] || null,
      i3: cevapMap['i3'] || null,
      i4: cevapMap['i4'] || null,
      i5: cevapMap['i5'] || null,
      y1: cevapMap['y1'] || null,
      y2: cevapMap['y2'] || null,
      y3: cevapMap['y3'] || null,
      y4: cevapMap['y4'] || null,
    };

    const r = await fetch(`${process.env.SUPABASE_URL}/rest/v1/anket_sonuclari`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(payload),
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
