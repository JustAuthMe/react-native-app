import React from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    TextInput,
    AsyncStorage,
    TouchableOpacity,
    Image,
    Text
} from 'react-native';
import Colors from '../constants/Colors';
import {DateModel} from "../models/DateModel";
import ActionBtn from "../components/ActionBtn";
import {DropdownSingleton} from "../models/DropdownSingleton";
import Constants from "expo-constants";
import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";
import * as Icon from "@expo/vector-icons";
import KeyboardShift from "../components/KeyboardShift";
import {DatePickerSingleton} from "../models/DatePickerSingleton";
import Config from "../constants/Config";
import {EncryptionModel} from "../models/EncryptionModel";
import * as SecureStore from "expo-secure-store";
import {NavigationActions, StackActions} from "react-navigation";
import NetworkLoader from "../components/NetworkLoader";
import {UserModel} from "../models/UserModel";
import DarkStatusBar from "../components/DarkStatusBar";
import Translator from "../i18n/Translator";

export default class UserScreen extends React.Component {
    static navigationOptions = () => ({
        title: Translator.t('user.title'),
    });

    state = {
        user: {},
        currentBirthdate: new Date(),
        birthdateInputValue: '',
        isLogin: false
    };

    constructor(props) {
        super(props);
        this.dateModel = new DateModel();
        this._bootstrapAsync().then();
        this.requiredInfos = [
            'email',
            'firstname',
            'lastname'
        ];
    }

    async _bootstrapAsync() {
        const user = {
            firstname: await AsyncStorage.getItem('firstname'),
            lastname: await AsyncStorage.getItem('lastname'),
            birthdate: await AsyncStorage.getItem('birthdate'),
            birthlocation: await AsyncStorage.getItem('birthlocation'),
            email: await AsyncStorage.getItem('email'),
            avatar: await AsyncStorage.getItem('avatar'),
            address_1: await AsyncStorage.getItem('address_1'),
            address_2: await AsyncStorage.getItem('address_2'),
            postal_code: await AsyncStorage.getItem('postal_code'),
            city: await AsyncStorage.getItem('city'),
            state: await AsyncStorage.getItem('state'),
            country: await AsyncStorage.getItem('country'),
            job: await AsyncStorage.getItem('job'),
            company: await AsyncStorage.getItem('company')
        };
        const splitDate = user.birthdate !== null ? user.birthdate.split('/') : [];
        this.setState({
            user: user,
            birthdateInputValue: user.birthdate,
            currentBirthdate: splitDate.length === 3 ? new Date(splitDate[1] + '/' + splitDate[0] + '/' + splitDate[2]) : new Date(),
            isLogin: this.props.navigation.getParam('login')
        });
    };

    componentDidMount() {
        this._navListener = this.props.navigation.addListener("didFocus", () => {
            this._bootstrapAsync().then();
        });
    }

    componentWillUnmount() {
        this._navListener.remove();
    }

    changeBirthdate() {
        const date = this.state.currentBirthdate;
        const humanDate = this.dateModel.fromJsDateToHumanDate(date);
        this.setState({
            birthdateInputValue: humanDate,
            user: {
                ...this.state.user,
                birthdate: humanDate
            }
        });
    }

    _pickImage = async () => {
        if (Constants.platform.ios) {
            const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
            if (status !== 'granted') {
                DropdownSingleton.get().alertWithType('info', Translator.t('permission_required'), Translator.t('permission.camera_roll'));
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
            this.setState({user: {...this.state.user, avatar: avatarUri}});
        }
    };

    async updateInfos() {
        for (let i = 0; i < this.requiredInfos.length; i++) {
            if (this.state.user[this.requiredInfos[i]] === '' || this.state.user[this.requiredInfos[i]] === null) {
                DropdownSingleton.get().alertWithType('warn', Translator.t('user.error.empty.title'), Translator.t('user.error.empty.text'));
                return;
            }
        }

        const oldEmail = await AsyncStorage.getItem('email');
        let hasEmailChanged = false;
        if (oldEmail !== this.state.user.email) {
            this.networkLoader.setState({visible: true});

            const dateModel = new DateModel();
            const enc = new EncryptionModel();
            const dataToSend = {
                email: this.state.user.email,
                jam_id: await SecureStore.getItemAsync(Config.storageKeys.jamID),
                timestamp: dateModel.getUnixTimestamp()
            };
            const sign = await enc.sign(enc.urlencode(enc.json_encode(dataToSend)));
            const response = await fetch(
                Config.apiUrl + 'mail/update',
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        data: dataToSend,
                        sign: sign
                    })
                }
            );

