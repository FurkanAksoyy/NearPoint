import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { UsersThree, Star, MagnifyingGlass, CircleNotch, Check, MapPin } from '@phosphor-icons/react';
import Seo from '../components/Seo';
import { photoUrl, prettyType } from '../utils/places';
import { getPoll, votePoll } from '../utils/poll';
import { useSettings } from '../context/AppSettings';

const PollPage = () => {
    const { slug } = useParams();
    const { t, lang } = useSettings();
    const [poll, setPoll] = useState(undefined); // undefined = loading, null = not found
    const [myVote, setMyVote] = useState(() => localStorage.getItem(`np_vote_${slug}`) || null);
    const [voting, setVoting] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        if (poll) { const id = setTimeout(() => setMounted(true), 60); return () => clearTimeout(id); }
        return undefined;
    }, [poll]);

    useEffect(() => {
        let cancelled = false;
        getPoll(slug).then((d) => { if (!cancelled) setPoll(d); }).catch(() => { if (!cancelled) setPoll(null); });
        return () => { cancelled = true; };
    }, [slug]);

    const vote = async (placeId) => {
        setVoting(true);
        try {
            const updated = await votePoll(slug, placeId);
            setPoll(updated);
            setMyVote(placeId);
            localStorage.setItem(`np_vote_${slug}`, placeId);
        } catch { /* ignore */ } finally { setVoting(false); }
    };

    if (poll === undefined) {
        return <div className="tours-page"><div className="pane-state"><CircleNotch size={26} className="spin" /></div></div>;
    }
    if (poll === null) {
        return (
            <div className="tours-page">
                <div className="pane-state">
                    <div className="ic"><UsersThree size={24} /></div>
                    <p className="mb-3">{t('poll.notfound')}</p>
                    <Link className="btn-ember" to="/"><MagnifyingGlass size={16} weight="bold" /> {t('shared.cta')}</Link>
                </div>
            </div>
        );
    }

    const total = poll.totalVotes || 0;
    const places = (poll.places || []).filter((p) => p && p.placeId);
    const leader = total > 0
        ? places.reduce((best, p) => ((poll.votes[p.placeId] || 0) > (poll.votes[best] || 0) ? p.placeId : best), places[0]?.placeId)
        : null;
    const title = poll.name || t('poll.default_name');

    return (
        <div className="tours-page">
            <Seo title={`${title} — NearPoint`} description={t('poll.subtitle')} path={`/poll/${slug}`} lang={lang} />

            <div className="best-head">
                <div>
                    <h1>{title}</h1>
                    <p className="shared-sub"><UsersThree size={15} weight="fill" /> {t('poll.subtitle')}</p>
                </div>
                <Link className="btn-ember" to="/"><MagnifyingGlass size={16} weight="bold" /> {t('shared.cta')}</Link>
            </div>

            <ul className="poll-list">
                {places.map((p) => {
                    const v = poll.votes[p.placeId] || 0;
                    const pct = total ? Math.round((v / total) * 100) : 0;
                    const mine = myVote === p.placeId;
                    const lead = leader === p.placeId && total > 0;
                    const img = photoUrl(p.photoReference, 200);
                    return (
                        <li className={`poll-opt ${mine ? 'mine' : ''} ${lead ? 'lead' : ''}`} key={p.placeId}>
                            {img
                                ? <img className="poll-thumb" src={img} alt={p.name} loading="lazy" />
                                : <div className="poll-thumb placeholder"><MapPin size={20} /></div>}
                            <div className="poll-body">
                                <div className="poll-name">
                                    {p.name}
                                    {lead && <span className="poll-lead">{t('poll.leading')}</span>}
                                </div>
                                <div className="place-meta">
                                    {p.rating != null && <span className="rating"><Star size={13} weight="fill" className="star" />{p.rating}</span>}
                                    <span className="dot-sep">·</span><span>{prettyType(p.types)}</span>
                                </div>
                                <div className="poll-bar"><span className="poll-bar-fill" style={{ width: mounted ? `${pct}%` : '0%' }} /></div>
                            </div>
                            <div className="poll-side">
                                {mine
                                    ? <span className="poll-voted"><Check size={15} weight="bold" /> {t('poll.voted')}</span>
                                    : <button className="btn-ghost poll-vote" onClick={() => vote(p.placeId)} disabled={voting}>{t('poll.vote')}</button>}
                                <span className="poll-count">{pct}% · {v}</span>
                            </div>
                        </li>
                    );
                })}
            </ul>

            <p className="poll-total">{total} {t('poll.total')}</p>

            <div className="poll-cta">
                {myVote && <div className="poll-cta-thanks"><Check size={15} weight="bold" /> {t('poll.voted_thanks')}</div>}
                <div className="poll-cta-title">{t('poll.make_own_title')}</div>
                <p className="poll-cta-desc">{t('poll.make_own_desc')}</p>
                <Link className="btn-ember" to="/"><UsersThree size={16} weight="fill" /> {t('poll.make_own')}</Link>
            </div>
        </div>
    );
};

export default PollPage;
