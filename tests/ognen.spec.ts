import {test, expect} from '@playwright/test';

for (const width of [390, 1366]) {
  test('Ognen ribbon opens the christening invitation in one gesture at ' + width, async ({page}) => {
    await page.setViewportSize({width, height: 844});
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/ognen/');
    const ribbon = page.getByRole('button', {name:'Одврзи ја панделката'});
    if (width === 390) {
      const box = await ribbon.boundingBox();
      if (!box) throw new Error('Ribbon unavailable');
      const x = box.x + box.width * .65, y = box.y + box.height * .5;
      await page.mouse.move(x,y);
      await page.mouse.down();
      await page.mouse.move(x+12,y+100,{steps:12});
      await page.mouse.up();
    } else {
      await ribbon.click();
    }
    await expect(page.locator('#cover')).toBeHidden({timeout:15000});
    await expect(page.locator('#musicButton')).toHaveAttribute('aria-pressed','true');
    await expect(page.locator('.font-corner img')).toBeVisible();
    await expect(page.locator('#rsvpForm')).toBeVisible();
    expect(await page.locator('.nursery img').evaluateAll(images => images.every(image => (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}
