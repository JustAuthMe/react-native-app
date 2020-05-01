import React from 'react';
import {
    StyleSheet,
    View,
    Image,
    TouchableOpacity,
    TextInput,
    AsyncStorage,
    Platform,
    ScrollView,
    Dimensions
} from 'react-native';
import { WebView } from 'react-native-webview';
import { SplashScreen } from 'expo';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import LaunchFooter from "../components/LaunchFooter";
import ContinueButton from "../components/ContinueButton";
import Config from "../constants/Config";
import LightStatusBar from "../components/LightStatusBar";
import { StackActions, NavigationActions } from 'react-navigation';
import {DropdownSingleton} from "../models/DropdownSingleton";
import Swiper from 'react-native-swiper';
import ExplanationTitle from "../components/ExplanationTitle";
import NetworkLoader from "../components/NetworkLoader";
import KeyboardShift from "../components/KeyboardShift";
import Translator from "../i18n/Translator";
import Text from '../components/JamText'

export default class LaunchScreen extends React.Component {

    static navigationOptions = {
        header: null,
    };

    state = {
        step: this.props.navigation.getParam('step') ? this.props.navigation.state.params.step : 'launch',
        explanationTitle: Translator.t('welcome'),
    };

    constructor(props) {
        super(props);

        this.personnalInfos = {
            avatar: Config.defaultAvatar
        };
        this.passcode = '';
        this.logo = require('../assets/images/logo-new.png');
        this.explanationTitles = [
            Translator.t('welcome'),
            Translator.t('how_it_works'),
            Translator.t('biometrics_rocks'),
            Translator.t('privacy_matters'),
            Translator.t('ready_go')
        ];

        this.isLoggedIn().then(loggedIn => {
            SplashScreen.hide();
            if (loggedIn && this.state.step === 'launch') {
                this.props.navigation.navigate('Main');
            }
        });
    }

    isLoggedIn = async () => {
        const email = await AsyncStorage.getItem('email');
        const pubkey = await SecureStore.getItemAsync(Config.storageKeys.publicKey);
        const privkey = await SecureStore.getItemAsync(Config.storageKeys.privateKey);
        const jam_id = await SecureStore.getItemAsync(Config.storageKeys.jamID);

        return email !== null && pubkey !== null && privkey !== null && jam_id !== null;
    };

    hasInfos = async () => {
        const email = await AsyncStorage.getItem('email');
        if (email === Config.appleEmail) {
            await AsyncStorage.setItem('firstname', 'John');
            await AsyncStorage.setItem('lastname', 'Appleseed');
            await AsyncStorage.setItem('birthdate', '01/01/1970');
        }

        const firstname = await AsyncStorage.getItem('firstname');
        const lastname = await AsyncStorage.getItem('lastname');
        const birthdate = await AsyncStorage.getItem('birthdate');
        const avatar = await AsyncStorage.getItem('avatar');
        if (avatar === null) {
            await AsyncStorage.setItem('avatar', Config.defaultAvatar);
        }

        return firstname !== null && lastname !== null && birthdate !== null;
    };

    onInputChange(key, value) {
        this.personnalInfos[key] = value;
        this.continueBtn.setState({
            disabled: this.isEmpty(key)
        });
    }

    isEmpty(key) {
        return !this.personnalInfos[key] || this.personnalInfos[key] === '';
    }

