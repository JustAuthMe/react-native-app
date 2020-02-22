import React from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet
} from 'react-native';
import ActionBtn from "./ActionBtn";
import Config from "../constants/Config";
import CheckMark from "./CheckMark";

export default class AuthDataList extends React.Component {
    constructor(props) {
        super(props);
        this.checkmarks = {};
    }

    static isDataRequired(data) {
        return data.indexOf('!') === data.length - 1;
    }

    getDataLabelFromID(data) {
        if (AuthDataList.isDataRequired(data)) {
            data = data.slice(0, -1);
        }

        return Config.dataList[data];
    }

    onCheckMarkPressed = data => {
        this.checkmarks[data].setState({visible: !this.checkmarks[data].state.visible});
        this.props.onUpdate(data);
    };

    render() {
        console.log(this.props.data);
        return (
            <View style={this.props.style}>
                <Text style={styles.authWarning}>{this.props.domain + ' ' + (this.props.isFirstLogin ? 'will have access to the following:' : 'has access to the following:')}</Text>
                <FlatList
                    style={styles.listContainer}
                    data={this.props.data}
                    renderItem={({item}) =>
                        <View style={styles.listItem}>
                            <TouchableOpacity style={{...styles.itemCheckbox, borderColor: AuthDataList.isDataRequired(item.key) || !this.props.isFirstLogin ? '#ccc' : '#1459E3'}} activeOpacity={1} onPress={() => {
                                if (!AuthDataList.isDataRequired(item.key) && this.props.isFirstLogin) {
                                    this.onCheckMarkPressed(item.key)
                                }
                            }}>
                                <CheckMark ref={ref =>(this.checkmarks[item.key] = ref)} itemKey={item.key} isFirstLogin={this.props.isFirstLogin} />
                            </TouchableOpacity>
                            <Text style={styles.itemText}>{this.getDataLabelFromID(item.key)}</Text>
                        </View>
                    }
                />
                <ActionBtn style={styles.loginBtn} btnText="Confirm login" btnIcon={'md-checkmark'} onPress={this.props.onAccept} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    listContainer: {
        marginTop: 20
    },
    listItem: {
        flexDirection: 'row',
        marginBottom: 10
    },
    itemCheckbox: {
        flexDirection: 'row',
        marginTop: 6,
        height: 20,
        width: 20,
        borderWidth: 1,
        borderRadius: 3
    },
    roundedBox: {
        width: 24,
        height: 24,
        marginTop: 2,
        marginLeft: 2,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center'
    },
    itemText: {
        marginLeft: 15,
        lineHeight: 30,
        fontSize: 20,
        fontWeight: '600'
    },
    loginBtn: {
        alignSelf: 'center'
    },
    authWarning: {
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'center'
    }
});