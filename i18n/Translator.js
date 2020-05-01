import * as Localization from 'expo-localization';
import i18n from 'i18n-js';
import locales from './translations';

export default class Translator {
    static init(){
        i18n.translations = locales;
        i18n.fallbacks = true;
        i18n.locale = Localization.locale;
    }

    static t(key, options = {}){
        return i18n.t(key, options);
    }
}
Translator.init();
