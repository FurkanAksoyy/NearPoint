import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Scales, X, Trophy } from '@phosphor-icons/react';
import { photoUrl, formatPrice, prettyType } from '../utils/places';
import { formatDistance } from '../utils/geo';
import { useSettings } from '../context/AppSettings';
import { useCompare } from '../context/Compare';

// Transparent weighted pick: rating + popularity (log reviews) − small distance penalty
function decide(places) {
    const scored = places.map((p) => {
        const rating = p.rating || 0;
        const pop = Math.min(Math.log10((p.userRatingsTotal || 0) + 1), 4);
        const distKm = (p._distance || 0) / 1000;
        return { p, score: rating + pop * 0.35 - distKm * 0.04 };
    }).sort((a, b) => b.score - a.score);
    return scored.length ? scored[0].p : null;
}

const Cell = ({ label, children }) => (
    <div className="cmp-row"><span>{label}</span><b>{children}</b></div>
);

const CompareBar = () => {
    const { t } = useSettings();
    const { compare, remove, clear } = useCompare();
    const [open, setOpen] = useState(false);
    const [winner, setWinner] = useState(null);

    if (!compare.length) return null;

    return (
        <>
            <div className="cmp-tray">
                <div className="cmp-chips">
                    {compare.map((p) => (
                        <span className="cmp-chip" key={p.placeId}>
                            <span className="text-truncate">{p.name}</span>
                            <button onClick={() => remove(p.placeId)} aria-label="remove"><X size={13} /></button>
                        </span>
                    ))}
                </div>
                <button className="btn-ghost cmp-clear" onClick={clear}>{t('compare.clear')}</button>
                <button className="btn-ember" onClick={() => { setWinner(null); setOpen(true); }} disabled={compare.length < 2}>
                    <Scales size={16} weight="fill" /> {t('compare.compare')} ({compare.length})
                </button>
            </div>

            {open && createPortal(
                <div className="cmp-overlay" onClick={() => setOpen(false)}>
                    <div className="cmp-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="cmp-modal-head">
                            <h3>{t('compare.title')}</h3>
                            <button className="guided-x" onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button>
                        </div>

                        <div className="cmp-grid" style={{ gridTemplateColumns: `repeat(${compare.length}, minmax(0, 1fr))` }}>
                            {compare.map((p) => {
                                const img = photoUrl(p.photoReference, 320);
                                const win = winner && winner.placeId === p.placeId;
                                return (
                                    <div className={`cmp-col ${win ? 'win' : ''}`} key={p.placeId}>
                                        {win && <div className="cmp-badge"><Trophy size={13} weight="fill" /> {t('compare.pick')}</div>}
                                        {img ? <img className="cmp-thumb" src={img} alt={p.name} /> : <div className="cmp-thumb ph" />}
                                        <div className="cmp-name">{p.name}</div>
                                        <Cell label={t('compare.rating')}>
                                            {p.rating ?? '–'}{p.userRatingsTotal != null ? ` (${p.userRatingsTotal})` : ''}
                                        </Cell>
                                        <Cell label={t('compare.price')}>{formatPrice(p.priceLevel) || '–'}</Cell>
                                        <Cell label={t('compare.type')}>{prettyType(p.types)}</Cell>
                                        <Cell label={t('compare.distance')}>{p._distance != null ? formatDistance(p._distance) : '–'}</Cell>
                                        <Cell label={t('compare.open')}>{p.openNow === true ? '✓' : p.openNow === false ? '✕' : '–'}</Cell>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="cmp-decide">
                            <button className="btn-ember" onClick={() => setWinner(decide(compare))}>
                                <Trophy size={16} weight="fill" /> {t('compare.decide')}
                            </button>
                            {winner && <p className="cmp-reason">{t('compare.pick')}: <b>{winner.name}</b> — {t('compare.reason')}.</p>}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

export default CompareBar;
