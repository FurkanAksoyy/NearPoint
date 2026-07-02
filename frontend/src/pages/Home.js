import React, { useMemo, useState, useEffect } from 'react';
import { Drawer } from 'vaul';
import { MagnifyingGlass, Warning } from '@phosphor-icons/react';
import SearchBar from '../components/SearchBar';
import FilterControls from '../components/FilterControls';
import MoodRow from '../components/MoodRow';
import PlacesList from '../components/PlacesList';
import MapContainer from '../components/MapContainer';
import PlaceDetailDrawer from '../components/PlaceDetailDrawer';
import Seo from '../components/Seo';
import { distanceMeters } from '../utils/geo';
import { CATEGORIES, priceLevelNum } from '../utils/places';
import { websiteJsonLd, itemListJsonLd } from '../utils/jsonld';
import useMediaQuery from '../utils/useMediaQuery';
import { useSettings } from '../context/AppSettings';

const SNAPS = [0.42, 0.75, 0.96];

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
    const isMobile = useMediaQuery('(max-width: 900px)');
    const [filters, setFilters] = useState({ sort: 'relevance', minRating: 0, openNowOnly: false, maxPrice: 0, hiddenGems: false });
    const [hoveredId, setHoveredId] = useState(null);
    const [selected, setSelected] = useState(null);
    const [showDrawer, setShowDrawer] = useState(false);
    const [snap, setSnap] = useState(SNAPS[0]);
    // Open the sheet after mount so vaul animates to the initial snap (avoids a stuck-closed state)
    const [sheetOpen, setSheetOpen] = useState(false);
    useEffect(() => {
        if (isMobile) {
            const id = setTimeout(() => setSheetOpen(true), 60);
            return () => clearTimeout(id);
        }
        setSheetOpen(false);
    }, [isMobile]);

    const list = useMemo(() => {
        let items = results.map((p) => ({
            ...p,
            _distance: distanceMeters(coords.lat, coords.lng, p.latitude, p.longitude),
        }));
        if (filters.openNowOnly) items = items.filter((p) => p.openNow === true);
        if (filters.minRating > 0) items = items.filter((p) => (p.rating || 0) >= filters.minRating);
        if (filters.maxPrice > 0) items = items.filter((p) => {
            const n = priceLevelNum(p.priceLevel);
            return n === 0 || n <= filters.maxPrice; // keep unknown-price places
        });
        // Hidden gems: well-loved but under-the-radar (high rating, modest review count)
        if (filters.hiddenGems) items = items.filter((p) => (p.rating || 0) >= 4.5
            && (p.userRatingsTotal || 0) >= 15 && (p.userRatingsTotal || 0) <= 300);
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

    let seoTitle;
    if (lastSearch.query) {
        seoTitle = lang === 'tr' ? `Yakınında “${lastSearch.query}” — NearPoint` : `“${lastSearch.query}” near you — NearPoint`;
    } else if (lastSearch.category && catTkey) {
        const cl = t(catTkey);
        seoTitle = lang === 'tr' ? `Yakındaki en iyi ${cl} — NearPoint` : `Best ${cl} near you — NearPoint`;
    } else {
        seoTitle = t('seo.default_title');
    }
    const jsonLd = list.length ? [websiteJsonLd(), itemListJsonLd(list, { name: title })] : websiteJsonLd();

    const openDetail = (place) => { setSelected(place); setShowDrawer(true); };

    const resultsBlock = (
        <>
            <div className="results-head">
                <h2 className="text-capitalize">{title}</h2>
                {!loading && <span className="count">{list.length} {t('home.places')}</span>}
            </div>

            {!loading && !error && !lastSearch.query && (
                <MoodRow onPick={(q) => onSearch(q, '')} />
            )}

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
        </>
    );

    const mapBlock = (
        <MapContainer
            places={list}
            center={coords}
            hoveredId={hoveredId}
            selectedId={selected?.id}
            onHover={setHoveredId}
            onSelect={openDetail}
            onSearchArea={onSearchArea}
        />
    );

    return (
        <>
            <Seo title={seoTitle} description={t('seo.default_desc')} path="/" lang={lang} jsonLd={jsonLd} />
            <SearchBar
                ref={searchBarRef}
                onSearch={onSearch}
                coords={coords}
                activeCategory={lastSearch.category}
                onUseLocation={onUseLocation}
                locating={locating}
                loading={loading}
                turnstileEnabled={turnstileEnabled}
                hasToken={hasTurnstileToken}
                onToken={onTurnstileToken}
            />

            {isMobile ? (
                <>
                    <div className="mobile-map">{mapBlock}</div>
                    <Drawer.Root
                        open={sheetOpen}
                        onOpenChange={setSheetOpen}
                        modal={false}
                        dismissible={false}
                        snapPoints={SNAPS}
                        activeSnapPoint={snap}
                        setActiveSnapPoint={setSnap}
                    >
                        <Drawer.Portal>
                            <Drawer.Content className="sheet" aria-describedby={undefined}>
                                <Drawer.Handle className="sheet-handle" />
                                <Drawer.Title className="visually-hidden">{title}</Drawer.Title>
                                <div className="sheet-body">{resultsBlock}</div>
                            </Drawer.Content>
                        </Drawer.Portal>
                    </Drawer.Root>
                </>
            ) : (
                <div className="discover">
                    <div className="results-pane">{resultsBlock}</div>
                    <div className="map-pane">{mapBlock}</div>
                </div>
            )}

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
