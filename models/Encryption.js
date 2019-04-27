import forge from 'node-forge';
import { SecureStore } from 'expo';
import Config from "../constants/Config";

export class Encryption {
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
            console.log(pubPem);
            console.log(privPem);

            // Storing keypair
            await SecureStore.setItemAsync(Config.storageKeys.publicKey, pubPem, {
                keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
            });
            await SecureStore.setItemAsync(Config.storageKeys.privateKey, privPem, {
                keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
            });

            const took = (new Date().getTime() - start) / 1000;
            console.log('Took ' + took + ' seconds');
        });
    }

    async sign(dataString) {
        const privKeyPem = await SecureStore.getItemAsync(Config.storageKeys.privateKey)
        const privKey = forge.pki.privateKeyFromPem(privKeyPem);
        const hash = forge.md.sha512.create();
        hash.update(dataString);

        return forge.util.encode64(privKey.sign(hash));
    }
}