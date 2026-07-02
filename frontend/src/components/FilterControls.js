import React from 'react';
import { Clock, Diamond, Wheelchair } from '@phosphor-icons/react';
import { useSettings } from '../context/AppSettings';

const FilterControls = ({ filters, onChange, showForYou }) => {
    const { t } = useSettings();
    const set = (patch) => onChange({ ...filters, ...patch });

    return (
        <div className="filter-bar">
            <select value={filters.sort} onChange={(e) => set({ sort: e.target.value })} aria-label={t('filter.filters')}>
                {showForYou && <option value="foryou">✨ {t('filter.for_you')}</option>}
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

            <select value={filters.maxPrice} onChange={(e) => set({ maxPrice: Number(e.target.value) })} aria-label={t('filter.any_price')}>
                <option value="0">{t('filter.any_price')}</option>
                <option value="1">$</option>
                <option value="2">$$</option>
                <option value="3">$$$</option>
            </select>

            <button
                type="button"
                className={`filter-toggle ${filters.openNowOnly ? 'active' : ''}`}
                onClick={() => set({ openNowOnly: !filters.openNowOnly })}
            >
                <Clock size={15} weight={filters.openNowOnly ? 'fill' : 'regular'} /> {t('filter.open_now')}
            </button>

            <button
                type="button"
                className={`filter-toggle ${filters.hiddenGems ? 'active' : ''}`}
                onClick={() => set({ hiddenGems: !filters.hiddenGems })}
                title={t('filter.hidden_gems_hint')}
            >
                <Diamond size={15} weight={filters.hiddenGems ? 'fill' : 'regular'} /> {t('filter.hidden_gems')}
            </button>

            <button
                type="button"
                className={`filter-toggle ${filters.accessible ? 'active' : ''}`}
                onClick={() => set({ accessible: !filters.accessible })}
                title={t('a11y.wheelchair')}
            >
                <Wheelchair size={15} weight={filters.accessible ? 'fill' : 'regular'} /> {t('filter.accessible')}
            </button>
        </div>
    );
};

export default FilterControls;
