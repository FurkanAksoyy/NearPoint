import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartBreak, MagnifyingGlass, MapTrifold } from '@phosphor-icons/react';
import PlacesList from '../components/PlacesList';
import PlaceDetailDrawer from '../components/PlaceDetailDrawer';
import RouteMap from '../components/RouteMap';
import Seo from '../components/Seo';
import { useSettings } from '../context/AppSettings';
import { useTrip } from '../context/Trip';

const Saved = ({ favorites, favIds, onToggleFav }) => {
    const { t, lang } = useSettings();
    const { inTrip, toggle: toggleTrip } = useTrip();
    const navigate = useNavigate();
    const [selected, setSelected] = useState(null);
    const [show, setShow] = useState(false);

    const openDetail = (place) => { setSelected(place); setShow(true); };

    const planTrip = () => {
        favorites.forEach((f) => { if (!inTrip(f.placeId)) toggleTrip(f); });
        navigate('/trip');
    };

    const mappable = favorites.filter((f) => f.latitude != null && f.longitude != null);

    return (
        <div className="saved-page">
            <Seo title={t('seo.saved_title')} description={t('seo.saved_desc')} path="/saved" lang={lang} />
            <div className="results-head" style={{ margin: '0 4px 16px' }}>
                <div>
                    <h2>{t('saved.title')}</h2>
                    <span className="count">{favorites.length} {t('saved.count')}</span>
                </div>
                {favorites.length > 1 && (
                    <button className="btn-ember" onClick={planTrip} style={{ border: 'none' }}>
                        <MapTrifold size={16} weight="fill" /> {t('saved.plan')}
                    </button>
                )}
            </div>

            {favorites.length > 0 ? (
                <>
                    {mappable.length > 1 && <RouteMap stops={mappable} connect={false} height={240} onSelect={openDetail} />}
                    <PlacesList
                        places={favorites}
                        favorites={favIds}
                        onToggleFav={onToggleFav}
                        onSelect={openDetail}
                        hoveredId={null}
                        onHover={() => {}}
                    />
                </>
            ) : (
                <div className="pane-state">
                    <div className="ic"><HeartBreak size={24} /></div>
                    <p className="mb-3">{t('saved.empty')}</p>
                    <Link className="btn-ember" to="/"><MagnifyingGlass size={16} weight="bold" /> {t('saved.discover')}</Link>
                </div>
            )}

            <PlaceDetailDrawer
                place={selected}
                show={show}
                onHide={() => setShow(false)}
                isFav={selected ? favIds.has(selected.placeId) : false}
                onToggleFav={onToggleFav}
            />
        </div>
    );
};

export default Saved;
