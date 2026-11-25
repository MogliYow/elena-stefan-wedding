export const invitation = {
  names: ['Елена', 'Стефан'], monogram: 'Е & С',
  date: '2027-06-12T17:00:00+02:00', dateLabel: '12 јуни 2027', deadline: '1 јуни 2027',
  venue: { name: 'Скопје', address: 'Локација за демонстрација', maps: 'https://www.google.com/maps/search/?api=1&query=Skopje' },
  photos: {
    hero: './wedding/ceremony.webp',
    portrait: './wedding/portrait.webp',
    gallery: [
      './wedding/bouquet.webp',
      './wedding/rings.webp',
      './wedding/table.webp'
    ]
  },
  timeline: [
    {time:'17:00', title:'Нашето „да“', text:'Моментот кога започнува нашето засекогаш.'},
    {time:'18:00', title:'Чаша за љубовта', text:'Наздравуваме, се прегрнуваме и создаваме спомени.'},
    {time:'19:00', title:'Вечера под ѕвездите', text:'Добра храна, блиски луѓе и многу приказни.'},
    {time:'21:00', title:'Танц до доцна', text:'Удобни чевли и вашата најубава насмевка.'}
  ],
  rsvp: {mode:'demo' as 'demo'|'formspree', endpoint:''},
  demo: true
};