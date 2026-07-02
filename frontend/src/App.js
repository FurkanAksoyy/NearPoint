import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import axios from 'axios';
import { Heart, Sun, Moon, Sparkle, Compass, Info, UserCircle, SignOut, Path, Bell, BellRinging, MapTrifold } from '@phosphor-icons/react';
import Home from './pages/Home';
import Logo from './components/Logo';
import AuthModal from './components/AuthModal';
import { useSettings } from './context/AppSettings';
import { useAuth } from './context/Auth';
import { useTrip } from './context/Trip';
import { pushSupported, enablePush } from './utils/push';

// Code-split secondary routes so the initial bundle stays small (better INP/LCP)
const About = lazy(() => import('./pages/About'));
const Saved = lazy(() => import('./pages/Saved'));
const BestOf = lazy(() => import('./pages/BestOf'));
const ToursPage = lazy(() => import('./pages/ToursPage'));
const TripPage = lazy(() => import('./pages/TripPage'));
const NearPage = lazy(() => import('./pages/NearPage'));

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8070';
const DEFAULT_COORDS = { lat: 41.0370, lng: 28.9851 }; // Istanbul
const RADIUS = 2000;
const FAV_KEY = 'np_favorites_v2';

function loadFavorites() {
    try {
        const raw = JSON.parse(localStorage.getItem(FAV_KEY) || '[]');
        return Array.isArray(raw) ? raw.filter((p) => p && p.placeId) : [];
    } catch {
        return [];
    }
}

// Shareable URL state: ?q=&cat=&lat=&lng=
function parseUrl() {
    const p = new URLSearchParams(window.location.search);
    const lat = parseFloat(p.get('lat'));
    const lng = parseFloat(p.get('lng'));
    return {
        query: p.get('q') || '',
        category: p.get('cat') || '',
        coords: !isNaN(lat) && !isNaN(lng) ? { lat, lng } : null,
    };
}

