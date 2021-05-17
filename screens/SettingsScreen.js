import React from 'react';
import {
    View, Alert, StyleSheet
} from 'react-native';
import Config from "../constants/Config";
import {UserModel} from "../models/UserModel";
import {DropdownSingleton} from "../models/DropdownSingleton";
import NetworkLoader from "../components/NetworkLoader";
import DarkStatusBar from "../components/DarkStatusBar";
import Translator from "../i18n/Translator";
import {SettingsView} from "../components/SettingsView";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from "expo-updates";
import {NetworkModel} from "../models/NetworkModel";

export default class SettingsScreen extends React.Component {
    static navigationOptions = () => ({
        title: Translator.t('settings.title')
    });

    constructor(props) {
        super(props);
    }

    confirmEmail = async () => {
        this.networkLoader.setState({visible: true});
        const email = await AsyncStorage.getItem('email');
        const isInternetReachable = await NetworkModel.isInternetReachable();
        if (!isInternetReachable) {
            this.networkLoader.setState({visible: false});
            DropdownSingleton.get().alertWithType(
                'warn',
                Translator.t('nonetwork.title'),
                Translator.t('nonetwork.text')
            );
        } else {
            fetch(
                Config.apiUrl + 'mail/confirm',
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: email
                    })
                }
            ).then(async response => {
                this.networkLoader.setState({visible: false});

                if (response.status === 200) {
                    DropdownSingleton.get().alertWithType(
                        'success',
                        Translator.t('settings.dropdown.success.title'),
                        Translator.t('settings.dropdown.success.text', {email: email})
                    );
                } else if (response.status === 404) {
                    DropdownSingleton.get().alertWithType(
                        'success',
                        Translator.t('settings.dropdown.already_confirmed.title'),
                        Translator.t('settings.dropdown.already_confirmed.text')
                    );
                } else if (response.status === 429) {
                    DropdownSingleton.get().alertWithType(
                        'warn',
                        Translator.t('settings.dropdown.spam.title'),
                        Translator.t('settings.dropdown.spam.text')
                    )
                } else {
                    DropdownSingleton.get().alertWithType(
                        'error',
                        Translator.t('settings.dropdown.unknow.title'),
                        Translator.t('settings.dropdown.unknow.text', {status: response.status})
                    );
                }
            });
        }
    };

    update = async () => {
        this.networkLoader.setState({visible: true});
        const isInternetReachable = await NetworkModel.isInternetReachable();
        if (!isInternetReachable) {
            DropdownSingleton.get().alertWithType(
                'warn',
                Translator.t('nonetwork.title'),
                Translator.t('nonetwork.text')
            );
        } else {
            const hasUpdates = await Updates.checkForUpdateAsync();
            if (hasUpdates.isAvailable) {
                const update = await Updates.fetchUpdateAsync();
                if (update.isNew) {
                    await Updates.reloadAsync();
                } else {
                    DropdownSingleton.get().alertWithType(
                        'success',
                        Translator.t('settings.dropdown.noupdate.title'),
                        Translator.t('settings.dropdown.noupdate.text')
                    );
                }
            } else {
                DropdownSingleton.get().alertWithType(
                    'success',
                    Translator.t('settings.dropdown.noupdate.title'),
                    Translator.t('settings.dropdown.noupdate.text')
                );
            }
        }

        this.networkLoader.setState({visible: false});
    };

    logout = () => {
        Alert.alert(Translator.t('are_you_sure'), '', [
            {text: Translator.t('cancel'), onPress: () => {}, style:'cancel'},
            {text: Translator.t('ok'), onPress: () => {
                UserModel.logout(this.props.navigation);
            }}
        ]);
    };

    render() {

        return <View style={styles.container}>
            <DarkStatusBar />
            <NetworkLoader ref={ref => this.networkLoader = ref} />
            <SettingsView onLogout={() => this.logout()} onUpdate={() => this.update()} onConfirmEmail={() => this.confirmEmail()} showEmailSend={true} />
        </View>;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});
