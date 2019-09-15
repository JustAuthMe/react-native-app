import Config from "../constants/Config";

export class AuthModel {
    constructor() {
        this.alreadyHandledDeepLink = false;
    }

    authByDeepLink(url, navigator) {
        if (!this.alreadyHandledDeepLink && url && url.indexOf(Config.urlScheme) === 0 && url !== Config.urlScheme) {
            console.log('authentication url: ', url);
            this.alreadyHandledDeepLink = true;
            const token = url.replace(Config.urlScheme, '');
            navigator.navigate('Auth', {
                token: token
            });
        }
    }
}