    storeValue(key, nextStep) {
        if (this.isEmpty(key)) {
            return;
        }

        AsyncStorage.setItem(key, this.personnalInfos[key], () => {
            if (nextStep === 'done') {
                this.networkLoader.setState({visible: true});
                this.register().then(registered => {
                    this.networkLoader.setState({visible: false});

                    if (registered) {
                        const resetAction = StackActions.reset({
                            index: 0,
                            actions: [NavigationActions.navigate({
                                routeName: 'LaunchScreen',
                                params: {
                                    step: nextStep
                                }
                            })],
                        });
                        this.props.navigation.dispatch(resetAction);
                    }
                });
            } else if (key === 'email') {
                this.networkLoader.setState({visible: true});
                fetch(
                    Config.apiUrl + 'applogin/request',
                    {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            email: this.personnalInfos[key]
                        })
                    }
                ).then(async response => {
                    this.networkLoader.setState({visible: false});

                    if (response.status === 200) {
                        this.props.navigation.push('LaunchScreen', {step: 'login'});
                    } else if (response.status === 400) {
                        DropdownSingleton.get().alertWithType('error',  Translator.t('launch.error.invalid_email'),  Translator.t('launch.error.enter_valid_email'));
                    } else if (response.status === 404) {
                        this.props.navigation.push('LaunchScreen', {step: 'firstname'});
                    } else if (response.status === 429) {
                        const responseJson = await response.json();
                        if (responseJson.message.match(/code/)) {
                            DropdownSingleton.get().alertWithType('error', Translator.t('launch.error.anti_spam'),  Translator.t('launch.error.anti_spam_message.email_code'));
                        } else {
                            DropdownSingleton.get().alertWithType('error', Translator.t('launch.error.anti_spam'),  Translator.t('error_too_many'));
                        }
                    } else {
                        DropdownSingleton.get().alertWithType(
                            'error',
                            Translator.t('launch.error.unknown'),
                            Translator.t('launch.error.unknown_message', {
                                code: response.status,
                                action: Translator.t('launch.action.email_check')
                            }));
                    }
                });
            } else {
                this.props.navigation.push('LaunchScreen', {step: nextStep});
            }

        });
    }

    async onMessage(message) {
        const eventData = message.nativeEvent.data;
        const data = Platform.OS === 'ios' ?
            JSON.parse(decodeURIComponent(decodeURIComponent(eventData))) :
            JSON.parse(eventData);

        // Storing keypair
        await SecureStore.setItemAsync(Config.storageKeys.publicKey, data.x, {
            keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
        });
        const pubkey = await SecureStore.getItemAsync(Config.storageKeys.publicKey);

        await SecureStore.setItemAsync(Config.storageKeys.privateKey, data.y, {
            keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
        });
    }

    async register() {
        const pubkey = await SecureStore.getItemAsync(Config.storageKeys.publicKey);
        const email = await AsyncStorage.getItem('email');
        const endpointUrl = Config.apiUrl + 'register';

        try {
            let response = await fetch(
                endpointUrl,
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        pubkey: pubkey,
                        email: email
                    })
                }
            );
            let responseJson = await response.json();
            if (responseJson.status === 'success') {
                await SecureStore.setItemAsync(Config.storageKeys.jamID, responseJson.user.username, {
                    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
                });

                return true;
            }

            let step  = '';
            if (response.status === 400) {
                DropdownSingleton.get().alertWithType('error', Translator.t('launch.error.http', {code:400}), Translator.t('launch.error.http_message', {code:400}));
            } else if (response.status === 409) {
                DropdownSingleton.get().alertWithType('error', Translator.t('launch.error.already_member'), Translator.t('launch.error.account_already_existing'));
                step = 'login';
            } else if (response.status === 429) {
                DropdownSingleton.get().alertWithType('error', Translator.t('launch.error.anti_spam'), Translator.t('launch.error.anti_spam_message.register'));
            }

            const resetAction = StackActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({
                    routeName: 'LaunchScreen',
                    params: {
                        step: step
                    }
                })],
            });
            this.props.navigation.dispatch(resetAction);

            return false;
        } catch (error) {
            return false;
        }
    }

    login = async () => {
        this.networkLoader.setState({visible: true});
        const email = await AsyncStorage.getItem('email');
        const pubkey = await SecureStore.getItemAsync(Config.storageKeys.publicKey);

        const response = await fetch(
            Config.apiUrl + 'applogin/challenge',
            {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    passcode: this.passcode,
                    pubkey: pubkey
                })
            }
        );

        const responseJson = await response.json();
        this.networkLoader.setState({visible: false});

        if (response.status === 200) {
            await SecureStore.setItemAsync(Config.storageKeys.jamID, responseJson.jam_id, {
                keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
            });
            await AsyncStorage.setItem(Config.servicesKey, JSON.stringify({}));

            this.hasInfos().then(hasInfos => {
                if (hasInfos) {
                    this.props.navigation.navigate('Main');
                } else {
                    this.props.navigation.navigate('Login', {login: true});
                }
            });
        } else if (response.status === 403) {
            DropdownSingleton.get().alertWithType('error', Translator.t('launch.error.wrong_passcode'), Translator.t('try_again'));
        } else if (response.status === 429) {
            DropdownSingleton.get().alertWithType('error', Translator.t('launch.error.anti_spam'), Translator.t('error_too_many'));
        } else {
            DropdownSingleton.get().alertWithType(
                'error',
                Translator.t('launch.error.unknown'),
                Translator.t('launch.error.unknown_message', {
                    code: response.status,
                    action: Translator.t('launch.action.applogin_challenge')
                })
            );
        }
    };

    finish = () => {
        AsyncStorage.setItem(Config.servicesKey, JSON.stringify({}), () => {});
        AsyncStorage.setItem('birthdate', '');
        AsyncStorage.setItem('avatar', Config.defaultAvatar);
        this.props.navigation.navigate('Main');
    };

    render() {
        switch (this.state.step) {
            case 'explanation':
                return (
                    <View style={{
                        ...styles.container,
                        justifyContent: 'space-between'
                    }}>
                        <LightStatusBar/>
                        <ExplanationTitle ref={ref => this.explanationTitle = ref} style={styles.welcomeText} text={this.explanationTitles[0]}/>
                        <View style={styles.swiperContainer}>
                            <Swiper
                                activeDotColor={'#555'}
                                autoplay={true}
                                autoplayTimeout={15}
                                removeClippedSubviews={false}
                                onIndexChanged={(index) => {
                                    this.explanationTitle.setState({text: this.explanationTitles[index]});
                                }}
                            >
                                <View style={styles.swipablePage}>
                                    <Image source={require('../assets/images/undraw/celebrating.png')} style={styles.pageImage}/>
                                    <Text style={styles.pageText}>
                                        {Translator.t('launch.explanation1')}
                                    </Text>
                                </View>
                                <View style={styles.swipablePage}>
                                    <Image source={require('../assets/images/undraw/accept_terms.png')} style={styles.pageImage}/>
                                    <Text style={styles.pageText}>
                                        {Translator.t('launch.explanation2')}
                                    </Text>
                                </View>
                                <View style={styles.swipablePage}>
                                    <Image source={require('../assets/images/undraw/confirmed.png')} style={styles.pageImage}/>
                                    <Text style={styles.pageText}>
                                        {Translator.t('launch.explanation3')}
                                    </Text>
                                </View>
                                <View style={styles.swipablePage}>
                                    <Image source={require('../assets/images/undraw/privacy.png')} style={styles.pageImage}/>
                                    <Text style={styles.pageText}>
                                        {Translator.t('launch.explanation4')}
                                    </Text>
                                </View>
                                <View style={styles.swipablePage}>
                                    <Image source={require('../assets/images/undraw/done.png')} style={styles.pageImage}/>
                                    <Text style={styles.pageText}>
                                        {Translator.t('launch.explanation5')}
                                    </Text>
                                </View>
                            </Swiper>
                        </View>
                        <ContinueButton
                            text={Translator.t('lets_go')}
                            ref={ref => this.continueBtn = ref}
                            onPress={() => this.props.navigation.push('LaunchScreen', {step: 'email'})}
                            marginTop={30}
                        />
                        <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                            <Text style={styles.swipeBack}>{Translator.t('not_now')}</Text>
                        </TouchableOpacity>
                    </View>
                );

            case 'email':
                return (
                    <KeyboardShift>
                        {() => (
                            <View style={styles.container}>
                                <LightStatusBar/>
                                <NetworkLoader ref={ref => this.networkLoader = ref} />
                                <Image style={styles.logo} source={this.logo}/>
                                <Text style={styles.baseline}>{Translator.t('launch.email')}</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder={Translator.t('placeholders.email')}
                                    placeholderTextColor={"rgba(255,255,255,.5)"}
                                    returnKeyType={"done"}
                                    autoCorrect={false}
                                    spellCheck={false}
                                    autoCapitalize={"none"}
                                    textContentType={"emailAddress"}
                                    keyboardType={"email-address"}
                                    clearButtonMode={"always"}
                                    onChangeText={(text) => this.onInputChange('email', text)}

                                />
                                <ContinueButton ref={ref => this.continueBtn = ref} disabled={true} onPress={() => this.storeValue('email')} />
                                <LaunchFooter />
                            </View>
                        )}
                    </KeyboardShift>
                );

            case 'login':
                return (
                    <KeyboardShift>
                        {() => (
                            <View style={styles.container}>
                                <LightStatusBar/>
                                <NetworkLoader ref={ref => this.networkLoader = ref} />
                                <Image style={styles.logo} source={this.logo}/>
                                <Text style={styles.baseline}>{Translator.t('launch.enter_code')}</Text>
                                <TextInput
                                    style={{
                                        ...styles.textInput,
                                        fontSize: 36,
                                        textAlign: 'center',
                                        letterSpacing: 3,
                                        marginTop:20
                                    }}
                                    placeholder={"123456"}
                                    placeholderTextColor={"rgba(255,255,255,.5)"}
                                    returnKeyType={'done'}
                                    autoCorrect={false}
                                    spellCheck={false}
                                    autoFocus={true}
                                    clearButtonMode={'never'}
                                    keyboardType={'numeric'}
                                    maxLength={6}
                                    textContentType={'oneTimeCode'}
                                    onChangeText={text => {
                                        this.passcode = text;
                                        this.continueBtn.setState({
                                            disabled: text === ''
                                        });
                                    }}
                                />
                                <ContinueButton text={'Login'} ref={ref => this.continueBtn = ref} disabled={true} onPress={() => this.login()} />
                                <View style={styles.webview}>
                                    <WebView
                                        source={{uri: 'https://init.justauth.me'}}
                                        onMessage={msg => this.onMessage(msg)}
                                        useWebKit={true}
                                    />
                                </View>
                                <LaunchFooter />
                            </View>
                        )}
                    </KeyboardShift>
                );

            case 'firstname':
                return (
                    <KeyboardShift>
                        {() => (
                            <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
                                <LightStatusBar/>
                                <Image style={styles.logo} source={this.logo}/>
                                <Text style={styles.baseline}>{Translator.t('launch.firstname')}</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder={Translator.t('placeholders.firstname')}
                                    placeholderTextColor={"rgba(255,255,255,.5)"}
                                    returnKeyType={"done"}
                                    autoCorrect={false}
                                    spellCheck={false}
                                    textContentType={"givenName"}
                                    clearButtonMode={"always"}
                                    onChangeText={(text) => this.onInputChange('firstname', text)}
                                />
                                <ContinueButton ref={ref => this.continueBtn = ref} disabled={true} onPress={() => this.storeValue('firstname', 'lastname')} />
                                <LaunchFooter />
                            </ScrollView>
                        )}
                    </KeyboardShift>
                );

            case 'lastname':
                return (
                    <KeyboardShift>
                        {() => (
                            <View style={styles.container}>
                                <LightStatusBar/>
                                <NetworkLoader ref={ref => this.networkLoader = ref} />
                                <Image style={styles.logo} source={this.logo}/>
                                <Text style={styles.baseline}>{Translator.t('launch.lastname')}</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder={Translator.t('placeholders.lastname')}
                                    placeholderTextColor={"rgba(255,255,255,.5)"}
                                    returnKeyType={"done"}
                                    autoCorrect={false}
                                    spellCheck={false}
                                    textContentType={"familyName"}
                                    clearButtonMode={"always"}
                                    onChangeText={(text) => this.onInputChange('lastname', text)}
                                />
                                <ContinueButton ref={ref => this.continueBtn = ref} disabled={true} onPress={() => this.storeValue('lastname', 'done')} />
                                <LaunchFooter />
                                <View style={styles.webview}>
                                    <WebView
                                        source={{uri: 'https://init.justauth.me'}}
                                        onMessage={msg => this.onMessage(msg)}
                                        useWebKit={true}
                                    />
                                </View>
                            </View>
                        )}
                    </KeyboardShift>
                );

            case 'done':
                return (
                    <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
                        <LightStatusBar/>
                        <Text style={{
                            color: '#fff',
                            fontSize: 30,
                            fontWeight: '600',
                            textAlign: 'center',
                            marginTop: isZoomed ? 20 : isBorderless ? 100 : 70
                        }}>{Translator.t('congratulations')}</Text>
                        <Text style={{
                            fontSize: isZoomed ? 70 : 100,
                            marginTop: 50
                        }}>🥳</Text>
                        <Text style={{
                            color: '#fff',
                            fontSize: 20,
                            lineHeight: 30,
                            paddingLeft: 15,
                            paddingRight: 15,
                            textAlign: 'center',
                            marginTop: 30
                        }}>{Translator.t('launch.success')}</Text>
                        <ContinueButton text={Translator.t('lets_go')} ref={ref => this.continueBtn = ref} onPress={this.finish} marginTop={50} />
                    </ScrollView>
                );

            default:
                return (
                    <View style={styles.container}>
                        <LightStatusBar/>
                        <Image style={styles.logo} source={this.logo}/>
                        <Text style={styles.baseline}>{Translator.t('join_revolution')}</Text>
                        <TouchableOpacity style={styles.startBtn} onPress={() => this.props.navigation.push('LaunchScreen', {step: 'explanation'})}>
                            <Ionicons name="ios-arrow-forward" size={56} color="white" style={styles.arrowIcon}/>
                        </TouchableOpacity>
                        <LaunchFooter />
                    </View>
                );
        }
    }
}
const isBorderless = Platform.OS === 'ios' && Constants.statusBarHeight > 20;
const isZoomed = Platform.OS === 'ios' && Dimensions.get('window').height < 667;
const styles = StyleSheet.create({
    scrollView: {
        backgroundColor: '#3598DB'
    },
    scrollViewContainer: {
        backgroundColor: '#3598DB',
        width: '100%',
        alignItems: 'center',
        paddingTop: Constants.statusBarHeight
    },
    container: {
        backgroundColor: '#3598DB',
        width: '100%',
        height: Dimensions.get('screen').height,
        alignItems: 'center',
        paddingTop: Constants.statusBarHeight
    },
    logo: {
        marginTop: isBorderless ? 100 : (isZoomed ? 50 : 80),
        width: '100%',
        height: isBorderless ? 170 : 120,
        resizeMode: 'contain'
    },
    baseline: {
        fontSize: 24,
        textAlign: 'center',
        color: 'white',
        fontWeight: '300',
        marginTop: 50,
        marginRight: 10,
        marginLeft: 10
    },
    startBtn: {
        width: 100,
        height: 100,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: 'white',
        borderRadius: 50,
        marginTop: 40,
        justifyContent: 'center',
        alignItems: 'center'
    },
    arrowIcon: {
        marginTop: 5,
        marginLeft: 5
    },
    textInput: {
        width: '70%',
        height: 50,
        marginTop: 40,
        color: 'white',
        borderBottomColor: 'white',
        borderBottomWidth: 1,
        fontWeight: '300',
        fontSize: 22
    },
    continueBtn: {
        marginTop: 60,
        paddingTop: 5,
        paddingRight: 20,
        paddingBottom: 5,
        paddingLeft: 20,
        borderColor: 'white',
        borderWidth: 1,
        borderRadius: 5,
        fontSize: 22,
        fontWeight: '300',
        color: 'white'
    },
    inputTouchable: {
        width: '100%',
        alignItems: 'center'
    },
    warningTextContainer: {
        marginTop: 30,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        width: '80%',
    },
    warningText: {
        fontSize: 18,
        color: '#555',
        textAlign: 'center',
    },
    avatarContainer: {
        marginTop: 20
    },
    avatar: {
        height: 120,
        width: 120,
        borderRadius: 60
    },
    avatarIgnore: {
        color: '#FFFFFF',
        textAlign: 'center',
        marginTop: 40
    },
    webview: {
        height: 0,
        width: 0
    },
    welcomeText: {
        fontSize: 32,
        color: 'white',
        fontWeight: '600',
        marginTop: isBorderless ? 80 : 30
    },
    swiperContainer: {
        width: '80%',
        height: isZoomed ? 330 : 400,
        backgroundColor: 'white',
        borderRadius: 20,
    },
    swipablePage: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'flex-start'
    },
    pageImage: {
        height: isZoomed ? '50%' : '60%',
        resizeMode: 'contain'
    },
    pageText: {
        marginTop: 20,
        fontSize: 15,
        textAlign: 'center',
        color: '#555'
    },
    swipeBack: {
        color: '#A7CADD',
        textAlign: 'center',
        marginTop: 10,
        marginBottom: isBorderless ? 50 : 30
    }
});
