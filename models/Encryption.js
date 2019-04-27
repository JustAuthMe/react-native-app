import forge from 'node-forge';
import { SecureStore } from 'expo';
import Config from "../constants/Config";

export class Encryption {
    generateKeypair() {
        // Keypair generation (take a hell of a time)
        const start = new Date().getTime();
        new Promise((fulfill, reject) => forge.pki.rsa.generateKeyPair(
            2048, (err, pair) => err ? reject(err) : fulfill(pair)))
            .then(keypair => {
                // Keys extraction
                const priv = keypair.privateKey;
                const pub = keypair.publicKey;

                // Serializing to PEM
                const pubPem  = forge.pki.publicKeyToPem(pub);
                const privPem  = forge.pki.privateKeyToPem(priv);

                // Storing keypair
                SecureStore.setItemAsync(Config.storageKeys.publicKey, pubPem, {
                    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
                }).then(() => {}).catch(err => console.log(err));
                SecureStore.setItemAsync(Config.storageKeys.privateKey, privPem, {
                    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
                }).then(() => {}).catch(err => console.log(err));

                const took = (new Date().getTime() - start) / 1000;
                console.log(pubPem);
                console.log(privPem);
                console.log('Took ' + took + ' seconds');
            }).catch(err => console.log(err));
    }

    async sign(dataString) {
        const privKeyPem = await SecureStore.getItemAsync(Config.storageKeys.privateKey)
        const privKey = forge.pki.privateKeyFromPem(privKeyPem);
        const hash = forge.md.sha512.create();
        hash.update(dataString);

        return forge.util.encode64(privKey.sign(hash));
    }
}