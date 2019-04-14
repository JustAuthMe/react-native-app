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
        disabled: this.props.disabled
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
                    paddingTop: 5,
                    paddingRight: 20,
                    paddingBottom: 5,
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
                }}>Continue</Text>
            </TouchableOpacity>
        );
    }
}