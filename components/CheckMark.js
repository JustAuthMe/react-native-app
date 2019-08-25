import React from 'react';
import {
    View
} from 'react-native';
import {
    Icon
} from 'expo';
import AuthDataList from "./AuthDataList";

export default class CheckMark extends React.Component {
    state = {
        visible: true
    };

    getCheckMarkStyle = (data) => {
        const bgColor = AuthDataList.isDataRequired(data) ? '#ccc' : '#00b100';
        const visible = this.state.visible ? 'flex' : 'none';
        return {
            width: 24,
            height: 24,
            marginTop: 2,
            marginLeft: 2,
            borderRadius: 12,
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
                    size={22}
                    color={'#fff'}
                />
            </View>
        );
    }
}
