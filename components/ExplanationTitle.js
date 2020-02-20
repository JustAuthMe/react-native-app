import React from 'react';
import {
    Text,
    StyleSheet
} from 'react-native';

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