import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { MagnifyingGlass, MapTrifold, CaretRight } from '@phosphor-icons/react';
import PlacesList from '../components/PlacesList';
import PlaceDetailDrawer from '../components/PlaceDetailDrawer';
import Seo from '../components/Seo';
import { distanceMeters } from '../utils/geo';
import { itemListJsonLd, breadcrumbJsonLd } from '../utils/jsonld';
import { findCity, findNearCategory, NEAR_CATEGORIES, CITIES } from '../utils/nearData';
import { useSettings } from '../context/AppSettings';

import { API_BASE_URL } from '../api';

const SkeletonList = () => (
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

const NearPage = ({ favorites, onToggleFav }) => {
    const { city: citySlug, category: catSlug } = useParams();
    const { t, lang } = useSettings();
    const city = findCity(citySlug);
    const cat = findNearCategory(catSlug);

    const [places, setPlaces] = useState(null);
    const [selected, setSelected] = useState(null);
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (!city || !cat) return;
        let cancelled = false;
        setPlaces(null);
        axios.get(`${API_BASE_URL}/api/places/nearby`, {
            params: {
                latitude: city.lat, longitude: city.lng, radius: 5000,
                query: cat.query || undefined, category: cat.category || undefined,
            },
        }).then((res) => {
            if (cancelled) return;
            const top = res.data
                .filter((p) => (p.rating || 0) >= 4.0 && (p.userRatingsTotal || 0) >= 50)
                .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                .slice(0, 20)
                .map((p) => ({ ...p, _distance: distanceMeters(city.lat, city.lng, p.latitude, p.longitude) }));
            setPlaces(top);
        }).catch(() => { if (!cancelled) setPlaces([]); });
        return () => { cancelled = true; };
    }, [city, cat]);

    if (!city || !cat) {
        return (
            <div className="near-page">
                <div className="pane-state">
                    <div className="ic"><MagnifyingGlass size={24} /></div>
                    <p className="mb-3">{t('near.notfound')}</p>
                    <Link className="btn-ember" to="/"><MagnifyingGlass size={16} weight="bold" /> NearPoint</Link>
                </div>
            </div>
        );
    }

    const catLabel = lang === 'tr' ? cat.tr : cat.en;
    const heading = lang === 'tr' ? `${city.name}’da en iyi ${catLabel}` : `Best ${catLabel} in ${city.name}`;
    const seoTitle = `${heading} — NearPoint`;
    const seoDesc = lang === 'tr'
        ? `${city.name}’da en yüksek puanlı ${catLabel}: puan, mesafe, çalışma saatleri ve yol tarifi NearPoint’te.`
        : `The best-rated ${catLabel} in ${city.name} — ratings, distance, hours and directions on NearPoint.`;
    const path = `/near/${city.slug}/${cat.slug}`;
    const exploreHref = cat.query
        ? `/?q=${encodeURIComponent(cat.query)}&lat=${city.lat}&lng=${city.lng}`
        : `/?cat=${cat.category}&lat=${city.lat}&lng=${city.lng}`;

    const jsonLd = [
        breadcrumbJsonLd([
            { name: 'NearPoint', url: '/' },
            { name: city.name, url: `/near/${city.slug}/restaurants` },
            { name: heading, url: path },
        ]),
        ...(places && places.length ? [itemListJsonLd(places, { name: heading })] : []),
    ];

    const openDetail = (p) => { setSelected(p); setShow(true); };

    return (
        <div className="near-page">
            <Seo title={seoTitle} description={seoDesc} path={path} lang={lang} jsonLd={jsonLd} />

            <nav className="near-crumbs">
                <Link to="/">NearPoint</Link><CaretRight size={13} />
                <span>{city.name}</span><CaretRight size={13} />
                <span className="text-capitalize">{catLabel}</span>
            </nav>

            <h1>{heading}</h1>
            <p className="near-intro">{seoDesc}</p>
            <Link className="btn-ember mb-4" to={exploreHref}><MapTrifold size={17} weight="fill" /> {t('near.explore')}</Link>

            {places === null
                ? <SkeletonList />
                : places.length > 0
                    ? <PlacesList places={places} favorites={favorites} onToggleFav={onToggleFav} onSelect={openDetail} hoveredId={null} onHover={() => {}} />
                    : <div className="pane-state"><div className="ic"><MagnifyingGlass size={24} /></div><p>{t('home.no_filter')}</p></div>}

            <section className="near-links">
                <h2>{t('near.popular')}</h2>
                <div className="near-link-row">
                    {NEAR_CATEGORIES.filter((c) => c.slug !== cat.slug).map((c) => (
                        <Link key={c.slug} to={`/near/${city.slug}/${c.slug}`} className="near-chip">
                            {lang === 'tr' ? c.tr : c.en} · {city.name}
                        </Link>
                    ))}
                </div>
                <div className="near-link-row">
                    {CITIES.filter((c) => c.slug !== city.slug).slice(0, 6).map((c) => (
                        <Link key={c.slug} to={`/near/${c.slug}/${cat.slug}`} className="near-chip">
                            {catLabel} · {c.name}
                        </Link>
                    ))}
                </div>
            </section>

            <PlaceDetailDrawer
                place={selected}
                show={show}
                onHide={() => setShow(false)}
                isFav={selected ? favorites.has(selected.placeId) : false}
                onToggleFav={onToggleFav}
            />
        </div>
    );
};

export default NearPage;
