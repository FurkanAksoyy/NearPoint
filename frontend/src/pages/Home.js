import React, { useMemo, useState } from 'react';
import { MagnifyingGlass, MapTrifold, ListBullets, Warning } from '@phosphor-icons/react';
import SearchBar from '../components/SearchBar';
import FilterControls from '../components/FilterControls';
import PlacesList from '../components/PlacesList';
import MapContainer from '../components/MapContainer';
import PlaceDetailDrawer from '../components/PlaceDetailDrawer';
import Seo from '../components/Seo';
import { distanceMeters } from '../utils/geo';
import { CATEGORIES } from '../utils/places';
import { websiteJsonLd, itemListJsonLd } from '../utils/jsonld';
import { useSettings } from '../context/AppSettings';

const Skeletons = () => (
    <div>
        {Array.from({ length: 6 }).map((_, i) => (
            <div className="skel-card" key={i}>
                <div className="skel skel-thumb" />
                <div style={{ flex: 1 }}>
                    <div className="skel skel-line" style={{ width: '70%' }} />
                    <div className="skel skel-line" style={{ width: '45%' }} />
                    <div className="skel skel-line" style={{ width: '85%' }} />
                </div>
            </div>
        ))}
    </div>
);

const Home = ({
    results, loading, error, coords, lastSearch,
    favorites, onToggleFav, onSearch, onSearchArea, onUseLocation, locating,
    turnstileEnabled, hasTurnstileToken, onTurnstileToken, searchBarRef,
}) => {
    const { t, lang } = useSettings();
    const [filters, setFilters] = useState({ sort: 'relevance', minRating: 0, openNowOnly: false });
    const [hoveredId, setHoveredId] = useState(null);
    const [selected, setSelected] = useState(null);
    const [showDrawer, setShowDrawer] = useState(false);
    const [showMap, setShowMap] = useState(false);

    const list = useMemo(() => {
        let items = results.map((p) => ({
            ...p,
            _distance: distanceMeters(coords.lat, coords.lng, p.latitude, p.longitude),
        }));
        if (filters.openNowOnly) items = items.filter((p) => p.openNow === true);
        if (filters.minRating > 0) items = items.filter((p) => (p.rating || 0) >= filters.minRating);
        if (filters.sort === 'rating') items = [...items].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        else if (filters.sort === 'distance') items = [...items].sort((a, b) => (a._distance ?? 1e12) - (b._distance ?? 1e12));
        return items;
    }, [results, coords, filters]);

    const catTkey = CATEGORIES.find((c) => c.key === lastSearch.category)?.tkey;
    const title = lastSearch.query
        ? `“${lastSearch.query}”`
        : lastSearch.category && catTkey
            ? t(catTkey)
            : t('home.nearby');

    const openDetail = (place) => { setSelected(place); setShowDrawer(true); };

    // SEO: dynamic "near you" titles leverage the brand + local-search intent
    let seoTitle;
    if (lastSearch.query) {
        seoTitle = lang === 'tr'
            ? `Yakınında “${lastSearch.query}” — NearPoint`
            : `“${lastSearch.query}” near you — NearPoint`;
    } else if (lastSearch.category && catTkey) {
        const cl = t(catTkey);
        seoTitle = lang === 'tr' ? `Yakındaki en iyi ${cl} — NearPoint` : `Best ${cl} near you — NearPoint`;
    } else {
        seoTitle = t('seo.default_title');
    }
    const jsonLd = list.length
        ? [websiteJsonLd(), itemListJsonLd(list, { name: title })]
        : websiteJsonLd();

    return (
        <>
            <Seo title={seoTitle} description={t('seo.default_desc')} path="/" lang={lang} jsonLd={jsonLd} />
            <SearchBar
                ref={searchBarRef}
                onSearch={onSearch}
                activeCategory={lastSearch.category}
                onUseLocation={onUseLocation}
                locating={locating}
                loading={loading}
                turnstileEnabled={turnstileEnabled}
                hasToken={hasTurnstileToken}
                onToken={onTurnstileToken}
            />

            <div className={`discover ${showMap ? 'show-map' : ''}`}>
                <div className="results-pane">
                    <div className="results-head">
                        <h2 className="text-capitalize">{title}</h2>
                        {!loading && <span className="count">{list.length} {t('home.places')}</span>}
                    </div>

                    {!loading && !error && results.length > 0 && (
                        <FilterControls filters={filters} onChange={setFilters} />
                    )}

                    {loading && <Skeletons />}

                    {error && <div className="pane-error"><Warning size={16} weight="fill" /> {t(error)}</div>}

                    {!loading && !error && list.length > 0 && (
                        <PlacesList
                            places={list}
                            favorites={favorites}
                            onToggleFav={onToggleFav}
                            onSelect={openDetail}
                            hoveredId={hoveredId}
                            onHover={setHoveredId}
                        />
                    )}

                    {!loading && !error && results.length === 0 && (
                        <div className="pane-state">
                            <div className="ic"><MagnifyingGlass size={24} /></div>
                            <p>{t('home.empty')}</p>
                        </div>
                    )}

                    {!loading && !error && results.length > 0 && list.length === 0 && (
                        <div className="pane-state">
                            <div className="ic"><MagnifyingGlass size={24} /></div>
                            <p>{t('home.no_filter')}</p>
                        </div>
                    )}
                </div>

                <div className="map-pane">
                    <MapContainer
                        places={list}
                        center={coords}
                        hoveredId={hoveredId}
                        selectedId={selected?.id}
                        onHover={setHoveredId}
                        onSelect={openDetail}
                        onSearchArea={onSearchArea}
                    />
                </div>
            </div>

            <button className="map-fab" onClick={() => setShowMap(true)}><MapTrifold size={18} weight="fill" /> {t('map.map')}</button>
            <button className="list-fab" onClick={() => setShowMap(false)}><ListBullets size={18} weight="bold" /> {t('map.list')}</button>

            <PlaceDetailDrawer
                place={selected}
                show={showDrawer}
                onHide={() => setShowDrawer(false)}
                isFav={selected ? favorites.has(selected.placeId) : false}
                onToggleFav={onToggleFav}
            />
        </>
    );
};

export default Home;
