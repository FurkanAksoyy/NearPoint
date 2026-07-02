import React from 'react';
import { MapPin, NavigationArrow, CircleNotch } from '@phosphor-icons/react';
import { useSettings } from '../context/AppSettings';

/** Honest indicator of what location results are for, with a soft prompt to use real GPS. */
const LocationBar = ({ label, geolocated, onUseLocation, locating }) => {
    const { t } = useSettings();

    if (geolocated) {
        return (
            <div className="loc-bar geo">
                <MapPin size={14} weight="fill" />
                <span>{t('loc.near')} <strong>{label || t('loc.your_location')}</strong></span>
            </div>
        );
    }

    return (
        <div className="loc-bar">
            <MapPin size={14} weight="fill" />
            <span className="loc-text">{t('loc.showing_near')} <strong>{label || t('loc.this_area')}</strong></span>
            <button className="loc-cta" onClick={onUseLocation} disabled={locating}>
                {locating ? <CircleNotch size={13} className="spin" /> : <NavigationArrow size={13} weight="fill" />}
                {t('loc.use_my')}
            </button>
        </div>
    );
};

export default LocationBar;
