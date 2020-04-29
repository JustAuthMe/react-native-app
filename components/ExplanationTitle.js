import React from 'react';
import {
    StyleSheet
} from 'react-native';
import Text from './JamText';

export default class ExplanationTitle extends React.Component {
    state = {
        text: this.props.text ? this.props.text : ''
    };

    render() {
        return (
            <Text style={this.props.style}>{this.state.text}</Text>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    }
});