import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { NavigationArrow, CircleNotch, MapPin, Star, Path } from '@phosphor-icons/react';
import PlaceDetailDrawer from '../components/PlaceDetailDrawer';
import Seo from '../components/Seo';
import { photoUrl, prettyType } from '../utils/places';
import { distanceMeters, formatDistance } from '../utils/geo';
import { itemListJsonLd } from '../utils/jsonld';
import { useSettings } from '../context/AppSettings';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8070';

// Greedy nearest-neighbour ordering from the center → a walkable route
function orderRoute(center, places) {
    const remaining = [...places];
    const route = [];
    let cur = { latitude: center.lat, longitude: center.lng };
    while (remaining.length) {
        const from = cur;
        let bi = 0;
        let bd = Infinity;
        remaining.forEach((p, i) => {
            const d = distanceMeters(from.latitude, from.longitude, p.latitude, p.longitude) ?? Infinity;
            if (d < bd) { bd = d; bi = i; }
        });
        const next = remaining.splice(bi, 1)[0];
        route.push(next);
        cur = next;
    }
    return route;
}

function tourUrl(center, route) {
    if (!route.length) return '#';
    const dest = route[route.length - 1];
    const waypoints = route.slice(0, -1).map((p) => `${p.latitude},${p.longitude}`).join('|');
    let url = `https://www.google.com/maps/dir/?api=1&origin=${center.lat},${center.lng}`
        + `&destination=${dest.latitude},${dest.longitude}&travelmode=walking`;
    if (waypoints) url += `&waypoints=${encodeURIComponent(waypoints)}`;
    return url;
}

const ToursPage = ({ coords, favorites, onToggleFav, onCoords }) => {
    const { t, lang } = useSettings();
    const [route, setRoute] = useState(null);
    const [locating, setLocating] = useState(false);
    const [selected, setSelected] = useState(null);
    const [show, setShow] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setRoute(null);
        axios.get(`${API_BASE_URL}/api/places/nearby`, {
            params: { latitude: coords.lat, longitude: coords.lng, radius: 4000, category: 'tourist_attraction' },
        }).then((res) => {
            if (cancelled) return;
            const top = res.data
                .filter((p) => (p.rating || 0) >= 4.2 && (p.userRatingsTotal || 0) >= 100)
                .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                .slice(0, 7);
            setRoute(orderRoute(coords, top).map((p) => ({ ...p, _distance: distanceMeters(coords.lat, coords.lng, p.latitude, p.longitude) })));
        }).catch(() => { if (!cancelled) setRoute([]); });
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

    const openDetail = (p) => { setSelected(p); setShow(true); };
    const jsonLd = route && route.length ? itemListJsonLd(route, { name: t('tours.title') }) : undefined;

    return (
        <div className="tours-page">
            <Seo title={t('tours.seo_title')} description={t('tours.seo_desc')} path="/tours" lang={lang} jsonLd={jsonLd} />

            <div className="best-head">
                <div>
                    <h1>{t('tours.title')}</h1>
                    <p>{t('tours.subtitle')}</p>
                </div>
                <button className="btn-loc" onClick={locate} disabled={locating}>
                    {locating ? <CircleNotch size={18} className="spin" /> : <NavigationArrow size={18} weight="fill" />}
                    <span>{t('tours.near')}</span>
                </button>
            </div>

            {route && route.length > 0 && (
                <a className="btn-ember tour-start" href={tourUrl(coords, route)} target="_blank" rel="noopener noreferrer">
                    <Path size={18} weight="fill" /> {t('tours.start')} · {route.length} {t('tours.stop')}
                </a>
            )}

            {route === null && (
                <div className="pane-state"><CircleNotch size={26} className="spin" /></div>
            )}

            {route && route.length === 0 && (
                <div className="pane-state"><div className="ic"><MapPin size={24} /></div><p>{t('tours.empty')}</p></div>
            )}

            {route && route.length > 0 && (
                <ol className="tour-list">
                    {route.map((p, i) => {
                        const img = photoUrl(p.photoReference, 200);
                        return (
                            <li className="tour-stop" key={p.id} onClick={() => openDetail(p)}>
                                <span className="tour-num">{i + 1}</span>
                                {img
                                    ? <img className="tour-thumb" src={img} alt={p.name} loading="lazy" />
                                    : <div className="tour-thumb placeholder"><MapPin size={22} /></div>}
                                <div className="tour-body">
                                    <div className="tour-name">{p.name}</div>
                                    <div className="place-meta">
                                        {p.rating != null && <span className="rating"><Star size={13} weight="fill" className="star" />{p.rating}</span>}
                                        <span className="dot-sep">·</span><span>{prettyType(p.types)}</span>
                                        {p._distance != null && <><span className="dot-sep">·</span><span className="mono">{formatDistance(p._distance)}</span></>}
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ol>
            )}

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

export default ToursPage;
