import * as Localization from 'expo-localization';
import i18n from 'i18n-js';
import locales from './translations';

export default class {
    static init(){
        i18n.translations = locales;
        i18n.fallbacks = true;
        i18n.locale = Localization.locale;
    }

    static t(str){
        return i18n.t(str);
    }
}
