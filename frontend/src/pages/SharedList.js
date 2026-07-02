import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { MapTrifold, Star, MagnifyingGlass, MapPin, CircleNotch } from '@phosphor-icons/react';
import RouteMap from '../components/RouteMap';
import Seo from '../components/Seo';
import Logo from '../components/Logo';
import { photoUrl, prettyType } from '../utils/places';
import { useSettings } from '../context/AppSettings';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8070';

function routeUrl(places) {
    if (!places.length) return '#';
    const dest = places[places.length - 1];
    const waypoints = places.slice(0, -1).map((p) => `${p.latitude},${p.longitude}`).join('|');
    let url = `https://www.google.com/maps/dir/?api=1&destination=${dest.latitude},${dest.longitude}&travelmode=walking`;
    if (waypoints) url += `&waypoints=${encodeURIComponent(waypoints)}`;
    return url;
}

const SharedList = () => {
    const { slug } = useParams();
    const { t, lang } = useSettings();
    const [data, setData] = useState(undefined); // undefined = loading, null = not found

    useEffect(() => {
        let cancelled = false;
        axios.get(`${API_BASE_URL}/api/share/${slug}`)
            .then((r) => { if (!cancelled) setData(r.data); })
            .catch(() => { if (!cancelled) setData(null); });
        return () => { cancelled = true; };
    }, [slug]);

    if (data === undefined) {
        return <div className="tours-page"><div className="pane-state"><CircleNotch size={26} className="spin" /></div></div>;
    }

    if (data === null) {
        return (
            <div className="tours-page">
                <div className="pane-state">
                    <div className="ic"><MapPin size={24} /></div>
                    <p className="mb-3">{t('shared.notfound')}</p>
                    <Link className="btn-ember" to="/"><MagnifyingGlass size={16} weight="bold" /> {t('shared.cta')}</Link>
                </div>
            </div>
        );
    }

    const isTrip = data.kind === 'trip';
    const places = (data.places || []).filter((p) => p && p.placeId);
    const title = data.name || t(isTrip ? 'shared.title_trip' : 'shared.title_saved');

    return (
        <div className="tours-page">
            <Seo title={`${title} — NearPoint`} description={t('shared.desc')} path={`/s/${slug}`} lang={lang} />

            <div className="best-head">
                <div>
                    <h1>{title}</h1>
                    <p className="shared-sub">
                        <Logo size={15} /> {t(isTrip ? 'shared.title_trip' : 'shared.title_saved')} · {places.length} {t('trip.stops')}
                    </p>
                </div>
                <Link className="btn-ember" to="/"><MagnifyingGlass size={16} weight="bold" /> {t('shared.cta')}</Link>
            </div>

            {places.length > 0 && <RouteMap stops={places} connect={isTrip} height={280} />}

            {isTrip && places.length > 1 && (
                <a className="btn-ghost" style={{ marginBottom: 16 }} href={routeUrl(places)} target="_blank" rel="noopener noreferrer">
                    <MapTrifold size={17} weight="fill" /> {t('shared.open')}
                </a>
            )}

            <ol className="tour-list">
                {places.map((p, i) => {
                    const img = photoUrl(p.photoReference, 200);
                    return (
                        <li className="tour-stop" key={p.placeId}>
                            <span className="tour-num">{i + 1}</span>
                            {img
                                ? <img className="tour-thumb" src={img} alt={p.name} loading="lazy" />
                                : <div className="tour-thumb placeholder"><MapPin size={20} /></div>}
                            <div className="tour-body" style={{ flex: 1 }}>
                                <div className="tour-name">{p.name}</div>
                                <div className="place-meta">
                                    {p.rating != null && <span className="rating"><Star size={13} weight="fill" className="star" />{p.rating}</span>}
                                    <span className="dot-sep">·</span><span>{prettyType(p.types)}</span>
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
};

export default SharedList;
