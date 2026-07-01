import React, { useEffect, useState } from 'react';
import { Offcanvas } from 'react-bootstrap';
import axios from 'axios';
import {
    Star, Heart, Clock, MapPin, ArrowSquareOut, NavigationArrow,
    Phone, Globe, CircleNotch,
} from '@phosphor-icons/react';
import { photoUrl, formatPrice, prettyType } from '../utils/places';
import { formatDistance } from '../utils/geo';
import { useSettings } from '../context/AppSettings';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8070';

const PlaceDetailDrawer = ({ place, show, onHide, isFav, onToggleFav }) => {
    const { t } = useSettings();
    const [details, setDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

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

    return (
        <Offcanvas show={show} onHide={onHide} placement="end" className="detail-drawer" style={{ width: 'min(440px, 100vw)' }}>
            <Offcanvas.Header closeButton>
                <Offcanvas.Title className="text-truncate">{place.name}</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                {img
                    ? <img className="detail-hero" src={img} alt={place.name} />
                    : <div className="detail-hero" style={{ display: 'grid', placeItems: 'center' }}><MapPin size={40} color="#94A3B8" /></div>}

                <h3 className="detail-title">{place.name}</h3>

                <div className="place-meta" style={{ fontSize: '0.9rem' }}>
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
                    </div>
                )}

                <div className="detail-actions">
                    <a className="btn-ember" href={dirUrl} target="_blank" rel="noopener noreferrer">
                        <NavigationArrow size={17} weight="fill" /> {t('detail.directions')}
                    </a>
                    <a className="btn-ghost" href={mapsUrl} target="_blank" rel="noopener noreferrer">
                        <ArrowSquareOut size={17} /> {t('detail.maps')}
                    </a>
                    <button className="btn-ghost" onClick={() => onToggleFav(place)}>
                        <Heart size={17} weight={isFav ? 'fill' : 'regular'} color={isFav ? '#E8552B' : undefined} />
                    </button>
                </div>
            </Offcanvas.Body>
        </Offcanvas>
    );
};

export default PlaceDetailDrawer;
