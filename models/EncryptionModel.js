import forge from 'node-forge';
import * as SecureStore from 'expo-secure-store';
import Config from "../constants/Config";

export class EncryptionModel {
    async generateKeypair() {
        // Keypair generation (take a hell of a time)
        const start = new Date().getTime();
        await forge.pki.rsa.generateKeyPair(2048, async (err, keypair) => {
            // Keys extraction
            const priv = keypair.privateKey;
            const pub = keypair.publicKey;

            // Serializing to PEM
            const pubPem  = forge.pki.publicKeyToPem(pub);
            const privPem  = forge.pki.privateKeyToPem(priv);

            // Storing keypair
            await SecureStore.setItemAsync(Config.storageKeys.publicKey, pubPem, {
                keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
            });
            await SecureStore.setItemAsync(Config.storageKeys.privateKey, privPem, {
                keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
            });
        });
    }

    async sign(dataString) {
        const privKeyPem = await SecureStore.getItemAsync(Config.storageKeys.privateKey)
        const privKey = forge.pki.privateKeyFromPem(privKeyPem);
        const hash = forge.md.sha512.create();
        hash.update(dataString);

        return forge.util.encode64(privKey.sign(hash));
    }

    urlencode(data) {
        return encodeURIComponent(data)
            .replace(/!/g, '%21')
            .replace(/'/g, '%27')
            .replace(/\(/g, '%28')
            .replace(/\)/g, '%29')
            .replace(/\*/g, '%2A')
            .replace(/~/g, '%7E')
            .replace(/%20/g, '+');
    }

    json_encode(data) {
        return JSON.stringify(data)
            .replace(/\//g, '\\/');
    }
}