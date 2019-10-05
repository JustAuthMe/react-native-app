import React from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    TextInput,
    AsyncStorage,
    StatusBar, TouchableOpacity
} from 'react-native';
import Colors from '../constants/Colors';
import {DateModel} from "../models/DateModel";
import DatePickerKeyboardIOS from "../components/DatePickerKeyboardIOS";
import ActionBtn from "../components/ActionBtn";

export default class UserScreen extends React.Component {
    static navigationOptions = {
        title: 'My infos',
    };

    state = {
        user: {},
        currentBirthdate: new Date(),
        birthdateInputValue: ''
    };

    constructor(props) {
        super(props);
        this.dateModel = new DateModel();
        this._bootstrapAsync().then();
    }

    async _bootstrapAsync() {
        const user = {
            firstname: await AsyncStorage.getItem('firstname'),
            lastname: await AsyncStorage.getItem('lastname'),
            birthdate: await AsyncStorage.getItem('birthdate'),
            email: await AsyncStorage.getItem('email')
        };
        const splitDate = user.birthdate.split('/');
        this.setState({
            user: user,
            birthdateInputValue: user.birthdate,
            currentBirthdate: splitDate.length === 3 ? new Date(splitDate[1] + '/' + splitDate[0] + '/' + splitDate[2]) : new Date()
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
        this.refs.datePicker.setState({opened: false});
    }

    async updateInfos() {
        await AsyncStorage.setItem('firstname', this.state.user.firstname);
        await AsyncStorage.setItem('lastname', this.state.user.lastname);
        await AsyncStorage.setItem('birthdate', this.state.user.birthdate);
        await AsyncStorage.setItem('email', this.state.user.email);
        this.props.navigation.goBack();
    }

    render() {
        return (
            <View style={styles.container}>
                <DatePickerKeyboardIOS
                    ref={'datePicker'}
                    date={this.state.currentBirthdate}
                    onDateChange={(date) => this.setState({currentBirthdate: date})}
                    onDone={() => this.changeBirthdate()}
                />
                <ScrollView style={styles.ScrollView}>
                    <View style={styles.content}>
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
                        />
                        <ActionBtn btnText={"Save"} btnIcon={'md-checkmark'} onPress={() => this.updateInfos()}/>
                    </View>
                </ScrollView>
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
        paddingTop: 15,
        backgroundColor: 'white',
    },
    content: {
        alignItems: 'center'
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
    }
});
