import React from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
    AsyncStorage,
    TouchableOpacity,
    StatusBar,
    FlatList
} from 'react-native';
import { Linking } from 'expo';


import Constants from 'expo-constants';
import * as Icon from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';


import Config from "../constants/Config";
import LightStatusBar from "../components/LightStatusBar";
import {AuthSingleton} from "../models/AuthSingleton";
import ActionBtn from "../components/ActionBtn";
import {ServicesModel} from "../models/ServicesModel";

export default class HomeScreen extends React.Component {
    static navigationOptions = {
        header: null
    };

    state = {
        user: {},
        services: null,
    };

    constructor(props) {
        super(props);
        this.user = {};
        this.services = {};
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
        ServicesModel.getServices().then((services) => {
            this.setState({
                services: services
            });
        });
        StatusBar.setBarStyle('light-content');
    };

    componentDidMount() {
        /**
         * USED TO RESET SERVICES LIST AT LAUNCH, DO NOT UNCOMMENT
         */
        //AsyncStorage.setItem(Config.servicesKey, JSON.stringify({}), () => {});
        /**
         * USED TO RESET SERVICES LIST AT LAUNCH, DO NOT UNCOMMENT
         */

        Linking.addEventListener('url', this._handleDeepLinkEvent);
        Linking.getInitialURL().then(url => {
            this._handleDeepLinkEvent({url: url});
        });
        this._navListener = this.props.navigation.addListener("didFocus", () => {
            this._bootstrapAsync().then();
        });
    }

    componentWillUnmount() {
        this._navListener.remove();
    }

    _handleDeepLinkEvent = event => {
        AuthSingleton.get().authByDeepLink(event.url, this.props.navigation);
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

    parseServices = () => {
        if (this.state.services === null) {
            return [];
        }

        let items = [];
        for (let i in this.state.services) {
            items.push({
                key: i
            });
        }

        console.log('parsed items:', items);
        return items;
    };

    render() {
        let servicesList = <View></View>;
        if (this.state.services === null || Object.keys(this.state.services).length === 0) {
            servicesList = <Text style={{
                textAlign: 'center',
                marginTop: 30,
                padding: 20
            }}>
                You haven't logged to any of our partners website or app yet. Just click the
                "Authenticate" button above to begin your JustAuth.Me experience.
            </Text>;
        } else {
            servicesList = <FlatList
                style={styles.servicesList}
                data={this.parseServices()}
                renderItem={(item) => {
                    return (
                        <TouchableOpacity
                            style={styles.serviceContainer}
                            onPress={() => {
                                this.props.navigation.navigate('Service', {
                                    service: this.state.services[item.item.key]
                                });
                            }}
                        >
                            <Image source={{uri: this.state.services[item.item.key].logo}} style={styles.serviceIcon}/>
                            <Text style={styles.serviceName}>{this.state.services[item.item.key].name}</Text>
                            <Icon.Ionicons
                                name={'ios-arrow-forward'}
                                size={24}
                                color={'#ccc'}
                                style={styles.serviceArrow}
                            />
                        </TouchableOpacity>
                    );
                }}
            />;
        }

        return (
            <View style={styles.container}>
                <LightStatusBar/>
                <View style={styles.container}>
                    <View style={styles.userHeader}>
                        <TouchableOpacity style={styles.switchIcon} onPress={() => this.props.navigation.navigate('Settings')}>
                            <Icon.Ionicons
                                name={'ios-settings'}
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
                    <Text style={styles.servicesTitle}>Services</Text>
                    {servicesList}
                </View>
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
        paddingTop: isBorderless ? 50 : 30
    },
    switchIcon: {
        position: 'absolute',
        top: isBorderless ? 40 : 20,
        left: 5,
        width: 50,
        height: 50,
        paddingTop: 10,
        paddingLeft: 15
    },
    editIcon: {
        position: 'absolute',
        top: isBorderless ? 40 : 20,
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
    },
    servicesTitle: {
        fontWeight: '700',
        fontSize: 36,
        width: '100%',
        textAlign: 'left',
        paddingLeft: 15,
        paddingTop: 10
    },
    servicesList: {
        width: '100%',
        paddingTop: 25,
        marginBottom: 30
    },
    serviceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 70,
        width: '100%',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#eee',
        borderStyle: 'solid',
        paddingLeft: 15,
        paddingRight: 15
    },
    serviceIcon: {
        width: 35,
        height: 35,
        borderRadius: 18,
    },
    serviceName: {
        fontSize: 18,
        paddingLeft: 20
    },
    serviceArrow: {
        position: 'absolute',
        right: 15,
        top: 23
    }
});
