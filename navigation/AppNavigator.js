import React from 'react';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';

import MainNavigator from './MainNavigator';
import LaunchNavigator from "./LaunchNavigator";
import SuccessScreen from "../screens/SuccessScreen";
import UserScreen from "../screens/UserScreen";

export default createAppContainer(createSwitchNavigator(
  {
    // You could add another route here for authentication.
    // Read more at https://reactnavigation.org/docs/en/auth-flow.html
    Main: MainNavigator,
    Login: UserScreen,
    Launch: LaunchNavigator,
    Success: SuccessScreen
  },
  {
    initialRouteName: 'Launch'
  }
));