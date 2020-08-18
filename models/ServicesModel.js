import {AsyncStorage} from "react-native";
import Config from "../constants/Config";
import {DateModel} from "./DateModel";
import {EncryptionModel} from "./EncryptionModel";
import * as SecureStore from "expo-secure-store";

export class ServicesModel {

    static async getServices() {
        const services = await AsyncStorage.getItem(Config.servicesKey);
        return JSON.parse(services);
    }

    static async saveService(key, service) {
        const services = await this.getServices();
        services[key] = {};
        for (let i in service) {
            services[key][i] = service[i];
        }
        await this.persist(services);
    }

    static async removeService(key) {
        const services = await this.getServices();
        delete services[key];
        await this.persist(services);
    }

    static async persist(services) {
        await AsyncStorage.setItem(Config.servicesKey, JSON.stringify(services));
    }

    static async remoteRemove(service) {
        const dateModel = new DateModel();
        const enc = new EncryptionModel();
        const dataToSend = {
            app_id: service.app_id,
            jam_id: await SecureStore.getItemAsync(Config.storageKeys.jamID),
            timestamp: dateModel.getUnixTimestamp()
        };

        const sign = await enc.sign(enc.urlencode(enc.json_encode(dataToSend)));
        return await fetch(
            Config.apiUrl + 'user_login',
            {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data: dataToSend,
                    sign: sign
                })
            }
        );
    }
}