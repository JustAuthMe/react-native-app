import React from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
    AsyncStorage,
    Alert,
    TouchableOpacity,
    StatusBar,
    Button
} from 'react-native';
import { Linking } from 'expo';


import Constants from 'expo-constants';
import * as Icon from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';


import Config from "../constants/Config";
import LightStatusBar from "../components/LightStatusBar";
import {AuthModel} from "../models/AuthModel";
import ActionBtn from "../components/ActionBtn";

export default class HomeScreen extends React.Component {
    static navigationOptions = {
        header: null,
    };

    state = {
        user: {}
    };

    constructor(props) {
        super(props);
        this.isBarCodeScannerEnabled = true;
        this.user = {};
        this.authModel = new AuthModel();
    }

    async _bootstrapAsync() {
        this.user = {
            firstname: await AsyncStorage.getItem('firstname'),
            lastname: await AsyncStorage.getItem('lastname'),
            birthdate: await AsyncStorage.getItem('birthdate'),
            email: await AsyncStorage.getItem('email'),
            avatar: await AsyncStorage.getItem('avatar')
        };
        this.setState({
            user: this.user
        });
        StatusBar.setBarStyle('light-content');
    };

    componentDidMount() {
        Linking.addEventListener('url', this._handleDeepLinkEvent);
        Linking.getInitialURL().then(url => {
            this.authModel.authByDeepLink(url, this.props.navigation);
        });
        this._navListener = this.props.navigation.addListener("didFocus", () => {
            this._bootstrapAsync().then();
        });
    }

    componentWillUnmount() {
        this._navListener.remove();
    }

    _handleDeepLinkEvent = event => {
        this.authModel.authByDeepLink(event.url, this.props.navigation);
    };

    run() {
        SecureStore.getItemAsync(Config.storageKeys.publicKey).then(value => {
            if (value !== null) {
                console.log(value);
                SecureStore.getItemAsync(Config.storageKeys.privateKey).then(value => {
                    if (value !== null) {
                        console.log(value);
                        SecureStore.getItemAsync(Config.storageKeys.jamID).then(value => {
                            console.log(value);
                        }).catch(err => console.log(err));
                    }
                }).catch(err => console.log(err));
            }
        }).catch(err => console.log(err));
    }

    logout = () => {
        Alert.alert('Are you sure?', '', [
            {text: 'Cancel', onPress: () => {}, style:'cancel'},
            {text: 'OK', onPress: () => {
                    AsyncStorage.multiRemove([
                        Config.initDone.key,
                        'firstname',
                        'lastname',
                        'birthdate',
                        'email'
                    ], async () => {
                        AsyncStorage.getItem(Config.initDone.key).then(value => {
                            console.log('init done at logout:', value);
                        });

                        await SecureStore.deleteItemAsync(Config.storageKeys.publicKey);
                        await SecureStore.deleteItemAsync(Config.storageKeys.privateKey);
                        await SecureStore.deleteItemAsync(Config.storageKeys.jamID);

                        this.props.navigation.navigate('Launch');
                    });
                }}
        ]);
    };

    render() {
        return (
            <View style={styles.container}>
                <LightStatusBar/>
                <ScrollView style={styles.container}>
                    <View style={styles.userHeader}>
                        <TouchableOpacity style={styles.switchIcon} onPress={() => Alert.alert('We\'re sorry...', 'This feature isn\'t implemented yet.')}>
                            <Icon.Ionicons
                                name={'md-switch'}
                                size={26}
                                color={'#FFFFFF'}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.editIcon} onPress={() => this.props.navigation.navigate('User')}>
                            <Icon.Ionicons
                                name={'md-create'}
                                size={26}
                                color={'#FFFFFF'}
                            />
                        </TouchableOpacity>
                        <Image source={{uri: this.state.user.avatar}} style={styles.userAvatar} />
                        <Text style={styles.userIdentity}>{this.state.user.firstname + ' ' + this.state.user.lastname}</Text>
                        <ActionBtn
                            onPress={() => this.props.navigation.navigate('Scanner')}
                            btnIcon={'ios-qr-scanner'}
                            btnText={'Authenticate'}
                        />
                    </View>
                    <View style={{
                        alignItems: 'center',
                        paddingTop: 10
                    }}>
                        <Text>Build {Constants.manifest.version}</Text>
                        <Button onPress={() => this.logout()} title={'Logout'} />
                    </View>
                </ScrollView>
            </View>
        );
    }
}

const isBorderless = Constants.statusBarHeight > 20;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    contentContainer: {
        alignItems: 'center'
    },
    userHeader: {
        backgroundColor: '#3498DB',
        width: '100%',
        height: 300,
        alignItems: 'center',
        paddingTop: isBorderless ? 50 : 20
    },
    switchIcon: {
        position: 'absolute',
        top: isBorderless ? 40 : 10,
        left: 5,
        width: 50,
        height: 50,
        paddingTop: 10,
        paddingLeft: 15
    },
    editIcon: {
        position: 'absolute',
        top: isBorderless ? 40 : 10,
        right: 5,
        width: 50,
        height: 50,
        paddingTop: 10,
        paddingLeft: 15
    },
    userAvatar: {
        height: 100,
        width: 100,
        borderRadius: 50
    },
    userIdentity: {
        paddingTop: 20,
        fontSize: 26,
        color: '#FFFFFF',
        fontWeight: '200'
    }
});
