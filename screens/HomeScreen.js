import React from 'react';
import {
    Image,
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
import {DropdownSingleton} from "../models/DropdownSingleton";
import {AlertModel} from "../models/AlertModel";

export default class HomeScreen extends React.Component {
    static navigationOptions = {
        header: null
    };

    state = {
        user: {},
        services: null,
        alert: null
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
        ServicesModel.getServices().then(services => {
            this.setState({
                services: services
            });
        });
        StatusBar.setBarStyle('light-content');

        AlertModel.getAlert().then(alert => {
            this.setState({alert: alert})
        });
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

        let alert = <View></View>;
        if (this.state.alert !== null) {
            alert =
                <View style={{
                    margin: 20,
                    marginBottom: 10,
                    padding: 15,
                    borderRadius: 10,
                    shadowChild: '#888',
                    shadowOffset: {width: 0, height: 0},
                    shadowOpacity: .3,
                    shadowRadius: 5,
                    backgroundColor: '#FFFFFF',
                    flexDirection: 'row',
                    alignItems: 'center'
                }}>
                    <TouchableOpacity
                        onPress={() => {
                            AlertModel.closeAlert(this.state.alert.id).then(() => {
                                this.setState({alert: null})
                            });
                        }}
                        style={{
                            position: 'absolute',
                            zIndex: 10,
                            top: -2,
                            right: -5,
                            height: 50,
                            width: 50,
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                        <Icon.Ionicons
                            name={'ios-close'}
                            size={36}
                            color={'#555'}
                        />
                    </TouchableOpacity>
                    <Icon.Ionicons
                        name={this.state.alert.type === 'warning' ? 'ios-warning' : 'ios-information-circle'}
                        size={48}
                        color={this.state.alert.type === 'warning' ? '#FF9900' : '#3498DB'}
                    />
                    <View style={{
                        paddingLeft: 15,
                        width: 0,
                        flexGrow: 1,
                    }}>
                        <Text style={{
                            fontSize: 18,
                            fontWeight: 600,
                            paddingBottom: 5
                        }}>{this.state.alert.type === 'warning' ? 'Alert' : 'Information'}</Text>
                        <Text style={{
                            flexWrap: 'wrap'
                        }}>{this.state.alert.text}</Text>
                    </View>
                </View>
            ;
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
                    {alert}
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
