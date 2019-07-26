import React from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
    Button,
    AsyncStorage,
    Alert,
    TouchableOpacity
} from 'react-native';
import {
    WebBrowser,
    SecureStore,
    BarCodeScanner,
    Linking,
    Icon,
    Constants
} from 'expo';

import Config from "../constants/Config";
import LightStatusBar from "../components/LightStatusBar";

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
        this.user = {};
    }

    async _bootstrapAsync() {
        this.user = {
            firstname: await AsyncStorage.getItem('firstname'),
            lastname: await AsyncStorage.getItem('lastname'),
            birthdate: await AsyncStorage.getItem('birthdate'),
            email: await AsyncStorage.getItem('email')
        };
        this.setState({
            user: this.user
        });
    };

    componentDidMount() {
        Linking.addEventListener('url', this._handleDeepLinkEvent);
        Linking.getInitialURL().then(url => {
            this._authByDeepLink(url);
        });
        this.props.navigation.addListener("didFocus", () => {
            this._bootstrapAsync().then();
        });
    }

    _handleDeepLinkEvent = event => {
        this._authByDeepLink(event.url);
    };

    _authByDeepLink(url) {
        if (url && url.indexOf(Config.urlScheme) === 0 && url !== Config.urlScheme) {
            console.log('authentication url: ', url);
            const token = url.replace(Config.urlScheme, '');
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
                <LightStatusBar/>
                <ScrollView style={styles.container}>
                    <View style={{
                        backgroundColor: '#3498DB',
                        width: '100%',
                        height: 300,
                        alignItems: 'center',
                        paddingTop: Constants.statusBarHeight > 20 ? 50 : 20
                        }}>
                        <TouchableOpacity onPress={() => Alert.alert('We\'re sorry...', 'This feature isn\'t implemented yet.')}
                          style={{
                            position: 'absolute',
                            top: Constants.statusBarHeight > 20 ? 50 : 20,
                            left: 20
                        }}>
                            <Icon.Ionicons
                                name={'md-switch'}
                                size={26}
                                color={'#FFFFFF'}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={{
                            position: 'absolute',
                            top: Constants.statusBarHeight > 20 ? 50 : 20,
                            right: 20
                        }}>
                            <Icon.Ionicons
                                name={'md-create'}
                                size={26}
                                color={'#FFFFFF'}
                            />
                        </TouchableOpacity>
                        <Image source={require('../assets/images/user.png')} style={{
                            height: 100,
                            width: 100,
                            borderRadius: 50
                        }} />
                        <Text style={{
                            paddingTop: 20,
                            fontSize: 26,
                            color: '#FFFFFF'
                        }}>{this.state.user.firstname + ' ' + this.state.user.lastname}</Text>
                        <TouchableOpacity style={{
                            flexDirection: 'row',
                            marginTop: 30,
                            width: 170,
                            height: 50,
                            backgroundColor: '#1459E3',
                            borderRadius: 5,
                            alignItems: 'center',
                            justifyContent: 'center',
                            shadowColor: "#000",
                            shadowOffset: {
                                width: 0,
                                height: 2,
                            },
                            shadowOpacity: 0.25,
                            shadowRadius: 2,
                            elevation: 5,
                        }}>
                            <Icon.Ionicons
                                name={'ios-qr-scanner'}
                                size={22}
                                color={'#FFFFFF'}
                            />
                            <Text style={{
                                color: '#FFFFFF',
                                paddingLeft: 10,
                                fontSize: 18
                            }}>Authenticate</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        );
        /*return (
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
        );*/
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

const isBorderless = Constants.statusBarHeight > 20;
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
