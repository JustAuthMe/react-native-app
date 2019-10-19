import React from 'react';
import {createStackNavigator} from 'react-navigation';

import HomeScreen from '../screens/HomeScreen';
import ScannerScreen from "../screens/ScannerScreen";
import AuthScreen from "../screens/AuthScreen";
import UserScreen from '../screens/UserScreen';
import ServiceScreen from "../screens/ServiceScreen";
import SettingsScreen from "../screens/SettingsScreen";

export default createStackNavigator({
    Home    : HomeScreen,
    Scanner : ScannerScreen,
    Auth    : AuthScreen,
    User    : UserScreen,
    Service : ServiceScreen,
    Settings: SettingsScreen
});
