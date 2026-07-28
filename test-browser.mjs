import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

page.on('console', msg => console.log(`[${msg.type()}] ${msg.text()}`));
page.on('pageerror', err => console.log(`❌ PAGE ERROR: ${err.message}`));

try {
  await page.goto('http://localhost:4321/anime-tracker/', { 
    timeout: 10000, waitUntil: 'networkidle' 
  });
  await new Promise(r => setTimeout(r, 3000));
  console.log('--- FINAL STATE ---');
  const stats = await page.evaluate(() => document.getElementById('stats')?.innerHTML?.length || 'no stats');
  const grid = await page.evaluate(() => document.getElementById('anime-grid')?.innerHTML?.length || 'no grid');
  console.log(`Stats HTML length: ${stats}`);
  console.log(`Grid HTML length: ${grid}`);
  console.log(`Has loader: ${await page.evaluate(() => !!document.querySelector('.anime-grid-loader'))}`);
} catch(e) {
  console.log(`❌ NAV ERROR: ${e.message}`);
}

await browser.close();
