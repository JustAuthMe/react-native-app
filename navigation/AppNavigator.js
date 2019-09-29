import React from 'react';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';

import MainNavigator from './MainNavigator';
import LaunchNavigator from "./LaunchNavigator";
import UserScreen from "../screens/UserScreen";
import SuccessScreen from "../screens/SuccessScreen";

export default createAppContainer(createSwitchNavigator(
  {
    // You could add another route here for authentication.
    // Read more at https://reactnavigation.org/docs/en/auth-flow.html
    Main: MainNavigator,
    Launch: LaunchNavigator,
    Success: SuccessScreen
  },
  {
    initialRouteName: 'Launch'
  }
));