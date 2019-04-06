import React from 'react';
import { createStackNavigator, createAppContainer } from "react-navigation";
import LaunchScreen from "../screens/LaunchScreen";

const LaunchNavigator = createStackNavigator({
    Launch: {
        screen: LaunchScreen
    }
});

export default createAppContainer(LaunchNavigator);