import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const localeImports = {
    en: () => import('./locales/en'),
    zh_CN: () => import('./locales/zh_CN'),
    de: () => import('./locales/de'),
    fr: () => import('./locales/fr'),
    es: () => import('./locales/es'),
    ru: () => import('./locales/ru'),
    ar: () => import('./locales/ar'),
    vi: () => import('./locales/vi'),
    th: () => import('./locales/th'),
    tr: () => import('./locales/tr'),
    ms: () => import('./locales/ms'),
    id: () => import('./locales/id'),
    zh_TW: () => import('./locales/zh_TW'),
    ko_KR: () => import('./locales/ko_KR'),
    pt: () => import('./locales/pt'),
    it: () => import('./locales/it'),
    pol: () => import('./locales/pol'),
    nl: () => import('./locales/nl'),
    jp: () => import('./locales/jp'),
    fa: () => import('./locales/fa'),
};

const cache = new Map();
const pendingLoads = new Map();

function loadLocale(lng) {
    if (cache.has(lng)) return Promise.resolve(cache.get(lng));
    if (pendingLoads.has(lng)) return pendingLoads.get(lng);

    const promise = localeImports[lng]().then((module) => {
        cache.set(lng, module);
        pendingLoads.delete(lng);
        return module;
    });
    pendingLoads.set(lng, promise);
    return promise;
}

export const i18nInitPromise = (async function init() {
    const zhCNModule = await loadLocale('zh_CN');
    i18n
        .use(initReactI18next)
        .init({
            resources: {
                zh_CN: { translation: zhCNModule.default.translation },
            },
            lng: 'zh_CN',
            keySeparator: false,
            interpolation: {
                escapeValue: false,
            },
        });
})();

export async function changeLanguage(lng) {
    if (!localeImports[lng]) {
        console.warn(`Unsupported language: ${lng}`);
        return;
    }
    if (!cache.has(lng)) {
        const module = await loadLocale(lng);
        i18n.addResourceBundle(lng, 'translation', module.default.translation, true, true);
    }
    await i18n.changeLanguage(lng);
}

export default i18n;
