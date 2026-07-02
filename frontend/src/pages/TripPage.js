import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Path, ArrowUp, ArrowDown, X, MagnifyingGlass, Star, ArrowsClockwise,
    MapTrifold, Ruler, Clock, PlayCircle, Plus, BookmarkSimple, PersonSimpleWalk,
} from '@phosphor-icons/react';
import Seo from '../components/Seo';
import RouteMap from '../components/RouteMap';
import GuidedRoute from '../components/GuidedRoute';
import { photoUrl, prettyType } from '../utils/places';
import { formatDistance } from '../utils/geo';
import { planRoute, formatDuration } from '../utils/route';
import { useSettings } from '../context/AppSettings';
import { useTrip } from '../context/Trip';

const NAME_KEY = 'np_trip_name';

function routeUrl(trip) {
    if (!trip.length) return '#';
    const dest = trip[trip.length - 1];
    const waypoints = trip.slice(0, -1).map((p) => `${p.latitude},${p.longitude}`).join('|');
    let url = `https://www.google.com/maps/dir/?api=1&destination=${dest.latitude},${dest.longitude}&travelmode=walking`;
    if (waypoints) url += `&waypoints=${encodeURIComponent(waypoints)}`;
    return url;
}

const TripPage = ({ savedPlaces = [] }) => {
    const { t, lang } = useSettings();
    const { trip, inTrip, toggle, remove, move, optimize, clear } = useTrip();
    const [name, setName] = useState(() => localStorage.getItem(NAME_KEY) || '');
    const [guided, setGuided] = useState(false);
    const [showAdd, setShowAdd] = useState(false);

    const setTripName = (v) => { setName(v); localStorage.setItem(NAME_KEY, v); };
    const plan = planRoute(trip);
    const addable = savedPlaces.filter((p) => !inTrip(p.placeId));

    return (
        <div className="tours-page">
            <Seo title={t('trip.seo_title')} description={t('trip.seo_desc')} path="/trip" lang={lang} />

            <div className="best-head">
                <div style={{ flex: 1, minWidth: 0 }}>
                    {trip.length > 0
                        ? <input className="trip-name-input" value={name} placeholder={t('trip.name_placeholder')} onChange={(e) => setTripName(e.target.value)} />
                        : <h1>{t('trip.title')}</h1>}
                    <p>{t('trip.subtitle')}</p>
                </div>
                {trip.length > 0 && <button className="btn-loc" onClick={clear}>{t('trip.clear')}</button>}
            </div>

            {trip.length === 0 ? (
                <div className="pane-state">
                    <div className="ic"><Path size={24} /></div>
                    <p className="mb-3">{t('trip.empty')}</p>
                    <Link className="btn-ember" to="/"><MagnifyingGlass size={16} weight="bold" /> {t('trip.discover')}</Link>
                </div>
            ) : (
                <>
                    <RouteMap stops={trip} height={280} />

                    <div className="route-summary">
                        <span className="rs"><Path size={16} weight="fill" className="ic" /> {trip.length} {t('trip.stops')}</span>
                        <span className="rs"><Ruler size={16} className="ic" /> {formatDistance(plan.totalMeters)}</span>
                        <span className="rs"><Clock size={16} className="ic" /> ~{formatDuration(plan.totalMin)} {t('trip.total')}</span>
                    </div>

                    <div className="trip-actions">
                        <button className="btn-ember" onClick={() => setGuided(true)}>
                            <PlayCircle size={18} weight="fill" /> {t('trip.start_guided')}
                        </button>
                        {trip.length >= 3 && (
                            <button className="btn-ghost" onClick={optimize}><ArrowsClockwise size={17} weight="bold" /> {t('trip.optimize')}</button>
                        )}
                        <a className="btn-ghost" href={routeUrl(trip)} target="_blank" rel="noopener noreferrer">
                            <MapTrifold size={17} weight="fill" /> {t('trip.open')}
                        </a>
                    </div>

                    <ol className="tour-list trip-list">
                        {trip.map((p, i) => {
                            const img = photoUrl(p.photoReference, 200);
                            const leg = plan.legs[i]; // walk from stop i to i+1
                            return (
                                <React.Fragment key={p.placeId}>
                                    <li className="tour-stop">
                                        <span className="tour-num">{i + 1}</span>
                                        {img
                                            ? <img className="tour-thumb" src={img} alt={p.name} loading="lazy" />
                                            : <div className="tour-thumb placeholder"><Path size={20} /></div>}
                                        <div className="tour-body" style={{ flex: 1 }}>
                                            <div className="tour-name">{p.name}</div>
                                            <div className="place-meta">
                                                {p.rating != null && <span className="rating"><Star size={13} weight="fill" className="star" />{p.rating}</span>}
                                                <span className="dot-sep">·</span><span>{prettyType(p.types)}</span>
                                            </div>
                                        </div>
                                        <div className="trip-stop-actions">
                                            <button className="trip-icon" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label="up"><ArrowUp size={16} /></button>
                                            <button className="trip-icon" onClick={() => move(i, i + 1)} disabled={i === trip.length - 1} aria-label="down"><ArrowDown size={16} /></button>
                                            <button className="trip-icon" onClick={() => remove(p.placeId)} aria-label="remove"><X size={16} /></button>
                                        </div>
                                    </li>
                                    {leg && (
                                        <div className="trip-leg">
                                            <PersonSimpleWalk size={15} weight="fill" />
                                            {leg.walkMin} {t('guided.min_walk')} · {formatDistance(leg.walkMeters)}
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </ol>

                    {addable.length > 0 && (
                        <div className="trip-add">
                            <button className="btn-ghost" onClick={() => setShowAdd((s) => !s)}>
                                <BookmarkSimple size={16} weight="fill" /> {t('trip.add_saved')} ({addable.length})
                            </button>
                            {showAdd && (
                                <ul className="trip-add-list">
                                    {addable.map((p) => (
                                        <li key={p.placeId} className="trip-add-item" onClick={() => toggle(p)}>
                                            <Plus size={16} weight="bold" className="add-ic" />
                                            <span className="text-truncate">{p.name}</span>
                                            {p.rating != null && <span className="rating ms-auto"><Star size={12} weight="fill" className="star" />{p.rating}</span>}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </>
            )}

            {guided && trip.length > 0 && (
                <GuidedRoute stops={trip} legs={plan.legs} onClose={() => setGuided(false)} />
            )}
        </div>
    );
};

export default TripPage;
