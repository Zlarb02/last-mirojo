export default {
  translation: {
    app: {
      title: "Mirojo.app Mini Roleplay Journey",
      description: "Embark on a futuristic AI-powered roleplay adventure",
    },
    auth: {
      welcome: "Welcome to Mirojo",
      login: "Login",
      register: "Register",
      username: "Username",
      password: "Password",
      loggingIn: "Logging in...",
      registering: "Registering...",
      logout: "Logout",
    },
    game: {
      adventure: "Adventure",
      stats: {
        title: "Character Stats",
        health: "Health",
        mana: "Mana",
        level: "Level",
        edit: "Edit",
        updated: "Stats updated successfully",
        updateFailed: "Failed to update stats",
        noGameId: "No game ID found",
        newStat: "New stat",
        statName: "Stat name",
        type: "Stat type",
        typeProgress: "Progress bar",
        typeNumber: "Number",
        typeText: "Text",
        maxValue: "Maximum value",
        color: "Color",
        value: "Value",
        addStat: "Add stat",
      },
      events: {
        title: "Event Log",
        empty: "No events yet",
      },
      chat: {
        placeholder: "Type your action...",
        thinking: "AI is thinking...",
        send: "Send message",
        save: "Save conversation",
        failed: "Failed to get AI response",
        saved: "Conversation saved successfully",
        saveFailed: "Failed to save conversation",
        autoSaveOn: "Auto-save enabled",
        autoSaveOff: "Auto-save disabled",
      },
      character: {
        title: "Character",
        name: "Character name",
        noName: "No name",
        description: "Description",
        noDescription: "No description",
      },
      quests: {
        title: "Quests",
        mainQuest: "Main Quest",
        questTitle: "Quest title",
        questDescription: "Quest description",
        noQuest: "No quest",
        status: {
          notStarted: "Not started",
          active: "Active",
          completed: "Completed",
        },
      },
      inventory: {
        title: "Inventory",
        empty: "Empty inventory",
        add: "Add",
        newItem: "New item",
      },
      newGame: "New game",
      enterGameName: "Enter game name",
      start: "Start",
      confirmTitle: "Create new game",
      confirmNewGame: "Do you want to create a new game named « {{name}} » ?",
      createFailed: "Failed to create new game",
    },
    navigation: {
      menu: "Menu",
      menuDescription: "Main application navigation",
      home: "Home",
      newGame: "New Game",
      mySaves: "My Games",
      settings: "Settings",
      toggleFullscreen: "Toggle Fullscreen",
      toggleMenu: "Toggle Menu",
    },
    settings: {
      language: "Language",
      english: "English",
      french: "French",
      title: "Settings",
      selectLanguage: "Select language",
      subscription: {
        title: "Subscription",
        freePlan: "Free",
        proPlan: "Pro",
        monthly: "month",
        upgrade: "Upgrade to Pro",
        downgrade: "Downgrade",
        currentPlan: "Current plan",
        billing: "Billing",
        billingHistory: "Billing history",
        noInvoices: "No invoices",
        features: {
          savedGames: "3 saved games maximum",
          basicAI: "Basic AI",
          standardSupport: "Standard support",
          unlimitedGames: "Unlimited saved games",
          advancedAI: "Advanced AI",
          prioritySupport: "Priority support",
          exclusiveContent: "Exclusive content",
        },
        management: {
          title: "Subscription management",
          cancel: "Cancel subscription",
          renew: "Auto-renewal",
          nextBilling: "Next billing",
          cardEnding: "Card ending in",
        },
        plan: "Plan",
      },
      appearance: {
        title: "Appearance",
        customization: "Customization",
        backgroundVideo: "Background video",
        backgroundVideoDescription: "Enable background video",
        uiEffects: "UI effects",
        uiEffectsDescription: "Enable interface visual effects",
        comingSoon: "Appearance options coming soon",
        videoQuality: "Video quality",
        videoQualityDescription: "Adjust background video quality",
        animationSpeed: "Animation speed",
        animationSpeedDescription: "Adjust visual effects speed",
        quality: {
          low: "Low",
          medium: "Medium",
          high: "High",
        },
        speed: {
          slow: "Slow",
          normal: "Normal",
          fast: "Fast",
        },
        theme: "Theme",
        colors: "Colors",
        style: "Style",
        background: "Background",
        variants: {
          classic: "Classic",
          modern: "Modern",
          soft: "Soft",
          sharp: "Sharp",
        },
      },
      notifications: {
        title: "Notifications",
        permission: "Allow notifications to receive game updates",
        enable: "Enable notifications",
        enabled: "Notifications enabled",
        disabled: "Notifications disabled",
        game: "Game notifications",
        sound: "Sound effects",
      },
    },
    myGames: {
      error: "Failed to load games",
      savedGame: "Saved game",
      noMessages: "No messages",
      title: "My Games",
      lastPlayed: "Last played on",
      continue: "Continue",
      newGame: "New Game",
      startNew: "Start a new adventure",
      create: "Create",
      deleteTitle: "Delete game",
      deleteDescription:
        "Are you sure you want to delete this game? This action cannot be undone.",
      deleted: "Game deleted successfully",
      deleteFailed: "Failed to delete game",
      rename: "Rename game",
      renameDescription: "Enter a new name for this game",
      renamePlaceholder: "Game name",
      renamed: "Game renamed successfully",
      renameFailed: "Failed to rename game",
      noDescription: "Add a description",
      descriptionPlaceholder: "Game description",
      editDescription: "Edit description",
      descriptionUpdated: "Description updated successfully",
      descriptionUpdateFailed: "Failed to update description",
    },
    common: {
      toggleTheme: "Toggle theme",
      cancel: "Cancel",
      delete: "Delete",
      success: "Success",
      error: "Error",
      save: "Save",
      confirm: "Confirm",
    },
    theme: {
      title: "Appearance",
      mode: "Mode",
      light: "Light",
      dark: "Dark",
      style: "Style",
      variants: {
        classic: "Classic",
        modern: "Modern",
        soft: "Soft",
        sharp: "Sharp",
      },
      colors: "Colors",
      primaryColor: "Primary color",
      secondaryColor: "Secondary color",
      mutedColor: "Muted color",
      moreSettings: "More appearance settings",
      resetColor: "Reset color",
      colorResetSuccess: "Color reset successfully",
      colorResetError: "Failed to reset color",
      borderStyle: "Border Style",
      borderRadius: "Border Radius",
      borderWidth: "Border Width", 
      none: "None",
      thin: "Thin",
      medium: "Medium",
      thick: "Thick",
      large: "Large",
      rounded: "Rounded",
      square: "Square",
      middle: "Middle",
      full: "Full",
      presets: "Presets",
      custom: "Custom",
      background: {
        title: "Background",
        image: "Image",
        video: "Video",
        none: "None",
        imagePlaceholder: "Image URL (https://...)",
        videoPlaceholder: "Video URL (https://...)",
        search: "Search background...",
        remove: "Remove background",
        useLightTheme: "Use light theme",
        useDarkTheme: "Dark background",
        muteVideo: "Muted",
        unmuteVideo: "Unmuted",
        opacity: "Opacity", 
        volume: "Volume",
        time: "Playback Position",
      },
      backgroundImage: "Background image",
      overlayOpacity: "Background opacity",
    },
  },
};
