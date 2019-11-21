import React from 'react';
import {
    View,
    StyleSheet,
    Text,
    Button
} from 'react-native';
import * as Icon from '@expo/vector-icons';

export default class AndroidBiometricPrompt extends React.Component {
    state = {
        visible: false,
        status: 'wait'
    };

    componentDidMount() {
        console.log('visible:', this.state.visible);
        console.log('state:', this.state);
    }

    render() {
        if (!this.state.visible) {
            return null;
        }

        return (
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.headerText}>Biometric validation</Text>
                    <Text style={styles.contentText}>Please confirm your face or fingerprint</Text>
                    <Icon.Ionicons
                        name={'md-finger-print'}
                        size={70}
                        color={this.state.status === 'wait' ? '#bbb' : (this.state.status === 'success' ? styles.biometricSuccessColor : styles.biometricErrorColor)}
                        style={styles.icon}
                    />
                    <Text style={{
                        ...styles.statusText,
                        color: this.state.status === 'wait' ? '#bbb' : (this.state.status === 'success' ? styles.biometricSuccessColor : styles.biometricErrorColor)
                    }}>{this.state.status === 'wait' ? 'Waiting...' : (this.state.status === 'success' ? 'Verified!' : 'Please retry')}</Text>
                    <View style={styles.btnContainer}>
                        <Button
                            title={'Cancel'}
                            color={'#1565c0'}
                            onPress={() => this.setState({visible: false})}
                        />
                        {/*<Button
                            title={'Use passcode'}
                            color={'#1565c0'}
                        />*/}
                    </View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        zIndex: 100,
        width: '100%',
        height: '100%',
        backgroundColor: '#000000aa'
    },
    container: {
        backgroundColor: 'white',
        position: 'absolute',
        zIndex: 101,
        background: 'white',
        alignSelf: 'center',
        width: '80%',
        height: 280,
        top: '30%',
        borderRadius: 3,
        paddingTop: 20,
        paddingRight: 30,
        paddingBottom: 20,
        paddingLeft: 30
    },
    headerText: {
        fontSize: 22,
        fontWeight: '600'
    },
    contentText: {
        fontSize: 16,
        width: '100%',
        color: '#747474',
        marginTop: 15
    },
    icon: {
        marginTop: 20,
        alignSelf: 'center'
    },
    btnContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15
    },
    statusText: {
        fontSize: 12,
        alignSelf: 'center'
    },
    biometricSuccessColor: '#00c853',
    biometricErrorColor: '#b71c1c'
});