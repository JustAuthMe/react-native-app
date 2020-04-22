import React from 'react';
import {
    StatusBar
} from 'react-native';

export default class DarkStatusBar extends React.Component {
    render() {
        return (
            <StatusBar barStyle="dark-content" animated={true} translucent backgroundColor={"#ffffff"} />
        );
    }
}
