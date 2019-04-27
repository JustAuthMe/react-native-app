import React from 'react';
import {
    View,
    Text,
    FlatList,
    Button
} from 'react-native';

export default class AuthDataList extends React.Component {
    render() {
        console.log(this.props.data);
        return (
            <View>
                <Text>{this.props.domain} will have access to the following:</Text>
                <FlatList
                    style={this.props.style}
                    data={this.props.data}
                    renderItem={({item}) => <Text>{item.key}</Text>}
                />
                <Button title="Confirm login" onPress={this.props.onAccept} />
            </View>
        );
    }
}
