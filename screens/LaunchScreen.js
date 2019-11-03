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
    ScrollView
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
import DatePickerKeyboardIOS from "../components/DatePickerKeyboardIOS";
import Config from "../constants/Config";
import LightStatusBar from "../components/LightStatusBar";
import { StackActions, NavigationActions } from 'react-navigation';
import {DropdownSingleton} from "../models/DropdownSingleton";
import KeyboardShift from "../components/KeyboardShift";
import {DatePickerSingleton} from "../models/DatePickerSingleton";

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
    };

    constructor(props) {
        super(props);
        this.personnalInfos = {
            avatar: Config.defaultAvatar
        };
        this.logo = require('../assets/images/logo-new.png');

        AsyncStorage.getItem(Config.initDone.key).then(value => {
            SplashScreen.hide();
            if (value === Config.initDone.value) {
                this.props.navigation.navigate('Main');
            }
        });
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

        this.register().then(() => {
            this.continueBtn.setState({disabled: false});
        });
    }

    /*async keygen() {
        /*
         TODO: Make sure that actual keygen and THEN registration is workign as expected
         (I think that maybe the keypair do not have the time to save itself onto the SecureStore before the
         registration process begins)

        console.log('Generating...');
        // Giving time to UI to update
        window.setTimeout(async () => {
            const enc = new EncryptionModel();
            await enc.generateKeypair();

            window.setTimeout(() => {
                this.register().then(() => {
                    this.setState({generationStatus: 'Done!'});
                    this.continueBtn.setState({disabled: false});
                });
            }, 500);
        }, 500);
    }*/

    async register() {
        const pubkey = await SecureStore.getItemAsync(Config.storageKeys.publicKey);
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
                        pubkey: pubkey
                    })
                }
            );
            let responseJson = await response.json();
            console.log(responseJson);
            if (responseJson.user.username) {
                await SecureStore.setItemAsync(Config.storageKeys.jamID, responseJson.user.username, {
                    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
                });
                const jamID = await SecureStore.getItemAsync(Config.storageKeys.jamID);
                console.log(jamID);
            } else {
                // TODO: make a real error handling
                console.log('error retreiving username');
            }
        } catch (error) {
            console.error(error);
        }
    }

    lastStep = () => {
        this.props.navigation.push('LaunchScreen', {step: 'done'});
    };

    finish = () => {
        AsyncStorage.setItem(Config.initDone.key, Config.initDone.value, () => {
            AsyncStorage.getItem(Config.initDone.key, (value) => {
                console.log('init done at and of launch:', value);
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
                        <ContinueButton ref={ref => this.continueBtn = ref} disabled={true} onPress={() => this.storeValue('birthdate', 'email')} />
                        <LaunchFooter/>
                    </View>
                );

            case 'email':
                return (
                    <KeyboardShift>
                        {() => (
                            <View style={styles.container}>
                                <LightStatusBar/>
                                <Image style={styles.logo} source={this.logo}/>
                                <Text style={styles.baseline}>And your E-Mail?</Text>
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
                                <ContinueButton ref={ref => this.continueBtn = ref} disabled={true} onPress={() => this.storeValue('email', 'avatar')} />
                                <LaunchFooter/>
                            </View>
                        )}
                    </KeyboardShift>
                );

            case 'avatar':
                return (
                    <View style={styles.container}>
                        <LightStatusBar/>
                        <Image style={styles.logo} source={this.logo}/>
                        <Text style={styles.baseline}>Finally, chose an avatar</Text>
                        <TouchableOpacity onPress={() => this._pickImage()} style={styles.avatarContainer}>
                            <Image source={{uri: this.state.avatar !== null ? this.state.avatar : '../assets/images/user.png'}} style={{
                                display: this.state.avatar !== null ? 'flex' : 'none',
                                height: 120,
                                width: 120,
                                borderRadius: 60
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
                        <LaunchFooter/>
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
                        <Text style={styles.baseline}>Congratulations!</Text>
                        <Text style={styles.warningText}>
                            You successfully registered into JustAuth.Me! All the personal information you just provided
                            is only stored on your phone, not on our servers, not anywhere else, just on your device.
                            You can now login on any website or app which provide the "Login with JustAuth.Me" button, without
                            getting through any registration process, without any password, without even thinking about it!
                        </Text>
                        <ContinueButton text={'Got it!'} ref={ref => this.continueBtn = ref} disabled={true} onPress={this.finish} />
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
                        <TouchableOpacity style={styles.startBtn} onPress={() => this.props.navigation.push('LaunchScreen', {step: 'firstname'})}>
                            <Ionicons name="ios-arrow-forward" size={56} color="white" style={styles.arrowIcon}/>
                        </TouchableOpacity>
                        <LaunchFooter/>
                    </View>
                );
        }
    }
}
const isBorderless = Constants.statusBarHeight > 20;
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
        marginTop: isBorderless ? 100 : 80,
        width: '100%',
        height: 150,
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
    warningText: {
        marginTop: 30,
        fontSize: 18,
        color: 'white',
        textAlign: 'center',
        paddingLeft: 15,
        paddingRight: 15
    },
    avatarContainer: {
        marginTop: 20
    },
    avatarIgnore: {
        color: '#FFFFFF',
        textAlign: 'center',
        marginTop: 40
    },
    webview: {
        height: 0,
        width: 0
    }
});
