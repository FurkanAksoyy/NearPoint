// Reverse-geocode coords → a short place label using the already-loaded Google Maps JS.
export function reverseGeocode(lat, lng) {
    return new Promise((resolve) => {
        const maps = window.google && window.google.maps;
        if (!maps || !maps.Geocoder) return resolve(null);
        try {
            new maps.Geocoder().geocode({ location: { lat, lng } }, (results, status) => {
                if (status === 'OK' && results && results.length) {
                    const comp = results[0].address_components || [];
                    const find = (type) => {
                        const c = comp.find((x) => x.types.includes(type));
                        return c ? c.long_name : null;
                    };
                    resolve(
                        find('neighborhood') || find('sublocality_level_1') || find('sublocality')
                        || find('locality') || find('administrative_area_level_2')
                        || find('administrative_area_level_1') || null
                    );
                } else {
                    resolve(null);
                }
            });
        } catch {
            resolve(null);
        }
    });
}
