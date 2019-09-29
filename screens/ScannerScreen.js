import React from 'react';
import {
    View,
    StyleSheet
} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import Config from "../constants/Config";
import {AuthModel} from "../models/AuthModel";
import DarkStatusBar from "../components/DarkStatusBar";

export default class ScannerScreen extends React.Component {
    static navigationOptions = {
        title: 'QR Scanner',
    };

    state = {};

    constructor(props) {
        super(props);
        this.isBarCodeScannerEnabled = true;
    }

    _handleBarCodeScanned = ({ type, data }) => {
        if (this.isBarCodeScannerEnabled && type === 'org.iso.QRCode') {
            this.isBarCodeScannerEnabled = false;
            const authModel = new AuthModel();
            authModel.authByDeepLink(data, this.props.navigation);

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
