import React from 'react';
import { Link } from 'react-router-dom';
import {
    MagnifyingGlass, MapTrifold, Sparkle, Path, Heart, DeviceMobile,
    NavigationArrow, ListChecks, Sun, Bell, Star, Globe, GithubLogo,
} from '@phosphor-icons/react';
import Logo from '../components/Logo';
import Seo from '../components/Seo';
import { useSettings } from '../context/AppSettings';

const REPO_URL = 'https://github.com/FurkanAksoyy/NearPoint';

const FEATURES = [
    { Icon: MagnifyingGlass, en: ['Smart search', 'Autocomplete, categories, filters and recent searches.'], tr: ['Akıllı arama', 'Otomatik tamamlama, kategoriler, filtreler ve son aramalar.'] },
    { Icon: MapTrifold, en: ['Map + list', 'Results synced live between a map and a list.'], tr: ['Harita + liste', 'Sonuçlar harita ve liste arasında canlı senkron.'] },
    { Icon: Sparkle, en: ['Top picks', 'The best-rated burgers, coffee and more, curated.'], tr: ['Öne çıkanlar', 'En iyi hamburgerciler, kahveciler ve daha fazlası.'] },
    { Icon: Path, en: ['History tours', 'Routed walks through nearby cultural spots.'], tr: ['Tarih turları', 'Yakındaki kültürel noktalar arasında rotalı yürüyüşler.'] },
    { Icon: Heart, en: ['Save & sync', 'Favorites that follow you across devices.'], tr: ['Kaydet & senkron', 'Cihazların arasında seni takip eden favoriler.'] },
    { Icon: DeviceMobile, en: ['Installable PWA', 'Add to home screen, works offline, push-ready.'], tr: ['Kurulabilir PWA', 'Ana ekrana ekle, çevrimdışı çalışır, bildirim hazır.'] },
];

const STEPS = [
    { Icon: NavigationArrow, en: ['Search or use your location', 'Type “hamburger” or tap “Near me”.'], tr: ['Ara ya da konumunu kullan', '“hamburger” yaz veya “Yakınımda”ya dokun.'] },
    { Icon: MapTrifold, en: ['Browse the synced map + list', 'Compare ratings, distance, price and open-now.'], tr: ['Senkron harita + listede gez', 'Puan, mesafe, fiyat ve açık/kapalı karşılaştır.'] },
    { Icon: ListChecks, en: ['Save, plan & go', 'Favorite it, build a trip, get directions.'], tr: ['Kaydet, planla & git', 'Favorile, gezi oluştur, yol tarifi al.'] },
];

const TECH = [
    { group: 'Backend', items: ['Java 21', 'Spring Boot 3.5', 'PostgreSQL', 'Flyway', 'Caffeine', 'Resilience4j', 'JWT'] },
    { group: 'Frontend', items: ['React 19', 'Bootstrap', 'Google Maps', 'PWA', 'Geist'] },
    { group: 'Quality', items: ['JUnit 5', 'Testcontainers', 'WireMock', 'Playwright', 'OpenAPI', 'JaCoCo'] },
    { group: 'Delivery', items: ['Docker', 'GitHub Actions', 'Jenkins', 'SonarCloud', 'Caddy'] },
];

const About = () => {
    const { t, lang } = useSettings();
    const pick = (o) => (lang === 'tr' ? o.tr : o.en);

    return (
        <div className="about-page">
            <Seo title={t('seo.about_title')} description={t('seo.about_desc')} path="/about" lang={lang} />

            <section className="about-hero">
                <Logo size={44} />
                <h1>Near<span style={{ color: '#E8552B' }}>Point</span></h1>
                <p>{t('about.tagline')}</p>
                <div className="about-cta">
                    <Link className="btn-ember" to="/"><MagnifyingGlass size={17} weight="bold" /> {t('about.cta_discover')}</Link>
                    <Link className="btn-ghost" to="/best"><Sparkle size={17} weight="fill" /> {t('about.cta_best')}</Link>
                </div>
            </section>

            <section className="about-section">
                <h2>{t('about.features_h')}</h2>
                <div className="feature-grid">
                    {FEATURES.map(({ Icon, ...o }, i) => {
                        const [title, desc] = pick(o);
                        return (
                            <div className="feature-card" key={i}>
                                <div className="feature-ic"><Icon size={22} weight="fill" /></div>
                                <div className="feature-title">{title}</div>
                                <div className="feature-desc">{desc}</div>
                            </div>
                        );
                    })}
                </div>
            </section>

            <section className="about-section">
                <h2>{t('about.how_t')}</h2>
                <div className="steps">
                    {STEPS.map(({ Icon, ...o }, i) => {
                        const [title, desc] = pick(o);
                        return (
                            <div className="step" key={i}>
                                <div className="step-num">{i + 1}</div>
                                <div className="step-ic"><Icon size={20} weight="fill" /></div>
                                <div className="step-title">{title}</div>
                                <div className="step-desc">{desc}</div>
                            </div>
                        );
                    })}
                </div>
            </section>

            <section className="about-section">
                <h2>{t('about.tech_t')}</h2>
                <div className="tech-groups">
                    {TECH.map((g) => (
                        <div className="tech-group" key={g.group}>
                            <div className="tech-group-name">{g.group}</div>
                            <div className="tech-pills">
                                {g.items.map((it) => <span className="tech-pill" key={it}>{it}</span>)}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="about-section">
                <a className="github-cta" href={REPO_URL} target="_blank" rel="noopener noreferrer">
                    <GithubLogo size={22} weight="fill" />
                    {t('about.star')}
                    <Star size={16} weight="fill" className="gh-star" />
                </a>
                <p className="github-note">{t('about.star_note')}</p>
            </section>

            <div className="about-badges">
                <span><Star size={15} weight="fill" /> Google Places API (New)</span>
                <span><Sun size={15} weight="fill" /> Dark mode</span>
                <span><Globe size={15} weight="fill" /> TR / EN</span>
                <span><Bell size={15} weight="fill" /> Web push</span>
            </div>
        </div>
    );
};

export default About;
