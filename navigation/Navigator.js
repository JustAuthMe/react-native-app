import {
    NavigationRouteConfigMap,
    StackNavigatorConfig,
    createStackNavigator as originalCreateStackNavigator,
    createSwitchNavigator as originalCreateSwitchNavigator,
    SwitchNavigatorConfig
} from "react-navigation";
import {Platform} from "react-native";

function createDefaultNavigator(navigatorCreator, routeConfigMap: NavigationRouteConfigMap, stackConfig?: StackNavigatorConfig|SwitchNavigatorConfig = {}){
    let defaultNavigationOptions = {
        headerTitleStyle: {
            fontFamily: Platform.OS === 'android' ? 'Roboto' : 'system font'
        }
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
