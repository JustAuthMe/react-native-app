import React from 'react';
import {
  StatusBar
} from 'react-native';
import { ExpoConfigView } from '@expo/samples';
import JamConfigView from "../components/JamConfigView";

export default class SettingsScreen extends React.Component {
  static navigationOptions = {
    title: 'Settings',
  };

  constructor(props) {
      super(props);
      this._bootstrapAsync().then();
  }

  async _bootstrapAsync() {
      StatusBar.setBarStyle('dark-content');
  }

  render() {
    /* Go ahead and delete ExpoConfigView and replace it with your
     * content, we just wanted to give you a quick view of your config */
    return <JamConfigView />;
  }
}
