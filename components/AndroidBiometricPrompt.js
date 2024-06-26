import React from 'react';
import {
    View,
    StyleSheet,
    Text,
    Button
} from 'react-native';
import * as Icon from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import Translator from "../i18n/Translator";

export default class AndroidBiometricPrompt extends React.Component {
    state = {
        visible: false,
        status: 'wait'
    };

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
                        color={this.state.status === 'wait' ? '#bbb' : (this.state.status === 'success' ? userStyles.biometricSuccessColor : userStyles.biometricErrorColor)}
                        style={styles.icon}
                    />
                    <Text style={{
                        ...styles.statusText,
                        color: this.state.status === 'wait' ? '#bbb' : (this.state.status === 'success' ? userStyles.biometricSuccessColor : userStyles.biometricErrorColor)
                    }}>{this.state.status === 'wait' ?
                        Translator.t('auth.android_prompt.waiting') : (
                            this.state.status === 'success' ?
                                Translator.t('auth.android_prompt.verified') :
                                Translator.t('auth.android_prompt.retry')
                        )
                    }</Text>
                    <View style={styles.btnContainer}>
                        <Button
                            title={'Cancel'}
                            color={'#1565c0'}
                            onPress={async () => {
                                await LocalAuthentication.cancelAuthenticate();
                                this.setState({visible: false})
                            }}
                        />
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
    }
});

const userStyles = {
    biometricSuccessColor: '#00c853',
    biometricErrorColor: '#b71c1c'
};