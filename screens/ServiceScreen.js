import React from 'react';
import {
    View,
    StyleSheet,
    Text,
    StatusBar,
    Image,
    FlatList, TouchableOpacity
} from 'react-native';
import {DropdownSingleton} from "../models/DropdownSingleton";
import Config from "../constants/Config";
import * as Icon from '@expo/vector-icons';
import DarkStatusBar from "../components/DarkStatusBar";

export default class ServiceScreen extends React.Component {
    static navigationOptions = ({ navigation }) => {
        const service = navigation.getParam('service', null);
        if (service === null) {
            return {
                title: 'Service details'
            };
        }

        return {
            title: service.name
        };
    };

    state = {
        service: null
    };

    constructor(props) {
        super(props);
        this._bootstrapAsync().then();
    }

    async _bootstrapAsync() {
    }

    componentDidMount() {
        const service = this.props.navigation.getParam('service', null);
        if (service === null) {
            this.props.navigation.goBack();
            DropdownSingleton.get().alertWithType('error', 'Unknow service', 'The service you are trying to access seems to be unavailable.');
            return;
        }

        this.setState({
            service: service
        });
    }

    render() {
        if (this.state.service === null) {
            return (<View></View>);
        }

        let dataToShow = [];
        for (let i in this.state.service.data) {
            dataToShow.push({
                key: i,
                value: this.state.service.data[i]
            });
        }

        return (
            <View style={styles.content}>
                <DarkStatusBar />
                <View style={{
                    width: '100%',
                    height: 190,
                    backgroundColor: '#3498DB',
                    alignItems: 'center',
                    paddingTop: 20
                }}>
                    <Image source={{uri: this.state.service.logo}} style={{
                        height: 100,
                        width: 100,
                        borderRadius: 50
                    }} />
                    <Text style={{
                        fontSize: 26,
                        fontWeight: '200',
                        color: '#fff',
                        paddingTop: 20
                    }}>{this.state.service.name}</Text>
                </View>
                <Text style={{
                    width: '100%',
                    textAlign: 'center',
                    fontWeight: '600',
                    fontSize: 20,
                    marginTop: 20
                }}>{this.state.service.domain}</Text>
                <Text style={{
                    width: '100%',
                    textAlign: 'center',
                    fontSize: 16,
                    marginTop: 5
                }}>Has access to the following:</Text>
                <FlatList
                    style={{
                        width: '100%',
                        marginTop: 30,
                        marginBottom: 30
                    }}
                    data={dataToShow}
                    renderItem={({item}) =>
                        <View style={{
                            height: 70,
                            backgroundColor: '#FFF',
                            paddingTop: 5,
                            paddingLeft: 15,
                            paddingRight: 15
                        }}>
                            <Text style={{
                                fontWeight: '700'
                            }}>{Config.dataList[item.key]}</Text>
                            {item.key !== 'avatar' && <View style={{
                                flexDirection: 'row'
                            }}>
                                <Icon.Ionicons
                                    name={'ios-arrow-forward'}
                                    size={22}
                                    color={'#666'}
                                    style={{
                                        paddingTop: 6
                                    }}
                                />
                                <Text style={{
                                    paddingTop: 5,
                                    paddingLeft: 10,
                                    fontSize: 18,
                                    color: '#666'
                                }}>{item.value}</Text>
                            </View>}
                        </View>
                    }
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    content: {
        flex: 1
    }
});
