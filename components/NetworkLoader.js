import React from 'react';
import {
    View,
    StyleSheet,
    ActivityIndicator
} from 'react-native';

export default class NetworkLoader extends React.Component {
    state = {
        visible: false
    };

    render() {
        let render =
            <View style={{
                ...styles.overlay,
                display: this.state.visible ? 'flex' : 'none'
            }}>
                <View style={styles.container}>
                    <ActivityIndicator size={'large'} color={'#555'} />
                </View>
            </View>
        ;
        if (Platform.OS === 'android') {
            render =
                <View style={{
                    width: '100%',
                    height: '100%',
                    display: this.state.visible ? 'flex' : 'none'
                }}>
                    <View style={styles.overlay}>
                        <View style={styles.container}>
                            <ActivityIndicator size={'large'} color={'#555'} />
                        </View>
                    </View>
                </View>
            ;
        }

        return render;
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