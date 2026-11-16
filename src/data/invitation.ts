export const invitation = {
  names: ['Елена', 'Стефан'], monogram: 'Е & С',
  date: '2027-06-12T17:00:00+02:00', dateLabel: '12 јуни 2027', deadline: '1 јуни 2027',
  venue: { name: 'Скопје', address: 'Локација за демонстрација', maps: 'https://www.google.com/maps/search/?api=1&query=Skopje' },
  photos: {
    hero: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=85',
    portrait: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=800&q=85',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=85',
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=85'
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