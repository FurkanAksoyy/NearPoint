import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';
import { MagnifyingGlass, NavigationArrow, CircleNotch } from '@phosphor-icons/react';
import { CATEGORIES } from '../utils/places';
import { useSettings } from '../context/AppSettings';

const SITE_KEY = process.env.REACT_APP_TURNSTILE_SITE_KEY;
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8070';

const SearchBar = forwardRef(({
    onSearch, coords, activeCategory, onUseLocation, locating, loading,
    turnstileEnabled, hasToken, onToken,
}, ref) => {
    const { t } = useSettings();
    const [text, setText] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggest, setShowSuggest] = useState(false);
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

    const runSearch = (value) => {
        setShowSuggest(false);
        setSuggestions([]);
        onSearch(value.trim(), '');
    };

    const submit = (e) => { e && e.preventDefault(); runSearch(text); };

    const pickSuggestion = (s) => {
        // Use the first, most specific part of the suggestion as the query
        const q = s.text.split(',')[0];
        setText(q);
        runSearch(q);
    };

    const clickChip = (key) => {
        setText('');
        setShowSuggest(false);
        onSearch('', key);
    };

    const blocked = turnstileEnabled && !hasToken;
    const goDisabled = loading || blocked;

    return (
        <div className="search-bar">
            <form className="search-row" onSubmit={submit}>
                <div className="search-input-wrap">
                    <MagnifyingGlass className="lead-icon" size={19} />
                    <input
                        className="search-input"
                        placeholder={t('search.placeholder')}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onFocus={() => { if (suggestions.length) setShowSuggest(true); }}
                        onBlur={() => { blurTimer.current = setTimeout(() => setShowSuggest(false), 150); }}
                        onKeyDown={(e) => { if (e.key === 'Escape') setShowSuggest(false); }}
                        aria-label={t('search.search')}
                        autoComplete="off"
                    />
                    {showSuggest && suggestions.length > 0 && (
                        <ul className="search-suggest" onMouseDown={() => clearTimeout(blurTimer.current)}>
                            {suggestions.map((s, i) => (
                                <li key={i} className="suggest-item" onClick={() => pickSuggestion(s)}>
                                    <MagnifyingGlass size={15} className="suggest-ic" />
                                    <span className="text-truncate">{s.text}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <button type="button" className="btn-loc" onClick={onUseLocation} disabled={locating || blocked}>
                    {locating ? <CircleNotch size={18} className="spin" /> : <NavigationArrow size={18} weight="fill" />}
                    <span className="d-none d-sm-inline">{locating ? t('search.locating') : t('search.near')}</span>
                </button>
                <button type="submit" className="btn-go" disabled={goDisabled}>
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
