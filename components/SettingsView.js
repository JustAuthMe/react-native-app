import React from "react";
import {View, Text, Linking, Platform} from "react-native";
import {SettingsData, SettingsScreen as SettingsScreenComponent} from "@taccolaa/react-native-settings-screen";
import Translator from "../i18n/Translator";
import Constants from "expo-constants";
import {Ionicons, FontAwesome} from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import Colors from '../constants/Colors';

export const SettingsView = ({onConfirmEmail, onUpdate, onLogout, showEmailSend}) => {
    const {manifest} = Constants;

    const openJamLink = (uri?: string, external?: boolean) => {
        external = external || false;
        const url = `https://justauth.me/${uri || ""}`;

        if (external) {
            Linking.openURL(url)
        } else {
            WebBrowser.openBrowserAsync(url);
        }
    }

    const settingsData: SettingsData = [
        {
            type: 'SECTION',
            rows: [
                {
                    title: Translator.t('settings.email'),
                    onPress: onConfirmEmail,
                    visible: showEmailSend ?? true,
                    renderBeforeAccessory: () => <ItemIcon icon={"md-mail"} color={'#74b42e'}/>,
                },
                {
                    title: Translator.t('settings.update'),
                    onPress: onUpdate,
                    renderBeforeAccessory: () => <ItemIcon icon={"ios-refresh"} color={Colors.tintColor}/>
                },
                {
                    title: Translator.t('settings.support'),
                    onPress: () => Linking.openURL('mailto:support@justauth.me?subject=[Support] ' + Platform.OS + ' ' + manifest.version),
                    renderBeforeAccessory: () => <ItemIcon icon={"md-bug"} color={'#ff9900'}/>,
                }
            ],
        },
        {
            type: 'SECTION',
            header: "JustAuthMe",
            rows: [
                {
                    title: Translator.t("settings.about"),
                    showDisclosureIndicator: true,
                    onPress: () => openJamLink('', true)
                },
                {
                    title: Translator.t("settings.dev"),
                    showDisclosureIndicator: true,
                    onPress: () => Linking.openURL('https://developers.justauth.me')
                }
            ],
        },
        {
            type: 'SECTION',
            header: Translator.t('settings.legal'),
            rows: [
                {
                    title: Translator.t("settings.notice.label"),
                    showDisclosureIndicator: true,
                    onPress: () => openJamLink(Translator.t("settings.notice.url"))
                },
                {
                    title: Translator.t("settings.privacy.label"),
                    showDisclosureIndicator: true,
                    onPress: () => openJamLink(Translator.t("settings.privacy.url"))
                },
                {
                    title: Translator.t("settings.tos.label"),
                    showDisclosureIndicator: true,
                    onPress: () => openJamLink(Translator.t("settings.tos.url"))
                }
            ]
        },
        {
            type: 'SECTION',
            rows: [
                {
                    key: 'logoutbtn',
                    onPress: onLogout,
                    renderBeforeAccessory: () => <ItemIcon color={'#f00'}><FontAwesome size={20} color={"white"} name={"lock"} /></ItemIcon>,
                    title: Translator.t('settings.logout'),
                }
            ]
        },
        {
            type: 'CUSTOM_VIEW',
            render: () => (
                <Text
                    style={{
                        alignSelf: 'center',
                        fontSize: 18,
                        color: '#999',
                        marginBottom: 40,
                        marginTop: 30,
                    }}
                >
                    {Translator.t('settings.version') + ' ' + manifest.version}
                </Text>
            ),
        },
    ];

    return <SettingsScreenComponent style={{paddingTop: 20}}
                                    data={settingsData.map((section, i) => ({...section, key: i}))}
                                    globalTextStyle={{color: "black"}}/>;

};

const ItemIcon = ({icon, color, children}) => {

    return <View style={{marginRight: 5}}>
        <View style={{
            backgroundColor: color,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 5,
            width: 30,
            height: 30
        }}>
            {children || <Ionicons style={{
                alignContent: 'center',
                marginBottom: -1,
                marginLeft: 1
            }} name={icon} color={'white'} size={20}/> }
        </View>
    </View>
}
