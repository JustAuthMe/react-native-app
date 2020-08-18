import React from 'react';
import {
    View,
    StyleSheet,
    Text,
    TouchableOpacity,
    Alert
} from 'react-native';
import LottieView from 'lottie-react-native';
import ActionBtn from "../components/ActionBtn";
import {AudioModel} from "../models/AudioModel";
import Translator from "../i18n/Translator";
import {ServicesModel} from "../models/ServicesModel";
import NetworkLoader from "../components/NetworkLoader";
import {UserModel} from "../models/UserModel";
import {DropdownSingleton} from "../models/DropdownSingleton";

export default class SuccessScreen extends React.Component {
    static navigationOptions = {
        header: null,
    };

    state = {
        service: this.props.navigation.getParam('service')
    };

    componentDidMount() {
        this.animation.play();
        try {
            window.setTimeout(() => {
                AudioModel.play('success').then();
            }, 750);
            // Your sound is playing!
        } catch (error) {
            // An error occurred!
        }

    }

    async removeCorruptService() {
        this.networkLoader.setState({visible: true});
        const response = await ServicesModel.remoteRemove(this.state.service);
        this.networkLoader.setState({visible: false});

        if (response.status === 200 || response.status === 404) {
            await ServicesModel.removeService(this.state.service.app_id);
            this.props.navigation.navigate('Home');
            DropdownSingleton.get().alertWithType('success', Translator.t('success.dropdown.title'), Translator.t('success.dropdown.text', {name: this.state.service.name}));
        } else if (response.status === 423) {
            UserModel.logout(this.props.navigation);
        } else {
            DropdownSingleton.get().alertWithType('error', Translator.t('home.error_delete'), Translator.t('error_default'));
        }
    }

    render() {
        return (
            <View style={styles.content}>
                <NetworkLoader ref={ref => this.networkLoader = ref} />
                <Text style={styles.successText}>{Translator.t('now_logged_in')}</Text>
                <View style={styles.animationContainer}>
                    <LottieView
                        ref={animation => {
                            this.animation = animation;
                        }}
                        source={require('../assets/animations/check-mark-success.json')}
                        loop={false}
                        speed={1.3}
                    />
                </View>
                <ActionBtn
                    btnText={Translator.t('go_back')}
                    btnIcon={'ios-arrow-back'}
                    style={styles.actionBtn}
                    onPress={() => {
                        this.props.navigation.navigate('Home')
                    }}
                />
                <TouchableOpacity onPress={() => Alert.alert(
                    Translator.t('success.alert.title'),
                    Translator.t('success.alert.msg', {domain: this.state.service.domain}),
                    [
                        {
                            text: Translator.t('success.alert.ok_btn'),
                            onPress: () => this.removeCorruptService()
                        },
                        {
                            text: Translator.t('cancel'),
                            style: 'cancel'
                        }
                    ])} style={styles.errorBtn}>
                    <Text style={styles.errorBtnText}>{Translator.t('success.error')}</Text>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        backgroundColor: '#3498db',
        alignItems: 'center',
        justifyContent: 'center'
    },
    animationContainer: {
        width: 150,
        height: 150,
        marginTop: 50,
        marginBottom: 40
    },
    successText: {
        fontSize: 24,
        color: '#fff',
        fontWeight: '600',
    },
    actionBtn: {
        marginBottom: 50
    },
    errorBtnText: {
        color: '#FFFFFFCC',
        paddingHorizontal: 5,
        paddingVertical: 3,
        textDecorationLine: "underline",
        textDecorationStyle: "solid",
        textDecorationColor: "#fffc",
    }
});
