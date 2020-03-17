import Config from "../constants/Config";

export class AuthSingleton {
    static instance = null;

    static get() {
        if (!AuthSingleton.instance) {
            AuthSingleton.instance = new AuthSingleton();
        }

        return AuthSingleton.instance;
    }

    constructor() {
        this.treatedTokens = [];
    }

    authByDeepLink(url, navigator) {
        if (url && url.indexOf(Config.urlScheme) === 0 && url !== Config.urlScheme && this.treatedTokens.indexOf(url) === -1) {
            this.treatedTokens.push(url);
            const token = url.replace(Config.urlScheme, '');
            navigator.navigate('Auth', {
                token: token
            });
        }
    }
}