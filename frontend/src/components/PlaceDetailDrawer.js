import React, { useEffect, useState } from 'react';
import { Offcanvas } from 'react-bootstrap';
import axios from 'axios';
import {
    Star, Heart, Clock, MapPin, ArrowSquareOut, NavigationArrow,
    Phone, Globe, CircleNotch, ChatCircle, ShareNetwork, Check, Ticket, Path, SealCheck,
} from '@phosphor-icons/react';
import { photoUrl, formatPrice, prettyType } from '../utils/places';
import { formatDistance } from '../utils/geo';
import { affiliateAction } from '../utils/affiliate';
import { useSettings } from '../context/AppSettings';
import { useTrip } from '../context/Trip';
import { useVisited } from '../context/Visited';

import { API_BASE_URL } from '../api';

const PlaceDetailDrawer = ({ place, show, onHide, isFav, onToggleFav }) => {
    const { t } = useSettings();
    const { inTrip, toggle: toggleTrip } = useTrip();
    const { isVisited, toggle: toggleVisited } = useVisited();
    const [details, setDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!show || !place) return;
        let cancelled = false;
        setDetails(null);
        setLoadingDetails(true);
        axios.get(`${API_BASE_URL}/api/places/details/${place.placeId}`)
            .then((res) => { if (!cancelled) setDetails(res.data); })
            .catch(() => { /* fall back to basic info */ })
            .finally(() => { if (!cancelled) setLoadingDetails(false); });
        return () => { cancelled = true; };
    }, [show, place]);

    if (!place) return null;

    const img = photoUrl(details?.photoReference || place.photoReference, 800);
    const price = formatPrice(place.priceLevel);
    const mapsUrl = details?.googleMapsUri
        || `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}&query_place_id=${place.placeId}`;
    const dirUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}&destination_place_id=${place.placeId}`;

    const share = async () => {
        const data = { title: place.name, text: `${place.name} · NearPoint`, url: mapsUrl };
        try {
            if (navigator.share) await navigator.share(data);
            else {
                await navigator.clipboard.writeText(mapsUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 1600);
            }
        } catch { /* user cancelled */ }
    };

    return (
        <Offcanvas show={show} onHide={onHide} placement="end" className="detail-drawer" style={{ width: 'min(440px, 100vw)' }}>
            <Offcanvas.Header closeButton className="detail-header-float" />
            <Offcanvas.Body>
                <div className={`detail-hero-wrap ${img ? '' : 'no-img'}`}>
                    {img
                        ? <img className="detail-hero" src={img} alt={place.name} />
                        : <div className="detail-hero placeholder"><MapPin size={40} /></div>}
                    <div className="detail-hero-scrim">
                        <h3 className="detail-title">{place.name}</h3>
                        <div className="place-meta detail-hero-meta">
                            {place.rating != null && (
                                <span className="rating">
                                    <Star size={15} weight="fill" className="star" />
                                    {place.rating}
                                    {place.userRatingsTotal != null && <span className="cnt">({place.userRatingsTotal})</span>}
                                </span>
                            )}
                            {price && <><span className="dot-sep">·</span><span className="price">{price}</span></>}
                            <span className="dot-sep">·</span>
                            <span>{prettyType(place.types)}</span>
                            {place._distance != null && <><span className="dot-sep">·</span><span className="mono">{formatDistance(place._distance)}</span></>}
                        </div>
                    </div>
                </div>

                <div className="place-meta" style={{ marginTop: 8 }}>
                    {place.openNow === true && <span className="badge-open"><Clock size={13} weight="fill" /> {t('card.open')}</span>}
                    {place.openNow === false && <span className="badge-closed"><Clock size={13} /> {t('card.closed')}</span>}
                </div>

                {details?.editorialSummary && (
                    <p className="mt-3 mb-0" style={{ color: 'var(--body)' }}>{details.editorialSummary}</p>
                )}

                <p className="mt-3 mb-0" style={{ color: 'var(--body)' }}>
                    <MapPin size={15} className="me-1" style={{ verticalAlign: '-2px' }} />
                    {details?.formattedAddress || place.vicinity}
                </p>

                {loadingDetails && (
                    <p className="mt-3 mb-0 text-muted small"><CircleNotch size={14} className="spin me-1" /> {t('detail.loading')}</p>
                )}

                {details && (
                    <div className="detail-extra">
                        {details.phone && (
                            <a className="detail-line" href={`tel:${details.phone.replace(/\s/g, '')}`}>
                                <Phone size={16} /> {details.phone}
                            </a>
                        )}
                        {details.website && (
                            <a className="detail-line" href={details.website} target="_blank" rel="noopener noreferrer">
                                <Globe size={16} /> <span className="text-truncate">{details.website.replace(/^https?:\/\/(www\.)?/, '')}</span>
                            </a>
                        )}
                        {details.weekdayDescriptions?.length > 0 && (
                            <div className="detail-hours">
                                <div className="detail-hours-title"><Clock size={15} /> {t('detail.hours')}</div>
                                {details.weekdayDescriptions.map((d, i) => <div key={i} className="hour-row">{d}</div>)}
                            </div>
                        )}

                        {details.reviews?.length > 0 && (
                            <div className="detail-reviews">
                                <div className="detail-hours-title"><ChatCircle size={15} weight="fill" /> {t('detail.reviews')}</div>
                                {details.reviews.map((r, i) => (
                                    <div className="review" key={i}>
                                        <div className="review-head">
                                            {r.authorPhotoUri
                                                ? <img className="review-avatar" src={r.authorPhotoUri} alt="" referrerPolicy="no-referrer" />
                                                : <div className="review-avatar placeholder">{(r.authorName || '?').charAt(0).toUpperCase()}</div>}
                                            <div className="min-w-0">
                                                <div className="review-author">{r.authorName}</div>
                                                <div className="review-meta">
                                                    {r.rating != null && <><Star size={11} weight="fill" className="star" /> {r.rating} · </>}
                                                    {r.relativeTime}
                                                </div>
                                            </div>
                                        </div>
                                        {r.text && <p className="review-text">{r.text}</p>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {affiliateAction(place) && (
                    <a className="affiliate-cta" href={affiliateAction(place).url}
                       target="_blank" rel="noopener noreferrer sponsored">
                        <Ticket size={18} weight="fill" /> {t(affiliateAction(place).key)}
                        <span className="ad-tag">{t('label.ad')}</span>
                    </a>
                )}

                <div className="detail-actions">
                    <a className="btn-ember" href={dirUrl} target="_blank" rel="noopener noreferrer">
                        <NavigationArrow size={17} weight="fill" /> {t('detail.directions')}
                    </a>
                    <a className="btn-ghost" href={mapsUrl} target="_blank" rel="noopener noreferrer">
                        <ArrowSquareOut size={17} /> {t('detail.maps')}
                    </a>
                    <button className="btn-ghost" onClick={() => toggleVisited(place)} title={t('detail.been')} aria-label={t('detail.been')}>
                        <SealCheck size={17} weight={isVisited(place.placeId) ? 'fill' : 'regular'} color={isVisited(place.placeId) ? '#15803D' : undefined} />
                    </button>
                    <button className="btn-ghost" onClick={() => toggleTrip(place)} title={t('detail.add_trip')} aria-label={t('detail.add_trip')}>
                        <Path size={17} weight={inTrip(place.placeId) ? 'fill' : 'regular'} color={inTrip(place.placeId) ? '#E8552B' : undefined} />
                    </button>
                    <button className="btn-ghost" onClick={share} title={t('detail.share')} aria-label={t('detail.share')}>
                        {copied ? <Check size={17} color="#15803D" /> : <ShareNetwork size={17} />}
                    </button>
                    <button className="btn-ghost" onClick={() => onToggleFav(place)}>
                        <Heart size={17} weight={isFav ? 'fill' : 'regular'} color={isFav ? '#E8552B' : undefined} />
                    </button>
                </div>
            </Offcanvas.Body>
        </Offcanvas>
    );
};

export default PlaceDetailDrawer;