            this.networkLoader.setState({visible: false});

            if (response.status === 200 ) {
                await AsyncStorage.setItem('email', this.state.user.email);
                hasEmailChanged = true;
            } else if (response.status === 423) {
                UserModel.logout(this.props.navigation);
            } else if (response.status === 429) {
                DropdownSingleton.get().alertWithType('warn', Translator.t('user.error.email_exists.title'), Translator.t('user.error.email_exists.text'));
            } else {
                DropdownSingleton.get().alertWithType('error', Translator.t('user.error.email_update'), Translator('error_default'));
            }
        }

        for (let i in this.state.user) {
            await AsyncStorage.setItem(i, this.state.user[i] ? this.state.user[i] : '');
        }

        if (!this.state.isLogin) {
            this.props.navigation.goBack();
        } else {
            const resetAction = StackActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({
                    routeName: 'Home'
                })],
            });
            this.props.navigation.dispatch(resetAction);
        }

        /*
        We add a small delay so that the correct screen is showing when showing the alert,
        This fixes a glitch with the statusbar being updated to the alert color and reverted to thw old screen status bar color
         */
        if (hasEmailChanged) {
            setTimeout(() => DropdownSingleton.get().alertWithType('info', Translator.t('user.info.inbox.title'), Translator.t('user.info.inbox.text', {email: this.state.user.email})), 300);
        } else {
            setTimeout(() => DropdownSingleton.get().alertWithType('success', Translator.t('user.title'), Translator.t('user.success')), 300);
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <DarkStatusBar />
                <NetworkLoader ref={ref => this.networkLoader = ref} />
                <KeyboardShift>
                    {() => (
                        <ScrollView style={styles.scrollView}>
                            <View style={{...styles.content, paddingTop: this.state.isLogin ? 35 : 15}}>
                                <TouchableOpacity onPress={() => this._pickImage()} style={styles.avatarEdit}>
                                    <View style={styles.avatarUpdateBtn}>
                                        <Icon.Ionicons
                                            name={'ios-camera'}
                                            size={20}
                                            color={'#FFFFFF'}
                                        />
                                    </View>
                                    <Image source={{uri: this.state.user.avatar}} style={styles.avatar} />
                                </TouchableOpacity>
                                <Text style={styles.textLabel}>{Translator.t('data_list.email')}*:</Text>
                                <TextInput
                                    ref={"email"}
                                    style={styles.textInput}
                                    placeholder={Translator.t('placeholders.email')}
                                    returnKeyType={"done"}
                                    autoCorrect={false}
                                    spellCheck={false}
                                    autoCapitalize={"none"}
                                    textContentType={"emailAddress"}
                                    keyboardType={"email-address"}
                                    clearButtonMode={"always"}
                                    value={this.state.user.email}
                                    onChangeText={(text) => this.setState({user:{...this.state.user, email:text.trim()}})}
                                    onFocus={() => DropdownSingleton.get().alertWithType(
                                        'info',
                                        Translator.t('alert.information'),
                                        Translator.t('user.info.email_update')
                                    )}
                                />
                                <Text style={styles.textLabel}>{Translator.t('data_list.firstname')}*:</Text>
                                <TextInput
                                    ref={"firstname"}
                                    style={styles.textInput}
                                    placeholder={Translator.t('placeholders.firstname')}
                                    returnKeyType={"done"}
                                    autoCorrect={false}
                                    spellCheck={false}
                                    textContentType={"givenName"}
                                    clearButtonMode={"always"}
                                    value={this.state.user.firstname}
                                    onChangeText={(text) => this.setState({user:{...this.state.user, firstname:text}})}
                                    onEndEditing={() => this.setState({user:{...this.state.user, firstname:this.state.user.firstname.trim()}})}
                                />
                                <Text style={styles.textLabel}>{Translator.t('data_list.lastname')}*:</Text>
                                <TextInput
                                    ref={"lastname"}
                                    style={styles.textInput}
                                    placeholder={Translator.t('placeholders.lastname')}
                                    returnKeyType={"done"}
                                    autoCorrect={false}
                                    spellCheck={false}
                                    textContentType={"familyName"}
                                    clearButtonMode={"always"}
                                    value={this.state.user.lastname}
                                    onChangeText={(text) => this.setState({user:{...this.state.user, lastname:text}})}
                                    onEndEditing={() => this.setState({user:{...this.state.user, lastname:this.state.user.lastname.trim()}})}
                                />
                                <Text style={styles.textLabel}>{Translator.t('data_list.birthdate')}:</Text>
                                <TouchableOpacity activeOpacity={.5} style={styles.inputTouchable} onPress={() => {
                                    DatePickerSingleton.get().open({
                                        date: this.state.currentBirthdate,
                                        onDateChangeCallback: date => this.setState({currentBirthdate: date}),
                                        onDone: () => this.changeBirthdate()
                                    })
                                }}>
                                    <TextInput
                                        ref={'birthdateInput'}
                                        style={styles.textInput}
                                        placeholder={Translator.t('placeholders.birthdate')}
                                        returnKeyType={"done"}
                                        autoCorrect={false}
                                        spellCheck={false}
                                        editable={false}
                                        onChangeText={(text) => this.setState({user:{...this.state.user, birthdate:text}})}
                                        pointerEvents={"none"}
                                        value={this.state.birthdateInputValue}
                                    />
                                </TouchableOpacity>
                                <Text style={styles.textLabel}>{Translator.t('data_list.birthlocation')}:</Text>
                                <TextInput
                                    ref={"birthlocation"}
                                    style={styles.textInput}
                                    placeholder={Translator.t('placeholders.birthlocation')}
                                    returnKeyType={"done"}
                                    autoCorrect={false}
                                    spellCheck={false}
                                    textContentType={"location"}
                                    clearButtonMode={"always"}
                                    value={this.state.user.birthlocation}
                                    onChangeText={(text) => this.setState({user:{...this.state.user, birthlocation:text}})}
                                    onEndEditing={() => this.setState({user:{...this.state.user, birthlocation:this.state.user.birthlocation.trim()}})}
                                />
                                <Text style={styles.textLabel}>{Translator.t('data_list.address_1')}:</Text>
                                <TextInput
                                    ref={"adress_1"}
                                    style={styles.textInput}
                                    placeholder={Translator.t('placeholders.address_1')}
                                    returnKeyType={"done"}
                                    autoCorrect={false}
                                    spellCheck={false}
                                    textContentType={"streetAddressLine1"}
                                    clearButtonMode={"always"}
                                    value={this.state.user.address_1}
                                    onChangeText={(text) => this.setState({user:{...this.state.user, address_1:text}})}
                                    onEndEditing={() => this.setState({user:{...this.state.user, address_1:this.state.user.address_1.trim()}})}
                                />
                                <Text style={styles.textLabel}>{Translator.t('data_list.address_2')}:</Text>
                                <TextInput
                                    ref={"address_2"}
                                    style={styles.textInput}
                                    placeholder={Translator.t('placeholders.address_2')}
                                    returnKeyType={"done"}
                                    autoCorrect={false}
                                    spellCheck={false}
                                    textContentType={"streetAddressLine2"}
                                    clearButtonMode={"always"}
                                    value={this.state.user.address_2}
                                    onChangeText={(text) => this.setState({user:{...this.state.user, address_2:text}})}
                                    onEndEditing={() => this.setState({user:{...this.state.user, address_2:this.state.user.address_2.trim()}})}
                                />
                                <Text style={styles.textLabel}>{Translator.t('data_list.postal_code')}:</Text>
                                <TextInput
                                    ref={"postal_code"}
                                    style={styles.textInput}
                                    placeholder={Translator.t('placeholders.postal_code')}
                                    returnKeyType={"done"}
                                    autoCorrect={false}
                                    spellCheck={false}
                                    keyboardType={'number-pad'}
                                    textContentType={"postalCode"}
                                    clearButtonMode={"always"}
                                    value={this.state.user.postal_code}
                                    onChangeText={(text) => this.setState({user:{...this.state.user, postal_code:text}})}
                                    onEndEditing={() => this.setState({user:{...this.state.user, postal_code:this.state.user.postal_code.trim()}})}
                                />
                                <Text style={styles.textLabel}>{Translator.t('data_list.city')}:</Text>
                                <TextInput
                                    ref={"city"}
                                    style={styles.textInput}
                                    placeholder={Translator.t('placeholders.city')}
                                    returnKeyType={"done"}
                                    autoCorrect={false}
                                    spellCheck={false}
                                    textContentType={"addressCity"}
                                    clearButtonMode={"always"}
                                    value={this.state.user.city}
                                    onChangeText={(text) => this.setState({user:{...this.state.user, city:text}})}
                                    onEndEditing={() => this.setState({user:{...this.state.user, city:this.state.user.city.trim()}})}
                                />
                                <Text style={styles.textLabel}>{Translator.t('data_list.state')}:</Text>
                                <TextInput
                                    ref={"state"}
                                    style={styles.textInput}
                                    placeholder={Translator.t('placeholders.state')}
                                    returnKeyType={"done"}
                                    autoCorrect={false}
                                    spellCheck={false}
                                    textContentType={"addressState"}
                                    clearButtonMode={"always"}
                                    value={this.state.user.state}
                                    onChangeText={(text) => this.setState({user:{...this.state.user, state:text}})}
                                    onEndEditing={() => this.setState({user:{...this.state.user, state:this.state.user.state.trim()}})}
                                />
                                <Text style={styles.textLabel}>{Translator.t('data_list.country')}:</Text>
                                <TextInput
                                    ref={"country"}
                                    style={styles.textInput}
                                    placeholder={Translator.t('placeholders.country')}
                                    returnKeyType={"done"}
                                    autoCorrect={false}
                                    spellCheck={false}
                                    textContentType={"countryName"}
                                    clearButtonMode={"always"}
                                    value={this.state.user.country}
                                    onChangeText={(text) => this.setState({user:{...this.state.user, country:text}})}
                                    onEndEditing={() => this.setState({user:{...this.state.user, country:this.state.user.country.trim()}})}
                                />
                                <Text style={styles.textLabel}>{Translator.t('data_list.job')}:</Text>
                                <TextInput
                                    ref={"job"}
                                    style={styles.textInput}
                                    placeholder={Translator.t('placeholders.job')}
                                    returnKeyType={"done"}
                                    autoCorrect={false}
                                    spellCheck={false}
                                    textContentType={"jobTitle"}
                                    clearButtonMode={"always"}
                                    value={this.state.user.job}
                                    onChangeText={(text) => this.setState({user:{...this.state.user, job:text}})}
                                    onEndEditing={() => this.setState({user:{...this.state.user, job:this.state.user.job.trim()}})}
                                />
                                <Text style={styles.textLabel}>{Translator.t('data_list.company')}:</Text>
                                <TextInput
                                    ref={"company"}
                                    style={styles.textInput}
                                    placeholder={Translator.t('placeholders.company')}
                                    returnKeyType={"done"}
                                    autoCorrect={false}
                                    spellCheck={false}
                                    textContentType={"organizationName"}
                                    clearButtonMode={"always"}
                                    value={this.state.user.company}
                                    onChangeText={(text) => this.setState({user:{...this.state.user, company:text}})}
                                    onEndEditing={() => this.setState({user:{...this.state.user, company:this.state.user.company.trim()}})}
                                />
                                <ActionBtn btnText={Translator.t('user.save')} btnIcon={'md-checkmark'} onPress={() => this.updateInfos()}/>
                            </View>
                        </ScrollView>
                    )}
                </KeyboardShift>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    scrollView: {
        flex: 1,
        backgroundColor: 'white',
    },
    content: {
        alignItems: 'center',
        marginBottom: 50
    },
    textLabel: {
        width: '70%',
        fontWeight: '700',
        marginTop: 20
    },
    textInput: {
        width: '70%',
        height: 50,
        marginBottom: 20,
        borderBottomColor: Colors.tintColor,
        borderBottomWidth: 1,
        fontWeight: '300',
        fontSize: 22
    },
    inputTouchable: {
        width: '100%',
        alignItems: 'center',
        backgroundColor: '#fff',
        height: 70
    },
    avatar: {
        height: 100,
        width: 100,
        borderRadius: 50
    },
    avatarUpdateBtn: {
        position: 'absolute',
        zIndex: 2,
        right: 0,
        bottom: 0,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#bdbdbd',
        alignItems: 'center',
        justifyContent: 'center'
    },
    avatarEdit: {
        marginTop: 20
    }
});
