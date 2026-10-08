import { chromium } from 'playwright-core';
const b = await chromium.launch({ channel: 'msedge' });
const sites = { mughlai: 'https://nawabi-wrap.preview.emergentagent.com/', 'forge-future': 'https://forge-future-6.preview.emergentagent.com/', 'golden-saffron': 'https://thegoldensaffron.netlify.app/' };
for (const [id, url] of Object.entries(sites)) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    const r = await p.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
    await p.waitForTimeout(4000);
    console.log(id, r?.status(), await p.title());
    await p.screenshot({ path: `visual-check/raw-${id}.png` });
  } catch (e) { console.log(id, 'ERR', e.message.split('\n')[0]); try { await p.screenshot({ path: `visual-check/raw-${id}.png` }); } catch {} }
  await p.close();
}
await b.close();
