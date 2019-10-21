import React from 'react';
import {
    View
} from 'react-native';
import * as Icon from '@expo/vector-icons';
import AuthDataList from "./AuthDataList";

export default class CheckMark extends React.Component {
    state = {
        visible: true
    };

    getCheckMarkStyle = (data) => {
        const bgColor = AuthDataList.isDataRequired(data) ? '#fff' : '#1459E3';
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
                    color={AuthDataList.isDataRequired(this.props.itemKey) ? '#ccc' : '#fff'}
                />
            </View>
        );
    }
}
