import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    TextInput,
    AsyncStorage
} from 'react-native';
import {
    Constants,
    SecureStore,
    SplashScreen
} from 'expo';
import { Ionicons } from '@expo/vector-icons';
import LaunchFooter from "../components/LaunchFooter";
import ContinueButton from "../components/ContinueButton";
import DatePickerKeyboardIOS from "../components/DatePickerKeyboardIOS";
import Config from "../constants/Config";
import {Encryption} from "../models/Encryption";
import LightStatusBar from "../components/LightStatusBar";

export default class LaunchScreen extends React.Component {

    static navigationOptions = {
        header: null,
    };

    state = {
        step: this.props.navigation.getParam('step') ? this.props.navigation.state.params.step : 'launch',
        currentBirthdate: new Date(),
        birthdateInputValue: '',
        generationStatus: 'Generating...'
    };

    constructor(props) {
        super(props);
        this.personnalInfos = {};

        AsyncStorage.getItem(Config.initDone.key).then(value => {
            SplashScreen.hide();
            if (value === Config.initDone.value) {
                this.props.navigation.navigate('Main');
            } else {
                if (this.state.step === 'keygen') {
                    this.keygen();
                }
            }
        });
    }

    onInputChange(key, value) {
        this.personnalInfos[key] = value;
        this.refs.continueBtn.setState({
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
            this.props.navigation.push('LaunchScreen', {step: nextStep});
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
        this.refs.datePicker.setState({opened: false});
    }

    keygen() {
        /*
         TODO: Make sure that actual keygen and THEN registration is workign as expected
         (I think that maybe the keypair do not have the time to save itself onto the SecureStore before the
         registration process begins)
          */
        console.log('Generating...');
        // Giving time to UI to update
        window.setTimeout(() => {
            const enc = new Encryption();
            //enc.generateKeypair();
            //this.register().then(() => {
                this.setState({generationStatus: 'Done!'});
                this.refs.continueBtn.setState({disabled: false});
            //});
        }, 500);
    }

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
            AsyncStorage.getItem(Config.initDone.key).then(value => {
                console.log('init done at and of launch:', value);
            });

            this.props.navigation.navigate('Main');
        });
    };

    render() {
        switch (this.state.step) {
            case 'firstname':
                return (
                    <View style={styles.container}>
                        <LightStatusBar/>
                        <Image style={styles.logo} source={require('../assets/images/logo-small.png')}/>
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
                        <ContinueButton ref={'continueBtn'} disabled={true} onPress={() => this.storeValue('firstname', 'lastname')} />
                        <LaunchFooter/>
                    </View>
                );

            case 'lastname':
                return (
                    <View style={styles.container}>
                        <LightStatusBar/>
                        <Image style={styles.logo} source={require('../assets/images/logo-small.png')}/>
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
                        <ContinueButton ref={'continueBtn'} disabled={true} onPress={() => this.storeValue('lastname', 'birthdate')} />
                        <LaunchFooter/>
                    </View>
                );

            case 'birthdate':
                return (
                    <View style={styles.container}>
                        <LightStatusBar/>
                        <DatePickerKeyboardIOS
                            ref={'datePicker'}
                            date={this.state.currentBirthdate}
                            onDateChange={(date) => this.setState({currentBirthdate: date})}
                            onDone={() => this.changeBirthdate()}
                        />
                        <Image style={styles.logo} source={require('../assets/images/logo-small.png')}/>
                        <Text style={styles.baseline}>What about your birthdate?</Text>
                        <TouchableOpacity activeOpacity={.5} style={styles.inputTouchable} onPress={() => this.refs.datePicker.setState({opened: true})}>
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
                        <ContinueButton ref={'continueBtn'} disabled={true} onPress={() => this.storeValue('birthdate', 'email')} />
                        <LaunchFooter/>
                    </View>
                );

            case 'email':
                return (
                    <View style={styles.container}>
                        <LightStatusBar/>
                        <Image style={styles.logo} source={require('../assets/images/logo-small.png')}/>
                        <Text style={styles.baseline}>And your E-Mail?</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder={"e.g. aiden@pearce.me"}
                            placeholderTextColor={"rgba(255,255,255,.5)"}
                            returnKeyType={"done"}
                            autoCorrect={false}
                            spellCheck={false}
                            textContentType={"emailAddress"}
                            keyboardType={"email-address"}
                            clearButtonMode={"always"}
                            onChangeText={(text) => this.onInputChange('email', text)}
                        />
                        <ContinueButton ref={'continueBtn'} disabled={true} onPress={() => this.storeValue('email', 'keygen')} />
                        <LaunchFooter/>
                    </View>
                );

            case 'address':
                // TODO: Add address screen to launch process
                return (
                    <View style={styles.container}>
                        <LightStatusBar/>
                        <Image style={styles.logo} source={require('../assets/images/logo-small.png')}/>
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
                        <ContinueButton ref={'continueBtn'} disabled={true} onPress={() => this.storeValue('address', 'phone')} />
                        <LaunchFooter/>
                    </View>
                );

            case 'phone':
                // TODO: Add phone number to launch process
                return (
                    <View style={styles.container}>
                        <LightStatusBar/>
                        <Image style={styles.logo} source={require('../assets/images/logo-small.png')}/>
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
                        <ContinueButton ref={'continueBtn'} disabled={true} onPress={() => this.storeValue('phone', 'otp')} />
                        <LaunchFooter/>
                    </View>
                );

            case 'otp':
                // TODO: Implement OTP-Code based phone number verification
                return (
                    <View style={styles.container}>
                        <LightStatusBar/>
                        <Image style={styles.logo} source={require('../assets/images/logo-small.png')}/>
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
                        <ContinueButton ref={'continueBtn'} disabled={true} onPress={() => this.storeValue('otp', 'keygen')} />
                        <LaunchFooter/>
                    </View>
                );

            case 'keygen':
                return (
                    <View style={styles.container}>
                        <LightStatusBar/>
                        <Image style={styles.logo} source={require('../assets/images/logo-small.png')}/>
                        <Text style={styles.baseline}>Almost there!</Text>
                        <Text style={styles.warningText}>
                            Your phone will now make complex calculations to secure your entire JustAuth.Me experience.
                            This can take up to 5 minutes, do not worry and just let your phone do all the work for you!
                            The Continue button will highlight itself once the process is complete.
                        </Text>
                        <Text style={styles.warningText}>{this.state.generationStatus}</Text>
                        <ContinueButton ref={'continueBtn'} disabled={true} onPress={this.lastStep} />
                    </View>
                );

            case 'done':
                return (
                    <View style={styles.container}>
                        <LightStatusBar/>
                        <Image style={styles.logo} source={require('../assets/images/logo-small.png')}/>
                        <Text style={styles.baseline}>Congratulations!</Text>
                        <Text style={styles.warningText}>
                            You successfully registered into JustAuth.Me! All the personnal informations you just provided
                            are only stored on your phone, not on our servers, not anywhere else, just on your device.
                            You can now login on any website which provide the "Login with JustAuth.Me" button, without
                            getting through any registration process, without any password, without even thinking about it!
                        </Text>
                        <ContinueButton text={'Finish'} ref={'continueBtn'} disabled={false} onPress={this.finish} />
                    </View>
                );

            default:
                return (
                    <View style={styles.container}>
                        <LightStatusBar/>
                        <Image style={styles.logo} source={require('../assets/images/logo-small.png')}/>
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
    container: {
        backgroundColor: '#3598DB',
        flex: 1,
        width: '100%',
        height: '100%',
        alignItems: 'center'
    },
    logo: {
        marginTop: isBorderless ? 150 : 80,
        width: '100%',
        height: 65,
        resizeMode: 'contain'
    },
    baseline: {
        fontSize: 24,
        textAlign: 'center',
        color: 'white',
        fontWeight: '300',
        marginTop: 80
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
    }
});
