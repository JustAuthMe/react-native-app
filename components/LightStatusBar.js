import React from 'react';
import {
    StatusBar
} from 'react-native';

export default class LightStatusBar extends React.Component {
    render() {
        return (
            <StatusBar barStyle="light-content"  animated={true} translucent backgroundColor={"#3498DB"} />
        );
    }
}
