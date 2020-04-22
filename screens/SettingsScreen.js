import React from 'react';
import {
    View, Alert, AsyncStorage,
    StatusBar, StyleSheet
} from 'react-native';
import JamConfigView from "../components/JamConfigView";
import Config from "../constants/Config";
import * as SecureStore from "expo-secure-store";
import {UserModel} from "../models/UserModel";
import {DropdownSingleton} from "../models/DropdownSingleton";
import NetworkLoader from "../components/NetworkLoader";
import DarkStatusBar from "../components/DarkStatusBar";

export default class SettingsScreen extends React.Component {
    static navigationOptions = {
        title: 'Settings'
    };

    constructor(props) {
        super(props);
        this._bootstrapAsync().then();
    }

    async _bootstrapAsync() {
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
                    'error',
                    'Unknow E-Mail',
                    'Are you sure that your E-Mail address isn\'t already validated? If it isn\'t, please contact support@justauth.me'
                );
            } else if (response.status === 429) {
                DropdownSingleton.get().alertWithType(
                    'error',
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
        Alert.alert('Are you sure?', '', [
            {text: 'Cancel', onPress: () => {}, style:'cancel'},
            {text: 'OK', onPress: () => {
                UserModel.logout(this.props.navigation);
            }}
        ]);
    };

    render() {
        return (
            <View style={styles.container}>
                <DarkStatusBar />
                <NetworkLoader ref={ref => this.networkLoader = ref} />
                <JamConfigView onLogout={() => this.logout()} onConfirmEmail={() => this.confirmEmail()} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});
