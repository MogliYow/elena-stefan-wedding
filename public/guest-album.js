class GuestAlbum extends HTMLElement {
  connectedCallback() {
    if (!window.invitationAlbumOrigin || this.shadowRoot) return;
    const endpoint = new URL('/albums/' + this.dataset.event, window.invitationAlbumOrigin);
    const root = this.attachShadow({mode: 'open'});
    root.innerHTML = `<style>
      :host{display:block;padding:4rem 1.25rem;text-align:center;color:#574937}
      section{margin:auto;max-width:42rem}h2{font:normal clamp(2rem,5vw,3.25rem) Georgia,serif;margin:.3em}
      button,label{display:inline-block;background:#f6eee1;border:1px solid #b89f7e;border-radius:2rem;padding:.65em 1.2em;color:inherit;cursor:pointer;font:inherit}
      label:focus-within{outline:2px solid}input{position:absolute;width:1px;height:1px;opacity:0}
      ul{padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(7rem,1fr));gap:.65rem;list-style:none}
      img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:.5rem}p{line-height:1.5}
    </style><section><h2>Нашиот фотоалбум</h2><p>Споделете момент од прославата. Секој со линкот до поканата може да ги види фотографиите.</p>
    <label>Прикачи фотографии<input type="file" accept="image/jpeg,image/png,image/webp" multiple></label>
    <button type="button">Освежи го албумот</button><p role="status" aria-live="polite"></p><ul></ul><button class="more" hidden>Повеќе фотографии</button></section>`;
    const input = root.querySelector('input'), status = root.querySelector('[role=status]'), list = root.querySelector('ul'), more = root.querySelector('.more');
    let revision = 0, cursor = '';
    async function refresh(append = false) {
      const version = ++revision;
      const url = new URL(endpoint);
      if (append && cursor) url.searchParams.set('before', cursor);
      const response = await fetch(url, {cache:'no-store'});
      if (!response.ok) throw Error();
      const photos = await response.json();
      if (version !== revision) return;
      if (!append) list.replaceChildren();
      for (const id of photos) {
        const item = document.createElement('li'), link = document.createElement('a'), image = document.createElement('img');
        link.href = endpoint + '/' + id; link.target = '_blank'; link.rel = 'noopener';
        image.src = link.href; image.alt = 'Отвори фотографија од прославата'; image.loading = 'lazy';
        link.append(image); item.append(link); list.append(item);
      }
      cursor = photos.at(-1); more.hidden = photos.length < 24;
      if (!list.children.length) status.textContent = 'Бидете први со фотографија од прославата.';
    }
    const reload = (append) => { status.textContent=''; refresh(append).catch(()=>status.textContent='Албумот не се вчита. Обидете се повторно.'); };
    root.querySelector('button').onclick = () => reload(false); more.onclick = () => reload(true);
    input.onchange = async () => {
      const files = [...input.files]; if (!files.length) return;
      input.disabled = true; let saved = 0;
      for (const file of files) {
        status.textContent = 'Се прикачува: ' + file.name;
        if (file.size > 12 * 1024 * 1024) continue;
        try {const response = await fetch(endpoint, {method:'POST',body:file}); if(response.ok) saved++;} catch {}
      }
      input.value=''; input.disabled=false;
      let loaded=true; try {await refresh();} catch {loaded=false;}
      status.textContent = 'Прикачени фотографии: ' + saved + ' од ' + files.length + '.' +
        (saved < files.length ? ' Проверете ја врската и изберете JPG, PNG или WebP до 12 MB.' : '') +
        (loaded ? '' : ' Освежете го албумот за да ги видите.');
    };
    reload(false);
  }
}
customElements.define('guest-album', GuestAlbum);
