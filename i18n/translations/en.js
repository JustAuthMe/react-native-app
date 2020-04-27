exports.default =  {
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
    delete: 'Delete',
    permi_ssion: {
        camera_roll: 'Sorry, you need to grant Camera roll permission to chose your avatar!',
        camera: 'You need camera permission to be able to scan QR Codes.'
    },
    try_again: 'Please try again',
    wait: 'Please wait',
    congratulations: 'Congratulations!',
    alert:{
        information:'Information',
        alert:'Alert'
    },
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
    home:{
        delete_service_confirm:'Delete the %{name} service?',
        delete_service_confirm_message:'This will NOT remove your %{domain} account, it will only remove the service from your login history.',
        error_delete: 'Cannot delete service',
        error_delete_message: 'Please contact support for further assistance.',
        no_services_yet: 'You haven\'t logged to any of our partners website or app yet. Just click the "Authenticate" button above to begin your JustAuthMe experience.',
        authenticate: 'Authenticate',
        services: 'Services'
    },
    scanner:{
        title: "QR Scanner"
    },
    auth:{
        title:'Authentication',
        confirm_login: 'Confirm login attempt',

        invalid_token: 'Invalid Token',
        invalid_token_message: 'An error occurred while attempting to retrieve authentication details. Please try again or contact support.',

        biometric_error: 'Biometric rejection',
        biometric_error_message: 'Your system cannot recognize your fingerprint. Please lock your phone and enter your passcode to reactivate it.',

        unauthorized_login: 'Unauthorized login',
        unauthorized_login_message: 'A wrong authentication attempt has been detected.',

        non_confirmed_email:'Non confirmed E-Mail',
        non_confirmed_email_message:'Please confirm your E-Mail address before trying to authenticate.',

        token_not_found: 'There is no such authentication token.',
        unknown_error: 'Unknown error',
        error_login: 'An error occurred during login challenge. Please contact support.',

        about_to_log: 'You\'re about to log into',
    },
    continue: 'Continue'

}
