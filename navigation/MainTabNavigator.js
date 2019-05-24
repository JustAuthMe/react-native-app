import React from 'react';
import {Platform} from 'react-native';
import {createStackNavigator, createBottomTabNavigator} from 'react-navigation';

import TabBarIcon from '../components/TabBarIcon';
import HomeScreen from '../screens/HomeScreen';
import UserScreen from '../screens/UserScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AuthScreen from "../screens/AuthScreen";

const HomeStack = createStackNavigator({
    Home: HomeScreen,
    Auth: AuthScreen
});

HomeStack.navigationOptions = {
    tabBarLabel: 'Home',
    tabBarIcon: ({focused}) => (
        <TabBarIcon
            focused={focused}
            name={
                Platform.OS === 'ios'
                    ? `ios-information-circle${focused ? '' : '-outline'}`
                    : 'md-information-circle'
            }
        />
    ),
};

const UserStack = createStackNavigator({
    Links: UserScreen
});

UserStack.navigationOptions = {
    tabBarLabel: 'My infos',
    tabBarIcon: ({focused}) => (
        <TabBarIcon
            focused={focused}
            name={Platform.OS === 'ios' ? 'ios-contact' : 'md-contact'}
        />
    ),
};

const SettingsStack = createStackNavigator({
    Settings: SettingsScreen,
});

SettingsStack.navigationOptions = {
    tabBarLabel: 'Settings',
    tabBarIcon: ({focused}) => (
        <TabBarIcon
            focused={focused}
            name={Platform.OS === 'ios' ? 'ios-options' : 'md-options'}
        />
    ),
};

export default createBottomTabNavigator({
    HomeStack,
    LinksStack: UserStack,
    SettingsStack,
});
