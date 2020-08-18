import React from 'react';
import {
    View, Alert, AsyncStorage, StyleSheet
} from 'react-native';
import Config from "../constants/Config";
import {UserModel} from "../models/UserModel";
import {DropdownSingleton} from "../models/DropdownSingleton";
import NetworkLoader from "../components/NetworkLoader";
import DarkStatusBar from "../components/DarkStatusBar";
import Translator from "../i18n/Translator";
import {SettingsView} from "../components/SettingsView";

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
                    'Check your inbox!',
                    'We sent you a confirmation E-Mail to ' + email + '. Click on the link to confirm your E-Mail address.'
                );
            } else if (response.status === 404) {
                DropdownSingleton.get().alertWithType(
                    'success',
                    'Already confirmed',
                    'Your E-Mail address is already confirmed! You have nothing more to do.'
                );
            } else if (response.status === 429) {
                DropdownSingleton.get().alertWithType(
                    'warn',
                    'Please check your inbox',
                    'Please wait at least 10 minutes before asking for a new confirmation E-Mail. Please also check your junk mail.'
                )
            } else {
                DropdownSingleton.get().alertWithType(
                    'error',
                    'Uknow error',
                    'An unknow error occured. Please contact support@justauth.me, mentionning that a HTTP ' + response.status + ' appeared at E-Mail confirmation request.'
                );
            }
        });
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
            <SettingsView onLogout={() => this.logout()} onConfirmEmail={() => this.confirmEmail()} showEmailSend={true} />
        </View>;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});
