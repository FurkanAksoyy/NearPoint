import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
    Users, Heart, ShareNetwork, BellRinging, MapPin, ArrowsDownUp,
    ArrowDown, ArrowUp, CircleNotch, ArrowClockwise, MagnifyingGlass, ChartBar,
} from '@phosphor-icons/react';
import Seo from '../components/Seo';
import { useSettings } from '../context/AppSettings';

import { API_BASE_URL } from '../api';

const StatCard = ({ icon, label, value, tag }) => (
    <div className="admin-card">
        <div className="admin-ic">{icon}</div>
        <div className="admin-val">{value != null ? value.toLocaleString() : '–'}</div>
        <div className="admin-label">{label}{tag && <span className="admin-tag">{tag}</span>}</div>
    </div>
);

const Admin = () => {
    const { t, lang } = useSettings();
    const [stats, setStats] = useState(undefined); // undefined=loading, null=denied/error
    const [busy, setBusy] = useState(false);

    const load = useCallback(async () => {
        setBusy(true);
        try {
            const { data } = await axios.get(`${API_BASE_URL}/api/admin/stats`);
            setStats(data);
        } catch {
            setStats(null);
        } finally {
            setBusy(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    return (
        <div className="admin-page">
            <Seo title={`${t('admin.title')} — NearPoint`} description={t('admin.subtitle')} path="/admin" lang={lang} />

            <div className="best-head">
                <div>
                    <h1><ChartBar size={26} weight="fill" style={{ marginRight: 8, color: '#E8552B' }} />{t('admin.title')}</h1>
                    <p>{t('admin.subtitle')}</p>
                </div>
                {stats && (
                    <button className="btn-ghost" onClick={load} disabled={busy}>
                        {busy ? <CircleNotch size={16} className="spin" /> : <ArrowClockwise size={16} />} {t('admin.refresh')}
                    </button>
                )}
            </div>

            {stats === undefined && <div className="pane-state"><CircleNotch size={26} className="spin" /></div>}

            {stats === null && (
                <div className="pane-state">
                    <div className="ic"><Users size={24} /></div>
                    <p className="mb-3">{t('admin.denied')}</p>
                    <Link className="btn-ember" to="/"><MagnifyingGlass size={16} weight="bold" /> {t('shared.cta')}</Link>
                </div>
            )}

            {stats && (
                <>
                    <div className="admin-section-label">{t('admin.incoming')} / {t('admin.outgoing')}</div>
                    <div className="admin-grid traffic">
                        <StatCard icon={<ArrowDown size={20} weight="bold" />} label={t('admin.http')} value={stats.httpRequests} tag={t('admin.incoming')} />
                        <StatCard icon={<ArrowUp size={20} weight="bold" />} label={t('admin.google')} value={stats.googleApiCalls} tag={t('admin.outgoing')} />
                    </div>

                    <div className="admin-section-label">{t('admin.usage')}</div>
                    <div className="admin-grid">
                        <StatCard icon={<Users size={20} weight="fill" />} label={t('admin.users')} value={stats.users} />
                        <StatCard icon={<Heart size={20} weight="fill" />} label={t('admin.favorites')} value={stats.favorites} />
                        <StatCard icon={<ShareNetwork size={20} weight="fill" />} label={t('admin.shared')} value={stats.sharedLists} />
                        <StatCard icon={<BellRinging size={20} weight="fill" />} label={t('admin.push')} value={stats.pushSubscriptions} />
                        <StatCard icon={<MapPin size={20} weight="fill" />} label={t('admin.places')} value={stats.placesCached} />
                    </div>

                    <div className="admin-section-label">{t('admin.top_searches')}</div>
                    {stats.topSearches && stats.topSearches.length > 0 ? (
                        <ul className="admin-bars">
                            {stats.topSearches.map((s, i) => {
                                const max = stats.topSearches[0].count || 1;
                                return (
                                    <li className="admin-bar-row" key={i}>
                                        <span className="admin-bar-label text-truncate">{s.query}</span>
                                        <span className="admin-bar-track"><span className="admin-bar-fill" style={{ width: `${Math.max(6, (s.count / max) * 100)}%` }} /></span>
                                        <span className="admin-bar-count">{s.count}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="admin-empty"><ArrowsDownUp size={15} /> {t('admin.no_searches')}</p>
                    )}
                </>
            )}
        </div>
    );
};

export default Admin;
