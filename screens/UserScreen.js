import React from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    TextInput,
    AsyncStorage,
    Button,
    StatusBar
} from 'react-native';
import Colors from '../constants/Colors';
import DatePickerInput from "../components/DatePickerInput";

export default class UserScreen extends React.Component {
    static navigationOptions = {
        title: 'My infos',
    };

    state = {
        user: {}
    };

    constructor(props) {
        super(props);
        this.isBarCodeScannerEnabled = true;
        this._bootstrapAsync().then();
    }

    async _bootstrapAsync() {
        const user = {
            firstname: await AsyncStorage.getItem('firstname'),
            lastname: await AsyncStorage.getItem('lastname'),
            birthdate: await AsyncStorage.getItem('birthdate'),
            email: await AsyncStorage.getItem('email')
        };
        this.setState({
            user: user
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

    async updateInfos() {
        await AsyncStorage.setItem('firstname', this.state.user.firstname);
        await AsyncStorage.setItem('lastname', this.state.user.lastname);
        await AsyncStorage.setItem('birthdate', this.state.user.birthdate);
        await AsyncStorage.setItem('email', this.state.user.email);
        alert('Updated!');
    }

    render() {
        return (
            <ScrollView style={styles.container}>
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
                    <DatePickerInput
                        ref={"birthdate"}
                        style={styles.textInput}
                        placeholder={"e.g. 02/05/1974"}
                        returnKeyType={"done"}
                        date={new Date()}
                        value={this.state.user.birthdate}
                        onChangeText={(text) => this.setState({user:{...this.state.user, birthdate:text}})}
                    />
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
                    <Button title="Update" onPress={() => this.updateInfos()}/>
                </View>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
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
    }
});
