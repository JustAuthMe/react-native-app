import React from 'react';
import {
    Image,
    StyleSheet,
    View,
    TouchableOpacity,
    TouchableHighlight,
    StatusBar,
    Dimensions,
    Alert,
    Button,
    Linking,
    Platform,
} from 'react-native';
import Constants from 'expo-constants';
import * as Icon from '@expo/vector-icons';
import LightStatusBar from "../components/LightStatusBar";
import {AuthSingleton} from "../models/AuthSingleton";
import ActionBtn from "../components/ActionBtn";
import {ServicesModel} from "../models/ServicesModel";
import {AlertModel} from "../models/AlertModel";
import {SwipeListView} from "react-native-swipe-list-view";
import {DropdownSingleton} from "../models/DropdownSingleton";
import * as Camera from "expo-camera";
import {UserModel} from "../models/UserModel";
import NetworkLoader from "../components/NetworkLoader";
import Translator from "../i18n/Translator";
import Text from '../components/JamText'
import AsyncStorage from '@react-native-async-storage/async-storage';


export default class HomeScreen extends React.Component {
    static navigationOptions = {
        headerShown: false
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
        this.isSwipeToDeleteEnabled = true;
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

    parseServices = () => {
        if (this.state.services === null) {
            return [];
        }

        let items = [];
        let j=0;
        for (let i in this.state.services) {
            items.push({
                key: i
            });
        }

        items.sort((a, b) => {
            if (this.state.services[a.key].updated_at < this.state.services[b.key].updated_at) {
                return 1;
            }

            if (this.state.services[a.key].updated_at > this.state.services[b.key].updated_at) {
                return -1;
            }

            return 0;
        });

        return items;
    };

    deletePopupAlert = service => {
        Alert.alert(Translator.t('home.delete_service_confirm', {name:service.name}), Translator.t('home.delete_service_confirm_message', {domain:service.domain}), [
            {text: Translator.t('cancel'), onPress: () => {
                    this.isSwipeToDeleteEnabled = true;
                }, style:'cancel'},
            {text: Translator.t('ok'), onPress: async () => {
                this.isSwipeToDeleteEnabled = true;
                this.networkLoader.setState({visible: true});
                const response = await ServicesModel.remoteRemove(service);
                this.networkLoader.setState({visible: false});

                if (response.status === 200 || response.status === 404) {
                    await ServicesModel.removeService(service.app_id);
                    const newServices = {...this.state.services};
                    delete newServices[service.app_id];
                    this.setState({services: newServices});
                } else if (response.status === 423) {
                    UserModel.logout(this.props.navigation);
                } else {
                    DropdownSingleton.get().alertWithType('error', Translator.t('home.error_delete'), Translator.t('error_default'));
                }
            }}
        ]);
    };

    getRenderItem(key, isLast) {
        return (
            <TouchableHighlight
                onPress={() => {
                    this.props.navigation.navigate('Service', {
                        service: this.state.services[key]
                    });
                }}
                style={isLast && {marginBottom: 50}}
            >
                <View style={[styles.serviceContainer, isLast && {borderBottomWidth: 1}]}>
                    <Image source={{uri: this.state.services[key].logo}} style={styles.serviceIcon}/>
                    <Text style={styles.serviceName}>{this.state.services[key].name}</Text>
                    <Icon.Ionicons
                        name={'chevron-forward-outline'}
                        size={28}
                        color={'#ccc'}
                        style={styles.serviceArrow}
                    />
                </View>
            </TouchableHighlight>
        )
    }

    render() {
        let servicesList = <View></View>;
        if (this.state.services === null || Object.keys(this.state.services).length === 0) {
            servicesList = <View>
                <Text style={{
                    textAlign: 'center',
                    marginTop: 30,
                    padding: 20
                }}>
                    {Translator.t('home.no_services_yet')}
                </Text>
                <Button onPress={() => Linking.openURL('https://demo.justauth.me')} title={Translator.t('home.try_demo')} />
            </View>;
        } else {
            let dataToList = this.parseServices();
            servicesList = <SwipeListView
                style={styles.servicesList}
                data={dataToList}
                renderItem={item => {
                    return this.getRenderItem(item.item.key, item.index >= dataToList.length - 1);
                }}
                renderHiddenItem={item => {
                    return (
                        <View style={styles.rowBack}>
                            <TouchableOpacity
                                style={[styles.backRightBtn, {width: Translator.t('home.hidden.delete')}, styles.backRightBtnRight]}
                                onPress={() => this.deletePopupAlert(this.state.services[item.item.key])}
                            >
                                <Icon.Ionicons
                                    name={'ios-trash-outline'}
                                    size={32}
                                    color={'#fff'}
                                    style={{marginTop:3}}
                                />
                                <Text style={styles.backTextWhite}>{Translator.t('forget')}</Text>
                            </TouchableOpacity>
                        </View>
                    );
                }}
                rightOpenValue={Translator.t('home.hidden.size')}
                disableRightSwipe
                onSwipeValueChange={swipeData => {
                    if (this.isSwipeToDeleteEnabled && swipeData.direction === 'left' && swipeData.value <= -(Dimensions.get('window').width * 0.5)) {
                        this.isSwipeToDeleteEnabled = false;
                        this.deletePopupAlert(this.state.services[swipeData.key]);
                    }
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
                            fontWeight: '600',
                            paddingBottom: 5
                        }}>{this.state.alert.type === 'warning' ? Translator.t('alert.alert') : Translator.t('alert.information')}</Text>
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
                <NetworkLoader ref={ref => this.networkLoader = ref} />
                <View style={styles.container}>
                    <View style={styles.userHeader}>
                        <TouchableOpacity style={styles.switchIcon} onPress={() => this.props.navigation.navigate('Settings')}>
                            <Icon.Ionicons
                                name={'settings-sharp'}
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
                            onPress={async () => {
                                const permissionResponse = await Camera.requestPermissionsAsync();
                                if (permissionResponse.status !== 'granted') {
                                    DropdownSingleton.get().alertWithType('info', Translator.t('permission_required'), Translator.t('permission.camera'));
                                } else {
                                    this.props.navigation.navigate('Scanner');
                                }
                            }}
                            btnIcon={'scan-outline'}
                            btnText={Translator.t('home.authenticate')}
                        />
                    </View>
                    {alert}
                    <Text style={styles.servicesTitle}>{Translator.t('home.services')}</Text>
                    {servicesList}
                </View>
            </View>
        );
    }
}

const isBorderless = Platform.OS === 'ios' && Constants.statusBarHeight > 20;
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
        paddingTop: 25
    },
    serviceContainer: {
        backgroundColor: '#FFF',
        flexDirection: 'row',
        alignItems: 'center',
        height: 70,
        width: '100%',
        borderTopWidth: 1,
        borderColor: '#eee',
        borderStyle: 'solid',
        paddingLeft: 15,
        paddingRight: 15
    },
    serviceContainerLast: {
        borderBottomWidth: 1
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
    },
    rowBack: {
        maxHeight: 70,
        alignItems: 'center',
        backgroundColor: '#341f97',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 15,
    },
    backRightBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        bottom: 0,
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        width: 75,
    },
    backRightBtnRight: {
        backgroundColor: '#341f97',
        right: 10,
    },
    backTextWhite: {
        color: '#FFF',
        paddingLeft: 5,
    }
});
