import {test,expect} from '@playwright/test';
test('isolated hook opens and replays without changing pages',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/?hook=1');
 await expect(page.locator('.cinema-render-webgl')).toBeVisible({timeout:15000});
 await page.screenshot({path:'test-results/hook-closed.png'});
 await page.getByRole('button',{name:'Отвори ја поканата',exact:true}).click();
 await expect(page.getByRole('button',{name:'ПОВТОРИ ГО ОТВОРАЊЕТО'})).toBeVisible({timeout:10000});
 await page.screenshot({path:'test-results/hook-open.png'});
 await expect(page.locator('main')).toHaveCount(0);
 await page.getByRole('button',{name:'ПОВТОРИ ГО ОТВОРАЊЕТО'}).click();
 await expect(page.getByRole('button',{name:'Отвори ја поканата',exact:true})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});
test('hook stays open and resets its 3D canvas on desktop',async({page})=>{
 await page.setViewportSize({width:1440,height:900});
 await page.clock.install();
 await page.goto('/?hook=1');
 await expect(page.locator('.cinema-render-webgl')).toBeVisible({timeout:15000});
 await page.getByRole('button',{name:'Отвори ја поканата',exact:true}).click();
 await page.clock.fastForward(60000);
 await expect(page.getByRole('button',{name:'ПОВТОРИ ГО ОТВОРАЊЕТО'})).toBeVisible();
 await page.screenshot({path:'test-results/hook-desktop-open.png'});
 await page.getByRole('button',{name:'ПОВТОРИ ГО ОТВОРАЊЕТО'}).click();
 await page.clock.runFor(100);
 await page.screenshot({path:'test-results/hook-desktop-replay.png'});
 await expect(page.locator('.cinema-sealed')).toBeVisible();
});
test('hook respects reduced motion',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/?hook=1');
 await page.getByRole('button',{name:'Отвори ја поканата',exact:true}).click();
 await expect(page.getByRole('button',{name:'ПОВТОРИ ГО ОТВОРАЊЕТО'})).toBeVisible();
 await expect(page.locator('.cinema-opening')).toHaveCount(0);
});
