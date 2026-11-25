import {test, expect} from '@playwright/test';

for (const combined of [false,true]) {
  test('Birthday candles and RSVP, combined=' + combined, async ({page}) => {
    await page.setViewportSize({width:390,height:844});
    await page.goto('/rodenden/' + (combined?'?proslava=zaedno':''));
    await page.getByRole('button',{name:'Допрете да ги дувнеме свеќичките'}).click();
    await expect(page.locator('#cake')).toHaveAttribute('src','birthday-blown.webp');
    if(combined) await expect(page.locator('#church')).toBeVisible(); else await expect(page.locator('#church')).toBeHidden();
    await page.getByLabel('Пробно име').fill('Мила');
    await page.getByRole('button',{name:'Испробај ја потврдата'}).click();
    await expect(page.locator('output')).toContainText('Број на гости: 1');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  });
}
test('Ognen’s wooden car follows scrolling in both directions',async({page})=>{
  await page.goto('/ognen/');
  await page.locator('#untie').click();
  await expect(page.locator('#cover')).toBeHidden({timeout:12000});
  const car=page.locator('.thread-rider');
  const start=await car.evaluate(e=>(e as HTMLElement).style.transform);
  await page.locator('#rsvpForm').scrollIntoViewIfNeeded();
  await expect.poll(()=>car.evaluate(e=>(e as HTMLElement).style.transform)).not.toBe(start);
});
