import React from 'react';
import {
    Text,
    FlatList,
    Button
} from 'react-native';

export default class AuthDataList extends React.Component {
    state = {
        data: this.props.data
    };

    render() {
        return (
            <View>
                <FlatList
                    style={this.props.style}
                    data={this.state.data}
                    renderItem={item => <Text>{item}</Text>}
                />
                <Button title="Confirm login" onPress={this.props.onAccept} />
            </View>
        );
    }
}
