import React from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
    Button,
    AsyncStorage,
    Alert
} from 'react-native';
import {
    WebBrowser,
    SecureStore,
    BarCodeScanner,
    Linking
} from 'expo';

import Config from "../constants/Config";

export default class HomeScreen extends React.Component {
    static navigationOptions = {
        header: null,
    };

    state = {
        user: {}
    };

    constructor(props) {
        super(props);
        this.isBarCodeScannerEnabled = true;
        this._bootstrapAsync().then();
    }

    async _bootstrapAsync() {
        const user = {
            firstname: await AsyncStorage.getItem('firstname'),
            lastname: await AsyncStorage.getItem('lastname'),
            birthdate: await AsyncStorage.getItem('birthdate'),
            email: await AsyncStorage.getItem('email')
        };
        this.setState({
            user: user
        });
    };

    componentDidMount() {
        Linking.addEventListener('url', this._handleDeepLinkEvent);
        Linking.getInitialURL().then(url => {
            this._authByDeepLink(url);
        });
    }

    _handleDeepLinkEvent = event => {
        this._authByDeepLink(event.url);
    };

    _authByDeepLink(url) {
        if (url && url.indexOf('jam://') === 0) {
            console.log('authentication url: ', url);
            const token = url.replace('jam://', '');
            this.props.navigation.navigate('Auth', {
                token: token
            });
        }
    }

    run() {
        SecureStore.getItemAsync(Config.storageKeys.publicKey).then(value => {
            if (value !== null) {
                console.log(value);
                SecureStore.getItemAsync(Config.storageKeys.privateKey).then(value => {
                    if (value !== null) {
                        console.log(value);
                        SecureStore.getItemAsync(Config.storageKeys.jamID).then(value => {
                            console.log(value);
                        }).catch(err => console.log(err));
                    }
                }).catch(err => console.log(err));
            }
        }).catch(err => console.log(err));
    }

    logout = () => {
        Alert.alert('Are you sure?', '', [
            {text: 'Cancel', onPress: () => {}, style:'cancel'},
            {text: 'OK', onPress: () => {
                    AsyncStorage.multiRemove([
                        Config.initDone.key,
                        'firstname',
                        'lastname',
                        'birthdate',
                        'email'
                    ], async () => {
                        AsyncStorage.getItem(Config.initDone.key).then(value => {
                            console.log('init done at logout:', value);
                        });

                        await SecureStore.deleteItemAsync(Config.storageKeys.publicKey);
                        await SecureStore.deleteItemAsync(Config.storageKeys.privateKey);
                        await SecureStore.deleteItemAsync(Config.storageKeys.jamID);

                        this.props.navigation.navigate('Launch');
                    });
                }}
        ]);
    };

    _handleBarCodeScanned = ({ type, data }) => {
        if (this.isBarCodeScannerEnabled && type === 'org.iso.QRCode') {
            this.isBarCodeScannerEnabled = false;
            this._authByDeepLink(data);

            window.setTimeout(() => {
                this.isBarCodeScannerEnabled = true;
            }, 2000);
        }
    };

    render() {
        return (
            <View style={styles.container}>
                <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                    <View style={styles.welcomeContainer}>
                        <Image
                            source={
                                __DEV__
                                    ? require('../assets/images/robot-dev.png')
                                    : require('../assets/images/robot-prod.png')
                            }
                            style={styles.welcomeImage}
                        />
                    </View>
                    <BarCodeScanner
                        onBarCodeScanned={this._handleBarCodeScanned}
                        style={styles.scanner}
                    />
                    <View style={styles.getStartedContainer}>
                        {this._maybeRenderDevelopmentModeWarning()}
                        <Button title="Display secured infos" onPress={this.run}/>
                        <Text>{this.state.user.firstname}</Text>
                        <Text>{this.state.user.lastname}</Text>
                        <Text>{this.state.user.birthdate}</Text>
                        <Text>{this.state.user.email}</Text>
                        <Button title="Log out" onPress={this.logout}/>
                    </View>
                </ScrollView>
            </View>
        );
    }

    _maybeRenderDevelopmentModeWarning() {
        if (__DEV__) {
            const learnMoreButton = (
                <Text onPress={this._handleLearnMorePress} style={styles.helpLinkText}>
                    Learn more
                </Text>
            );

            return (
                <Text style={styles.developmentModeText}>
                    Development mode is enabled, your app will be slower but you can use useful development
                    tools. {learnMoreButton}
                </Text>
            );
        } else {
            return (
                <Text style={styles.developmentModeText}>
                    You are not in development mode, your app will run at full speed.
                </Text>
            );
        }
    }

    _handleLearnMorePress = () => {
        WebBrowser.openBrowserAsync('https://docs.expo.io/versions/latest/guides/development-mode');
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    developmentModeText: {
        marginBottom: 20,
        color: 'rgba(0,0,0,0.4)',
        fontSize: 14,
        lineHeight: 19,
        textAlign: 'center'
    },
    contentContainer: {
        paddingTop: 30,
        alignItems: 'center'
    },
    welcomeContainer: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20
    },
    welcomeImage: {
        width: 100,
        height: 80,
        resizeMode: 'contain',
        marginTop: 3,
        marginLeft: -10
    },
    getStartedContainer: {
        alignItems: 'center',
        marginHorizontal: 50
    },
    scanner: {
        width: 300,
        height: 300
    }
});
