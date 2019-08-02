import React from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity
} from 'react-native';
import {
    Icon
} from 'expo';
import ActionBtn from "./ActionBtn";
import Config from "../constants/Config";

export default class AuthDataList extends React.Component {
    getDataLabelFromID(data) {
        if (data.indexOf('!') === data.length - 1) {
            data = data.slice(0, -1);
        }

        return Config.dataList[data];
    }

    render() {
        console.log(this.props.data);
        return (
            <View style={this.props.style}>
                <Text style={{
                    fontSize: 20,
                    fontWeight: '600',
                    textAlign: 'center'
                }}>{this.props.domain} will have access to the following:</Text>
                <FlatList
                    style={{
                        marginTop: 20
                    }}
                    data={this.props.data}
                    renderItem={({item}) =>
                        <View style={{
                            flexDirection: 'row',
                            marginBottom: 10
                        }}>
                            <TouchableOpacity style={{
                                width: 30,
                                height: 30,
                                borderRadius: 15,
                                borderWidth: 1,
                                borderColor: '#6f6f6f'
                            }}>
                                <View style={{
                                    width: 24,
                                    height: 24,
                                    marginTop: 2,
                                    marginLeft: 2,
                                    backgroundColor: '#00b100',
                                    borderRadius: 12,
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Icon.Ionicons
                                        name={'md-checkmark'}
                                        size={22}
                                        color={'#fff'}
                                    />
                                </View>
                            </TouchableOpacity>
                            <Text style={{
                                marginLeft: 15,
                                lineHeight: 30,
                                fontSize: 20,
                                fontWeight: '600'
                            }}>{this.getDataLabelFromID(item.key)}</Text>
                        </View>
                    }
                />
                <ActionBtn style={{alignSelf: 'center'}} btnText="Confirm login" btnIcon={'md-checkmark'} onPress={this.props.onAccept} />
            </View>
        );
    }
}
