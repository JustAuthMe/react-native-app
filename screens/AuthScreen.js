import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    AsyncStorage,
    ScrollView
} from 'react-native';
import {
    LocalAuthentication,
    SecureStore
} from 'expo';
import {
    StackActions,
    NavigationActions
} from 'react-navigation';
import AuthDataList from "../components/AuthDataList";
import Config from "../constants/Config";
import {Encryption} from "../models/Encryption";
import DarkStatusBar from "../components/DarkStatusBar";

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
            const plain = encodeURIComponent(JSON.stringify(data));
            const enc = new Encryption();
            const sign = await enc.sign(plain);
            console.log(data);
            console.log(plain);
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
                            plain: plain,
                            data: data,
                            sign: sign
                        })
                    }
                );

                const responseJson = await response.json();
                console.log(responseJson);

                if (responseJson.status === 'success') {
                    alert('Login succeed!');
                    const resetAction = StackActions.reset({
                        index: 0,
                        actions: [NavigationActions.navigate({ routeName: 'Home' })],
                    });
                    this.props.navigation.dispatch(resetAction);
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
            let data = [];
            for (let i = 0; i < this.state.auth.data.length; i++) {
                data.push({key: this.state.auth.data[i]});
            }
            content =
                <ScrollView style={styles.container}>
                    <View style={styles.authHeader}>
                        <Image source={require('../assets/images/client.png')} style={styles.appIcon} />
                        <Text style={styles.logInto}>You're about to log into</Text>
                        <Text style={styles.appName}>{this.state.auth.client_app.name}</Text>
                    </View>
                    <AuthDataList
                        style={styles.data}
                        domain={this.state.auth.client_app.domain}
                        data={data}
                        onAccept={this.onAcceptLogin}
                    />
                </ScrollView>
            ;
        }

        return (
            <View style={styles.container}>
                <DarkStatusBar/>
                {content}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    loadingText: {
        textAlign: 'center'
    },
    data: {
        paddingLeft: 70,
        paddingRight: 70,
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
