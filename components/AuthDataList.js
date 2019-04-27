import React from 'react';
import {
    View,
    Text,
    FlatList,
    Button
} from 'react-native';

export default class AuthDataList extends React.Component {
    state = {
        data: this.props.auth.data
    };

    render() {
        console.log(this.state.data);
        return (
            <View>
                <Text>{this.props.auth.client_app.domain} will have access to the following:</Text>
                <FlatList
                    style={this.props.style}
                    data={this.state.data}
                    renderItem={item => <Text>{item.toString()}</Text>}
                />
                <Button title="Confirm login" onPress={this.props.onAccept} />
            </View>
        );
    }
}
