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
import { Ionicons } from '@expo/vector-icons';
import LaunchFooter from "../components/LaunchFooter";
import ContinueButton from "../components/ContinueButton";
import DatePickerKeyboardIOS from "../components/DatePickerKeyboardIOS";

export default class LaunchScreen extends React.Component {

    static navigationOptions = {
        header: null,
    };

    state = {
        step: this.props.navigation.getParam('step') ? this.props.navigation.state.params.step : 'launch',
        currentBirthdate: new Date(),
        birthdateInputValue: ''
    };

    constructor(props) {
        super(props);
        this.personnalInfos = {};
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
            console.log(this.personnalInfos[key]);
            return;
        }

        AsyncStorage.setItem(key, this.personnalInfos[key], () => this.props.navigation.push('Launch', {step: nextStep}));
        AsyncStorage.getItem(key).then(value => {
            console.log(key + ':', value);
        });
    }

    changeBirthdate(date) {
        this.onInputChange('birthdate', date);
        const day = (date.getDate() < 10 ? '0' : '') + date.getDate();
        const month = (date.getMonth() + 1 < 10 ? '0' : '') + (date.getMonth() + 1);
        this.setState({
            currentBirthdate: date,
            birthdateInputValue: day + '/' + month + '/' + date.getFullYear()
        });
    }

    render() {
        switch (this.state.step) {
            case 'firstname':
                return (
                    <View style={styles.container}>
                        <Image style={styles.logo} source={require('../assets/images/logo-small.png')}/>
                        <Text style={styles.baseline}>What's your firstname?</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder={"e.g. Peter"}
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
                        <Image style={styles.logo} source={require('../assets/images/logo-small.png')}/>
                        <Text style={styles.baseline}>And your lastname?</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder={"e.g. Cauty"}
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
                        <DatePickerKeyboardIOS
                            ref={'datePicker'}
                            date={this.state.currentBirthdate}
                            onDateChange={(date) => this.changeBirthdate(date)}
                        />
                        <Image style={styles.logo} source={require('../assets/images/logo-small.png')}/>
                        <Text style={styles.baseline}>What about your birthdate?</Text>
                        <TouchableOpacity activeOpacity={.5} style={styles.inputTouchable} onPress={() => this.refs.datePicker.setState({opened: true})}>
                            <TextInput
                                ref={'birthdateInput'}
                                style={styles.textInput}
                                placeholder={"e.g. 11/11/1994"}
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

            default:
                return (
                    <View style={styles.container}>
                        <Image style={styles.logo} source={require('../assets/images/logo-small.png')}/>
                        <Text style={styles.baseline}>Join the revolution</Text>
                        <TouchableOpacity style={styles.startBtn} onPress={() => this.props.navigation.push('Launch', {step: 'firstname'})}>
                            <Ionicons name="ios-arrow-forward" size={56} color="white" style={styles.arrowIcon}/>
                        </TouchableOpacity>
                        <LaunchFooter/>
                    </View>
                );
        }
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#3598DB',
        flex: 1,
        width: '100%',
        height: '100%',
        alignItems: 'center'
    },
    logo: {
        marginTop: 150,
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
    }
});