function App() {
    const initial = useRef(parseUrl()).current;
    const [coords, setCoords] = useState(initial.coords || DEFAULT_COORDS);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [locating, setLocating] = useState(false);
    const [lastSearch, setLastSearch] = useState({ query: initial.query, category: initial.category });
    const [favorites, setFavorites] = useState(loadFavorites);
    const [turnstileToken, setTurnstileToken] = useState('');
    const searchBarRef = useRef(null);

    const { t, theme, toggleTheme, lang, toggleLang } = useSettings();
    const { isAuthed, user, logout } = useAuth();
    const { trip } = useTrip();
    const [authOpen, setAuthOpen] = useState(false);
    const [pushOn, setPushOn] = useState(() => typeof Notification !== 'undefined' && Notification.permission === 'granted');
    const [pushBusy, setPushBusy] = useState(false);

    const handleEnablePush = async () => {
        setPushBusy(true);
        try {
            await enablePush();
            setPushOn(true);
        } catch { /* denied/unsupported */ }
        finally { setPushBusy(false); }
    };
    const turnstileEnabled = !!process.env.REACT_APP_TURNSTILE_SITE_KEY;
    const favIds = useMemo(() => new Set(favorites.map((f) => f.placeId)), [favorites]);

    const syncUrl = (query, category, c) => {
        const sp = new URLSearchParams();
        if (query) sp.set('q', query);
        if (category) sp.set('cat', category);
        sp.set('lat', c.lat.toFixed(5));
        sp.set('lng', c.lng.toFixed(5));
        window.history.replaceState(null, '', `${window.location.pathname}?${sp.toString()}`);
    };

    const runSearch = useCallback(async (query, category, coordsOverride) => {
        const c = coordsOverride || coords;
        setLastSearch({ query, category });
        setLoading(true);
        setError('');
        try {
            const headers = {};
            if (turnstileToken) headers['CF-Turnstile-Token'] = turnstileToken;
            const res = await axios.get(`${API_BASE_URL}/api/places/nearby`, {
                params: {
                    latitude: c.lat,
                    longitude: c.lng,
                    radius: RADIUS,
                    query: query || undefined,
                    category: category || undefined,
                },
                headers,
            });
            setResults(res.data);
            syncUrl(query, category, c);
        } catch (err) {
            if (err.response && err.response.status === 403) {
                setError('error.bot');
            } else {
                setError('error.generic');
            }
            setResults([]);
        } finally {
            setLoading(false);
            if (turnstileEnabled) {
                searchBarRef.current?.resetTurnstile?.();
                setTurnstileToken('');
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [coords, turnstileToken, turnstileEnabled]);

    // Initial search on load — wait for a Turnstile token if verification is on
    const didInit = useRef(false);
    useEffect(() => {
        if (didInit.current) return;
        if (turnstileEnabled && !turnstileToken) return;
        didInit.current = true;
        runSearch(initial.query, initial.category);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [turnstileEnabled, turnstileToken]);

    const handleUseLocation = () => {
        if (!navigator.geolocation) {
            setError('error.geo_unsupported');
            return;
        }
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setCoords(c);
                setLocating(false);
                runSearch(lastSearch.query, lastSearch.category, c);
            },
            () => {
                setLocating(false);
                setError('error.geo_denied');
            },
            { enableHighAccuracy: true, timeout: 8000 }
        );
    };

    const handleSearchArea = (c) => {
        setCoords(c);
        runSearch(lastSearch.query, lastSearch.category, c);
    };

    // Sync favorites with the server on login (merge guest favorites up), revert to local on logout
    useEffect(() => {
        let cancelled = false;
        async function sync() {
            if (isAuthed) {
                try {
                    const { data: serverFavs } = await axios.get(`${API_BASE_URL}/api/me/favorites`);
                    const serverIds = new Set(serverFavs.map((f) => f.placeId));
                    const localOnly = loadFavorites().filter((f) => !serverIds.has(f.placeId));
                    for (const f of localOnly) {
                        try { await axios.post(`${API_BASE_URL}/api/me/favorites`, f); } catch { /* ignore */ }
                    }
                    if (cancelled) return;
                    const merged = [...serverFavs, ...localOnly];
                    setFavorites(merged);
                    localStorage.setItem(FAV_KEY, JSON.stringify(merged));
                } catch { /* stay with local */ }
            } else {
                setFavorites(loadFavorites());
            }
        }
        sync();
        return () => { cancelled = true; };
    }, [isAuthed]);

    const toggleFav = (place) => {
        setFavorites((prev) => {
            const exists = prev.some((p) => p.placeId === place.placeId);
            const next = exists ? prev.filter((p) => p.placeId !== place.placeId) : [place, ...prev];
            localStorage.setItem(FAV_KEY, JSON.stringify(next));
            if (isAuthed) {
                if (exists) axios.delete(`${API_BASE_URL}/api/me/favorites/${encodeURIComponent(place.placeId)}`).catch(() => {});
                else axios.post(`${API_BASE_URL}/api/me/favorites`, place).catch(() => {});
            }
            return next;
        });
    };

    return (
        <Router>
            <nav className="np-nav">
                <NavLink className="np-brand" to={`/${window.location.search}`}>
                    <Logo size={24} />
                    <span>Near<span style={{ color: '#E8552B' }}>Point</span></span>
                </NavLink>
                <div className="np-nav-links">
                    <NavLink to={`/${window.location.search}`} end title={t('nav.discover')}>
                        <Compass size={17} weight="regular" /><span className="nav-label">{t('nav.discover')}</span>
                    </NavLink>
                    <NavLink to="/best" title={t('nav.best')}>
                        <Sparkle size={16} weight="fill" /><span className="nav-label">{t('nav.best')}</span>
                    </NavLink>
                    <NavLink to="/tours" title={t('nav.tours')}>
                        <Path size={16} weight="fill" /><span className="nav-label">{t('nav.tours')}</span>
                    </NavLink>
                    <NavLink to="/trip" title={t('nav.trip')}>
                        <MapTrifold size={16} weight="fill" />
                        <span className="nav-label">{trip.length ? `${t('nav.trip')} · ${trip.length}` : t('nav.trip')}</span>
                    </NavLink>
                    <NavLink to="/saved" title={t('nav.saved')}>
                        <Heart size={16} weight={favorites.length ? 'fill' : 'regular'} style={{ color: favorites.length ? '#E8552B' : undefined }} />
                        <span className="nav-label">{favorites.length ? `${t('nav.saved')} · ${favorites.length}` : t('nav.saved')}</span>
                    </NavLink>
                    <NavLink to="/about" title={t('nav.about')}>
                        <Info size={16} weight="regular" /><span className="nav-label">{t('nav.about')}</span>
                    </NavLink>
                    <div className="np-controls">
                        {isAuthed ? (
                            <>
                                <span className="np-user" title={user.email}>
                                    <UserCircle size={18} weight="fill" /><span className="nav-label">{user.displayName}</span>
                                </span>
                                <button className="np-icon-btn" onClick={logout} title={t('auth.logout')} aria-label={t('auth.logout')}>
                                    <SignOut size={17} />
                                </button>
                            </>
                        ) : (
                            <button className="np-login" onClick={() => setAuthOpen(true)}>
                                <UserCircle size={17} weight="fill" /><span className="nav-label">{t('auth.login')}</span>
                            </button>
                        )}
                        <button className="np-lang" onClick={toggleLang} aria-label={t('a11y.lang')} title={t('a11y.lang')}>
                            {lang.toUpperCase()}
                        </button>
                        {pushSupported() && (
                            <button className={`np-icon-btn ${pushOn ? 'on' : ''}`} onClick={handleEnablePush} disabled={pushBusy || pushOn} aria-label={t('a11y.notify')} title={t('a11y.notify')}>
                                {pushOn ? <BellRinging size={18} weight="fill" color="#E8552B" /> : <Bell size={18} />}
                            </button>
                        )}
                        <button className="np-icon-btn" onClick={toggleTheme} aria-label={t('a11y.theme')} title={t('a11y.theme')}>
                            {theme === 'dark' ? <Sun size={18} weight="fill" /> : <Moon size={18} weight="fill" />}
                        </button>
                    </div>
                </div>
            </nav>

            <Suspense fallback={<div className="pane-state" style={{ paddingTop: 80 }} />}>
            <Routes>
                <Route path="/" element={
                    <Home
                        results={results}
                        loading={loading}
                        error={error}
                        coords={coords}
                        lastSearch={lastSearch}
                        favorites={favIds}
                        onToggleFav={toggleFav}
                        onSearch={(q, cat) => runSearch(q, cat)}
                        onSearchArea={handleSearchArea}
                        onUseLocation={handleUseLocation}
                        locating={locating}
                        turnstileEnabled={turnstileEnabled}
                        hasTurnstileToken={!!turnstileToken}
                        onTurnstileToken={setTurnstileToken}
                        searchBarRef={searchBarRef}
                    />
                } />
                <Route path="/best" element={
                    <BestOf coords={coords} favorites={favIds} onToggleFav={toggleFav} onCoords={setCoords} />
                } />
                <Route path="/tours" element={
                    <ToursPage coords={coords} favorites={favIds} onToggleFav={toggleFav} onCoords={setCoords} />
                } />
                <Route path="/trip" element={<TripPage />} />
                <Route path="/near/:city/:category" element={
                    <NearPage favorites={favIds} onToggleFav={toggleFav} />
                } />
                <Route path="/saved" element={
                    <Saved favorites={favorites} favIds={favIds} onToggleFav={toggleFav} />
                } />
                <Route path="/about" element={<About />} />
            </Routes>
            </Suspense>

            <AuthModal show={authOpen} onHide={() => setAuthOpen(false)} />
        </Router>
    );
}

export default App;
