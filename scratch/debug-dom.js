const { chromium } = require('playwright');

(async () => {
  let browser;
  try {
    browser = await chromium.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => {
      console.log(`[CONSOLE] ${msg.type()}: ${msg.text()}`);
    });
    
    page.on('pageerror', err => {
      console.error(`[UNCAUGHT ERROR] ${err.message}`);
    });

    console.log('Navigating to local editor page...');
    await page.goto('http://localhost:3000/write/9c644e6a-865f-4abd-9965-e10755d7a9bb');
    
    console.log('Waiting 4 seconds...');
    await page.waitForTimeout(4000);
    
    const containerHtml = await page.evaluate(() => {
      const el = document.getElementById('editorjs-container');
      return el ? el.innerHTML : 'CONTAINER NOT FOUND';
    });

    console.log('\n--- CONTAINER HTML START ---');
    console.log(containerHtml);
    console.log('--- CONTAINER HTML END ---\n');

  } catch (err) {
    console.error('Script failed:', err);
  } finally {
    if (browser) await browser.close();
  }
})();
