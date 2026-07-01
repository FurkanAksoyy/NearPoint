import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HeartBreak, MagnifyingGlass } from '@phosphor-icons/react';
import PlacesList from '../components/PlacesList';
import PlaceDetailDrawer from '../components/PlaceDetailDrawer';
import { useSettings } from '../context/AppSettings';

const Saved = ({ favorites, favIds, onToggleFav }) => {
    const { t } = useSettings();
    const [selected, setSelected] = useState(null);
    const [show, setShow] = useState(false);

    const openDetail = (place) => { setSelected(place); setShow(true); };

    return (
        <div className="saved-page">
            <div className="results-head" style={{ margin: '0 4px 16px' }}>
                <h2>{t('saved.title')}</h2>
                <span className="count">{favorites.length} {t('saved.count')}</span>
            </div>

            {favorites.length > 0 ? (
                <PlacesList
                    places={favorites}
                    favorites={favIds}
                    onToggleFav={onToggleFav}
                    onSelect={openDetail}
                    hoveredId={null}
                    onHover={() => {}}
                />
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
