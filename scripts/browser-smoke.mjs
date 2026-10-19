import { chromium } from 'playwright';
const browser = await chromium.launch({headless:true});
const page = await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
const errors=[];
page.on('pageerror', e=>errors.push(e.message));
try {
  const response=await page.goto('http://127.0.0.1:4173/feuchlab/',{waitUntil:'networkidle'});
  if (!response?.ok()) throw new Error('Page failed to load: '+response?.status());
  await page.locator('body').waitFor();
  const visible = await page.locator('body').innerText();
  if(!/Feuch|laboratoire|Welcome|Bienvenid/i.test(visible)) throw new Error('Feuch Lab home content not rendered');
  if(visible.trim().length<50) throw new Error('Blank screen detected');
  if(errors.length) throw new Error('JavaScript runtime errors: '+errors.join('; '));
  const htmlWidth=await page.evaluate(()=>document.documentElement.scrollWidth);
  if(htmlWidth>405) throw new Error('Mobile horizontal overflow: '+htmlWidth);
  console.log('Feuch Lab mobile React smoke PASS');
} finally { await browser.close(); }
