import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Text
} from 'react-native';
import {
    Icon
} from 'expo';

export default class ActionBtn extends React.Component {
    state = {};

    render() {
        return (
            <View style={this.props.style}>
                <TouchableOpacity style={styles.JamBtn} onPress={this.props.onPress}>
                    <Icon.Ionicons
                        name={this.props.btnIcon}
                        size={22}
                        color={'#FFFFFF'}
                    />
                    <Text style={styles.JamBtnText}>{this.props.btnText}</Text>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    JamBtn: {
        flexDirection: 'row',
        marginTop: 30,
        width: 170,
        height: 50,
        backgroundColor: '#1459E3',
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 2,
        elevation: 5,
    },
    JamBtnText: {
        color: '#FFFFFF',
        paddingLeft: 10,
        fontSize: 18
    }
});
