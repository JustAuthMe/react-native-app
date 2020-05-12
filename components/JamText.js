import React from 'react';
import {
    Text,
    StyleSheet,
    Platform
} from 'react-native';

export default class extends React.Component {
    render() {
        return (
            <Text style={{...this.props.style, ...styles.text}}>{this.props.children}</Text>
        );
    }
}

const styles = StyleSheet.create({
    text: {
        ...(Platform.OS === 'android' ? {fontFamily: 'Roboto'} : {})
    }
});
