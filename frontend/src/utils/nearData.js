// Curated cities (slug + coords) and categories for SEO landing pages /near/:city/:category.

// Wedge: go deep on Istanbul neighbourhoods (winnable Turkish long-tail SEO) rather than
// wide on foreign cities we can never rank for. A few other Turkish cities for breadth.
export const CITIES = [
    { slug: 'istanbul', name: 'İstanbul', lat: 41.0082, lng: 28.9784 },
    // Istanbul neighbourhoods
    { slug: 'kadikoy', name: 'Kadıköy', lat: 40.9903, lng: 29.0275 },
    { slug: 'besiktas', name: 'Beşiktaş', lat: 41.0422, lng: 29.0083 },
    { slug: 'sisli', name: 'Şişli', lat: 41.0602, lng: 28.9877 },
    { slug: 'beyoglu', name: 'Beyoğlu', lat: 41.0369, lng: 28.9770 },
    { slug: 'uskudar', name: 'Üsküdar', lat: 41.0233, lng: 29.0152 },
    { slug: 'moda', name: 'Moda', lat: 40.9810, lng: 29.0265 },
    { slug: 'karakoy', name: 'Karaköy', lat: 41.0256, lng: 28.9741 },
    { slug: 'sariyer', name: 'Sarıyer', lat: 41.1669, lng: 29.0570 },
    { slug: 'bakirkoy', name: 'Bakırköy', lat: 40.9770, lng: 28.8720 },
    { slug: 'atasehir', name: 'Ataşehir', lat: 40.9923, lng: 29.1244 },
    { slug: 'fatih', name: 'Fatih', lat: 41.0186, lng: 28.9497 },
    { slug: 'nisantasi', name: 'Nişantaşı', lat: 41.0479, lng: 28.9936 },
    { slug: 'bebek', name: 'Bebek', lat: 41.0776, lng: 29.0433 },
    { slug: 'ortakoy', name: 'Ortaköy', lat: 41.0553, lng: 29.0269 },
    { slug: 'levent', name: 'Levent', lat: 41.0785, lng: 29.0100 },
    { slug: 'taksim', name: 'Taksim', lat: 41.0369, lng: 28.9855 },
    // Other Turkish cities
    { slug: 'ankara', name: 'Ankara', lat: 39.9334, lng: 32.8597 },
    { slug: 'izmir', name: 'İzmir', lat: 38.4237, lng: 27.1428 },
    { slug: 'antalya', name: 'Antalya', lat: 36.8969, lng: 30.7133 },
    { slug: 'bursa', name: 'Bursa', lat: 40.1826, lng: 29.0665 },
    { slug: 'adana', name: 'Adana', lat: 37.0000, lng: 35.3213 },
];

// query => Places Text Search; category => includedType
export const NEAR_CATEGORIES = [
    { slug: 'burgers', query: 'hamburger', en: 'burgers', tr: 'hamburgerciler' },
    { slug: 'pizza', query: 'pizza', en: 'pizza', tr: 'pizzacılar' },
    { slug: 'coffee', category: 'cafe', en: 'coffee shops', tr: 'kahveciler' },
    { slug: 'restaurants', category: 'restaurant', en: 'restaurants', tr: 'restoranlar' },
    { slug: 'bars', category: 'bar', en: 'bars', tr: 'barlar' },
    { slug: 'hotels', category: 'lodging', en: 'hotels', tr: 'oteller' },
    { slug: 'attractions', category: 'tourist_attraction', en: 'attractions', tr: 'gezilecek yerler' },
];

export const findCity = (slug) => CITIES.find((c) => c.slug === slug);
export const findNearCategory = (slug) => NEAR_CATEGORIES.find((c) => c.slug === slug);
