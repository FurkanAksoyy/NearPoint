import React from 'react';
import { useSettings } from '../context/AppSettings';

// A vibe → a Google Places text query (kept in English; Places handles it globally)
const MOODS = [
    { key: 'cozy', q: 'cozy cafe', emoji: '☕', en: 'Cozy', tr: 'Sakin' },
    { key: 'date', q: 'romantic restaurant', emoji: '🌙', en: 'Date night', tr: 'Romantik' },
    { key: 'lively', q: 'popular bar', emoji: '🎉', en: 'Lively', tr: 'Hareketli' },
    { key: 'work', q: 'cafe to work on laptop', emoji: '💻', en: 'Work-friendly', tr: 'Çalışmalık' },
    { key: 'brunch', q: 'brunch spot', emoji: '🥐', en: 'Brunch', tr: 'Brunch' },
    { key: 'sweet', q: 'dessert', emoji: '🍰', en: 'Something sweet', tr: 'Tatlı bir şey' },
    { key: 'view', q: 'rooftop with a view', emoji: '🌆', en: 'Great view', tr: 'Manzaralı' },
];

const MoodRow = ({ onPick }) => {
    const { t, lang } = useSettings();
    return (
        <div className="mood-row" aria-label={t('mood.label')}>
            <span className="mood-lead">{t('mood.label')}</span>
            <div className="mood-chips">
                {MOODS.map((m) => (
                    <button key={m.key} className="mood-chip" onClick={() => onPick(m.q)}>
                        <span className="mood-emoji" aria-hidden="true">{m.emoji}</span>
                        {lang === 'tr' ? m.tr : m.en}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default MoodRow;
