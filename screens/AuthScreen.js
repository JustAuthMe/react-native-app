import React from 'react';
import {
    View,
    Text,
    StyleSheet
} from 'react-native';
import {
    LocalAuthentication
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
        data: []
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
            const response = await fetch(endpoint);
            const responseJson = await response.json();
            console.log(responseJson);
            if (responseJson.auth.data) {
                this.setState({
                    data: responseJson.auth.data
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
        // TODO: Write function
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
            const data = this.getUserDataFromDataset();
            const enc = new Encryption();
            const sign = await enc.sign(data);
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
                )
            }
        } else {
            console.log('Forbidden');
        }
    };

    render() {
        let content;
        if (this.state.data.length === 0) {
            content = <Text style={styles.loadingText}>Loading authentication details...</Text>;
        } else {
            content = <AuthDataList
                style={styles.data}
                data={this.state.data}
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

    },
    data: {

    }
});
