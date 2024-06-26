import React from 'react';
import {
    View,
    StyleSheet,
    Image,
    FlatList
} from 'react-native';
import {DropdownSingleton} from "../models/DropdownSingleton";
import DarkStatusBar from "../components/DarkStatusBar";
import {DateModel} from "../models/DateModel";
import Text from '../components/JamText'
import Translator from "../i18n/Translator";

export default class ServiceScreen extends React.Component {
    static navigationOptions = ({ navigation }) => {
        const service = navigation.getParam('service', null);
        if (service === null) {
            return {
                title: Translator.t('service.title')
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
            DropdownSingleton.get().alertWithType('warn', Translator.t('service.error_unknow.title'), Translator.t('service.error_unknow.text'));
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

        const dateModel = new DateModel();

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

                {this.state.service.created_at && <Text style={{
                    textAlign: 'center',
                    fontSize: 14,
                    paddingTop: 10,
                    paddingBottom: 5,
                    color: '#888'
                }}>{Translator.t('service.first_login')}: {dateModel.getFullDate(new Date(this.state.service.created_at))}</Text>}
                {this.state.service.updated_at && <Text style={{
                    textAlign: 'center',
                    fontSize: 14,
                    color: '#888'
                }}>{Translator.t('service.last_login')}: {dateModel.getFullDate(new Date(this.state.service.updated_at))}</Text>}
                <Text style={{
                    width: '100%',
                    textAlign: 'center',
                    fontWeight: '600',
                    fontSize: 20,
                    marginTop: 15
                }}>{this.state.service.domain}</Text>
                <Text style={{
                    width: '100%',
                    textAlign: 'center',
                    fontSize: 16,
                    marginTop: 5
                }}>{Translator.t('service.has_access')}:</Text>
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
                                fontWeight: '700',
                                fontSize: 18
                            }}>&rarr; {Translator.t('data_list.' + item.key)}</Text>
                            {item.key !== 'avatar' && <View style={{
                                flexDirection: 'row'
                            }}>
                                <Text style={{
                                    paddingTop: 5,
                                    fontSize: 14,
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
        backgroundColor: 'white',
        flex: 1
    }
});
