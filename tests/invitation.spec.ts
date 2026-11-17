import {test,expect} from '@playwright/test';
for (const viewport of [{width:1440,height:900},{width:390,height:844},{width:320,height:740}]) {
test('envelope, scroll, RSVP, music, replay '+viewport.width, async({page})=>{
await page.setViewportSize(viewport);
const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('/');
await expect(page.getByRole('button',{name:'Отвори ја поканата',exact:true})).toBeVisible();
await page.screenshot({path:'test-results/envelope-'+viewport.width+'.png'});
await page.getByRole('button',{name:'Отвори ја поканата',exact:true}).click({force:true});
await expect(page.getByRole('dialog')).toHaveCount(0,{timeout:10000});
await expect(page.locator('main')).toHaveAttribute('aria-hidden','false');
expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBeTruthy();
await page.getByRole('link',{name:'Нашиот ден',exact:true}).click();
await expect(page).toHaveURL(/#day$/);
await expect(page.getByRole('heading',{name:'Еден ден. Цела љубов.'})).toBeInViewport();
for(const row of await page.locator('.timeline-item').all()){
await row.scrollIntoViewIfNeeded();
await expect(row).toBeVisible();
await expect(row).toHaveCSS('opacity','1');
}

await page.locator('#rsvp').scrollIntoViewIfNeeded();
await page.getByLabel('Име и презиме *',{exact:true}).fill('Тест Гост');
await page.getByLabel('Број на гости, вклучувајќи ве и вас *',{exact:true}).fill('2');
await page.getByRole('button',{name:'Испробај ја потврдата'}).click();
await expect(page.getByRole('status')).toContainText('Ниту еден податок не е испратен');
await page.getByRole('button',{name:'Вклучи музика',exact:true}).click();
await expect(page.getByRole('button',{name:'Исклучи музика',exact:true})).toHaveAttribute('aria-pressed','true');
await page.getByRole('button',{name:'Исклучи музика',exact:true}).click();
await page.getByRole('button',{name:'Повторно отвори го пликот ↗',exact:true}).click();
await expect(page.getByRole('dialog')).toBeVisible();
await page.getByRole('button',{name:'Прескокни го воведот ↗',exact:true}).click();
await expect(page.getByRole('dialog')).toHaveCount(0);
expect(errors).toEqual([]);
});}
test('reduced motion and RSVP declining',async({page})=>{
await page.emulateMedia({reducedMotion:'reduce'});
await page.goto('/');
await page.getByRole('button',{name:'Отвори ја поканата',exact:true}).press('Enter');
await expect(page.getByRole('dialog')).toHaveCount(0);
await expect(page.locator('.gold-scene canvas')).toHaveCount(0);
await page.locator('#rsvp').scrollIntoViewIfNeeded();
await page.getByLabel('За жал, нема да можам.',{exact:true}).check();
await expect(page.getByLabel('Број на гости, вклучувајќи ве и вас *',{exact:true})).toHaveCount(0);
await page.getByLabel('Име и презиме *',{exact:true}).fill('Тест Гост');
await page.getByRole('button',{name:'Испробај ја потврдата'}).click();
await expect(page.getByRole('status')).toContainText('демонстрација');
});
test('3D motion can be paused and resumed without hiding content',async({page})=>{
await page.goto('/');
await page.getByRole('button',{name:'Прескокни го воведот ↗',exact:true}).click();
await expect(page.getByRole('button',{name:'Ⅱ Паузирај движење',exact:true})).toHaveAttribute('aria-pressed','true');
await page.getByRole('button',{name:'Ⅱ Паузирај движење',exact:true}).click();
await expect(page.locator('.gold-scene canvas')).toHaveCount(0);
await page.locator('#day').scrollIntoViewIfNeeded();
await expect(page.getByRole('heading',{name:'Еден ден. Цела љубов.',exact:true})).toBeVisible();
await page.getByRole('button',{name:'▷ Вклучи движење',exact:true}).click();
await expect(page.locator('.motion-enabled')).toHaveCount(1);
await page.locator('#rsvp').scrollIntoViewIfNeeded();
await page.getByLabel('Име и презиме *',{exact:true}).fill('Проверка');
await page.getByRole('button',{name:'Испробај ја потврдата'}).click();
await expect(page.getByRole('status')).toContainText('Ниту еден податок не е испратен');
});
