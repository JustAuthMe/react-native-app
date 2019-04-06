import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default class LaunchScreen extends React.Component {
    static navigationOptions = {
        header: null,
    };

    state = {
        step: this.props.navigation.getParam('step') ? this.props.navigation.state.params.step : 'default'
    };

    render() {
        switch (this.state.step) {
            case 'firstname':

                break;

            default:
                return (
                    <View style={styles.container}>
                        <Image style={styles.logo} source={require('../assets/images/logo-small.png')}/>
                        <Text style={styles.baseline}>Join the revolution {this.state.step}</Text>
                        <TouchableOpacity style={styles.startBtn} onPress={() => this.props.navigation.push('Launch', {step: 'firstname'})}>
                            <Ionicons name="ios-arrow-forward" size={56} color="white" style={styles.arrowIcon}/>
                        </TouchableOpacity>
                        <View style={styles.footer}>
                            <Text style={styles.alreadyMember}>Are you already a JustAuth.Me member?</Text>
                            <TouchableOpacity>
                                <Text style={styles.recover}>Recover your account</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
                break;
        }
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#3598DB',
        flex: 1,
        width: '100%',
        height: '100%',
        alignItems: 'center'
    },
    logo: {
        marginTop: 150,
        width: '100%',
        height: 65,
        resizeMode: 'contain'
    },
    baseline: {
        fontSize: 24,
        textAlign: 'center',
        color: 'white',
        fontWeight: '300',
        marginTop: 80
    },
    startBtn: {
        width: 100,
        height: 100,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: 'white',
        borderRadius: 50,
        marginTop: 40,
        justifyContent: 'center',
        alignItems: 'center'
    },
    arrowIcon: {
        marginTop: 5,
        marginLeft: 5
    },
    footer: {
        flex: 1,
        justifyContent: 'flex-end',
        marginBottom: 70
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
