import React from 'react';
import {
    View,
    StyleSheet,
    Image,
    AsyncStorage,
    ScrollView,
    Platform
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import AuthDataList from "../components/AuthDataList";
import Config from "../constants/Config";
import {EncryptionModel} from "../models/EncryptionModel";
import DarkStatusBar from "../components/DarkStatusBar";
import {DropdownSingleton} from "../models/DropdownSingleton";
import {NavigationActions, StackActions} from "react-navigation";
import {ServicesModel} from "../models/ServicesModel";
import AndroidBiometricPrompt from "../components/AndroidBiometricPrompt";
import {UserModel} from "../models/UserModel";
import NetworkLoader from "../components/NetworkLoader";
import {DateModel} from "../models/DateModel";
import Translator from "../i18n/Translator";
import Text from '../components/JamText'

export default class AuthScreen extends React.Component {
    static navigationOptions = {
        title: Translator.t('auth.title'),
    };

    state = {
        token: this.props.navigation.getParam('token'),
        auth: null,
        isFirstLogin: false
    };

    constructor(props) {
        super(props);
        this.getAuthDetails().then();
    }

    async getAuthDetails() {
        const endpointUrl = Config.apiUrl + 'auth/' + this.state.token;
        this.services = await ServicesModel.getServices();

        try {
            const response = await fetch(endpointUrl);
            const responseJson = await response.json();

            if (responseJson.status === 'success') {
                this.setState({
                    auth: responseJson.auth,
                    isFirstLogin: !this.services.hasOwnProperty(responseJson.auth.client_app.app_id)
                });

                this.actualData = {};
                for (let i = 0; i < responseJson.auth.client_app.data.length; i++) {
                    this.actualData[responseJson.auth.client_app.data[i]] = true;
                }
            } else {

                const resetAction = StackActions.reset({
                    index: 0,
                    actions: [NavigationActions.navigate({
                        routeName: 'Home'
                    })],
                });
                this.props.navigation.dispatch(resetAction);
                DropdownSingleton.get().alertWithType(
                    'error',
                    Translator.t('auth.invalid_token'),
                    Translator.t('auth.invalid_token_message')
                );
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

        if (this.services.hasOwnProperty(this.state.auth.client_app.app_id)) {
            return data;
        }

        const authData = this.state.auth.client_app.data;
        for (let i = 0; i < authData.length; i++) {
            let dataName = authData[i];
            if (authData[i].indexOf('!') !== -1) {
                dataName = authData[i].slice(0, -1);
            }

            if (this.actualData[authData[i]]) {
                data[dataName] = await AsyncStorage.getItem(dataName);
            }
        }

        return data;
    }

    onAcceptLogin = async () => {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        let canLogin = true;
        if (hasHardware && isEnrolled) {
            if (Platform.OS === 'android') {
                this.androidPrompt.setState({visible: true});
            }

            let localAuth = await LocalAuthentication.authenticateAsync({promptMessage: Translator.t('auth.confirm_login')});
            canLogin = localAuth.success;

            if (Platform.OS === 'android') {
                let i = 0;
                do {
                    this.androidPrompt.setState({status: canLogin ? 'success' : 'error'});

                    if (!canLogin) {
                        localAuth = await LocalAuthentication.authenticateAsync({promptMessage: Translator.t('auth.confirm_login')});
                        canLogin = localAuth.success;
                        i++;
                    }
                } while (i < 5 && !canLogin && this.androidPrompt.state.visible);

                if (!canLogin) {
                    this.androidPrompt.setState({visible: false});
                    DropdownSingleton.get().alertWithType(
                        'error',
                        Translator.t('auth.biometric_error'),
                        Translator.t('auth.biometric_error_message')
                    );
                }
            }
        }

        if (canLogin) {
            const endpointUrl = Config.apiUrl + 'login';
            const data = await this.getUserDataFromDataset();
            const enc = new EncryptionModel();
            const dateModel = new DateModel();
            const plain = enc.urlencode(enc.json_encode(data));
            const sign = await enc.sign(plain);

            try {
                this.networkLoader.setState({visible: true});
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
                this.networkLoader.setState({visible: false});

                if (responseJson.status === 'success') {
                    let dataToStore = {};
                    for (let i in this.actualData) {
                        if (this.actualData[i]) {
                            const dataKey = i.indexOf('!') === i.length - 1 ? i.slice(0, -1) : i;
                            dataToStore[dataKey] = data[dataKey];
                        }
                    }

                    const currentTime = (new Date()).getTime();
                    let service = {};

                    if (this.state.isFirstLogin) {
                        service = {
                            app_id: this.state.auth.client_app.app_id,
                            name: this.state.auth.client_app.name,
                            logo: this.state.auth.client_app.logo,
                            domain: this.state.auth.client_app.domain,
                            data: dataToStore,
                            created_at: currentTime,
                            updated_at: currentTime
                        };

                    } else {
                        service = this.services[this.state.auth.client_app.app_id];
                        service.name = this.state.auth.client_app.name;
                        service.logo = this.state.auth.client_app.logo;
                        service.domain = this.state.auth.client_app.domain;
                        service.updated_at = currentTime;
                    }

                    await ServicesModel.saveService(this.state.auth.client_app.app_id, service);
                    this.props.navigation.navigate('Success');
                } else {
                    if (response.status === 401) {
                        DropdownSingleton.get().alertWithType('error', Translator.t('auth.unauthorized_login'), Translator.t('auth.unauthorized_login_message'));
                    } else if (response.status === 403) {
                        DropdownSingleton.get().alertWithType('error', Translator.t('auth.non_confirmed_email'), Translator.t('auth.non_confirmed_email_message'));
                    } else if (response.status === 404) {
                        DropdownSingleton.get().alertWithType('error', Translator.t('auth.invalid_token'), Translator.t('auth.token_not_found'));
                    } else if (response.status === 423) {
                        UserModel.logout(this.props.navigation);
                    } else {
                        DropdownSingleton.get().alertWithType('error', Translator.t('auth.unknown_error'), Translator.t('auth.error_login'));
                    }

                    const resetAction = StackActions.reset({
                        index: 0,
                        actions: [NavigationActions.navigate({
                            routeName: 'Home'
                        })],
                    });
                    this.props.navigation.dispatch(resetAction);
                }
            } catch (error) {}
        }
    };

    onUpdateData = (data) => {
        this.actualData[data] = !this.actualData[data];
    };

    render() {
        let content;
        if (this.state.auth === null) {
            content = <NetworkLoader visible={true} />;
        } else {
            let data = [];

            if (this.state.isFirstLogin) {
                for (let i = 0; i < this.state.auth.client_app.data.length; i++) {
                    data.push({key: this.state.auth.client_app.data[i]});
                }
            } else {
                for (let i in this.services[this.state.auth.client_app.app_id].data) {
                    data.push({key: i});
                }
            }

            content =
                <ScrollView style={styles.scrollViewContainer}>
                    <View style={styles.authHeader}>
                        <Image source={{uri: this.state.auth.client_app.logo}} style={styles.appIcon} />
                        <Text style={styles.logInto}>{Translator.t('auth.about_to_log')}</Text>
                        <Text style={styles.appName}>{this.state.auth.client_app.name}</Text>
                    </View>
                    <AuthDataList
                        style={styles.data}
                        domain={this.state.auth.client_app.domain}
                        data={data}
                        isFirstLogin={this.state.isFirstLogin}
                        onAccept={this.onAcceptLogin}
                        onUpdate={this.onUpdateData}
                    />
                </ScrollView>
            ;
        }

        return (
            <View style={styles.container}>
                <DarkStatusBar/>
                <NetworkLoader ref={ref => this.networkLoader = ref} />
                <AndroidBiometricPrompt ref={ref => this.androidPrompt = ref}/>
                {content}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollViewContainer: {
        flex: 1,
    },
    loadingText: {
        textAlign: 'center'
    },
    data: {
        paddingLeft: 70,
        paddingRight: 70,
        paddingBottom: 30,
        marginTop: 20,
        alignItems: 'center'
    },
    authHeader: {
        backgroundColor: '#3498DB',
        width: '100%',
        alignItems: 'center'
    },
    appIcon: {
        height: 100,
        width: 100,
        borderRadius: 50,
        marginTop: 20
    },
    logInto: {
        marginTop: 20,
        paddingLeft: 70,
        paddingRight: 70,
        fontWeight: '200',
        color: '#fff',
        fontSize: 20,
        textAlign: 'center'
    },
    appName: {
        marginTop: 20,
        fontWeight: '600',
        color: '#fff',
        fontSize: 20,
        paddingBottom: 30
    }
});
