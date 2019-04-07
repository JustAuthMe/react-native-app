import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    TextInput,
    Alert,
    AsyncStorage
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default class LaunchScreen extends React.Component {

    static navigationOptions = {
        header: null,
    };

    state = {
        step: this.props.navigation.getParam('step') ? this.props.navigation.state.params.step : 'launch'
    };

    onInputChange(key, value) {
        this.personnalInfos[key] = value;
    }

    storeValue(key, nextStep) {
        AsyncStorage.setItem(key, this.personnalInfos[key], () => this.props.navigation.push('Launch', {step: nextStep}));
        AsyncStorage.getItem(key).then(value => {
            console.log(key + ':', value);
        });
    }

    render() {
        this.personnalInfos = {};
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
                            onChangeText={(text) => {this.onInputChange('firstname', text)}}
                        />
                        <TouchableOpacity onPress={() => this.storeValue('firstname', 'lastname')}>
                            <Text style={styles.continueBtn}>Continue</Text>
                        </TouchableOpacity>
                        <View style={styles.footer}>
                            <Text style={styles.alreadyMember}>Are you already a JustAuth.Me member?</Text>
                            <TouchableOpacity onPress={() => Alert.alert('We\'re sorry...', 'This feature isn\'t implemented yet.')}>
                                <Text style={styles.recover}>Recover your account</Text>
                            </TouchableOpacity>
                        </View>
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
                            onChangeText={(text) => {this.onInputChange('lastname', text)}}
                        />
                        <TouchableOpacity onPress={() => this.storeValue('lastname', 'birthdate')}>
                            <Text style={styles.continueBtn}>Continue</Text>
                        </TouchableOpacity>
                        <View style={styles.footer}>
                            <Text style={styles.alreadyMember}>Are you already a JustAuth.Me member?</Text>
                            <TouchableOpacity onPress={() => Alert.alert('We\'re sorry...', 'This feature isn\'t implemented yet.')}>
                                <Text style={styles.recover}>Recover your account</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );

            case 'birthdate':
                return (
                    <View style={styles.container}>
                        <Image style={styles.logo} source={require('../assets/images/logo-small.png')}/>
                        <Text style={styles.baseline}>Thank you!</Text>
                        <TextInput
                            style={{display: 'none'}}
                            placeholder={"e.g. Peter"}
                            placeholderTextColor={"rgba(255,255,255,.5)"}
                            returnKeyType={"done"}
                            autoCorrect={false}
                            spellCheck={false}
                            textContentType={"givenName"}
                            clearButtonMode={"always"}
                            onChangeText={(text) => {this.onInputChange('firstname', text)}}
                        />
                        <TouchableOpacity style={{display: 'none'}} onPress={() => this.storeValue('firstname', 'lastname')}>
                            <Text style={styles.continueBtn}>Continue</Text>
                        </TouchableOpacity>
                        <View style={styles.footer}>
                            <Text style={styles.alreadyMember}>Are you already a JustAuth.Me member?</Text>
                            <TouchableOpacity onPress={() => Alert.alert('We\'re sorry...', 'This feature isn\'t implemented yet.')}>
                                <Text style={styles.recover}>Recover your account</Text>
                            </TouchableOpacity>
                        </View>
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
                        <View style={styles.footer}>
                            <Text style={styles.alreadyMember}>Are you already a JustAuth.Me member?</Text>
                            <TouchableOpacity onPress={() => Alert.alert('We\'re sorry...', 'This feature isn\'t implemented yet.')}>
                                <Text style={styles.recover}>Recover your account</Text>
                            </TouchableOpacity>
                        </View>
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
    footer: {
        flex: 1,
        justifyContent: 'flex-end',
        marginBottom: 70
    },
    alreadyMember: {
        color: 'white',
        textAlign: 'center'
    },
    recover: {
        color: '#A7CADD',
        textAlign: 'center',
        marginTop: 15
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
    }
});
