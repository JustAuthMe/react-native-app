import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    AsyncStorage
} from 'react-native';
import {
    LocalAuthentication,
    SecureStore
} from 'expo';
import AuthDataList from "../components/AuthDataList";
import Config from "../constants/Config";
import {Encryption} from "../models/Encryption";

export default class AuthScreen extends React.Component {
    static navigationOptions = {
        title: 'Authentication',
    };

    state = {
        token: this.props.navigation.getParam('token'),
        auth: null
    };

    constructor(props) {
        super(props);
        this.getAuthDetails().then(data => {
            this.setState({data: data});
        });
    }

    async getAuthDetails() {
        const endpointUrl = Config.apiUrl + 'auth/' + this.state.token;
        console.log(endpointUrl);
        try {
            const response = await fetch(endpointUrl);
            const responseJson = await response.json();
            console.log(responseJson);
            if (responseJson.auth) {
                this.setState({
                    auth: responseJson.auth
                });
            } else {
                // TODO: make a real error handling
                console.log('error retreiving auth details');
            }
        } catch (error) {
            console.error(error);
        }
    }

    async getUserDataFromDataset() {
        const jamID = await SecureStore.getItemAsync(Config.storageKeys.jamID);
        let data = {
            jam_id: jamID,
            token: this.state.token
        };

        const authData = this.state.auth.data;
        for (let i = 0; i < authData.length; i++) {
            let dataName = authData[i];
            if (authData[i].indexOf('!') !== -1) {
                dataName = authData[i].slice(0, -1);
            }

            data[dataName] = await AsyncStorage.getItem(dataName);
        }

        return data;
    }

    onAcceptLogin = async () => {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        let canLogin = true;
        if (hasHardware && isEnrolled) {
            const localAuth = await LocalAuthentication.authenticateAsync('Confirm login attempt');
            canLogin = localAuth.success;
        }

        if (canLogin) {
            const endpointUrl = Config.apiUrl + 'login';
            const data = await this.getUserDataFromDataset();
            const enc = new Encryption();
            const sign = await enc.sign(JSON.stringify(data));
            console.log(data);
            console.log(sign);
            try {
                const response = await fetch(
                    endpointUrl,
                    {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            data: data,
                            sign: sign
                        })
                    }
                );

                const responseJson = await response.json();
                console.log(responseJson);

                if (responseJson.status === 'success') {
                    this.props.navigation.goBack();
                }
            } catch (error) {
                console.error(error);
            }
        } else {
            console.log('Forbidden');
        }
    };

    render() {
        let content;
        if (this.state.auth === null) {
            content = <Text style={styles.loadingText}>Loading authentication details...</Text>;
        } else {
            content = <AuthDataList
                style={styles.data}
                auth={this.state.auth}
                onAccept={this.onAcceptLogin}
            />;
        }

        return (
            <View style={styles.container}>
                {content}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
    },
    loadingText: {
        textAlign: 'center'
    },
    data: {
        textAlign: 'center'
    }
});
