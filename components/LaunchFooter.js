import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Constants } from 'expo';

export default class LaunchFooter extends React.Component {
    render() {
        return (
            <View style={styles.footer}>
                <Text style={styles.alreadyMember}>Are you already a JustAuth.Me member?</Text>
                <TouchableOpacity onPress={() => Alert.alert('We\'re sorry...', 'This feature isn\'t implemented yet.')}>
                    <Text style={styles.recover}>Recover your account</Text>
                </TouchableOpacity>
            </View>
        );
    }
}

const isBorderless = Constants.statusBarHeight > 20;
const styles = StyleSheet.create({
    footer: {
        flex: 1,
        justifyContent: 'flex-end',
        marginBottom: isBorderless ? 70 : 30
    },
    alreadyMember: {
        color: 'white',
        textAlign: 'center'
    },
    recover: {
        color: '#A7CADD',
        textAlign: 'center',
        marginTop: 15
    }
});
