import {test,expect} from '@playwright/test';
for (const width of [390,1440]) test('the invitation waits for a guest before the jewellery scene '+width, async({page})=>{
  await page.setViewportSize({width,height:width === 390 ? 844 : 1000});
  await page.goto('/');
  await page.getByRole('button',{name:'Отвори ја поканата',exact:true}).click();
  const next = page.getByRole('button',{name:'Продолжи кон поканата',exact:true});
  await expect(next).toBeVisible();
  await page.clock.install();
  await page.clock.fastForward(60000);
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('main')).toHaveAttribute('aria-hidden','true');
  await next.click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('.cinema-inline.cinema-rings')).toBeVisible();
});
test('silk, opening, and jewellery still work without WebGL',async({page})=>{
  await page.addInitScript(()=>{
    const original=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(type,...args){
      if(['webgl','webgl2','experimental-webgl'].includes(type))return null;
      return original.call(this,type,...args);
    } as typeof original;
  });
  await page.goto('/');
  await expect(page.locator('.atelier-silk img')).toBeVisible();
  await page.getByRole('button',{name:'Отвори ја поканата',exact:true}).click();
  await page.getByRole('button',{name:'Продолжи кон поканата',exact:true}).click();
  await expect(page.locator('.cinema-fallback')).toBeVisible();
  await expect(page.locator('.cinema-inline.cinema-rings')).toBeVisible();
});
