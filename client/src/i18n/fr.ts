import { c } from "node_modules/vite/dist/node/types.d-aGj9QkWt";

export default {
  translation: {
    app: {
      title: "Mirojo.app Mini Voyage de Jeu de Rôle",
      description:
        "Embarquez dans une aventure futuriste de jeu de rôle propulsée par l'IA",
    },
    auth: {
      welcome: "Bienvenue sur Mirojo",
      login: "Connexion",
      register: "Inscription",
      username: "Nom d'utilisateur",
      password: "Mot de passe",
      loggingIn: "Connexion en cours...",
      registering: "Inscription en cours...",
      logout: "Déconnexion",
    },
    game: {
      adventure: "Aventure",
      stats: {
        title: "Statistiques du Personnage",
        health: "Santé",
        mana: "Mana",
        level: "Niveau",
        edit: "Modifier",
        updated: "Statistiques mises à jour avec succès",
        updateFailed: "Échec de la mise à jour des statistiques",
        noGameId: "Aucun identifiant de partie trouvé",
        newStat: "Nouvelle statistique",
        statName: "Nom de la statistique",
        type: "Type de statistique",
        typeProgress: "Barre de progression",
        typeNumber: "Nombre",
        typeText: "Texte",
        maxValue: "Valeur maximale",
        color: "Couleur",
        value: "Valeur",
        addStat: "Ajouter une statistique"
      },
      events: {
        title: "Journal des Événements",
        empty: "Aucun événement",
      },
      chat: {
        placeholder: "Tapez votre action...",
        thinking: "L'IA réfléchit...",
        send: "Envoyer",
        save: "Sauvegarder la conversation",
        failed: "Échec de la réponse IA",
        saved: "Conversation sauvegardée avec succès",
        saveFailed: "Échec de la sauvegarde de la conversation",
        autoSaveOn: "Sauvegarde automatique activée",
        autoSaveOff: "Sauvegarde automatique désactivée",
      },
      character: {
        title: "Personnage",
        name: "Nom du personnage",
        noName: "Sans nom",
        description: "Description",
        noDescription: "Aucune description"
      },
      quests: {
        title: "Quêtes",
        mainQuest: "Quête principale",
        questTitle: "Titre de la quête",
        questDescription: "Description de la quête",
        noQuest: "Aucune quête",
        status: {
          notStarted: "Non commencée",
          active: "En cours",
          completed: "Terminée"
        }
      },
      inventory: {
        title: "Inventaire",
        empty: "Inventaire vide",
        add: "Ajouter",
        newItem: "Nouvel objet"
      },
      newGame: "Créer une nouvelle partie",
      enterGameName: "Entrez le nom de votre partie...",
      start: "Commencer",
      confirmTitle: "Confirmation",
      confirmNewGame: "Voulez-vous créer une partie nommée « {{name}} » ?",
      createFailed: "Échec de la création de la partie",
    },
    navigation: {
      menu: "Menu",
      menuDescription: "Navigation principale de l'application",
      home: "Accueil",
      newGame: "Nouvelle Partie",
      mySaves: "Mes Parties",
      settings: "Réglages",
      toggleFullscreen: "Plein Écran",
      toggleMenu: "Menu",
    },
    settings: {
      title: "Réglages",
      language: "Langue",
      selectLanguage: "Sélectionner une langue",
      subscription: {
        title: "Abonnement",
        freePlan: "Gratuit",
        proPlan: "Pro",
        monthly: "mois",
        upgrade: "Passer à Pro",
        downgrade: "Rétrograder",
        currentPlan: "Plan actuel",
        billing: "Facturation",
        billingHistory: "Historique de facturation",
        noInvoices: "Aucune facture",
        features: {
          savedGames: "3 parties sauvegardées maximum",
          basicAI: "IA basique",
          standardSupport: "Support standard",
          unlimitedGames: "Parties sauvegardées illimitées",
          advancedAI: "IA avancée",
          prioritySupport: "Support prioritaire",
          exclusiveContent: "Contenu exclusif"
        },
        management: {
          title: "Gestion de l'abonnement",
          cancel: "Annuler l'abonnement",
          renew: "Renouvellement automatique",
          nextBilling: "Prochaine facturation",
          cardEnding: "Carte se terminant par"
        }
      },
      appearance: {
        title: "Apparence",
        customization: "Personnalisation",
        backgroundVideo: "Vidéo d'arrière-plan",
        backgroundVideoDescription: "Activer la vidéo d'arrière-plan",
        uiEffects: "Effets d'interface",
        uiEffectsDescription: "Activer les effets visuels de l'interface",
        comingSoon: "Options d'apparence à venir",
        videoQuality: "Qualité de la vidéo",
        videoQualityDescription: "Ajuster la qualité de la vidéo d'arrière-plan",
        animationSpeed: "Vitesse des animations",
        animationSpeedDescription: "Ajuster la vitesse des effets visuels",
        quality: {
          low: "Basse",
          medium: "Moyenne",
          high: "Haute"
        },
        speed: {
          slow: "Lente",
          normal: "Normale",
          fast: "Rapide"
        }
      },
      notifications: {
        title: "Notifications",
        permission: "Autorisez les notifications pour recevoir des mises à jour du jeu",
        enable: "Activer les notifications",
        enabled: "Notifications activées",
        disabled: "Notifications désactivées",
        game: "Notifications de jeu",
        sound: "Effets sonores"
      }
    },
    myGames: {
      error: "Erreur lors du chargement des parties",
      savedGame: "Partie sauvegardée",
      noMessages: "Aucun message",
      title: "Mes parties",
      lastPlayed: "Dernière partie le",
      continue: "Continuer",
      newGame: "Nouvelle partie",
      startNew: "Commencer une nouvelle aventure",
      create: "Créer",
      deleteTitle: "Supprimer la partie",
      deleteDescription: "Êtes-vous sûr de vouloir supprimer cette partie ? Cette action est irréversible.",
      deleted: "Partie supprimée avec succès",
      deleteFailed: "Échec de la suppression de la partie"
    },
    common: {
      toggleTheme: "Changer le thème",
      cancel: "Annuler",
      delete: "Supprimer",
      success: "Succès",
      error: "Erreur",
      save: "Sauvegarder",
      confirm: "Confirmer",
    },
    theme: {
      title: "Apparence",
      mode: "Mode",
      light: "Clair",
      dark: "Sombre",
      style: "Style",
      colors: "Couleurs",
      primaryColor: "Couleur primaire",
      secondaryColor: "Couleur secondaire",
      moreSettings: "Plus de paramètres d'apparence"
    }
  },
};
