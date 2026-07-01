import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { MagnifyingGlass, NavigationArrow, CircleNotch } from '@phosphor-icons/react';
import { CATEGORIES } from '../utils/places';
import { useSettings } from '../context/AppSettings';

const SITE_KEY = process.env.REACT_APP_TURNSTILE_SITE_KEY;

const SearchBar = forwardRef(({
    onSearch, activeCategory, onUseLocation, locating, loading,
    turnstileEnabled, hasToken, onToken,
}, ref) => {
    const { t } = useSettings();
    const [text, setText] = useState('');
    const holderRef = useRef(null);
    const widgetId = useRef(null);

    useEffect(() => {
        if (!turnstileEnabled || !SITE_KEY) return;
        let cancelled = false;
        const render = () => {
            if (cancelled || widgetId.current !== null || !window.turnstile || !holderRef.current) return;
            widgetId.current = window.turnstile.render(holderRef.current, {
                sitekey: SITE_KEY,
                callback: (t) => onToken(t),
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

    useImperativeHandle(ref, () => ({
        resetTurnstile() {
            if (window.turnstile && widgetId.current !== null) window.turnstile.reset(widgetId.current);
        },
    }));

    const submit = (e) => {
        e && e.preventDefault();
        onSearch(text.trim(), '');
    };

    const clickChip = (key) => {
        setText('');
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
                        aria-label={t('search.search')}
                    />
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
