import { Audio } from 'expo-av';

const soundObjects = {};

export class AudioModel {
    static load(library) {
        const promisedSoundObjects = []

        for (const name in library) {
            const sound = library[name];

            soundObjects[name] = new Audio.Sound();

            promisedSoundObjects.push(
                soundObjects[name].loadAsync(sound)
            );
        }

        return promisedSoundObjects
    }

    static async play(name) {
        try {
            if (soundObjects[name]) {
                await soundObjects[name].replayAsync();
                window.setTimeout(() =>
                    soundObjects[name].stopAsync().then(),
                    2000
                );
            }
        } catch (error) {}
    }
}
