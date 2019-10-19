import React from 'react';
import {
    View,
    StyleSheet,
    Text,
    StatusBar,
    Image,
    FlatList
} from 'react-native';
import {DropdownSingleton} from "../models/DropdownSingleton";
import Config from "../constants/Config";

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
        StatusBar.setBarStyle('dark-content');
    }

    componentDidMount() {
        const service = this.props.navigation.getParam('service', null);
        if (service === null) {
            this.props.navigation.goBack();
            DropdownSingleton.get().alertWithType('error', 'Unknow service', 'The service you are trying to access seems to be unavailable.');
            return;
        }

        console.log('shown service:', service);
        this.setState({
            service: service
        });
    }

    render() {
        if (this.state.service === null) {
            return (<View></View>);
        }

        let dataToShow = [];
        for (let i = 0; i < this.state.service.data.length; i++) {
            dataToShow.push({
                key: this.state.service.data[i]
            });
        }
        console.log('data to show:', dataToShow);

        return (
            <View style={styles.content}>
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
                        marginTop: 30
                    }}
                    data={this.state.service.data}
                    renderItem={({item}) =>
                        <Text style={{
                            fontSize: 18,
                            paddingLeft: 30,
                            paddingTop: 5
                        }}>> {Config.dataList[item]}</Text>
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
