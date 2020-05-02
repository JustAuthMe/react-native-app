import React from 'react';
import {StyleSheet, View, AsyncStorage} from 'react-native';
import { AppLoading } from 'expo';
import * as Icon from '@expo/vector-icons';
import * as Font from 'expo-font';
import AppNavigator from './navigation/AppNavigator';
import Config from "./constants/Config";
import {AudioModel} from "./models/AudioModel";
import AudioLibrary from "./constants/AudioLibrary";
import DropdownAlert from "react-native-dropdownalert";
import {DropdownSingleton} from "./models/DropdownSingleton";
import UniversalDatePicker from "./components/UniversalDatePicker";
import {DatePickerSingleton} from "./models/DatePickerSingleton";
import Translator from "./i18n/Translator";

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

        return (
            <View style={styles.container}>
                <DropdownAlert ref={ref => DropdownSingleton.set(ref)} updateStatusBar={true} translucent={true} zIndex={100}/>
                <AppNavigator/>
                <UniversalDatePicker ref={ref => DatePickerSingleton.set(ref)} />
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
