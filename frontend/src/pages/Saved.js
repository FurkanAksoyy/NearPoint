import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartBreak, MagnifyingGlass, MapTrifold, SealCheck, ShareNetwork, Check } from '@phosphor-icons/react';
import PlacesList from '../components/PlacesList';
import PlaceDetailDrawer from '../components/PlaceDetailDrawer';
import RouteMap from '../components/RouteMap';
import Seo from '../components/Seo';
import { prettyType } from '../utils/places';
import { shareList } from '../utils/share';
import { useSettings } from '../context/AppSettings';
import { useTrip } from '../context/Trip';
import { useVisited } from '../context/Visited';

const Saved = ({ favorites, favIds, onToggleFav }) => {
    const { t, lang } = useSettings();
    const { inTrip, toggle: toggleTrip } = useTrip();
    const { visited } = useVisited();
    const navigate = useNavigate();
    const [tab, setTab] = useState('saved');
    const [selected, setSelected] = useState(null);
    const [show, setShow] = useState(false);
    const [shared, setShared] = useState(false);

    const openDetail = (place) => { setSelected(place); setShow(true); };

    const doShare = async () => {
        try {
            await shareList(t('saved.tab_saved'), 'saved', favorites);
            setShared(true);
            setTimeout(() => setShared(false), 1800);
        } catch { /* ignore */ }
    };

    const planTrip = () => {
        favorites.forEach((f) => { if (!inTrip(f.placeId)) toggleTrip(f); });
        navigate('/trip');
    };

    const topCats = useMemo(() => {
        const counts = {};
        visited.forEach((p) => { const c = prettyType(p.types); if (c) counts[c] = (counts[c] || 0) + 1; });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 4);
    }, [visited]);

    const mappableFav = favorites.filter((f) => f.latitude != null && f.longitude != null);
    const mappableVis = visited.filter((f) => f.latitude != null && f.longitude != null);

    return (
        <div className="saved-page">
            <Seo title={t('seo.saved_title')} description={t('seo.saved_desc')} path="/saved" lang={lang} />

            <div className="saved-tabs">
                <button className={`saved-tab ${tab === 'saved' ? 'active' : ''}`} onClick={() => setTab('saved')}>
                    <HeartBreak size={16} weight="fill" /> {t('saved.tab_saved')} {favorites.length > 0 && <span className="tab-count">{favorites.length}</span>}
                </button>
                <button className={`saved-tab ${tab === 'visited' ? 'active' : ''}`} onClick={() => setTab('visited')}>
                    <SealCheck size={16} weight="fill" /> {t('saved.tab_visited')} {visited.length > 0 && <span className="tab-count">{visited.length}</span>}
                </button>
            </div>

            {tab === 'saved' && (
                favorites.length > 0 ? (
                    <>
                        <div className="results-head" style={{ margin: '0 4px 14px' }}>
                            <span className="count">{favorites.length} {t('saved.count')}</span>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button className="btn-ghost" onClick={doShare}>
                                    {shared ? <Check size={16} color="#15803D" /> : <ShareNetwork size={16} />}
                                    {shared ? t('share.copied') : t('share.action')}
                                </button>
                                {favorites.length > 1 && (
                                    <button className="btn-ember" onClick={planTrip} style={{ border: 'none' }}>
                                        <MapTrifold size={16} weight="fill" /> {t('saved.plan')}
                                    </button>
                                )}
                            </div>
                        </div>
                        {mappableFav.length > 1 && <RouteMap stops={mappableFav} connect={false} height={240} onSelect={openDetail} />}
                        <PlacesList places={favorites} favorites={favIds} onToggleFav={onToggleFav} onSelect={openDetail} hoveredId={null} onHover={() => {}} />
                    </>
                ) : (
                    <div className="pane-state">
                        <div className="ic"><HeartBreak size={24} /></div>
                        <p className="mb-3">{t('saved.empty')}</p>
                        <Link className="btn-ember" to="/"><MagnifyingGlass size={16} weight="bold" /> {t('saved.discover')}</Link>
                    </div>
                )
            )}

            {tab === 'visited' && (
                visited.length > 0 ? (
                    <>
                        <div className="visited-stats">
                            <span className="vs-count">{visited.length}</span>
                            <span className="vs-label">{t('visited.count')}</span>
                            <div className="vs-cats">
                                {topCats.map(([c, n]) => <span className="vs-cat" key={c}>{n} {c}</span>)}
                            </div>
                        </div>
                        {mappableVis.length > 0 && <RouteMap stops={mappableVis} connect={false} height={260} onSelect={openDetail} />}
                        <PlacesList places={visited} favorites={favIds} onToggleFav={onToggleFav} onSelect={openDetail} hoveredId={null} onHover={() => {}} />
                    </>
                ) : (
                    <div className="pane-state">
                        <div className="ic"><SealCheck size={24} /></div>
                        <p className="mb-3">{t('visited.empty')}</p>
                        <Link className="btn-ember" to="/"><MagnifyingGlass size={16} weight="bold" /> {t('saved.discover')}</Link>
                    </div>
                )
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
