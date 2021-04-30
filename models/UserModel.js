import Config from "../constants/Config";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from '@react-native-async-storage/async-storage';

export class UserModel {
    static logout(navigation) {
        AsyncStorage.multiRemove([
            'firstname',
            'lastname',
            'birthdate',
            'email',
            'avatar',
            Config.servicesKey
        ], async () => {
            await SecureStore.deleteItemAsync(Config.storageKeys.publicKey);
            await SecureStore.deleteItemAsync(Config.storageKeys.privateKey);
            await SecureStore.deleteItemAsync(Config.storageKeys.jamID);

            navigation.navigate('Launch');
        });
    }
}