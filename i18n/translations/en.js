import {Text} from "react-native";
import React from "react";

export default {
    join_revolution: 'Join the revolution',
    welcome: 'Welcome',
    how_it_works: 'How it works?',
    biometrics_rocks: 'Biometrics rocks',
    privacy_matters: 'Privacy matters',
    ready_go: 'Ready to go!',
    lets_go: 'Let\'s go!',
    not_now: 'Not now',
    having_trouble: 'Having trouble using the app?',
    contact_support: 'Contact support',
    cancel: 'Cancel',
    ok: 'OK',
    ignore_step: 'Ignore this step',
    permission_required: 'Permission required',
    permission: {
        camera_roll: 'Sorry, you need to grant Camera roll permission to chose your avatar!'
    },
    try_again: 'Please try again',
    wait: 'Please wait',
    congratulations: 'Congratulations!',
    launch:{
        explanation1: 'Welcome to JustAuthMe! This app is meant to help you login to any website or app with the "Sign in with JAM" button, without a single password.',
        explanation2: 'To login to apps or websites, just to click the "Sign in with JAM" button and accept the login from the App, where you can check which informations you want to share.',
        explanation3: 'From there, you will be prompt to check your biometrical print (if your device is equiped) and the informations needed to log you will be automatically sent.',
        explanation4: 'Your personal informations are stored only on your device and will never be stored on our servers. If we can\'t access them, we can\'t sell them to anyone.',
        explanation5: 'We assume that your phone is the best way to authenticate yourself. Never remember a single password or fill a boring register form again.\nThis is JustAuthMe.',

        email:'Let\'s begin with your E-Mail',
        enter_code: 'Enter the passcode you just received by E-Mail',
        firstname:'What\'s your firstname?',
        lastname:'And your lastname?',
        birthdate:'What about your birthdate?',
        avatar:'Finally, chose an avatar?',
        avatar_confirm:'Are you sure? You still could update your avatar later.',

        generating: 'Generating',

        success: 'You successfully registered into JustAuthMe! You can now login on any website or app which provide the "Login with JustAuthMe" button.',

        action: {
            applogin_challenge: 'applogin challenge',
            email_check: 'email check'
        },

        error:{
            unknown: 'Unknown',
            unknown_message: 'An unknow error occured. Please contact support mentionning that an HTTP %{code} appeared during %{action}.',

            http: 'A HTTP %{code} error occured',
            http_message: 'Please contact support at support@justauth.me mentioning the error code %{code} at registration',

            wrong_passcode: 'Wrong passcode',

            anti_spam: 'Anti-Spam',
            anti_spam_message: {
                login: 'You have tried too many times. Please wait a few minutes.',
                register: 'Please try again in 30 seconds, this is an anti-spam measure',
                email_code: 'Please wait at least 2 minutes before asking for another code.',
                email: 'You have tried to many times. Please wait a few minutes.'
            },

            invalid_email: 'Invalid E-Mail',
            enter_valid_email: 'Please enter a valid E-Mail address',

            already_member: 'Already member',
            account_already_existing: 'You already have a JustAuthMe account, please log in',
        }
    },
    continue: 'Continue'

}
