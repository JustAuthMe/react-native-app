import React from 'react';
import {
    View,
    StyleSheet,
    Text,
    StatusBar,
    Image
} from 'react-native';
import {DropdownSingleton} from "../models/DropdownSingleton";

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

        this.setState({
            service: service
        });
    }

    render() {
        if (this.state.service === null) {
            return (<View></View>);
        }

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
                    fontWeight: 600,
                    fontSize: 20,
                    marginTop: 20
                }}>{this.state.service.domain}</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    content: {
        flex: 1
    }
});
