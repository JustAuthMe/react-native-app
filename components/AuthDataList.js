import React from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet
} from 'react-native';
import ActionBtn from "./ActionBtn";
import CheckMark from "./CheckMark";
import Translator from "../i18n/Translator";
import {DataModel} from '../models/DataModel';

export default class AuthDataList extends React.Component {
    constructor(props) {
        super(props);
        this.checkmarks = {};
    }

    onCheckMarkPressed = data => {
        this.checkmarks[data].setState({visible: !this.checkmarks[data].state.visible});
        this.props.onUpdate(data);
    };

    render() {
        return (
            <View style={this.props.style}>
                <Text style={styles.authWarning}>{Translator.t('auth.data_list.' + (this.props.isFirstLogin ? 'first' : 'relog'), {domain: this.props.domain})}:</Text>
                <FlatList
                    style={styles.listContainer}
                    data={this.props.data}
                    renderItem={({item}) =>
                        <View style={styles.listItem}>
                            <TouchableOpacity style={{...styles.itemCheckbox, borderStyle: this.props.checkable[item.key] || !this.props.isFirstLogin ? 'solid' : 'dashed', borderColor: !this.props.checkable[item.key] && this.props.isFirstLogin ? '#ccc' : (DataModel.isDataRequired(item.key) || !this.props.isFirstLogin ? '#888' : '#1459E3')}} activeOpacity={1} onPress={() => {
                                if (!DataModel.isDataRequired(item.key) && this.props.isFirstLogin && this.props.checkable[item.key]) {
                                    this.onCheckMarkPressed(item.key)
                                }
                            }}>
                                <CheckMark ref={ref =>(this.checkmarks[item.key] = ref)} itemKey={item.key} visible={this.props.checkable[item.key] || !this.props.isFirstLogin} isFirstLogin={this.props.isFirstLogin} />
                            </TouchableOpacity>
                            <Text style={{...styles.itemText, color: this.props.checkable[item.key] || !this.props.isFirstLogin ? '#000' : '#ccc', fontWeight: DataModel.isDataRequired(item.key) ? '400' : '500'}}>{DataModel.getDataLabelFromID(item.key)}</Text>
                            {!this.props.checkable[item.key] && this.props.isFirstLogin && <Text style={styles.notFilled}>{Translator.t('auth.missing')}</Text>}
                        </View>
                    }
                />
                <ActionBtn style={styles.loginBtn} btnText={Translator.t('auth.confirm_login')} btnIcon={'md-checkmark'} onPress={this.props.onAccept} />
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
    },
    notFilled: {
        position: 'absolute',
        color: '#aaa',
        fontSize: 12,
        top: 23,
        left: 36
    }
});