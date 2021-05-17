import React from 'react';
import {StyleSheet, View} from 'react-native';
import AppLoading from 'expo-app-loading';
import * as Icon from '@expo/vector-icons';
import * as Font from 'expo-font';
import AppNavigator from './navigation/AppNavigator';
import {AudioModel} from "./models/AudioModel";
import AudioLibrary from "./constants/AudioLibrary";
import DropdownAlert from "react-native-dropdownalert";
import {DropdownSingleton} from "./models/DropdownSingleton";
import * as Network from "expo-network";
import * as Updates from 'expo-updates';
import {NetworkModel} from "./models/NetworkModel";

export default class App extends React.Component {
    state = {
        isLoadingComplete: false,
        storedItems: false
    };

    render() {
        if (!this.state.isLoadingComplete) {
            return (
                <AppLoading
                    startAsync={this._startAsync()}
                    onError={this._handleLoadingError}
                    onFinish={this._handleFinishLoading}
                    autoHideSplash={false}
                />
            );
        }

        return (
            <View style={styles.container}>
                <DropdownAlert ref={ref => DropdownSingleton.set(ref)} updateStatusBar={true} translucent={true} zIndex={100}/>
                <AppNavigator/>
            </View>
        );
    }

    _startAsync = async () => {
        await this._loadResourcesAsync();
        const isInternetReachable = await NetworkModel.isInternetReachable();
        if (isInternetReachable) {
            const hasUpdates = await Updates.checkForUpdateAsync();
            if (hasUpdates.isAvailable) {
                const update = await Updates.fetchUpdateAsync();
                if (update.isNew) {
                    await Updates.reloadAsync();
                }
            }
        }
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
        console.warn('App Loading Error:', error);
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
