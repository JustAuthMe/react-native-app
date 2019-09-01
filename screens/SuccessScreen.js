import React from 'react';
import {
    View,
    StyleSheet,
    Text
} from 'react-native';
import {
    Audio
} from 'expo';
import {
    NavigationActions,
    StackActions
} from "react-navigation";
import LottieView from 'lottie-react-native';
import ContinueButton from "../components/ContinueButton";
import ActionBtn from "../components/ActionBtn";

export default class SuccessScreen extends React.Component {
    static navigationOptions = {
        header: null,
    };

    state = {};

    componentDidMount() {
        this.animation.play();
        const soundObject = new Audio.Sound();
        try {
            soundObject.loadAsync(require('../assets/sounds/success.wav')).then(() => {
                window.setTimeout(() => {
                    soundObject.playAsync();
                }, 800);
            });
            // Your sound is playing!
        } catch (error) {
            // An error occurred!
        }

    }

    render() {
        return (
            <View style={styles.content}>
                <Text style={styles.successText}>You're now logged in!</Text>
                <View style={styles.animationContainer}>
                    <LottieView
                        ref={animation => {
                            this.animation = animation;
                        }}
                        source={require('../assets/animations/check-mark-success.json')}
                        loop={false}
                    />
                </View>
                <ActionBtn
                    btnText={'Go back'}
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
        width: 200,
        height: 200
    },
    successText: {
        fontSize: 24,
        color: '#fff',
        fontWeight: '600',
        paddingBottom: 20
    }
});
