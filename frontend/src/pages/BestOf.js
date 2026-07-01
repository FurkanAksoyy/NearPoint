import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Star, NavigationArrow, CircleNotch, Storefront } from '@phosphor-icons/react';
import PlaceDetailDrawer from '../components/PlaceDetailDrawer';
import Seo from '../components/Seo';
import { photoUrl, formatPrice } from '../utils/places';
import { distanceMeters, formatDistance } from '../utils/geo';
import { itemListJsonLd } from '../utils/jsonld';
import { useSettings } from '../context/AppSettings';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8070';

// Curated collections — keyword-based (burgers/pizza) + category-based
const COLLECTIONS = [
    { key: 'burgers', query: 'hamburger', en: 'Best burgers', tr: 'En iyi hamburgerciler' },
    { key: 'pizza', query: 'pizza', en: 'Best pizza', tr: 'En iyi pizzacılar' },
    { key: 'coffee', category: 'cafe', en: 'Top coffee spots', tr: 'En iyi kahveciler' },
    { key: 'restaurants', category: 'restaurant', en: 'Top-rated restaurants', tr: 'En yüksek puanlı restoranlar' },
    { key: 'bars', category: 'bar', en: 'Best bars', tr: 'En iyi barlar' },
    { key: 'sights', category: 'tourist_attraction', en: 'Must-see sights', tr: 'Görülecek yerler' },
];

const BestCard = ({ place, onSelect }) => {
    const img = photoUrl(place.photoReference, 300);
    const price = formatPrice(place.priceLevel);
    return (
        <div className="best-card" onClick={() => onSelect(place)}>
            {img
                ? <img className="best-thumb" src={img} alt={place.name} loading="lazy" />
                : <div className="best-thumb placeholder"><Storefront size={26} /></div>}
            <div className="best-card-body">
                <div className="best-name">{place.name}</div>
                <div className="best-meta">
                    {place.rating != null && (
                        <span className="rating"><Star size={12} weight="fill" className="star" />{place.rating}
                            {place.userRatingsTotal != null && <span className="cnt">({place.userRatingsTotal})</span>}
                        </span>
                    )}
                    {price && <><span className="dot-sep">·</span><span className="price">{price}</span></>}
                    {place._distance != null && <><span className="dot-sep">·</span><span className="mono">{formatDistance(place._distance)}</span></>}
                </div>
            </div>
        </div>
    );
};

const RowSkeleton = () => (
    <div className="best-row">
        {Array.from({ length: 5 }).map((_, i) => (
            <div className="best-card" key={i}>
                <div className="skel best-thumb" />
                <div className="best-card-body">
                    <div className="skel skel-line" style={{ width: '80%' }} />
                    <div className="skel skel-line" style={{ width: '50%' }} />
                </div>
            </div>
        ))}
    </div>
);

const BestOf = ({ coords, favorites, onToggleFav, onCoords }) => {
    const { t, lang } = useSettings();
    const [data, setData] = useState({});
    const [locating, setLocating] = useState(false);
    const [selected, setSelected] = useState(null);
    const [show, setShow] = useState(false);

    useEffect(() => {
        let cancelled = false;
        COLLECTIONS.forEach((col) => {
            setData((d) => ({ ...d, [col.key]: { loading: true, places: [] } }));
            axios.get(`${API_BASE_URL}/api/places/nearby`, {
                params: {
                    latitude: coords.lat, longitude: coords.lng, radius: 4000,
                    query: col.query || undefined, category: col.category || undefined,
                },
            }).then((res) => {
                if (cancelled) return;
                const places = res.data
                    .filter((p) => (p.rating || 0) >= 4.0 && (p.userRatingsTotal || 0) >= 50)
                    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                    .slice(0, 10)
                    .map((p) => ({ ...p, _distance: distanceMeters(coords.lat, coords.lng, p.latitude, p.longitude) }));
                setData((d) => ({ ...d, [col.key]: { loading: false, places } }));
            }).catch(() => {
                if (!cancelled) setData((d) => ({ ...d, [col.key]: { loading: false, places: [] } }));
            });
        });
        return () => { cancelled = true; };
    }, [coords]);

    const locate = useCallback(() => {
        if (!navigator.geolocation) return;
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => { setLocating(false); onCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); },
            () => setLocating(false),
            { enableHighAccuracy: true, timeout: 8000 }
        );
    }, [onCoords]);

    const openDetail = (place) => { setSelected(place); setShow(true); };
    const allPlaces = Object.values(data).flatMap((d) => d.places || []);

    return (
        <div className="best-page">
            <Seo
                title={t('best.seo_title')}
                description={t('best.seo_desc')}
                path="/best"
                lang={lang}
                jsonLd={allPlaces.length ? itemListJsonLd(allPlaces, { name: t('best.title') }) : undefined}
            />

            <div className="best-head">
                <div>
                    <h1>{t('best.title')}</h1>
                    <p>{t('best.subtitle')}</p>
                </div>
                <button className="btn-loc" onClick={locate} disabled={locating}>
                    {locating ? <CircleNotch size={18} className="spin" /> : <NavigationArrow size={18} weight="fill" />}
                    <span>{t('best.near')}</span>
                </button>
            </div>

            {COLLECTIONS.map((col) => {
                const entry = data[col.key];
                if (entry && !entry.loading && entry.places.length === 0) return null;
                return (
                    <section className="best-section" key={col.key}>
                        <h2>{lang === 'tr' ? col.tr : col.en}</h2>
                        {(!entry || entry.loading)
                            ? <RowSkeleton />
                            : (
                                <div className="best-row">
                                    {entry.places.map((p) => <BestCard key={p.id} place={p} onSelect={openDetail} />)}
                                </div>
                            )}
                    </section>
                );
            })}

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

export default BestOf;
