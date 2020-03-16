import React from 'react';
import {
    Alert, AsyncStorage,
    StatusBar
} from 'react-native';
import JamConfigView from "../components/JamConfigView";
import Config from "../constants/Config";
import * as SecureStore from "expo-secure-store";

export default class SettingsScreen extends React.Component {
    static navigationOptions = {
        title: 'Settings'
    };

    constructor(props) {
        super(props);
        this._bootstrapAsync().then();
    }

    async _bootstrapAsync() {
        StatusBar.setBarStyle('dark-content');
    }

    logout = () => {
        Alert.alert('Are you sure?', '', [
            {text: 'Cancel', onPress: () => {}, style:'cancel'},
            {text: 'OK', onPress: () => {
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

                    this.props.navigation.navigate('Launch');
                });
            }}
        ]);
    };

    render() {
        return <JamConfigView onLogout={() => this.logout()} />;
    }
}
