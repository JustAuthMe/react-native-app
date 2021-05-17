export class NetworkModel {
    static isInternetReachable = async () => {
        const FETCH_TIMEOUT = 2000;
        let didTimeOut = false;
        return await (new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                didTimeOut = true;
                resolve(false);
            }, FETCH_TIMEOUT);

            const timestamp = (new Date()).getTime();
            fetch('https://ping.justauth.me/?time=' + timestamp)
                .then(response => {
                    clearTimeout(timeout);
                    if (!didTimeOut) {
                        resolve(true);
                    }
                })
                .catch(err => {
                    resolve(false);
                });
        }));
    };
}