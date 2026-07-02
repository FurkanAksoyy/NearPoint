import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { X, ArrowLeft, ArrowRight, Star, Quotes, NavigationArrow, Clock, CheckCircle, MapPin } from '@phosphor-icons/react';
import { photoUrl, prettyType } from '../utils/places';
import { dwellFor } from '../utils/route';
import { useSettings } from '../context/AppSettings';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8070';

function whyLine(i, total, stop, t) {
    if (i === 0) return t('guided.why_start');
    if (i === total - 1) return t('guided.why_end');
    if ((stop.rating || 0) >= 4.6) return t('guided.why_top');
    return t('guided.why_mid');
}

/** Full-screen, one-stop-at-a-time guided walk player. */
const GuidedRoute = ({ stops = [], legs = [], onClose }) => {
    const { t } = useSettings();
    const [i, setI] = useState(0);
    const [cache, setCache] = useState({});
    const stop = stops[i];

    useEffect(() => {
        if (!stop || cache[stop.placeId] !== undefined) return;
        let cancelled = false;
        axios.get(`${API_BASE_URL}/api/places/details/${stop.placeId}`)
            .then((r) => { if (!cancelled) setCache((c) => ({ ...c, [stop.placeId]: r.data })); })
            .catch(() => { if (!cancelled) setCache((c) => ({ ...c, [stop.placeId]: {} })); });
        return () => { cancelled = true; };
    }, [stop, cache]);

    useEffect(() => {
        const h = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight' && i < stops.length - 1) setI(i + 1);
            if (e.key === 'ArrowLeft' && i > 0) setI(i - 1);
        };
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
    }, [i, stops.length, onClose]);

    if (!stop) return null;

    const detail = cache[stop.placeId] || {};
    const img = photoUrl(detail.photoReference || stop.photoReference, 1200);
    const hook = detail.editorialSummary;
    const picked = (detail.reviews || [])
        .slice().sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .find((r) => r.text && r.text.trim().length > 30);
    const review = picked
        ? { ...picked, text: picked.text.length > 220 ? `${picked.text.slice(0, 210).trim()}…` : picked.text }
        : null;
    const dwell = dwellFor(stop.types);
    const nextLeg = legs[i];
    const dirUrl = `https://www.google.com/maps/dir/?api=1&destination=${stop.latitude},${stop.longitude}`
        + `&destination_place_id=${stop.placeId}&travelmode=walking`;
    const last = i === stops.length - 1;

    return createPortal(
        <div className="guided" role="dialog" aria-modal="true">
            <div className="guided-top">
                <button className="guided-x" onClick={onClose} aria-label="Close"><X size={20} /></button>
                <div className="guided-bar"><div className="guided-bar-fill" style={{ width: `${((i + 1) / stops.length) * 100}%` }} /></div>
                <span className="guided-count">{t('guided.stop')} {i + 1} / {stops.length}</span>
            </div>

            <div className="guided-scroll">
                {img
                    ? <div className="guided-hero" style={{ backgroundImage: `url(${img})` }}><span className="guided-num">{i + 1}</span></div>
                    : <div className="guided-hero placeholder"><MapPin size={40} /><span className="guided-num">{i + 1}</span></div>}

                <div className="guided-content">
                    <h2>{stop.name}</h2>
                    <div className="place-meta guided-meta">
                        {stop.rating != null && <span className="rating"><Star size={14} weight="fill" className="star" />{stop.rating}</span>}
                        <span className="dot-sep">·</span><span>{prettyType(stop.types)}</span>
                        <span className="dot-sep">·</span>
                        <span className="rs"><Clock size={14} className="ic" /> ~{dwell} {t('guided.min_here')}</span>
                    </div>

                    <p className="guided-why">{whyLine(i, stops.length, stop, t)}</p>
                    {hook && <p className="guided-hook">{hook}</p>}
                    {review && (
                        <blockquote className="guided-quote">
                            <Quotes size={20} weight="fill" />
                            <span>{review.text}</span>
                            {review.authorName && <cite>— {review.authorName}</cite>}
                        </blockquote>
                    )}
                </div>
            </div>

            <div className="guided-foot">
                <button className="btn-ghost" disabled={i === 0} onClick={() => setI(i - 1)}>
                    <ArrowLeft size={17} /> {t('guided.prev')}
                </button>
                <a className="btn-ghost" href={dirUrl} target="_blank" rel="noopener noreferrer">
                    <NavigationArrow size={16} weight="fill" /> {t('guided.directions')}
                    {nextLeg && <span className="leg-hint"> · {nextLeg.walkMin} {t('guided.min_walk')}</span>}
                </a>
                {last
                    ? <button className="btn-ember" onClick={onClose}><CheckCircle size={17} weight="fill" /> {t('guided.finish')}</button>
                    : <button className="btn-ember" onClick={() => setI(i + 1)}>{t('guided.next')} <ArrowRight size={17} /></button>}
            </div>
        </div>,
        document.body
    );
};

export default GuidedRoute;
