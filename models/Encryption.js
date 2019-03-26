import forge from 'node-forge';
import { SecureStore } from 'expo';

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
                SecureStore.setItemAsync('pubkey', pubPem, {
                    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
                }).then(() => {}).catch(err => console.log(err));
                SecureStore.setItemAsync('privkey', privPem, {
                    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
                }).then(() => {}).catch(err => console.log(err));

                const took = (new Date().getTime() - start) / 1000;
                console.log(pubPem);
                console.log(privPem);
                console.log('Took ' + took + ' seconds');
            }).catch(err => console.log(err));
    }
}