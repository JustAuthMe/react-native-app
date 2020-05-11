module.exports = {
    join_revolution: 'Join the revolution',
    welcome: 'Welcome',
    how_it_works: 'How it works?',
    biometrics_rocks: 'Biometrics rocks',
    privacy_matters: 'Privacy matters',
    ready_go: 'Ready to go!',
    lets_go: 'Let\'s go!',
    terms: 'I read and I accept the TOS',
    terms_url: 'https://justauth.me/p/conditions-generales-dutilisation',
    go_back: 'Go back',
    not_now: 'Not now',
    having_trouble: 'Having trouble using the app?',
    contact_support: 'Contact support',
    cancel: 'Cancel',
    done: 'Done',
    ok: 'OK',
    ignore_step: 'Ignore this step',
    permission_required: 'Permission required',
    delete: 'Delete',
    error_default: 'Please contact support for further assistance.',
    error_too_many: 'You have tried too many times. Please wait a few minutes.',
    now_logged_in: 'You\'re now logged in!',
    are_you_sure: 'Are you sure?',
    back_btn: 'Back',
    data_list: {
        email: 'e-mail address',
        firstname: 'Firstname',
        lastname: 'Lastname',
        tel: 'Phone number',
        birthdate: 'Birthdate',
        avatar: 'Profile picture',
        address_1: 'Address line 1',
        address_2: 'Address line 2',
        postal_code: 'Postal code',
        city: 'City',
        state: 'State',
        country: 'Country',
        job: 'Job title',
        company: 'Company'
    },
    placeholders: {
        email: 'e.g. aiden@pearce.me',
        firstname: 'e.g. Aiden',
        lastname: 'e.g. Pearce',
        birthdate: 'e.g. 02/05/1974',
        address_1: 'e.g. 42 Main Street',
        address_2: 'e.g. Parker Square',
        postal_code: 'e.g. 60644',
        city: 'Chicago',
        state: 'e.g. Illinois',
        country: 'e.g. USA',
        job: 'e.g. CTO',
        company: 'e.g. Blume'
    },
    permission: {
        camera_roll: 'Sorry, you need to grant Camera roll permission to set your profile picture!',
        camera: 'You need camera permission to be able to scan QR Codes.'
    },
    try_again: 'Please try again',
    wait: 'Please wait',
    congratulations: 'Congratulations!',
    alert:{
        information:'Information',
        alert:'Alert'
    },
    ios_date_picker: {
        cancel: 'Close the date picker',
        done: 'Validate the date picker'
    },
    launch:{
        explanation1: 'Welcome to JustAuthMe! This app is meant to help you login to any website or app with the "Sign in with JAM" button, without a single password.',
        explanation2: 'To login to apps or websites, just to click the "Sign in with JAM" button and accept the login from the App, where you can check which informations you want to share.',
        explanation3: 'From there, you will be prompt to check your biometrical print (if your device is equiped) and the informations needed to log you will be automatically sent.',
        explanation4: 'Your personal informations are stored only on your device and will never be stored on our servers. If we can\'t access them, we can\'t sell them to anyone.',
        explanation5: 'We assume that your phone is the best way to authenticate yourself. Never remember a single password or fill a boring register form again.\nThis is JustAuthMe.',

        email:'Let\'s begin with your e-mail',
        enter_code: 'Enter the passcode you just received by e-mail',
        firstname:'What\'s your firstname?',
        lastname:'And your lastname?',
        birthdate:'What about your birthdate?',
        avatar:'Finally, chose an profile picture?',
        avatar_confirm:'Are you sure? You still could update your profile picture later.',

        generating: 'Generating',

        success: 'You successfully registered into JustAuthMe!\nWe sent you a confirmation e-mail.\nYou can now enjoy all JustAuthMe benefits.',

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
                register: 'Please try again in 30 seconds, this is an anti-spam measure',
                email_code: 'Please wait at least 2 minutes before asking for another code. Check your junk mail.',
            },

            invalid_email: 'Invalid e-mail',
            enter_valid_email: 'Please enter a valid e-mail address',

            already_member: 'Already member',
            account_already_existing: 'You already have a JustAuthMe account, please log in',
        }
    },
    home:{
        delete_service_confirm:'Delete the %{name} service?',
        delete_service_confirm_message:'This will NOT remove your %{domain} account, it will only remove the service from your login history.',
        error_delete: 'Cannot delete service',
        no_services_yet: 'You haven\'t logged to any of our partners website or app yet?',
        try_demo: 'Try our demo',
        authenticate: 'Authenticate',
        services: 'Services',
        hidden: {
            size: -80,
            delete: 75,
        }
    },
    scanner:{
        title: "QR Scanner"
    },
    auth:{
        title:'Authentication',
        confirm_login: 'Confirm login',

        invalid_token: 'Invalid Token',
        invalid_token_message: 'An error occurred while attempting to retrieve authentication details. Please try again or contact support.',

        biometric_error: 'Biometric rejection',
        biometric_error_message: 'Your system cannot recognize your fingerprint. Try to lock your phone and enter your passcode to reactivate it.',

        unauthorized_login: 'Unauthorized login',
        unauthorized_login_message: 'A wrong authentication attempt has been detected.',

        non_confirmed_email:'Non confirmed e-mail',
        non_confirmed_email_message:'Please confirm your e-mail address before trying to authenticate.',

        missing_data: 'Missing data',
        missing_data_message: 'A(n) %{data} is required to log into %{name}. Please fill in your %{data} before continuing',

        token_not_found: 'There is no such authentication token.',
        unknown_error: 'Unknown error',
        error_login: 'An error occurred during login challenge. Please contact support.',

        about_to_log: 'You\'re about to log into',
        missing: 'Missing',

        android_prompt: {
            waiting: 'Waiting...',
            verified: 'Verified!',
            retry: 'Please retry'
        },

        data_list: {
            first: '%{domain} will have access to the following',
            relog: '%{domain} has access to the following'
        }
    },
    service: {
        title: 'Service details',
        error_unknow: {
            title: 'Unknow service',
            text: 'The service you are trying to access seems to be unavailable.'
        },
        first_login: 'First login at',
        last_login: 'Last login at',
        has_access: 'Has access to the following'
    },
    settings: {
        title: 'Settings',
        version: {
            title: 'Version',
            text: 'Build'
        },
        orientation: 'Orientation',
        email: {
            title: 'Non confirmed e-mail address ?',
            text: 'Send me another confirmation e-mail'
        },
        support: {
            title: 'Help & Support',
            text: 'Contact support'
        },
        logout: 'Logout'
    },
    user: {
        title: 'My profile',
        error: {
            empty: {
                title: 'Empty field(s)',
                text: 'Please fill all the required informations.'
            },
            email_exists: {
                title: 'e-mail address is already registered',
                text: 'This e-mail address is associated to another JustAuthMe account.'
            },
            email_update: 'Cannot update e-mail address'
        },
        info: {
            inbox: {
                title: 'Check your inbox!',
                text: 'We sent you a confirmation e-mail to %{email}. Click on the link to confirm your new e-mail address.'
            },
            email_update: 'If you change your e-mail address, you\'ll need to confirm your new address before continuing to use JustAuthMe'
        },
        success: 'Saved successfully',
        save: 'Save'
    },
    continue: 'Continue'
}
