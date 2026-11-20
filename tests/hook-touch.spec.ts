import {devices, expect, test} from '@playwright/test';

test.use({...devices['iPhone 13'], browserName: 'webkit'});
test('iPhone WebKit opens the ribbon by touch and waits on the invitation', async ({page}) => {
  await page.goto('/?hook=1');
  const ribbon = page.getByRole('button', {name:'Отвори ја поканата',exact:true});
  await expect(ribbon).toBeVisible();
  await expect.poll(() => page.locator('.atelier-silk img').evaluate(e => (e as HTMLImageElement).naturalWidth)).toBeGreaterThan(500);
  await page.screenshot({path:'test-results/iphone-closed.png'});
  await ribbon.tap();
  const replay = page.getByRole('button',{name:'Повтори го отворањето'});
  await expect(replay).toBeVisible({timeout:10000});
  await expect(page.getByRole('heading',{name:/Елена.*Стефан/})).toBeVisible();
  await page.clock.install();
  await page.clock.fastForward(60000);
  await expect(replay).toBeVisible();
  await page.screenshot({path:'test-results/iphone-open.png'});
  await replay.tap();
  await page.clock.fastForward(4000);
  await expect(ribbon).toBeVisible();
});
