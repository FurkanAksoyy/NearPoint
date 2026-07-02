import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
    Users, Heart, ShareNetwork, BellRinging, MapPin, ArrowsDownUp, UsersThree, Trophy,
    ArrowDown, ArrowUp, CircleNotch, ArrowClockwise, MagnifyingGlass, ChartBar, Timer, Sparkle, CaretRight,
} from '@phosphor-icons/react';
import Seo from '../components/Seo';
import { API_BASE_URL } from '../api';
import { useSettings } from '../context/AppSettings';

function formatUptime(s) {
    if (!s || s < 0) return '–';
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
}

const StatCard = ({ icon, label, value, tag }) => (
    <div className="admin-card">
        <div className="admin-ic">{icon}</div>
        <div className="admin-val">{typeof value === 'number' ? value.toLocaleString() : (value ?? '–')}</div>
        <div className="admin-label">{label}{tag && <span className="admin-tag">{tag}</span>}</div>
    </div>
);

const Admin = () => {
    const { t, lang } = useSettings();
    const [stats, setStats] = useState(undefined); // undefined=loading, null=denied/error
    const [featured, setFeatured] = useState(null);
    const [busy, setBusy] = useState(false);
    const [gen, setGen] = useState(false);

    const load = useCallback(async () => {
        setBusy(true);
        try {
            const [s, f] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/admin/stats`),
                axios.get(`${API_BASE_URL}/api/poll/featured`).catch(() => ({ data: null })),
            ]);
            setStats(s.data);
            setFeatured(f && f.data && f.data.slug ? f.data : null);
        } catch {
            setStats(null);
        } finally {
            setBusy(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const generatePoll = async () => {
        setGen(true);
        try {
            await axios.post(`${API_BASE_URL}/api/admin/featured-poll`);
            await load();
        } catch { /* ignore */ } finally { setGen(false); }
    };

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
                    {/* Actions — poll of the week */}
                    <div className="admin-section-label">{t('admin.actions')}</div>
                    <div className="admin-poll-panel">
                        <div className="app-left">
                            <div className="app-ic"><Trophy size={22} weight="fill" /></div>
                            <div>
                                <div className="app-label">{t('admin.featured_now')}</div>
                                <div className="app-name">{featured ? featured.name : t('admin.no_featured')}</div>
                            </div>
                        </div>
                        <div className="app-actions">
                            {featured && (
                                <Link className="btn-ghost" to={`/poll/${featured.slug}`}>{t('admin.open')} <CaretRight size={14} weight="bold" /></Link>
                            )}
                            <button className="btn-ember" onClick={generatePoll} disabled={gen}>
                                {gen ? <CircleNotch size={16} className="spin" /> : <Sparkle size={16} weight="fill" />}
                                {gen ? t('admin.gen_busy') : t('admin.gen_poll')}
                            </button>
                        </div>
                    </div>

                    {/* Traffic */}
                    <div className="admin-section-label">{t('admin.incoming')} / {t('admin.outgoing')}</div>
                    <div className="admin-grid traffic">
                        <StatCard icon={<ArrowDown size={20} weight="bold" />} label={t('admin.http')} value={stats.httpRequests} tag={t('admin.incoming')} />
                        <StatCard icon={<ArrowUp size={20} weight="bold" />} label={t('admin.google')} value={stats.googleApiCalls} tag={t('admin.outgoing')} />
                        <StatCard icon={<Timer size={20} weight="fill" />} label={t('admin.uptime')} value={formatUptime(stats.uptimeSeconds)} tag={t('admin.system')} />
                    </div>

                    {/* Engagement */}
                    <div className="admin-section-label">{t('admin.engagement')}</div>
                    <div className="admin-grid">
                        <StatCard icon={<UsersThree size={20} weight="fill" />} label={t('admin.polls')} value={stats.polls} />
                        <StatCard icon={<ArrowsDownUp size={20} weight="fill" />} label={t('admin.poll_votes')} value={stats.pollVotes} />
                        <StatCard icon={<ShareNetwork size={20} weight="fill" />} label={t('admin.shared')} value={stats.sharedLists} />
                        <StatCard icon={<Heart size={20} weight="fill" />} label={t('admin.favorites')} value={stats.favorites} />
                    </div>

                    {/* Content / users */}
                    <div className="admin-section-label">{t('admin.usage')}</div>
                    <div className="admin-grid">
                        <StatCard icon={<Users size={20} weight="fill" />} label={t('admin.users')} value={stats.users} />
                        <StatCard icon={<BellRinging size={20} weight="fill" />} label={t('admin.push')} value={stats.pushSubscriptions} />
                        <StatCard icon={<MapPin size={20} weight="fill" />} label={t('admin.places')} value={stats.placesCached} />
                    </div>

                    {/* Top searches */}
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
