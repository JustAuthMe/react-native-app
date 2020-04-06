import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Linking,
    Platform
} from 'react-native';
import Constants from 'expo-constants';
import Translator from "../i18n/Translator";

export default class LaunchFooter extends React.Component {
    render() {
        const { manifest } = Constants;
        return (
            <View style={styles.footer}>
                <Text style={styles.alreadyMember}>{Translator.t('having_trouble') }</Text>
                <TouchableOpacity onPress={() => Linking.openURL('mailto:support@justauth.me?subject=[Support] ' + Platform.OS + ' ' + manifest.version)}>
                    <Text style={styles.recover}>{Translator.t('contact_support') }</Text>
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
        marginTop: 5
    }
});
