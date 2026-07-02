import React from 'react';
import { Link } from 'react-router-dom';
import { Path, ArrowUp, ArrowDown, X, MagnifyingGlass, Star, ArrowsClockwise, MapTrifold } from '@phosphor-icons/react';
import Seo from '../components/Seo';
import { photoUrl, prettyType } from '../utils/places';
import { useSettings } from '../context/AppSettings';
import { useTrip } from '../context/Trip';

function routeUrl(trip) {
    if (!trip.length) return '#';
    const dest = trip[trip.length - 1];
    const waypoints = trip.slice(0, -1).map((p) => `${p.latitude},${p.longitude}`).join('|');
    let url = `https://www.google.com/maps/dir/?api=1&destination=${dest.latitude},${dest.longitude}&travelmode=walking`;
    if (waypoints) url += `&waypoints=${encodeURIComponent(waypoints)}`;
    return url;
}

const TripPage = () => {
    const { t, lang } = useSettings();
    const { trip, remove, move, optimize, clear } = useTrip();

    return (
        <div className="tours-page">
            <Seo title={t('trip.seo_title')} description={t('trip.seo_desc')} path="/trip" lang={lang} />

            <div className="best-head">
                <div>
                    <h1>{t('trip.title')}</h1>
                    <p>{t('trip.subtitle')}</p>
                </div>
                {trip.length > 0 && (
                    <button className="btn-loc" onClick={clear}>{t('trip.clear')}</button>
                )}
            </div>

            {trip.length === 0 ? (
                <div className="pane-state">
                    <div className="ic"><Path size={24} /></div>
                    <p className="mb-3">{t('trip.empty')}</p>
                    <Link className="btn-ember" to="/"><MagnifyingGlass size={16} weight="bold" /> {t('trip.discover')}</Link>
                </div>
            ) : (
                <>
                    <div className="trip-actions">
                        {trip.length >= 3 && (
                            <button className="btn-ghost" onClick={optimize}><ArrowsClockwise size={17} weight="bold" /> {t('trip.optimize')}</button>
                        )}
                        <a className="btn-ember" href={routeUrl(trip)} target="_blank" rel="noopener noreferrer">
                            <MapTrifold size={17} weight="fill" /> {t('trip.open')} · {trip.length} {t('trip.stops')}
                        </a>
                    </div>

                    <ol className="tour-list">
                        {trip.map((p, i) => {
                            const img = photoUrl(p.photoReference, 200);
                            return (
                                <li className="tour-stop" key={p.placeId}>
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
                            );
                        })}
                    </ol>
                </>
            )}
        </div>
    );
};

export default TripPage;
