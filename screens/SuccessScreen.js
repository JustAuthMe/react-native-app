import React from 'react';
import {
    View,
    StyleSheet,
    Text
} from 'react-native';
import LottieView from 'lottie-react-native';
import ActionBtn from "../components/ActionBtn";
import {AudioModel} from "../models/AudioModel";
import Translator from "../i18n/Translator";

export default class SuccessScreen extends React.Component {
    static navigationOptions = {
        header: null,
    };

    state = {};

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

    render() {
        return (
            <View style={styles.content}>
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
                    onPress={() => {
                        this.props.navigation.navigate('Home')
                    }}
                />
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
        marginBottom: 50
    },
    successText: {
        fontSize: 24,
        color: '#fff',
        fontWeight: '600',
    }
});
