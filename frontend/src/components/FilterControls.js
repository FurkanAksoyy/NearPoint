import React from 'react';
import { Clock, SlidersHorizontal } from '@phosphor-icons/react';
import { useSettings } from '../context/AppSettings';

const FilterControls = ({ filters, onChange }) => {
    const { t } = useSettings();
    const set = (patch) => onChange({ ...filters, ...patch });

    return (
        <div className="filter-bar">
            <select value={filters.sort} onChange={(e) => set({ sort: e.target.value })} aria-label={t('filter.filters')}>
                <option value="relevance">{t('filter.best')}</option>
                <option value="rating">{t('filter.rated')}</option>
                <option value="distance">{t('filter.nearest')}</option>
            </select>

            <select value={filters.minRating} onChange={(e) => set({ minRating: Number(e.target.value) })} aria-label={t('filter.any_rating')}>
                <option value="0">{t('filter.any_rating')}</option>
                <option value="3.5">3.5+ ★</option>
                <option value="4">4.0+ ★</option>
                <option value="4.5">4.5+ ★</option>
            </select>

            <button
                type="button"
                className={`filter-toggle ${filters.openNowOnly ? 'active' : ''}`}
                onClick={() => set({ openNowOnly: !filters.openNowOnly })}
            >
                <Clock size={15} weight={filters.openNowOnly ? 'fill' : 'regular'} /> {t('filter.open_now')}
            </button>

            <span className="filter-toggle" style={{ borderColor: 'transparent', cursor: 'default', color: 'var(--muted)' }}>
                <SlidersHorizontal size={15} /> {t('filter.filters')}
            </span>
        </div>
    );
};

export default FilterControls;
