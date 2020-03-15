import React from 'react';
import {
    View,
    StyleSheet,
    ActivityIndicator
} from 'react-native';

export default class NetworkLoader extends React.Component {
    render() {
        return (
            <View style={{
                ...styles.overlay,
                display: this.props.visible ? 'flex' : 'none'
            }}>
                  <View style={styles.container}>
                      <ActivityIndicator size={'large'} color={'#555'} />
                  </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    overlay: {
        height: '100%',
        width: '100%',
        position: 'absolute',
        zIndex: 200,
        alignItems: 'center',
        justifyContent: 'center',
    },
    container: {
        height: 120,
        width: 120,
        backgroundColor: '#ffffffaa',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center'
    }
});