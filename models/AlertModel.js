import Config from "../constants/Config";
import {AsyncStorage} from "react-native";

export class AlertModel {
    static async getAlert() {
        const response = await fetch(Config.alertUrl);
        const responseJson = await response.json();

        if (responseJson.status === 'success') {
            const closedId = parseInt(await AsyncStorage.getItem('closed_alert_id'));

            if (closedId !== responseJson.alert.id) {
                return responseJson.alert;
            }
        }

        return null;
    }

    static async closeAlert(id) {
        await AsyncStorage.setItem('closed_alert_id', String(id));
    }
}