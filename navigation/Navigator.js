import {
    NavigationRouteConfigMap,
    createSwitchNavigator as originalCreateSwitchNavigator,
    SwitchNavigatorConfig
} from "react-navigation";
import {
    StackNavigatorConfig,
    createStackNavigator as originalCreateStackNavigator,
} from "react-navigation-stack";
import {Platform} from "react-native";
import Translator from "../i18n/Translator";

function createDefaultNavigator(navigatorCreator, routeConfigMap: NavigationRouteConfigMap, stackConfig: StackNavigatorConfig|SwitchNavigatorConfig = {}){
    let defaultNavigationOptions = {
        headerTitleStyle: {
            ...(Platform.OS === 'android' ? {fontFamily: 'Roboto'} : {})
        },
        headerBackTitle: Translator.t('back_btn'),
        headerTruncatedBackTitle: Translator.t('back_btn')
    };

    let customStackConfig = {
        ...stackConfig,
        defaultNavigationOptions: {
            ...(stackConfig.defaultNavigationOptions ? stackConfig.defaultNavigationOptions : {}),
            ...defaultNavigationOptions,
        }
    };
    return navigatorCreator(routeConfigMap, customStackConfig)
}

export function createStackNavigator(routeConfigMap: NavigationRouteConfigMap, stackConfig?: StackNavigatorConfig){
    return createDefaultNavigator(originalCreateStackNavigator, routeConfigMap, stackConfig);
}

export function createSwitchNavigator(routeConfigMap: NavigationRouteConfigMap, switchConfig?: SwitchNavigatorConfig){
    return createDefaultNavigator(originalCreateSwitchNavigator, routeConfigMap, switchConfig);
}
