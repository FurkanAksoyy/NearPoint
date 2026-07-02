import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';
import { MagnifyingGlass, NavigationArrow, CircleNotch, Clock } from '@phosphor-icons/react';
import { CATEGORIES } from '../utils/places';
import { useSettings } from '../context/AppSettings';
import { API_BASE_URL } from '../api';

const SITE_KEY = process.env.REACT_APP_TURNSTILE_SITE_KEY;
const RECENT_KEY = 'np_recent';

function loadRecent() {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
}

const SearchBar = forwardRef(({
    onSearch, coords, activeCategory, onUseLocation, locating, loading,
    turnstileEnabled, hasToken, onToken,
}, ref) => {
    const { t } = useSettings();
    const [text, setText] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggest, setShowSuggest] = useState(false);
    const [recent, setRecent] = useState(loadRecent);
    const [activeIndex, setActiveIndex] = useState(-1);
    const holderRef = useRef(null);
    const widgetId = useRef(null);
    const blurTimer = useRef(null);

    useEffect(() => {
        if (!turnstileEnabled || !SITE_KEY) return;
        let cancelled = false;
        const render = () => {
            if (cancelled || widgetId.current !== null || !window.turnstile || !holderRef.current) return;
            widgetId.current = window.turnstile.render(holderRef.current, {
                sitekey: SITE_KEY,
                callback: (tok) => onToken(tok),
                'error-callback': () => onToken(''),
                'expired-callback': () => onToken(''),
            });
        };
        if (window.turnstile) render();
        else {
            const timer = setInterval(() => { if (window.turnstile) { clearInterval(timer); render(); } }, 200);
            return () => { cancelled = true; clearInterval(timer); };
        }
        return () => { cancelled = true; };
    }, [turnstileEnabled, onToken]);

    // Debounced autocomplete
    useEffect(() => {
        const q = text.trim();
        if (q.length < 2 || !coords) { setSuggestions([]); return undefined; }
        let cancelled = false;
        const id = setTimeout(() => {
            axios.get(`${API_BASE_URL}/api/places/autocomplete`, {
                params: { input: q, latitude: coords.lat, longitude: coords.lng },
            }).then((res) => { if (!cancelled) { setSuggestions(res.data); setShowSuggest(true); } })
                .catch(() => { if (!cancelled) setSuggestions([]); });
        }, 250);
        return () => { cancelled = true; clearTimeout(id); };
    }, [text, coords]);

    useImperativeHandle(ref, () => ({
        resetTurnstile() {
            if (window.turnstile && widgetId.current !== null) window.turnstile.reset(widgetId.current);
        },
    }));

    const addRecent = (q) => {
        setRecent((prev) => {
            const next = [q, ...prev.filter((r) => r.toLowerCase() !== q.toLowerCase())].slice(0, 6);
            localStorage.setItem(RECENT_KEY, JSON.stringify(next));
            return next;
        });
    };

    const clearRecent = () => {
        setRecent([]);
        localStorage.removeItem(RECENT_KEY);
    };

    const runSearch = (value) => {
        const q = value.trim();
        setShowSuggest(false);
        setSuggestions([]);
        if (q) addRecent(q);
        onSearch(q, '');
    };

    const submit = (e) => { e && e.preventDefault(); runSearch(text); };

    const pickSuggestion = (s) => {
        // Use the full suggestion so multi-part names ("Starbucks, Main St") keep their context
        setText(s.text);
        runSearch(s.text);
    };

    const clickChip = (key) => {
        setText('');
        setShowSuggest(false);
        onSearch('', key);
    };

    const blocked = turnstileEnabled && !hasToken;
    const goDisabled = loading || blocked;
    const showAuto = text.trim().length >= 2 && suggestions.length > 0;
    const showRecent = text.trim().length < 2 && recent.length > 0;
    const listOpen = showSuggest && (showAuto || showRecent);
    const options = showAuto ? suggestions.map((s) => s.text) : (showRecent ? recent : []);

    const selectOption = (i) => {
        if (showAuto) pickSuggestion(suggestions[i]);
        else { setText(recent[i]); runSearch(recent[i]); }
    };

    const onKeyDown = (e) => {
        if (e.key === 'Escape') { setShowSuggest(false); setActiveIndex(-1); return; }
        if (!listOpen || !options.length) return;
        if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((i) => (i + 1) % options.length); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex((i) => (i <= 0 ? options.length - 1 : i - 1)); }
        else if (e.key === 'Enter' && activeIndex >= 0) { e.preventDefault(); selectOption(activeIndex); }
    };

    return (
        <div className="search-bar">
            <form className="search-row" onSubmit={submit}>
                <div className="search-input-wrap">
                    <MagnifyingGlass className="lead-icon" size={19} />
                    <input
                        className="search-input"
                        placeholder={t('search.placeholder')}
                        value={text}
                        onChange={(e) => { setText(e.target.value); setActiveIndex(-1); }}
                        onFocus={() => setShowSuggest(true)}
                        onBlur={() => { blurTimer.current = setTimeout(() => setShowSuggest(false), 150); }}
                        onKeyDown={onKeyDown}
                        aria-label={t('search.search')}
                        role="combobox"
                        aria-expanded={listOpen}
                        aria-controls="search-listbox"
                        aria-autocomplete="list"
                        aria-activedescendant={activeIndex >= 0 ? `sg-${activeIndex}` : undefined}
                        autoComplete="off"
                    />
                    {listOpen && (
                        <ul className="search-suggest" id="search-listbox" role="listbox" onMouseDown={() => clearTimeout(blurTimer.current)}>
                            {showRecent && (
                                <li className="suggest-head">
                                    <span>{t('search.recent')}</span>
                                    <button type="button" className="suggest-clear" onClick={clearRecent}>{t('search.clear')}</button>
                                </li>
                            )}
                            {showAuto
                                ? suggestions.map((s, i) => (
                                    <li key={`a${i}`} id={`sg-${i}`} role="option" aria-selected={activeIndex === i}
                                        className={`suggest-item ${activeIndex === i ? 'active' : ''}`}
                                        onMouseEnter={() => setActiveIndex(i)}
                                        onClick={() => pickSuggestion(s)}>
                                        <MagnifyingGlass size={15} className="suggest-ic" />
                                        <span className="text-truncate">{s.text}</span>
                                    </li>))
                                : recent.map((r, i) => (
                                    <li key={`r${i}`} id={`sg-${i}`} role="option" aria-selected={activeIndex === i}
                                        className={`suggest-item ${activeIndex === i ? 'active' : ''}`}
                                        onMouseEnter={() => setActiveIndex(i)}
                                        onClick={() => { setText(r); runSearch(r); }}>
                                        <Clock size={15} className="suggest-ic" />
                                        <span className="text-truncate">{r}</span>
                                    </li>))}
                        </ul>
                    )}
                </div>
                <button type="button" className="btn-loc" onClick={onUseLocation} disabled={locating || blocked} aria-label={t('search.near')}>
                    {locating ? <CircleNotch size={18} className="spin" /> : <NavigationArrow size={18} weight="fill" />}
                    <span className="d-none d-sm-inline">{locating ? t('search.locating') : t('search.near')}</span>
                </button>
                <button type="submit" className="btn-go" disabled={goDisabled} aria-label={t('search.search')}>
                    <MagnifyingGlass size={18} weight="bold" />
                    <span className="d-none d-sm-inline">{t('search.search')}</span>
                </button>
            </form>

            <div className="chips">
                {CATEGORIES.map((c) => (
                    <button
                        key={c.key || 'all'}
                        className={`chip ${activeCategory === c.key ? 'active' : ''}`}
                        onClick={() => clickChip(c.key)}
                        type="button"
                        disabled={blocked}
                    >
                        {t(c.tkey)}
                    </button>
                ))}
            </div>

            {turnstileEnabled && (
                <div className="turnstile-holder">
                    <div ref={holderRef}></div>
                </div>
            )}
        </div>
    );
});

export default SearchBar;
