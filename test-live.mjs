import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });

  await page.goto('http://localhost:4444/anime-tracker/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Welche CSS wird geladen?
  const links = await page.evaluate(() =>
    Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(l => l.href)
  );
  console.log('CSS-Links:', JSON.stringify(links, null, 2));

  const hasViews = links.some(l => l.includes('views.css'));
  console.log('views.css:', hasViews ? '✅' : '❌');

  // Gibt es views.css Inhalt?
  const viewStyles = await page.evaluate(async () => {
    for (const link of document.querySelectorAll('link[rel="stylesheet"]')) {
      if (link.href.includes('views.css')) {
        const resp = await fetch(link.href);
        return (await resp.text()).substring(0, 200);
      }
    }
    return 'nicht gefunden';
  });
  console.log('views.css Inhalt:', viewStyles.substring(0, 100));

  // Views prüfen
  const initial = await page.evaluate(() => ({
    colActive: document.getElementById('view-collection')?.classList.contains('active'),
    expActive: document.getElementById('view-explore')?.classList.contains('active'),
    setActive: document.getElementById('view-settings')?.classList.contains('active'),
    colHTML: document.getElementById('view-collection')?.innerHTML?.substring(0, 80),
    expHTML: document.getElementById('view-explore')?.innerHTML?.substring(0, 80),
    navItems: document.querySelectorAll('#bottom-nav .nav-item').length,
  }));
  console.log('Initial:', JSON.stringify(initial, null, 2));

  // Explore Tab klicken
  const exploreBtn = await page.$('#bottom-nav [data-tab="explore"]');
  if (exploreBtn) {
    await exploreBtn.click();
    await page.waitForTimeout(500);
  } else {
    console.log('❌ Explore Button nicht gefunden');
  }

  const afterExplore = await page.evaluate(() => ({
    colActive: document.getElementById('view-collection')?.classList.contains('active'),
    expActive: document.getElementById('view-explore')?.classList.contains('active'),
    expHTML: document.getElementById('view-explore')?.innerHTML?.substring(0, 150),
  }));
  console.log('Nach Explore:', JSON.stringify(afterExplore, null, 2));

  await browser.close();
  console.log('\n✅ DONE');
})();
