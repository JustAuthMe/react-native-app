import React from 'react';
import {createStackNavigator} from 'react-navigation';

import HomeScreen from '../screens/HomeScreen';
import ScannerScreen from "../screens/ScannerScreen";
import AuthScreen from "../screens/AuthScreen";
import UserScreen from '../screens/UserScreen';
import SuccessScreen from "../screens/SuccessScreen";

export default createStackNavigator({
    Home   : HomeScreen,
    Scanner: ScannerScreen,
    Auth   : AuthScreen,
    User   : UserScreen
});
