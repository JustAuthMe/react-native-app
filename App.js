import React from 'react';
import {StyleSheet, View, AsyncStorage} from 'react-native';
import { AppLoading } from 'expo';
import * as Icon from '@expo/vector-icons';
import * as Font from 'expo-font';
import { Asset } from 'expo-asset';
import AppNavigator from './navigation/AppNavigator';
import Config from "./constants/Config";
import {AudioModel} from "./models/AudioModel";
import AudioLibrary from "./constants/AudioLibrary";

export default class App extends React.Component {
    state = {
        isLoadingComplete: false,
        storedItems: false
    };

    render() {
        if (!this.state.isLoadingComplete) {
            return (
                <AppLoading
                    startAsync={this._loadResourcesAsync}
                    onError={this._handleLoadingError}
                    onFinish={this._handleFinishLoading}
                    autoHideSplash={false}
                />
            );
        }

        AsyncStorage.getItem(Config.initDone.key).then(value => {
            console.log('init done at app init:', value);
        });

        return (
            <View style={styles.container}>
                <AppNavigator/>
            </View>
        );
    }

    _loadResourcesAsync = async () => {
        const sounds = AudioModel.load(AudioLibrary);
        return Promise.all([
            Font.loadAsync({
                // This is the font that we are using for our tab bar
                ...Icon.Ionicons.font,
                ...sounds
            }),
        ]);
    };

    _handleLoadingError = error => {
        // In this case, you might want to report the error to your error
        // reporting service, for example Sentry
        console.warn(error);
    };

    _handleFinishLoading = () => {
        this.setState({isLoadingComplete: true});
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },

});
