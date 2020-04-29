import React from 'react';
import {
    Text,
    StyleSheet
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
        fontFamily: Platform.OS === 'android' ? 'Roboto' : 'system font'
    }
});