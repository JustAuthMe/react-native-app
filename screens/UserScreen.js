import React from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    TextInput,
    AsyncStorage,
    StatusBar,
    TouchableOpacity,
    Image
} from 'react-native';
import Colors from '../constants/Colors';
import {DateModel} from "../models/DateModel";
import DatePickerKeyboardIOS from "../components/DatePickerKeyboardIOS";
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
import {ServicesModel} from "../models/ServicesModel";
import {NavigationActions, StackActions} from "react-navigation";
import NetworkLoader from "../components/NetworkLoader";

export default class UserScreen extends React.Component {
    static navigationOptions = {
        title: 'My infos',
    };

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
            'firstname',
            'lastname',
            'birthdate',
            'email'
        ];
    }

    async _bootstrapAsync() {
        const user = {
            firstname: await AsyncStorage.getItem('firstname'),
            lastname: await AsyncStorage.getItem('lastname'),
            birthdate: await AsyncStorage.getItem('birthdate'),
            email: await AsyncStorage.getItem('email'),
            avatar: await AsyncStorage.getItem('avatar')
        };
        const splitDate = user.birthdate !== null ? user.birthdate.split('/') : [];
        this.setState({
            user: user,
            birthdateInputValue: user.birthdate,
            currentBirthdate: splitDate.length === 3 ? new Date(splitDate[1] + '/' + splitDate[0] + '/' + splitDate[2]) : new Date(),
            isLogin: this.props.navigation.getParam('login')
        });
        StatusBar.setBarStyle('dark-content');
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
                DropdownSingleton.get().alertWithType('error', 'Permission required', 'Sorry, you need to grant Camera roll permission to change your avatar!');
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
                DropdownSingleton.get().alertWithType('error', 'Empty field(s)', 'Please fill all the required informations.');
                return;
            }
        }

        await AsyncStorage.setItem('firstname', this.state.user.firstname);
        await AsyncStorage.setItem('lastname', this.state.user.lastname);
        await AsyncStorage.setItem('birthdate', this.state.user.birthdate);

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
            } else {
                DropdownSingleton.get().alertWithType('error', 'Cannot update E-Mail address', 'Please contact support for further assistance.');
            }
        }

        await AsyncStorage.setItem('avatar', this.state.user.avatar);

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

        if (hasEmailChanged) {
            DropdownSingleton.get().alertWithType('info', 'Check your inbox!', 'We sent you a confirmation E-Mail to ' + this.state.user.email + '. Click on the link to confirm your new E-Mail address.')
        } else {
            DropdownSingleton.get().alertWithType('success', 'My infos', 'Saved successfully');
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <NetworkLoader ref={ref => this.networkLoader = ref} />
                <KeyboardShift>
                    {() => (
                        <ScrollView style={{
                            ...styles.ScrollView,
                            paddingTop: this.state.isLogin ? 75 : 15
                        }}>
                            <View style={styles.content}>
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
                                <TextInput
                                    ref={"firstname"}
                                    style={styles.textInput}
                                    placeholder={"e.g. Aiden"}
                                    returnKeyType={"done"}
                                    autoCorrect={false}
                                    spellCheck={false}
                                    textContentType={"givenName"}
                                    clearButtonMode={"always"}
                                    value={this.state.user.firstname}
                                    onChangeText={(text) => this.setState({user:{...this.state.user, firstname:text}})}
                                />
                                <TextInput
                                    ref={"lastname"}
                                    style={styles.textInput}
                                    placeholder={"e.g. Pearce"}
                                    returnKeyType={"done"}
                                    autoCorrect={false}
                                    spellCheck={false}
                                    textContentType={"familyName"}
                                    clearButtonMode={"always"}
                                    value={this.state.user.lastname}
                                    onChangeText={(text) => this.setState({user:{...this.state.user, lastname:text}})}
                                />
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
                                        onChangeText={(text) => this.setState({user:{...this.state.user, birthdate:text}})}
                                        pointerEvents={"none"}
                                        value={this.state.birthdateInputValue}
                                    />
                                </TouchableOpacity>
                                <TextInput
                                    ref={"email"}
                                    style={styles.textInput}
                                    placeholder={"e.g. aiden@pearce.me"}
                                    returnKeyType={"done"}
                                    autoCorrect={false}
                                    spellCheck={false}
                                    autoCapitalize={"none"}
                                    textContentType={"emailAddress"}
                                    keyboardType={"email-address"}
                                    clearButtonMode={"always"}
                                    value={this.state.user.email}
                                    onChangeText={(text) => this.setState({user:{...this.state.user, email:text}})}
                                    onFocus={() => DropdownSingleton.get().alertWithType('info', 'Information', 'If you change your E-Mail address, you\'ll need to confirm your new address before continuing to use JustAuth.Me')}
                                />
                                <ActionBtn btnText={"Save"} btnIcon={'md-checkmark'} onPress={() => this.updateInfos()}/>
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
        marginBottom: 30
    },
    textInput: {
        width: '70%',
        height: 50,
        marginTop: 20,
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
        height: 100
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
