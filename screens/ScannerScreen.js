import React from 'react';
import {
    View,
    StyleSheet
} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import {AuthSingleton} from "../models/AuthSingleton";
import DarkStatusBar from "../components/DarkStatusBar";
import * as Permissions from 'expo-permissions';
import {DropdownSingleton} from "../models/DropdownSingleton";

export default class ScannerScreen extends React.Component {
    static navigationOptions = {
        title: 'QR Scanner',
    };

    state = {
        hasCameraPermission: false
    };

    async componentDidMount() {
        this.getPermissionsAsync();
    }

    getPermissionsAsync = async () => {
        const permissionResponse = await Permissions.askAsync(Permissions.CAMERA);
        console.log(permissionResponse);
        if (permissionResponse.status !== 'granted') {
            this.props.navigation.goBack();
            DropdownSingleton.get().alertWithType('error', 'Permission required', 'You need camera permission to be able to scan QR Codes.');
            return;
        }

        this.setState({ hasCameraPermission: true});
    };

    constructor(props) {
        super(props);
        this.isBarCodeScannerEnabled = true;
    }

    _handleBarCodeScanned = ({ type, data }) => {
        console.log('scanned:', type);
        console.log('expecting:', BarCodeScanner.Constants.BarCodeType.qr);
        if (this.isBarCodeScannerEnabled && type === BarCodeScanner.Constants.BarCodeType.qr) {
            this.isBarCodeScannerEnabled = false;
            AuthSingleton.get().authByDeepLink(data, this.props.navigation);

            window.setTimeout(() => {
                this.isBarCodeScannerEnabled = true;
            }, 2000);
        }
    };

    render() {
        return (
            <View style={styles.container}>
                <DarkStatusBar/>
                <BarCodeScanner onBarCodeScanned={this._handleBarCodeScanned} style={StyleSheet.absoluteFillObject} />
                <View style={{
                    backgroundColor: 'transparent',
                    borderLeftWidth: 2,
                    borderTopWidth: 2,
                    borderColor: '#fff',
                    borderStyle: 'solid',
                    width: 50,
                    height: 50,
                    position: 'absolute',
                    top: 150,
                    left: 50,
                    borderTopLeftRadius: 20
                }}></View>
                <View style={{
                    backgroundColor: 'transparent',
                    borderRightWidth: 2,
                    borderTopWidth: 2,
                    borderColor: '#fff',
                    borderStyle: 'solid',
                    width: 50,
                    height: 50,
                    position: 'absolute',
                    top: 150,
                    right: 50,
                    borderTopRightRadius: 20
                }}></View>
                <View style={{
                    backgroundColor: 'transparent',
                    borderLeftWidth: 2,
                    borderBottomWidth: 2,
                    borderColor: '#fff',
                    borderStyle: 'solid',
                    width: 50,
                    height: 50,
                    position: 'absolute',
                    bottom: 150,
                    left: 50,
                    borderBottomLeftRadius: 20
                }}></View>
                <View style={{
                    backgroundColor: 'transparent',
                    borderRightWidth: 2,
                    borderBottomWidth: 2,
                    borderColor: '#fff',
                    borderStyle: 'solid',
                    width: 50,
                    height: 50,
                    position: 'absolute',
                    bottom: 150,
                    right: 50,
                    borderBottomRightRadius: 20
                }}></View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    }
});
