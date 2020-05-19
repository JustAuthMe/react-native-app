import React from 'react';
import {
    View,
    Image,
    ScrollView
} from 'react-native';
import Translator from "../i18n/Translator";
import Text from './JamText';

export default class SwiperPage extends React.Component {
    render() {
        return (
            <View style={{
                height: '100%',
                paddingTop: 20,
            }}>
                <View style={{
                    width: '100%',
                    position: 'relative',
                    flex: 1.3
                }}>
                    <Image source={this.props.image} style={{
                        position: 'absolute',
                        top: 0,
                        width: '100%',
                        height: '100%'
                    }}/>
                </View>
                <ScrollView style={{
                    flex: 1,
                    marginLeft: 20,
                    marginRight: 20,
                    marginBottom: 30
                }}>
                    <Text style={{
                        fontSize: 16,
                        textAlign: 'center',
                        color: '#555'
                    }}>
                        {Translator.t(this.props.text)}
                    </Text>
                </ScrollView>
            </View>
        );
    }
}