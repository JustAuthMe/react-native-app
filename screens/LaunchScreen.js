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

export default class LaunchScreen extends React.Component {

    static navigationOptions = {
        header: null,
    };

    state = {
        step: this.props.navigation.getParam('step') ? this.props.navigation.state.params.step : 'launch',
        currentBirthdate: new Date(),
        birthdateInputValue: '',
        generationStatus: 'Generating...',
        avatar: null,
        explanationTitle: 'Welcome',
        congratsTitle: 'Please wait...',
        displayCongrats: false
    };

    constructor(props) {
        super(props);
        this.personnalInfos = {
            avatar: Config.defaultAvatar
        };
        this.logo = require('../assets/images/logo-new.png');
        this.explanationTitles = [
            'Welcome',
            'How it works?',
            'Biometrics rocks',
            'Privacy matters',
            'Ready to go!'
        ];

        AsyncStorage.getItem(Config.initDone.key).then(value => {
            SplashScreen.hide();
            if (value === Config.initDone.value) {
                this.props.navigation.navigate('Main');
            }
        });
        console.log('window height:', Dimensions.get('window').height);
        console.log('status bar height:', Constants.statusBarHeight);
    }

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
            AsyncStorage.getItem(key).then(value => {
                console.log(key + ':', value);
            });
            if (nextStep !== 'done') {
                this.props.navigation.push('LaunchScreen', {step: nextStep});
            } else {
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

    async onMessage(message) {
        console.log(message);
        const eventData = message.nativeEvent.data;
        const data = Platform.OS === 'ios' ?
            JSON.parse(decodeURIComponent(decodeURIComponent(eventData))) :
            JSON.parse(eventData);

        console.log(data.x);
        console.log(data.y);

        // Storing keypair
        await SecureStore.setItemAsync(Config.storageKeys.publicKey, data.x, {
            keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
        });
        await SecureStore.setItemAsync(Config.storageKeys.privateKey, data.y, {
            keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
        });

        console.log('Took ' + data.t + ' seconds');

        this.register().then(registered => {
            if (registered) {
                this.setState({
                    congratsTitle: 'Congratulations!',
                    displayCongrats: true
                });
                this.continueBtn.setState({disabled: false});
            }
        });
    }

    async register() {
        const pubkey = await SecureStore.getItemAsync(Config.storageKeys.publicKey);
        const email = await AsyncStorage.getItem('email');
        const endpointUrl = Config.apiUrl + 'register';
        console.log('sent pubkey: ', pubkey);
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
            console.log(responseJson);
            if (responseJson.status === 'success') {
                await SecureStore.setItemAsync(Config.storageKeys.jamID, responseJson.user.username, {
                    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
                });
                const jamID = await SecureStore.getItemAsync(Config.storageKeys.jamID);
                console.log(jamID);

                return true;
            }

            let step  = '';
            if (response.status === 400) {
                DropdownSingleton.get().alertWithType('error', 'A HTTP 400 error occured', 'Please contact support at support@justauth.me mentionning the error code 400 at registration');
            } else if (response.status === 409) {
                DropdownSingleton.get().alertWithType('error', 'Already member', 'You already have a JustAuth.Me account, please log in');
                step = ''; // TODO redirect to Login screen
            } else if (response.status === 429) {
                DropdownSingleton.get().alertWithType('error', 'Anti-spam', 'Please try again in 30 seconds, this an anti-spam measure');
            }

            console.log('error retreiving username: ' + response.status);

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

    lastStep = () => {
        this.props.navigation.push('LaunchScreen', {step: 'done'});
    };

    finish = () => {
        AsyncStorage.setItem(Config.initDone.key, Config.initDone.value, () => {
            AsyncStorage.getItem(Config.initDone.key, (value) => {
                console.log('init done at end of launch:', value);
            });
            AsyncStorage.setItem(Config.servicesKey, JSON.stringify({}), () => {
                AsyncStorage.getItem(Config.servicesKey, (value) => {
                    console.log('services list:', value);
                });
            });

            this.props.navigation.navigate('Main');
        });
    };

    _pickImage = async () => {
        if (Constants.platform.ios) {
            const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
            if (status !== 'granted') {
                DropdownSingleton.get().alertWithType('error', 'Permission required', 'Sorry, you need to grant Camera roll permission to chose your avatar!');
                return;
            }
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            base64: true
        });

        console.log(result);
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
                                        Welcome to JustAuth.Me! This app is meant to help you login to any website or
                                        app with the "Sign in with JAM" button, without a single password.
                                    </Text>
                                </View>
                                <View style={styles.swipablePage}>
                                    <Image source={require('../assets/images/undraw/accept_terms.png')} style={styles.pageImage}/>
                                    <Text style={styles.pageText}>
                                        To login to apps or websites, just to click the "Sign in with JAM" button and
                                        accept the login from the App, where you can check which informations you want
                                        to share.
                                    </Text>
                                </View>
                                <View style={styles.swipablePage}>
                                    <Image source={require('../assets/images/undraw/confirmed.png')} style={styles.pageImage}/>
                                    <Text style={styles.pageText}>
                                        From there, you will be prompt to check your biometrical print (if your device
                                        is equiped) and the informations needed to log you will be automatically sent.
                                    </Text>
                                </View>
                                <View style={styles.swipablePage}>
                                    <Image source={require('../assets/images/undraw/privacy.png')} style={styles.pageImage}/>
                                    <Text style={styles.pageText}>
                                        Your personal informations are stored only on your device and will never be
                                        stored on our servers. If we can't access them, we can't sell them to anyone.
                                    </Text>
                                </View>
                                <View style={styles.swipablePage}>
                                    <Image source={require('../assets/images/undraw/done.png')} style={styles.pageImage}/>
                                    <Text style={styles.pageText}>
                                        We assume that your phone is the best way to authenticate yourself. Never
                                        remember a single password or fill a boring register form again.{"\n"}This is
                                        JustAuth.Me.
                                    </Text>
                                </View>
                            </Swiper>
                        </View>
                        <ContinueButton
                            text={'Let\'s go!'}
                            ref={ref => this.continueBtn = ref}
                            onPress={() => this.props.navigation.push('LaunchScreen', {step: 'email'})}
                            marginTop={30}
                        />
                        <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                            <Text style={styles.swipeBack}>Not now</Text>
                        </TouchableOpacity>
                    </View>
                );

            case 'email':
                return (
                    <KeyboardShift>
                        {() => (
                            <View style={styles.container}>
                                <LightStatusBar/>
                                <Image style={styles.logo} source={this.logo}/>
                                <Text style={styles.baseline}>Let's begin with your E-Mail</Text>
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
                                <ContinueButton ref={ref => this.continueBtn = ref} disabled={true} onPress={() => this.storeValue('email', 'firstname')} />
                                <LaunchFooter/>
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
                                <Text style={styles.baseline}>What's your firstname?</Text>
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
                                <LaunchFooter/>
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
                                <Text style={styles.baseline}>And your lastname?</Text>
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
                                <LaunchFooter/>
                            </View>
                        )}
                    </KeyboardShift>
                );

            case 'birthdate':
                return (
                    <View style={styles.container}>
                        <LightStatusBar/>
                        <Image style={styles.logo} source={this.logo}/>
                        <Text style={styles.baseline}>What about your birthdate?</Text>
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
                        <LaunchFooter/>
                    </View>
                );

            case 'avatar':
                return (
                    <View style={styles.container}>
                        <LightStatusBar/>
                        <Image style={styles.logo} source={this.logo}/>
                        <Text style={styles.baseline}>Finally, chose an avatar</Text>
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
                        <TouchableOpacity onPress={() => Alert.alert('Are you sure? You still could update your avatar later.', '', [
                            {text: 'Cancel', onPress: () => {}, style:'cancel'},
                            {text: 'OK', onPress: () => this.storeValue('avatar', 'done')}
                        ])}>
                            <Text style={styles.avatarIgnore}>Ignore this step</Text>
                        </TouchableOpacity>
                    </View>
                );

            case 'address':
                // TODO: Add address screen to launch process
                return (
                    <View style={styles.container}>
                        <LightStatusBar/>
                        <Image style={styles.logo} source={this.logo}/>
                        <Text style={styles.baseline}>Do you have an address?</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder={"e.g. Owl Motel, Parker Square"}
                            placeholderTextColor={"rgba(255,255,255,.5)"}
                            returnKeyType={"done"}
                            autoCorrect={false}
                            spellCheck={false}
                            textContentType={"fullStreetAddress"}
                            clearButtonMode={"always"}
                            onChangeText={(text) => this.onInputChange('address', text)}
                        />
                        <ContinueButton ref={ref => this.continueBtn = ref} disabled={true} onPress={() => this.storeValue('address', 'phone')} />
                        <LaunchFooter/>
                    </View>
                );

            case 'phone':
                // TODO: Add phone number to launch process
                return (
                    <View style={styles.container}>
                        <LightStatusBar/>
                        <Image style={styles.logo} source={this.logo}/>
                        <Text style={styles.baseline}>And a phone number?</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder={"e.g. +14213371994"}
                            placeholderTextColor={"rgba(255,255,255,.5)"}
                            returnKeyType={"done"}
                            autoCorrect={false}
                            spellCheck={false}
                            textContentType={"telephoneNumber"}
                            keyboardType={"phone-pad"}
                            clearButtonMode={"always"}
                            onChangeText={(text) => this.onInputChange('address', text)}
                        />
                        <ContinueButton ref={ref => this.continueBtn = ref} disabled={true} onPress={() => this.storeValue('phone', 'otp')} />
                        <LaunchFooter/>
                    </View>
                );

            case 'otp':
                // TODO: Implement OTP-Code based phone number verification
                return (
                    <View style={styles.container}>
                        <LightStatusBar/>
                        <Image style={styles.logo} source={this.logo}/>
                        <Text style={styles.baseline}>Enter the code you received by SMS</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder={"Your verification code"}
                            placeholderTextColor={"rgba(255,255,255,.5)"}
                            returnKeyType={"done"}
                            autoCorrect={false}
                            spellCheck={false}
                            textContentType={"oneTimeCode"}
                            keyboardType={"phone-pad"}
                            clearButtonMode={"always"}
                            onChangeText={(text) => this.onInputChange('address', text)}
                        />
                        <ContinueButton ref={ref => this.continueBtn = ref} disabled={true} onPress={() => this.storeValue('otp', 'keygen')} />
                        <LaunchFooter/>
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
                                You successfully registered into JustAuth.Me! You can now login on any website or app which
                                provide the "Login with JustAuth.Me" button.
                            </Text>
                        </View>
                        <ContinueButton text={'Got it!'} ref={ref => this.continueBtn = ref} disabled={true} onPress={this.finish} marginTop={30} />
                        <View style={styles.webview}>
                            <WebView
                                source={{uri: 'https://init.justauth.me'}}
                                onMessage={msg => this.onMessage(msg)}
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
                        <Text style={styles.baseline}>Join the revolution</Text>
                        <TouchableOpacity style={styles.startBtn} onPress={() => this.props.navigation.push('LaunchScreen', {step: 'explanation'})}>
                            <Ionicons name="ios-arrow-forward" size={56} color="white" style={styles.arrowIcon}/>
                        </TouchableOpacity>
                        <LaunchFooter/>
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
        marginTop: 50
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
