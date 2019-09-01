import React from 'react';
import {
    Text,
    TouchableOpacity,
} from 'react-native';

export default class ContinueButton extends React.Component {

    static styles = {
        color: {
            enabled: 'white',
            disabled: 'rgba(255, 255, 255, .5)'
        },
        opacity: {
            enabled: .2,
            disabled: 1
        }
    };

    state = {
        disabled: this.props.disabled,
        text: this.props.text ? this.props.text : 'Continue'
    };

    render() {
        return (
            <TouchableOpacity activeOpacity={
                this.state.disabled ?
                    ContinueButton.styles.opacity.disabled :
                    ContinueButton.styles.opacity.enabled
                }
                onPress={this.props.onPress}>
                <Text style={{
                    marginTop: 60,
                    paddingTop: 10,
                    paddingRight: 20,
                    paddingBottom: 10,
                    paddingLeft: 20,
                    borderColor: this.state.disabled ?
                        ContinueButton.styles.color.disabled :
                        ContinueButton.styles.color.enabled,
                    borderWidth: 1,
                    borderRadius: 5,
                    fontSize: 22,
                    fontWeight: '300',
                    color: this.state.disabled ?
                        ContinueButton.styles.color.disabled :
                        ContinueButton.styles.color.enabled
                }}>{this.state.text}</Text>
            </TouchableOpacity>
        );
    }
}