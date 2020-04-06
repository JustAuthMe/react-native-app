import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    TextInput,
    AsyncStorage,
    Platform,
    Alert,
    ScrollView,
    Dimensions
} from 'react-native';
import { WebView } from 'react-native-webview';
import { SplashScreen } from 'expo';
import * as Icon from '@expo/vector-icons';
import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import LaunchFooter from "../components/LaunchFooter";
import ContinueButton from "../components/ContinueButton";
import Config from "../constants/Config";
import LightStatusBar from "../components/LightStatusBar";
import { StackActions, NavigationActions } from 'react-navigation';
import {DropdownSingleton} from "../models/DropdownSingleton";
import KeyboardShift from "../components/KeyboardShift";
import {DatePickerSingleton} from "../models/DatePickerSingleton";
import Swiper from 'react-native-swiper';
import ExplanationTitle from "../components/ExplanationTitle";
import NetworkLoader from "../components/NetworkLoader";
import Translator from "../i18n/Translator";

export default class LaunchScreen extends React.Component {

    static navigationOptions = {
        header: null,
    };

    state = {
        step: this.props.navigation.getParam('step') ? this.props.navigation.state.params.step : 'launch',
        currentBirthdate: new Date(),
        birthdateInputValue: '',
        generationStatus: Translator.t('launch.generating')+'...',
        avatar: null,
        explanationTitle: Translator.t('welcome'),
        congratsTitle: Translator.t('wait')+'...',
        displayCongrats: false,
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
            if (loggedIn) {
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
                        /*DropdownSingleton.get().alertWithType(
                            'info',
                            'Check your inbox!',
                            'We sent a Passcode to ' + this.state.user.email + '. Enter the received passcode below to recover your account.'
                        );*/
                    } else if (response.status === 400) {
                        DropdownSingleton.get().alertWithType('error',  Translator.t('launch.error.invalid_email'),  Translator.t('launch.error.enter_valid_email'));
                    } else if (response.status === 404) {
                        this.props.navigation.push('LaunchScreen', {step: 'firstname'});
                    } else if (response.status === 429) {
                        const responseJson = await response.json();
                        if (responseJson.message.match(/code/)) {
                            DropdownSingleton.get().alertWithType('error', Translator.t('launch.error.anti_spam'),  Translator.t('launch.error.anti_spam_message.email_code'));
                        } else {
                            DropdownSingleton.get().alertWithType('error', Translator.t('launch.error.anti_spam'),  Translator.t('launch.error.anti_spam.email'));
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

    changeBirthdate() {
        const date = this.state.currentBirthdate;
        const day = (date.getDate() < 10 ? '0' : '') + date.getDate();
        const month = (date.getMonth() + 1 < 10 ? '0' : '') + (date.getMonth() + 1);
        const humanDate = day + '/' + month + '/' + date.getFullYear();
        this.onInputChange('birthdate', humanDate);
        this.setState({
            birthdateInputValue: humanDate
        });
    }

    async onMessageRegister(message) {
        const eventData = message.nativeEvent.data;
        const data = Platform.OS === 'ios' ?
            JSON.parse(decodeURIComponent(decodeURIComponent(eventData))) :
            JSON.parse(eventData);

        // Storing keypair
        await SecureStore.setItemAsync(Config.storageKeys.publicKey, data.x, {
            keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
        });
        await SecureStore.setItemAsync(Config.storageKeys.privateKey, data.y, {
            keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
        });

        this.register().then(registered => {
            if (registered) {
                this.setState({
                    congratsTitle: Translator.t('congratulations'),
                    displayCongrats: true
                });
                this.continueBtn.setState({disabled: false});
            }
        });
    }

    async onMessageLogin(message) {
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
                const jamID = await SecureStore.getItemAsync(Config.storageKeys.jamID);

                return true;
            }

            let step  = '';
            if (response.status === 400) {
                DropdownSingleton.get().alertWithType('error', Translator.t('launch.error.http', {code:400}), Translator.t('launch.error.http_message', {code:400}));
            } else if (response.status === 409) {
                DropdownSingleton.get().alertWithType('error', Translator.t('launch.error.already_member'), Translator.t('launch.error.account_already_existing'));
                step = 'login';
            } else if (response.status === 429) {
                DropdownSingleton.get().alertWithType('error', Translator.t('launch.error.anti_spam'), Translator.t('launch.error.anti_spam_message'));
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
            console.error(error);

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
        this.networkLoader.setState({visible: false});

        const responseJson = await response.json();

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
            DropdownSingleton.get().alertWithType('error', Translator.t('launch.error.anti_spam'), Translator.t('launch.error.anti_spam_message.login'));
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

    lastStep = () => {
        this.props.navigation.push('LaunchScreen', {step: 'done'});
    };

    finish = () => {
        AsyncStorage.setItem(Config.servicesKey, JSON.stringify({}), () => {});

        this.props.navigation.navigate('Main');
    };

    _pickImage = async () => {
        if (Constants.platform.ios) {
            const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
            if (status !== 'granted') {
                DropdownSingleton.get().alertWithType('error', Translator.t('permission_required'), Translator.t('permission.camera_roll'));
                return;
            }
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            base64: true
        });

        if (!result.cancelled) {
            const avatarUri = 'data:image/jpeg;base64,' + result.base64;
            this.personnalInfos['avatar'] = avatarUri;
            this.setState({avatar: avatarUri});
            this.continueBtn.setState({disabled: false});
        }
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
                                    placeholder={"e.g. aiden@pearce.me"}
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
                                        letterSpacing: 50
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
                                        onMessage={msg => this.onMessageLogin(msg)}
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
                                    placeholder={"e.g. Aiden"}
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
                                <Image style={styles.logo} source={this.logo}/>
                                <Text style={styles.baseline}>{Translator.t('launch.lastname')}</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder={"e.g. Pearce"}
                                    placeholderTextColor={"rgba(255,255,255,.5)"}
                                    returnKeyType={"done"}
                                    autoCorrect={false}
                                    spellCheck={false}
                                    textContentType={"familyName"}
                                    clearButtonMode={"always"}
                                    onChangeText={(text) => this.onInputChange('lastname', text)}
                                />
                                <ContinueButton ref={ref => this.continueBtn = ref} disabled={true} onPress={() => this.storeValue('lastname', 'birthdate')} />
                                <LaunchFooter />
                            </View>
                        )}
                    </KeyboardShift>
                );

            case 'birthdate':
                return (
                    <View style={styles.container}>
                        <LightStatusBar/>
                        <Image style={styles.logo} source={this.logo}/>
                        <Text style={styles.baseline}>{Translator.t('launch.birthdate')}</Text>
                        <TouchableOpacity activeOpacity={.5} style={styles.inputTouchable} onPress={() => {
                            DatePickerSingleton.get().open({
                                date: this.state.currentBirthdate,
                                onDateChange: date => this.setState({currentBirthdate: date}),
                                onDone: () => this.changeBirthdate()
                            })
                        }}>
                            <TextInput
                                ref={'birthdateInput'}
                                style={styles.textInput}
                                placeholder={"e.g. 02/05/1974"}
                                placeholderTextColor={"rgba(255,255,255,.5)"}
                                returnKeyType={"done"}
                                autoCorrect={false}
                                spellCheck={false}
                                editable={false}
                                onChangeText={(text) => this.onInputChange('birthdate', text)}
                                pointerEvents={"none"}
                                value={this.state.birthdateInputValue}
                            />
                        </TouchableOpacity>
                        <ContinueButton ref={ref => this.continueBtn = ref} disabled={true} onPress={() => this.storeValue('birthdate', 'avatar')} />
                        <LaunchFooter />
                    </View>
                );

            case 'avatar':
                return (
                    <View style={styles.container}>
                        <LightStatusBar/>
                        <Image style={styles.logo} source={this.logo}/>
                        <Text style={styles.baseline}>{Translator.t('launch.avatar')}</Text>
                        <TouchableOpacity onPress={() => this._pickImage()} style={styles.avatarContainer}>
                            <Image source={{uri: this.state.avatar !== null ? this.state.avatar : '../assets/images/user.png'}} style={{
                                ...styles.avatar,
                                display: this.state.avatar !== null ? 'flex' : 'none',
                            }} />
                            <Icon.Ionicons
                                name={'ios-cloud-upload'}
                                size={120}
                                color={'#FFFFFF'}
                                 style={{
                                     display: this.state.avatar === null ? 'flex' : 'none'
                                 }}
                            />
                        </TouchableOpacity>
                        <ContinueButton ref={ref => this.continueBtn = ref} disabled={true} onPress={() => this.storeValue('avatar', 'done')} marginTop={20} />
                        <TouchableOpacity onPress={() => Alert.alert(Translator.t('launch.avatar_confirm'), '', [
                            {text: Translator.t('cancel'), onPress: () => {}, style:'cancel'},
                            {text: Translator.t('ok'), onPress: () => this.storeValue('avatar', 'done')}
                        ])}>
                            <Text style={styles.avatarIgnore}>{Translator.t('ignore_step')}</Text>
                        </TouchableOpacity>
                        <LaunchFooter />
                    </View>
                );

            case 'done':
                return (
                    <View style={styles.container}>
                        <LightStatusBar/>
                        <Image style={styles.logo} source={this.logo}/>
                        <Text style={styles.baseline}>{this.state.congratsTitle /*Congratulations!*/}</Text>
                        <View style={{...styles.warningTextContainer, display: this.state.displayCongrats ? 'flex' : 'none'}}>
                            <Text style={styles.warningText}>
                                {Translator.t('launch.success')}
                            </Text>
                        </View>
                        <ContinueButton text={'Got it!'} ref={ref => this.continueBtn = ref} disabled={true} onPress={this.finish} marginTop={30} />
                        <View style={styles.webview}>
                            <WebView
                                source={{uri: 'https://init.justauth.me'}}
                                onMessage={msg => this.onMessageRegister(msg)}
                                useWebKit={true}
                            />
                        </View>
                    </View>
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
    container: {
        backgroundColor: '#3598DB',
        width: '100%',
        height: '100%',
        alignItems: 'center'
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
