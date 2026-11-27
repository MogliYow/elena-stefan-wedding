import {test,expect} from '@playwright/test';

for (const width of [375,1280]) {
  test('Stefi opens the seal and blows out each candle at '+width, async ({page})=>{
    await page.setViewportSize({width,height:850});
    await page.goto('/stefi/');
    await expect(page.locator('main')).toBeHidden();
    await page.getByRole('button',{name:'Отвори го пликот со печатчето на Мини'}).click();
    const first=page.getByRole('button',{name:'Изгасни го првото пламенче'});
    const second=page.getByRole('button',{name:'Изгасни го второто пламенче'});
    await expect(page.locator('#greeting')).toHaveText('Стефи полни две годинки!');
    await second.click();
    await expect(first).toBeEnabled();
    await expect(second).toBeDisabled();
    await expect(page.locator('.scene')).not.toHaveClass(/hooray/);
    await first.click();
    await expect(page.locator('.scene')).toHaveClass(/hooray/);
    await expect(page.locator('#status')).toHaveText('Среќен втор роденден, Стефи!');
    await page.getByRole('button',{name:'Запали ги повторно'}).click();
    await expect(first).toBeEnabled();
    await expect(second).toBeEnabled();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await expect(page.locator('#song')).toHaveAttribute('src','happy-birthday.mp3');
  });
}
