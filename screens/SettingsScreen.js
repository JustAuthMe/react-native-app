import React from 'react';
import {
  StatusBar
} from 'react-native';
import { ExpoConfigView } from '@expo/samples';

export default class SettingsScreen extends React.Component {
  static navigationOptions = {
    title: 'app.json',
  };

  async _bootstrapAsync() {
      StatusBar.setBarStyle('dark-content');
  }

  componentDidMount() {
      this._navListener = this.props.navigation.addListener("didFocus", () => {
          this._bootstrapAsync().then();
      });
  }

    componentWillUnmount() {
        this._navListener.remove();
    }

  render() {
    /* Go ahead and delete ExpoConfigView and replace it with your
     * content, we just wanted to give you a quick view of your config */
    return <ExpoConfigView />;
  }
}
