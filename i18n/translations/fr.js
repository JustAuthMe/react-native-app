module.exports = {
    join_revolution: 'Rejoignez la révolution',
    welcome: 'Bienvenue',
    how_it_works: 'Comment ça marche ?',
    biometrics_rocks: 'Vive la biométrie',
    privacy_matters: 'Votre vie privée',
    ready_go: 'Tout est prêt !',
    lets_go: 'C\'est parti !',
    terms: 'J\'ai lu et j\'accepte les CGU',
    terms_url: 'https://justauth.me/p/conditions-generales-dutilisation',
    go_back: 'Retour',
    not_now: 'Pas maintenant',
    having_trouble: 'Vous rencontrez des difficultés ?',
    contact_support: 'Contacter le support',
    cancel: 'Annuler',
    done: 'OK',
    ok: 'OK',
    ignore_step: 'Ignorer cette étape',
    permission_required: 'Permission requise',
    delete: 'Supprimer',
    error_default: 'Merci de contacter l\'assistance',
    error_too_many: 'Vous avez effectué trop d\'essais. réessayez dans quelques minutes.',
    now_logged_in: 'Vous êtes connecté !',
    are_you_sure: 'Êtes-vous sur ?',
    back_btn: 'Retour',
    data_list: {
        email: 'Adresse e-mail',
        firstname: 'Prénom',
        lastname: 'Nom',
        tel: 'Numéro de téléphone',
        birthdate: 'Date de naissance',
        avatar: 'Photo de profil',
        address_1: 'Addresse',
        address_2: 'Complément d\'adresse',
        postal_code: 'Code postal',
        city: 'Ville',
        state: 'Région',
        country: 'Pays',
        job: 'Profession',
        company: 'Entreprise'
    },
    placeholders: {
        email: 'ex. elliot@fsociety.com',
        firstname: 'ex. Elliot',
        lastname: 'ex. Alderson',
        birthdate: 'ex. 17/09/1986',
        address_1: 'ex. 42 Rue République',
        address_2: 'ex. Bât. B',
        postal_code: 'ex. 75000',
        city: 'ex. Paris',
        state: 'ex. Île de France',
        country: 'ex. France',
        job: 'ex. Pirate',
        company: 'ex. E Corp'
    },
    permission: {
        camera_roll: 'Vous devez accepter l\'accès à la pellicule pour choisir une photo de profil',
        camera: 'Vous devez accepter l\'accès à la caméra pour pouvoir scanner des QR-Codes'
    },
    try_again: 'Merci de ré-essayer',
    wait: 'Chargement',
    congratulations: 'Félicitations !',
    alert:{
        information:'Information',
        alert:'Alerte'
    },
    ios_date_picker: {
        cancel: 'Fermer le sélecteur de date',
        done: 'Valider la date'
    },
    launch:{
        explanation1: 'Bienvenue sur JustAuthMe ! Cette application vous permet de vous connecter aux sites web et applis arborant le bouton "Se connecter avec JustAuthMe", sans mot de passe.',
        explanation2: 'Pour vous connecter aux sites et applis, cliquez sur "Se connecter avec JustAuthMe" et validez la connexion dans l\'application après avoir choisi les informations à partager.',
        explanation3: 'Vous serez ensuite amenez à vous authentifier grâce à la biométrie (si votre appareil le permet) et les informations nécessaires à la connexion seront automatiquement envoyées.',
        explanation4: 'Vos informations personnelles sont stockées sur votre téléphone uniqument et non sur nos serveurs. Si nous n\'y avons pas accès, nous ne pourrons les vendre à personne.',
        explanation5: 'Nous pensons que votre téléphone est le meilleur moyen de vous authentifier. Ne cherchez plus à retenir des mots de passe.\nBienvenue sur JustAuthMe.',

        email:'Commençons par votre e-mail',
        enter_code: 'Entrez le code de confirmation que vous avez reçu par e-mail',
        firstname:'Quel est votre prénom ?',
        lastname:'Et votre nom ?',
        birthdate:'Qu\'en est-il de votre date de naissance ?',
        avatar:'Pour finir, une photo ?',
        avatar_confirm:'Êtes-vous sur ? Vous pourrez la choisir plus tard.',

        generating: 'Génération en cours',

        success: 'Vous êtes maintenant inscrit sur JustAuthMe !\nNous vous avons envoyé un e-mail de confirmation.\nVous pouvez maintenant profiter pleinement de JustAuthMe.',

        action: {
            applogin_challenge: 'la vérification de code de confirmation',
            email_check: 'la vérification de l\'adresse e-mail'
        },

        error:{
            unknown: 'Inconnue',
            unknown_message: 'Une erreur inconnue s\'est produite. Merci de contacter le support en mentionnant qu\'une erreur HTTP %{code} est apparue pendant %{action}.',

            http: 'Une erreur HTTP %{code} est apparue',
            http_message: 'Merci de contacter le support à support@justauth.me en mentionnant le code d\'erreur %{code} à l\'inscription',

            wrong_passcode: 'Code faux',

            anti_spam: 'Anti-Spam',
            anti_spam_message: {
                register: 'Merci de réessayer dans 30 secondes, ceci est une mesure anti-spam',
                email_code: 'Merci d\'attendre au moins 2 minutes avant de redemander un code. Vérifez vos spams.',
            },

            invalid_email: 'Adresse e-mail invalide',
            enter_valid_email: 'Merci de renseigner une addresse e-mail valide',

            already_member: 'Vous êtes déjà membre',
            account_already_existing: 'Vous possédez déjà un compte JustAuthMe, merci de vous y connecter.',
        }
    },
    home:{
        delete_service_confirm:'Supprimer le service %{name} ?',
        delete_service_confirm_message:'Cela ne supprimera PAS votre compte sur %{domain}, cela va uniquement supprimer le service de votre historique de connexions.',
        error_delete: 'Impossible de supprimer le service',
        no_services_yet: 'Vous ne vous êtes pas encore connecté à l\'un de nos sites partenaires ?',
        try_demo: 'Essayez notre démo',
        authenticate: 'S\'authentifier',
        services: 'Services',
        hidden: {
            size: -105,
            delete: 100,
        }
    },
    scanner:{
        title: "Scanner QR"
    },
    auth:{
        title:'Authentification',
        confirm_login: 'Confirmer',

        invalid_token: 'Jeton invalide',
        invalid_token_message: 'Une erreur s\'est produite pendant la récupération des informations de connexion. Merci de réessayer ou de contacter le support.',

        biometric_error: 'Refus de l\'empreinte biométrique',
        biometric_error_message: 'Votre système n\'a pas pu authentifier votre empreinte. Essyez de verrouiller votre téléphone et de rentrer votre code pour réactiver le capteur.',

        unauthorized_login: 'Connexion interdite',
        unauthorized_login_message: 'Une tentative frauduleuse de connexion a été détectée',

        non_confirmed_email:'Adresse e-mail non confirmée',
        non_confirmed_email_message:'Merci de confirmer votre adresse e-mail avant d\'essayer de vous connecter',

        missing_data: 'Donnée manquante',
        missing_data_message: 'Un(e) %{data} est requis(e) pour se connecter à %{name}. Merci de renseigner votre %{data} avant de continuer',

        token_not_found: 'Ce jeton d\'authentification n\'existe pas',
        unknown_error: 'Erreur inconnue',
        error_login: 'Une erreur s\'est produite pendant la connexion. Merci de contacter le support.',

        about_to_log: 'Vous êtes sur le point de vous connecter à',
        missing: 'Non renseignée',

        android_prompt: {
            waiting: 'En attente...',
            verified: 'Vérifié !',
            retry: 'Merci de réessayer'
        },

        data_list: {
            first: '%{domain} aura accès aux informations suivantes',
            relog: '%{domain} a accès aux informations suivante'
        }
    },
    success: {
        error: 'Un problème est survenu ?',
        alert: {
            title: 'Erreur lors de la connexion ?',
            msg: 'Confirmez-vous que la connexion à %{domain} a échouée ?',
            ok_btn: 'Je confirme'
        },
        dropdown: {
            title: 'Merci pour votre retour !',
            text: 'Nous avons retiré %{name} de vos services. Vous pouvez maintenant réessayer !'
        }
    },
    service: {
        title: 'Détails du service',
        error_unknow: {
            title: 'Service inconnu',
            text: 'Le service que vous essayez de visualiser ne semble pas exister'
        },
        first_login: 'Première connexion le',
        last_login: 'Dernière connexion le',
        has_access: 'A accès aux informations suivante'
    },
    settings: {
        title: 'Paramètres',
        version: 'Version',
        email: 'Envoyez-moi un nouvel e-mail',
        support: 'Contacter le support',
        logout: 'Déconnexion',
        privacy: 'Confidentialité',
        tos: "Conditions d'utilisation",
        notice: "Mentions légales",
        about: "À propos",
        dev: "Panel développeurs",
        legal: "Infos légales"
    },
    user: {
        title: 'Mon profil',
        error: {
            empty: {
                title: 'Champ(s) vide(s)',
                text: 'Merci de renseigner les champs obligatoires.'
            },
            email_exists: {
                title: 'Cette adresse e-mail est déjà enregistrée',
                text: 'Cette adresse e-mail appartient à un autre compte JustAuthMe'
            },
            email_update: 'Impossible de mettre à jour l\'adresse e-mail'
        },
        info: {
            inbox: {
                title: 'Vérifiez vos e-mails !',
                text: 'Nous avons envoyé un e-mail de confirmation à %{email}. Cliquez sur le lien dans l\'email pour activer votre nouvelle adresse.'
            },
            email_update: 'Si vous changez d\'adresse e-mail, vous devrez confirmez la nouvelle adresse avant de continuer d\'utiliser JustAuthMe'
        },
        success: 'Sauvegardées avec succès',
        save: 'Sauvegarder'
    },
    continue: 'Continuer'
}
