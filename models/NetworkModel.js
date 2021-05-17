import * as Network from "expo-network";
import {Platform} from "react-native";

export class NetworkModel {
    static isInternetReachable = async () => {
        if (Platform.OS === 'ios') {
            const FETCH_TIMEOUT = 2000;
            let didTimeOut = false;
            return await (new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    didTimeOut = true;
                    resolve(false);
                }, FETCH_TIMEOUT);

                const date = new Date();
                const timestamp = date.getTime();
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
        } else {
            const networkState = await Network.getNetworkStateAsync();
            return networkState.isInternetReachable;
        }
    };
}