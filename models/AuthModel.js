import Config from "../constants/Config";

export class AuthModel {
    authByDeepLink(url, navigator) {
        if (url && url.indexOf(Config.urlScheme) === 0 && url !== Config.urlScheme) {
            console.log('authentication url: ', url);
            const token = url.replace(Config.urlScheme, '');
            navigator.navigate('Auth', {
                token: token
            });
        }
    }
}