import React from 'react';
import {
    View
} from 'react-native';
import * as Icon from '@expo/vector-icons';
import AuthDataList from "./AuthDataList";

export default class CheckMark extends React.Component {
    state = {
        visible: this.props.visible || false
    };

    componentDidUpdate(prevProps) {
        if(prevProps.visible !== this.props.visible) {
            this.setState({visible: this.props.visible});
        }
    }

    getCheckMarkStyle = (data) => {
        const bgColor = AuthDataList.isDataRequired(data) || !this.props.isFirstLogin ? '#888' : '#1459E3';
        const visible = this.state.visible ? 'flex' : 'none';
        return {
            width: 18,
            height: 18,
            marginTop: 0,
            marginLeft: 0,
            borderRadius: 1,
            alignItems: 'center',
            justifyContent: 'center',
            display: visible,
            backgroundColor: bgColor
        };
    };

    render() {
        return (
            <View style={this.getCheckMarkStyle(this.props.itemKey)}>
                <Icon.Ionicons
                    name={'md-checkmark'}
                    size={16}
                    color={'#fff'}
                />
            </View>
        );
    }
}
