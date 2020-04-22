import {
    AsyncStorage
} from "react-native";
import Config from "../constants/Config";

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
}