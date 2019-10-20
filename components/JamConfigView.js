import React from 'react';
import {
    SectionList,
    Image,
    StyleSheet,
    Text,
    View,
    Alert,
    AsyncStorage,
    Button
} from 'react-native';
import Constants from 'expo-constants';
import Config from "../constants/Config";
import * as SecureStore from "expo-secure-store";


export default class JamConfigView extends React.Component {
    render() {
        const { manifest } = Constants;
        const sections = [
            { data: [{ value: 'build ' + manifest.version }], title: 'version' },
            { data: [{ value: manifest.orientation }], title: 'orientation' },
            {
                data: [
                    {
                        value:
                            manifest.ios && manifest.ios.supportsTablet ? 'true' : 'false',
                    },
                ],
                title: 'ios.supportsTablet',
            },
            {
                data: [
                    {
                        value: 'logout',
                        type: 'logout'
                    }
                ],
                title: 'logout' }
        ];

        return (
            <SectionList
                style={styles.container}
                renderItem={this._renderItem}
                renderSectionHeader={this._renderSectionHeader}
                stickySectionHeadersEnabled={true}
                keyExtractor={(item, index) => index}
                ListHeaderComponent={ListHeader}
                sections={sections}
            />
        );
    }

    _renderSectionHeader = ({ section }) => {
        return <SectionHeader title={section.title} />;
    };

    _renderItem = ({ item }) => {
        if (item.type === 'logout') {
            return (
                <SectionContent>
                    <Button onPress={() => this.logout()} title={item.value} />
                </SectionContent>
            );
        } else {
            return (
                <SectionContent>
                    <Text style={styles.sectionContentText}>
                        {item.value}
                    </Text>
                </SectionContent>
            );
        }
    };

    logout = () => {
        Alert.alert('Are you sure?', '', [
            {text: 'Cancel', onPress: () => {}, style:'cancel'},
            {text: 'OK', onPress: () => {
                    AsyncStorage.multiRemove([
                        Config.initDone.key,
                        'firstname',
                        'lastname',
                        'birthdate',
                        'email',
                        'avatar'
                    ], async () => {
                        AsyncStorage.getItem(Config.initDone.key).then(value => {
                            console.log('init done at logout:', value);
                        });

                        await SecureStore.deleteItemAsync(Config.storageKeys.publicKey);
                        await SecureStore.deleteItemAsync(Config.storageKeys.privateKey);
                        await SecureStore.deleteItemAsync(Config.storageKeys.jamID);

                        this.props.navigation.navigate('Launch');
                    });
                }}
        ]);
    };
}

const ListHeader = () => {
    const { manifest } = Constants;

    return (
        <View style={styles.titleContainer}>
            <View style={styles.titleIconContainer}>
                <AppIconPreview iconUrl={manifest.iconUrl} />
            </View>

            <View style={styles.titleTextContainer}>
                <Text style={styles.nameText} numberOfLines={1}>
                    {manifest.name}
                </Text>

                <Text style={styles.slugText} numberOfLines={1}>
                    {manifest.slug}
                </Text>

                <Text style={styles.descriptionText}>
                    {manifest.description}
                </Text>
            </View>
        </View>
    );
};

const SectionHeader = ({ title }) => {
    return (
        <View style={styles.sectionHeaderContainer}>
            <Text style={styles.sectionHeaderText}>
                {title}
            </Text>
        </View>
    );
};

const SectionContent = props => {
    return (
        <View style={styles.sectionContentContainer}>
            {props.children}
        </View>
    );
};

const AppIconPreview = ({ iconUrl }) => {
    if (!iconUrl) {
        iconUrl =
            'https://s3.amazonaws.com/exp-brand-assets/ExponentEmptyManifest_192.png';
    }

    return (
        <Image
            source={{ uri: iconUrl }}
            style={{ width: 64, height: 64 }}
            resizeMode="cover"
        />
    );
};

const Color = ({ value }) => {
    if (!value) {
        return <View />;
    } else {
        return (
            <View style={styles.colorContainer}>
                <View style={[styles.colorPreview, { backgroundColor: value }]} />
                <View style={styles.colorTextContainer}>
                    <Text style={styles.sectionContentText}>
                        {value}
                    </Text>
                </View>
            </View>
        );
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    titleContainer: {
        paddingHorizontal: 15,
        paddingTop: 15,
        paddingBottom: 15,
        flexDirection: 'row',
    },
    titleIconContainer: {
        marginRight: 15,
        paddingTop: 2,
    },
    sectionHeaderContainer: {
        backgroundColor: '#fbfbfb',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#ededed',
    },
    sectionHeaderText: {
        fontSize: 14,
    },
    sectionContentContainer: {
        paddingTop: 8,
        paddingBottom: 12,
        paddingHorizontal: 15,
    },
    sectionContentText: {
        color: '#808080',
        fontSize: 14,
    },
    nameText: {
        fontWeight: '600',
        fontSize: 18,
    },
    slugText: {
        color: '#a39f9f',
        fontSize: 14,
        backgroundColor: 'transparent',
    },
    descriptionText: {
        fontSize: 14,
        marginTop: 6,
        color: '#4d4d4d',
    },
    colorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    colorPreview: {
        width: 17,
        height: 17,
        borderRadius: 2,
        marginRight: 6,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#ccc',
    },
    colorTextContainer: {
        flex: 1,
    },
});
