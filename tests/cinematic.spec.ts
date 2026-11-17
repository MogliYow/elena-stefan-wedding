import {test,expect} from '@playwright/test';
for(const width of [390,1440])test('cinematic ribbon and jewellery reveal '+width,async({page})=>{
 await page.setViewportSize({width,height:width<600?844:1000});
 await page.clock.install({time:new Date('2026-11-17T12:00:00Z')});
 await page.clock.pauseAt(new Date('2026-11-17T12:00:01Z'));
 await page.goto('/');
 await expect(page.locator('.cinema-render-webgl')).toBeVisible({timeout:15000});
 await page.clock.runFor(50);
 await page.screenshot({path:'test-results/cinema-envelope-'+width+'.png'});
 await page.getByRole('button',{name:'Отвори ја поканата',exact:true}).click();
 await page.clock.fastForward(6000);
 await expect(page.locator('.cinema-rings')).toBeVisible({timeout:6000});
 await page.clock.runFor(50);
 await page.screenshot({path:'test-results/cinema-rings-'+width+'.png'});
 await expect(page.getByRole('button',{name:'ПРОДОЛЖИ КОН ПОКАНАТА',exact:false})).toBeVisible();
 await page.getByRole('button',{name:'ПРОДОЛЖИ КОН ПОКАНАТА',exact:false}).click();
 await expect(page.getByRole('dialog')).toHaveCount(0);
});
test('no WebGL still opens both scenes and permits skipping',async({page})=>{
 await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(type==='webgl2'||type==='webgl'||type==='experimental-webgl')return null;return original.call(this,type,...args);} as typeof original;});
 await page.goto('/');
 await expect(page.locator('.cinema-fallback')).toBeVisible();
 await page.getByRole('button',{name:'Отвори ја поканата',exact:true}).click();
 await expect(page.locator('.cinema-rings')).toBeVisible({timeout:6000});
 await page.getByRole('button',{name:'Прескокни го воведот ↗',exact:true}).click();
 await expect(page.getByRole('dialog')).toHaveCount(0);
});
