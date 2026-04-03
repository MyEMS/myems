import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import en from './locales/en';
import zh_CN from './locales/zh_CN';
import de from './locales/de';
import fr from './locales/fr';
import es from './locales/es';
import ru from './locales/ru';
import ar from './locales/ar';
import vi from './locales/vi';
import th from './locales/th';
import tr from './locales/tr';
import ms from './locales/ms';
import id from './locales/id';
import zh_TW from './locales/zh_TW';
import ko_KR from './locales/ko_KR';
import pt from './locales/pt';
import it from './locales/it';
import pol from './locales/pol';
import nl from './locales/nl';
import jp from './locales/jp';
import fa from './locales/fa';

const resources = {
    en,
    zh_CN,
    de,
    fr,
    es,
    ru,
    ar,
    vi,
    th,
    tr,
    ms,
    id,
    zh_TW,
    ko_KR,
    pt,
    it,
    pol,
    nl,
    jp,
    fa
};

i18n
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
        resources,
        lng: 'zh_CN',

        keySeparator: false, // we do not use keys in form messages.welcome

        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export default i18n;
