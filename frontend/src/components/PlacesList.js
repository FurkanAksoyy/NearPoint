import React from 'react';
import { Star, Heart, Clock, MapPin, Storefront } from '@phosphor-icons/react';
import { photoUrl, formatPrice, prettyType } from '../utils/places';
import { formatDistance } from '../utils/geo';
import { isFeatured } from '../utils/affiliate';
import { useSettings } from '../context/AppSettings';

const PlaceCard = ({ place, isFav, onToggleFav, onSelect, hovered, onHover, t }) => {
    const img = photoUrl(place.photoReference, 200);
    const price = formatPrice(place.priceLevel);

    return (
        <div
            className={`place-card ${hovered ? 'hovered' : ''}`}
            onClick={() => onSelect(place)}
            onMouseEnter={() => onHover(place.id)}
            onMouseLeave={() => onHover(null)}
        >
            {img ? (
                <img className="place-thumb" src={img} alt={place.name} loading="lazy" />
            ) : (
                <div className="place-thumb placeholder"><Storefront size={28} /></div>
            )}

            <div className="place-body">
                {isFeatured(place.placeId) && <span className="featured-badge">{t('label.featured')}</span>}
                <div className="place-name">
                    <span className="text-truncate">{place.name}</span>
                    <button
                        className={`fav-btn ${isFav ? 'on' : ''}`}
                        onClick={(e) => { e.stopPropagation(); onToggleFav(place); }}
                        aria-label={isFav ? 'Remove from favorites' : 'Save to favorites'}
                    >
                        <Heart size={19} weight={isFav ? 'fill' : 'regular'} />
                    </button>
                </div>

                <div className="place-meta">
                    {place.rating != null && (
                        <span className="rating">
                            <Star size={13} weight="fill" className="star" />
                            {place.rating}
                            {place.userRatingsTotal != null && <span className="cnt">({place.userRatingsTotal})</span>}
                        </span>
                    )}
                    {price && <><span className="dot-sep">·</span><span className="price">{price}</span></>}
                    <span className="dot-sep">·</span>
                    <span>{prettyType(place.types)}</span>
                    {place._distance != null && (
                        <><span className="dot-sep">·</span><span className="mono">{formatDistance(place._distance)}</span></>
                    )}
                </div>

                <div className="place-meta">
                    {place.openNow === true && <span className="badge-open"><Clock size={12} weight="fill" /> {t('card.open')}</span>}
                    {place.openNow === false && <span className="badge-closed"><Clock size={12} /> {t('card.closed')}</span>}
                </div>

                <div className="place-addr"><MapPin size={12} /> {place.vicinity}</div>
            </div>
        </div>
    );
};

const PlacesList = ({ places, favorites, onToggleFav, onSelect, hoveredId, onHover }) => {
    const { t } = useSettings();
    return (
        <div>
            {places.map((place) => (
                <PlaceCard
                    key={place.id}
                    place={place}
                    isFav={favorites.has(place.placeId)}
                    onToggleFav={onToggleFav}
                    onSelect={onSelect}
                    hovered={hoveredId === place.id}
                    onHover={onHover}
                    t={t}
                />
            ))}
        </div>
    );
};

export default PlacesList;
