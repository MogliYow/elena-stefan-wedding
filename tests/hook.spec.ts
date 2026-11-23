import {test, expect} from '@playwright/test';
for (const width of [390,1440]) test('gatefold stays put before and after opening at '+width, async ({page}) => {
  await page.setViewportSize({width,height:width === 390 ? 844 : 900});
  await page.goto('/?hook=1');
  await expect(page.locator('.atelier-silk canvas')).toBeVisible();
  await page.clock.install();
  await page.clock.fastForward(60000);
  await expect(page.locator('.atelier')).toHaveAttribute('data-phase','closed');
  await page.screenshot({path:'test-results/gatefold-closed-'+width+'.png'});
  await page.getByRole('button',{name:'Отвори ја поканата',exact:true}).click();
  await page.clock.runFor(1800);
  await expect(page.locator('.atelier')).toHaveAttribute('data-phase','moving');
  await page.screenshot({path:'test-results/gatefold-opening-'+width+'.png'});
  await page.clock.fastForward(60000);
  await expect(page.getByRole('heading',{name:/Елена.*Стефан/})).toBeVisible();
  await page.screenshot({path:'test-results/gatefold-open-'+width+'.png'});
  await page.getByRole('button',{name:'Повтори го отворањето'}).click();
  await page.clock.fastForward(3000);
  await expect(page.locator('.atelier')).toHaveAttribute('data-phase','closed');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
});

test('short drag returns the ribbon, full drag opens it', async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/?hook=1');
  const hit = page.getByRole('button',{name:'Отвори ја поканата',exact:true});
  const bounds = (await hit.boundingBox())!;
  const x = bounds.x + bounds.width/2, y = bounds.y + bounds.height/2;
  for (const distance of [12,140]) {
    await page.mouse.move(x,y); await page.mouse.down();
    await page.mouse.move(x,y+distance,{steps:8}); await page.mouse.up();
    await expect(page.locator('.atelier')).toHaveAttribute('data-phase',distance === 12 ? 'closed' : 'open');
  }
});
test('reduced motion opens the separated hook by keyboard',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/?hook=1');
  await page.getByRole('button',{name:'Отвори ја поканата',exact:true}).press('Enter');
  await expect(page.locator('.atelier')).toHaveAttribute('data-phase','open');
  await expect(page.getByRole('button',{name:'Повтори го отворањето'})).toBeFocused();
});

test('each loop feeds into the knot before the paper moves', async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/?hook=1');
  const canvas = page.locator('.atelier-silk canvas');
  await expect(canvas).toBeVisible();
  await page.clock.install({time:new Date('2026-11-20T09:00:00Z')});
  await page.clock.pauseAt(new Date('2026-11-20T09:00:01Z'));
  await page.getByRole('button',{name:'Отвори ја поканата',exact:true}).press('Enter');

  // Sample the visible fabric in the two upper bights in photo coordinates.
  async function fabric(x: number,y: number) {
    return canvas.evaluate((element,[x,y]) => {
      const c = element as HTMLCanvasElement;
      const context = c.getContext('2d')!;
      const px = Math.floor((220+x)*c.width/1130), py = Math.floor((42+y)*c.height/620);
      const data = context.getImageData(px-2,py-2,5,5).data;
      let sum=0;
      for(let i=3;i<data.length;i+=4) sum+=data[i];
      return sum/25;
    },[x,y]);
  }
  await page.clock.runFor(260);
  expect(await fabric(158,50)).toBeGreaterThan(220);
  expect(await fabric(502,57)).toBeGreaterThan(220);
  await page.clock.runFor(990);
  expect(await fabric(502,57)).toBeLessThan(15);
  expect(await fabric(158,50)).toBeGreaterThan(190);
  await page.clock.runFor(1300);
  expect(await fabric(158,50)).toBeLessThan(15);
  const root = page.locator('.atelier-object');
  expect(await root.evaluate(e=>e.style.getPropertyValue('--left-angle'))).toBe('0deg');
  await page.clock.runFor(1600);
  expect(parseFloat(await root.evaluate(e=>e.style.getPropertyValue('--left-angle')))).toBeLessThan(-90);
});
