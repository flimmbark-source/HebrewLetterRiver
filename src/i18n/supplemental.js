// Supplemental dictionaries cover newer UI keys that were added after the
// original app-language JSON files were generated. Keep this file focused on
// modern UI patches and pack metadata overrides; the base dictionaries still
// live in the language JSON files.
export const supplementalDictionaries = {
  portuguese: {
    common: {
      active: 'ATIVO',
      day: 'dia',
      days: 'dias'
    },
    app: {
      brand: { name: 'Rio de Letras' },
      playMode: {
        title: 'Escolha seu modo',
        close: 'Fechar',
        letterRiver: {
          name: 'Rio de Letras',
          description: 'Capture letras enquanto elas descem pelo rio'
        },
        vocabBuilder: {
          name: 'Construtor de Vocabulário',
          description: 'Jogue para aprender e praticar vocabulário'
        },
        deepScript: {
          name: 'Escrita Profunda',
          description: 'Explore um calabouço infinito com palavras de vocabulário'
        }
      }
    },
    home: {
      languageLearning: { title: 'Aprendizado de idiomas' },
      profile: { learningSince: 'Aprendendo desde {{date}}' },
      profileOverview: { title: 'Visão geral do perfil' },
      gameActivity: {
        title: 'Atividade de jogo',
        empty: 'Comece um jogo e sua atividade mais recente aparecerá aqui.'
      },
      progress: {
        levelLabel: 'NÍVEL {{level}}',
        recentMastery: 'Domínio recente',
        emptyMastery: 'Capture algumas letras para desbloquear sua linha de domínio.'
      },
      quest: {
        dailyGoal: 'Meta diária',
        minutesPerDay: 'min/dia',
        minutesPerDayValue: '{{minutes}} min / dia'
      },
      reminders: { title: 'Lembretes' },
      cta: {
        letterRiver: 'Rio de Letras',
        startLetters: 'Comece a aprender letras brincando',
        showAllModes: 'Mostrar todos os modos'
      },
      footer: {
        syncNotice: 'Seu progresso é sincronizado automaticamente com sua conta na nuvem.',
        privacyPolicy: 'Política de Privacidade'
      }
    },
    dailyReview: {
      title: 'Revisão diária',
      allCaughtUp: 'Tudo em dia!',
      checkBackTomorrow: 'Ótimo trabalho. Volte amanhã.',
      lettersDue_one: '{{count}} letra para revisar',
      lettersDue_other: '{{count}} letras para revisar',
      wordsDue_one: '{{count}} palavra para praticar',
      wordsDue_other: '{{count}} palavras para praticar',
      focusOn: 'Foque em: {{symbol}} ({{name}})'
    },
    streak: {
      startJourney: 'Comece sua jornada!',
      greatStart: 'Ótimo começo! Continue assim',
      buildingMomentum: 'Você está ganhando ritmo!',
      onFire: 'Você está mandando bem!',
      incredibleDedication: 'Dedicação incrível!',
      legendaryCommitment: 'Compromisso lendário!',
      todayComplete: 'Hoje: completo',
      todayNotYet: 'Hoje: ainda não',
      daysUntilMilestone_one: 'Mais {{count}} dia até {{label}}!',
      daysUntilMilestone_other: 'Mais {{count}} dias até {{label}}!',
      repair: 'Reparar sequência (20 estrelas)',
      restoreTo: 'restaurar para {{count}} dias',
      personalBest: 'Melhor sequência: {{count}} dias',
      freezeAvailable_one: '{{count}} proteção de sequência disponível',
      freezeAvailable_other: '{{count}} proteções de sequência disponíveis'
    },
    bridgeBuilder: {
      sections: {
        foundations: { title: 'Fundamentos' },
        daily_life: { title: 'Vida diária' },
        people_social: { title: 'Pessoas e vida social' },
        meaning_builders: { title: 'Construtores de significado' },
        cafe_talk: { title: 'Conversa de café' }
      },
      vocabJourney: {
        title: 'Jornada de vocabulário',
        startPath: 'Comece seu caminho de aprendizagem',
        noPacks: 'Ainda não há pacotes disponíveis.',
        allPacks: 'Todos os pacotes',
        currentPack: 'Pacote atual',
        currentGoal: 'Meta atual: {{goal}}',
        learnEverydayWords: 'Aprenda {{count}} palavras do dia a dia',
        tapForPackDetails: 'Toque para ver detalhes do pacote',
        openDetailsFor: 'Abrir detalhes de {{title}}',
        packDetails: 'Detalhes do pacote',
        closePackDetails: 'Fechar detalhes do pacote',
        savePack: 'Salvar pacote',
        continueLearningWords: 'Continue aprendendo novas palavras.',
        recommendedNext: 'Próximo recomendado',
        moreWaysToLearn: 'Mais formas de aprender',
        optionLoosePlanksTitle: 'Fortalecer — Pranchas Soltas',
        optionLoosePlanksSubtitle: 'Reforce com prática direcionada.',
        optionReviewTitle: 'Revisar — Revisão de hoje',
        optionReviewSubtitle: 'Revise palavras para memorizá-las.',
        optionDeepScriptTitle: 'Desafio — Escrita Profunda',
        optionDeepScriptSubtitle: 'Teste profundidade com escrita e lembrança.',
        optionReadTitle: 'Ler — Conversa de café',
        optionReadSubtitle: 'Veja as palavras em uma conversa real.',
        todaysReviewWords: 'Revisão de hoje — {{count}} palavras',
        keepWordsStrong: 'Mantenha suas palavras fortes.',
        completePackToUnlockReview: 'Complete um pacote para desbloquear a revisão.',
        readInContextTitle: 'Ler em contexto — Conversa de café',
        readInContextLockedSubtitle: 'Desbloqueia depois deste pacote.',
        missingPackContent: 'O conteúdo deste pacote ainda não está disponível no idioma de prática selecionado.',
        loadingWords: 'Carregando palavras...',
        packLearningProgress: 'Progresso de aprendizagem do pacote',
        currentSectionProgress: '{{section}} · {{percent}}% completo',
        statusOpenPath: 'Caminho aberto',
        statusLocked: 'Bloqueado',
        statusComplete: 'Completo',
        statusCurrent: 'Atual',
        stageNotStarted: 'Não iniciado',
        stageFirstLook: 'Primeiro olhar',
        stageMeaning: 'Significado',
        stageReview: 'Revisão',
        stageChallenge: 'Desafio',
        stageReadyForChallenge: 'Pronto para o desafio',
        stageStrengtheningMemory: 'Fortalecendo a memória',
        stageLearningMeanings: 'Aprendendo significados',
        stageNewPack: 'Novo pacote',
        actionBridgeTitle: 'Construtor de Vocabulário',
        actionBridgeSubtitle: 'Melhor para ver a palavra, o som e o significado pela primeira vez.',
        actionStartBridge: 'Começar: Construtor de Vocabulário',
        actionContinueBridge: 'Continuar: Construtor de Vocabulário',
        actionLoosePlanksTitle: 'Fortalecer — Pranchas Soltas',
        actionLoosePlanksSubtitle: 'Reforce com prática direcionada.',
        actionContinueLoosePlanks: 'Continuar: Pranchas Soltas',
        actionDeepScriptTitle: 'Desafio — Escrita Profunda',
        actionDeepScriptSubtitle: 'Teste profundidade com escrita e lembrança.',
        actionContinueDeepScript: 'Continuar: Escrita Profunda',
        actionReviewTitle: 'Revisão',
        actionReviewSubtitle: 'Mantenha estas palavras frescas.',
        actionReviewPack: 'Revisar este pacote'
      }
    },
    packs: {
      greetings_01: {
        title: 'Saudações',
        description: 'Olá, obrigado e cortesia básica'
      },
      pronouns_01: {
        title: 'Pronomes',
        description: 'Eu, você e pronomes básicos'
      },
      pronouns_02: {
        title: 'Pronomes 2',
        description: 'Ele, ela, nós e eles'
      },
      family_01: {
        title: 'Família',
        description: 'Mãe, pai, família e casa'
      },
      family_02: {
        title: 'Família 2',
        description: 'Amigo, criança, pai ou mãe, vizinho e mais'
      },
      food_01: {
        title: 'Comida e bebida',
        description: 'Pão, água, café e mais'
      },
      food_02: {
        title: 'Comida e bebida 2',
        description: 'Comida, água e café'
      },
      adjectives_01: {
        title: 'Adjetivos',
        description: 'Bom, grande, pequeno e bonito'
      },
      adjectives_02: {
        title: 'Adjetivos 2',
        description: 'Ótimo, legal, bonito, ruim e mais'
      },
      adjectives_03: {
        title: 'Adjetivos 3',
        description: 'Feio e estranho'
      },
      numbers_01: {
        title: 'Números',
        description: 'Contando de um a cinco'
      },
      colors_01: {
        title: 'Cores',
        description: 'Vermelho, azul, verde e mais'
      },
      everyday_objects_01: {
        title: 'Objetos do dia a dia',
        description: 'Livro, telefone, mesa e porta'
      },
      everyday_objects_02: {
        title: 'Objetos do dia a dia 2',
        description: 'Livro, telefone e coisa'
      }
    }
  },
  spanish: {
    common: {
      active: 'ACTIVO',
      day: 'día',
      days: 'días'
    },
    app: {
      brand: { name: 'Río de Letras' },
      playMode: {
        title: 'Elige tu modo',
        close: 'Cerrar',
        letterRiver: {
          name: 'Río de Letras',
          description: 'Atrapa letras mientras bajan por el río'
        },
        vocabBuilder: {
          name: 'Constructor de vocabulario',
          description: 'Juega para aprender y practicar vocabulario'
        },
        deepScript: {
          name: 'Escritura profunda',
          description: 'Explora una mazmorra infinita con palabras de vocabulario'
        }
      }
    },
    home: {
      languageLearning: { title: 'Aprendizaje de idiomas' },
      profile: { learningSince: 'Aprendiendo desde {{date}}' },
      profileOverview: { title: 'Resumen del perfil' },
      gameActivity: {
        title: 'Actividad de juego',
        empty: 'Empieza un juego y tu actividad más reciente aparecerá aquí.'
      },
      progress: {
        levelLabel: 'NIVEL {{level}}',
        recentMastery: 'Dominio reciente',
        emptyMastery: 'Atrapa algunas letras para desbloquear tu fila de dominio.'
      },
      quest: {
        dailyGoal: 'Meta diaria',
        minutesPerDay: 'min/día',
        minutesPerDayValue: '{{minutes}} min / día'
      },
      reminders: { title: 'Recordatorios' },
      cta: {
        letterRiver: 'Río de Letras',
        startLetters: 'Empieza a aprender letras jugando',
        showAllModes: 'Mostrar todos los modos'
      },
      footer: {
        syncNotice: 'Tu progreso se sincroniza automáticamente con tu cuenta en la nube.',
        privacyPolicy: 'Política de privacidad'
      }
    },
    dailyReview: {
      title: 'Revisión diaria',
      allCaughtUp: '¡Todo al día!',
      checkBackTomorrow: 'Buen trabajo. Vuelve mañana.',
      lettersDue_one: '{{count}} letra para repasar',
      lettersDue_other: '{{count}} letras para repasar',
      wordsDue_one: '{{count}} palabra para practicar',
      wordsDue_other: '{{count}} palabras para practicar',
      focusOn: 'Enfócate en: {{symbol}} ({{name}})'
    },
    streak: {
      startJourney: '¡Empieza tu viaje!',
      greatStart: '¡Buen comienzo! Sigue así',
      buildingMomentum: '¡Estás ganando impulso!',
      onFire: '¡Estás en racha!',
      incredibleDedication: '¡Dedicación increíble!',
      legendaryCommitment: '¡Compromiso legendario!',
      todayComplete: 'Hoy: completo',
      todayNotYet: 'Hoy: todavía no',
      daysUntilMilestone_one: '¡{{count}} día más hasta {{label}}!',
      daysUntilMilestone_other: '¡{{count}} días más hasta {{label}}!',
      repair: 'Reparar racha (20 estrellas)',
      restoreTo: 'restaurar a {{count}} días',
      personalBest: 'Mejor racha personal: {{count}} días',
      freezeAvailable_one: '{{count}} protector de racha disponible',
      freezeAvailable_other: '{{count}} protectores de racha disponibles'
    },
    bridgeBuilder: {
      sections: {
        foundations: { title: 'Fundamentos' },
        daily_life: { title: 'Vida diaria' },
        people_social: { title: 'Personas y vida social' },
        meaning_builders: { title: 'Constructores de significado' },
        cafe_talk: { title: 'Charla de café' }
      },
      vocabJourney: {
        title: 'Viaje de vocabulario',
        startPath: 'Empieza tu ruta de aprendizaje',
        noPacks: 'Todavía no hay paquetes disponibles.',
        allPacks: 'Todos los paquetes',
        currentPack: 'Paquete actual',
        currentGoal: 'Meta actual: {{goal}}',
        learnEverydayWords: 'Aprende {{count}} palabras cotidianas',
        tapForPackDetails: 'Toca para ver detalles del paquete',
        openDetailsFor: 'Abrir detalles de {{title}}',
        packDetails: 'Detalles del paquete',
        closePackDetails: 'Cerrar detalles del paquete',
        savePack: 'Guardar paquete',
        continueLearningWords: 'Sigue aprendiendo palabras nuevas.',
        recommendedNext: 'Siguiente recomendado',
        moreWaysToLearn: 'Más formas de aprender',
        optionLoosePlanksTitle: 'Fortalecer — Tablones sueltos',
        optionLoosePlanksSubtitle: 'Refuerza con práctica dirigida.',
        optionReviewTitle: 'Repasar — Revisión de hoy',
        optionReviewSubtitle: 'Repasa palabras para recordarlas.',
        optionDeepScriptTitle: 'Desafío — Escritura profunda',
        optionDeepScriptSubtitle: 'Pon a prueba tu memoria con escritura y recuerdo.',
        optionReadTitle: 'Leer — Charla de café',
        optionReadSubtitle: 'Ve las palabras en una conversación real.',
        todaysReviewWords: 'Revisión de hoy — {{count}} palabras',
        keepWordsStrong: 'Mantén fuertes tus palabras.',
        completePackToUnlockReview: 'Completa un paquete para desbloquear la revisión.',
        readInContextTitle: 'Leer en contexto — Charla de café',
        readInContextLockedSubtitle: 'Se desbloquea después de este paquete.',
        missingPackContent: 'El contenido de este paquete todavía no está disponible en el idioma de práctica seleccionado.',
        loadingWords: 'Cargando palabras...',
        packLearningProgress: 'Progreso de aprendizaje del paquete',
        currentSectionProgress: '{{section}} · {{percent}}% completo',
        statusOpenPath: 'Ruta abierta',
        statusLocked: 'Bloqueado',
        statusComplete: 'Completo',
        statusCurrent: 'Actual',
        stageNotStarted: 'No iniciado',
        stageFirstLook: 'Primer vistazo',
        stageMeaning: 'Significado',
        stageReview: 'Revisión',
        stageChallenge: 'Desafío',
        stageReadyForChallenge: 'Listo para el desafío',
        stageStrengtheningMemory: 'Fortaleciendo la memoria',
        stageLearningMeanings: 'Aprendiendo significados',
        stageNewPack: 'Paquete nuevo',
        actionBridgeTitle: 'Constructor de vocabulario',
        actionBridgeSubtitle: 'Ideal para ver por primera vez la palabra, el sonido y el significado.',
        actionStartBridge: 'Empezar: Constructor de vocabulario',
        actionContinueBridge: 'Continuar: Constructor de vocabulario',
        actionLoosePlanksTitle: 'Fortalecer — Tablones sueltos',
        actionLoosePlanksSubtitle: 'Refuerza con práctica dirigida.',
        actionContinueLoosePlanks: 'Continuar: Tablones sueltos',
        actionDeepScriptTitle: 'Desafío — Escritura profunda',
        actionDeepScriptSubtitle: 'Pon a prueba tu memoria con escritura y recuerdo.',
        actionContinueDeepScript: 'Continuar: Escritura profunda',
        actionReviewTitle: 'Revisión',
        actionReviewSubtitle: 'Mantén frescas estas palabras.',
        actionReviewPack: 'Repasar este paquete'
      }
    },
    packs: {
      greetings_01: {
        title: 'Saludos',
        description: 'Hola, gracias y cortesía básica'
      },
      pronouns_01: {
        title: 'Pronombres',
        description: 'Yo, tú y pronombres básicos'
      },
      pronouns_02: {
        title: 'Pronombres 2',
        description: 'Él, ella, nosotros y ellos'
      },
      family_01: {
        title: 'Familia',
        description: 'Mamá, papá, familia y casa'
      },
      family_02: {
        title: 'Familia 2',
        description: 'Amigo, niño, padre o madre, vecino y más'
      },
      food_01: {
        title: 'Comida y bebida',
        description: 'Pan, agua, café y más'
      },
      food_02: {
        title: 'Comida y bebida 2',
        description: 'Comida, agua y café'
      },
      adjectives_01: {
        title: 'Adjetivos',
        description: 'Bueno, grande, pequeño y bonito'
      },
      adjectives_02: {
        title: 'Adjetivos 2',
        description: 'Genial, agradable, bonito, malo y más'
      },
      adjectives_03: {
        title: 'Adjetivos 3',
        description: 'Feo y extraño'
      },
      numbers_01: {
        title: 'Números',
        description: 'Contar del uno al cinco'
      },
      colors_01: {
        title: 'Colores',
        description: 'Rojo, azul, verde y más'
      },
      everyday_objects_01: {
        title: 'Objetos cotidianos',
        description: 'Libro, teléfono, mesa y puerta'
      },
      everyday_objects_02: {
        title: 'Objetos cotidianos 2',
        description: 'Libro, teléfono y cosa'
      }
    }
  },
  french: {
    common: {
      active: 'ACTIF',
      day: 'jour',
      days: 'jours'
    },
    app: {
      brand: { name: 'Rivière des Lettres' },
      playMode: {
        title: 'Choisis ton mode',
        close: 'Fermer',
        letterRiver: {
          name: 'Rivière des Lettres',
          description: 'Attrape les lettres pendant qu’elles descendent la rivière'
        },
        vocabBuilder: {
          name: 'Constructeur de vocabulaire',
          description: 'Joue pour apprendre et pratiquer le vocabulaire'
        },
        deepScript: {
          name: 'Écriture profonde',
          description: 'Explore un donjon sans fin avec des mots de vocabulaire'
        }
      }
    },
    home: {
      languageLearning: { title: 'Apprentissage des langues' },
      profile: { learningSince: 'Apprentissage depuis {{date}}' },
      profileOverview: { title: 'Aperçu du profil' },
      gameActivity: {
        title: 'Activité de jeu',
        empty: 'Commence une partie et ton activité récente apparaîtra ici.'
      },
      progress: {
        levelLabel: 'NIVEAU {{level}}',
        recentMastery: 'Maîtrise récente',
        emptyMastery: 'Attrape quelques lettres pour débloquer ta rangée de maîtrise.'
      },
      quest: {
        dailyGoal: 'Objectif quotidien',
        minutesPerDay: 'min/jour',
        minutesPerDayValue: '{{minutes}} min / jour'
      },
      reminders: { title: 'Rappels' },
      cta: {
        letterRiver: 'Rivière des Lettres',
        startLetters: 'Commence à apprendre les lettres en jouant',
        showAllModes: 'Afficher tous les modes'
      },
      footer: {
        syncNotice: 'Ta progression est automatiquement synchronisée avec ton compte cloud.',
        privacyPolicy: 'Politique de confidentialité'
      }
    },
    dailyReview: {
      title: 'Révision quotidienne',
      allCaughtUp: 'Tout est à jour !',
      checkBackTomorrow: 'Beau travail. Reviens demain.',
      lettersDue_one: '{{count}} lettre à réviser',
      lettersDue_other: '{{count}} lettres à réviser',
      wordsDue_one: '{{count}} mot à pratiquer',
      wordsDue_other: '{{count}} mots à pratiquer',
      focusOn: 'Concentre-toi sur : {{symbol}} ({{name}})'
    },
    streak: {
      startJourney: 'Commence ton parcours !',
      greatStart: 'Très bon début ! Continue comme ça',
      buildingMomentum: 'Tu prends de l’élan !',
      onFire: 'Tu es lancé !',
      incredibleDedication: 'Dévouement incroyable !',
      legendaryCommitment: 'Engagement légendaire !',
      todayComplete: 'Aujourd’hui : terminé',
      todayNotYet: 'Aujourd’hui : pas encore',
      daysUntilMilestone_one: 'Encore {{count}} jour avant {{label}} !',
      daysUntilMilestone_other: 'Encore {{count}} jours avant {{label}} !',
      repair: 'Réparer la série (20 étoiles)',
      restoreTo: 'restaurer à {{count}} jours',
      personalBest: 'Meilleure série : {{count}} jours',
      freezeAvailable_one: '{{count}} protection de série disponible',
      freezeAvailable_other: '{{count}} protections de série disponibles'
    },
    bridgeBuilder: {
      sections: {
        foundations: { title: 'Fondations' },
        daily_life: { title: 'Vie quotidienne' },
        people_social: { title: 'Personnes et vie sociale' },
        meaning_builders: { title: 'Constructeurs de sens' },
        cafe_talk: { title: 'Conversation au café' }
      },
      vocabJourney: {
        title: 'Parcours de vocabulaire',
        startPath: 'Commence ton parcours d’apprentissage',
        noPacks: 'Aucun pack disponible pour le moment.',
        allPacks: 'Tous les packs',
        currentPack: 'Pack actuel',
        currentGoal: 'Objectif actuel : {{goal}}',
        learnEverydayWords: 'Apprends {{count}} mots du quotidien',
        tapForPackDetails: 'Touche pour voir les détails du pack',
        openDetailsFor: 'Ouvrir les détails de {{title}}',
        packDetails: 'Détails du pack',
        closePackDetails: 'Fermer les détails du pack',
        savePack: 'Enregistrer le pack',
        continueLearningWords: 'Continue à apprendre de nouveaux mots.',
        recommendedNext: 'Prochaine étape recommandée',
        moreWaysToLearn: 'Plus de façons d’apprendre',
        optionLoosePlanksTitle: 'Renforcer — Planches libres',
        optionLoosePlanksSubtitle: 'Renforce avec une pratique ciblée.',
        optionReviewTitle: 'Réviser — Révision du jour',
        optionReviewSubtitle: 'Révise les mots pour les mémoriser.',
        optionDeepScriptTitle: 'Défi — Écriture profonde',
        optionDeepScriptSubtitle: 'Teste ta maîtrise par l’écriture et le rappel.',
        optionReadTitle: 'Lire — Conversation au café',
        optionReadSubtitle: 'Vois les mots dans une vraie conversation.',
        todaysReviewWords: 'Révision du jour — {{count}} mots',
        keepWordsStrong: 'Garde tes mots bien ancrés.',
        completePackToUnlockReview: 'Termine un pack pour débloquer la révision.',
        readInContextTitle: 'Lire en contexte — Conversation au café',
        readInContextLockedSubtitle: 'Se débloque après ce pack.',
        missingPackContent: 'Le contenu de ce pack n’est pas encore disponible dans la langue de pratique sélectionnée.',
        loadingWords: 'Chargement des mots...',
        packLearningProgress: 'Progression d’apprentissage du pack',
        currentSectionProgress: '{{section}} · {{percent}}% terminé',
        statusOpenPath: 'Parcours ouvert',
        statusLocked: 'Verrouillé',
        statusComplete: 'Terminé',
        statusCurrent: 'Actuel',
        stageNotStarted: 'Non commencé',
        stageFirstLook: 'Premier aperçu',
        stageMeaning: 'Sens',
        stageReview: 'Révision',
        stageChallenge: 'Défi',
        stageReadyForChallenge: 'Prêt pour le défi',
        stageStrengtheningMemory: 'Renforcement de la mémoire',
        stageLearningMeanings: 'Apprentissage des sens',
        stageNewPack: 'Nouveau pack',
        actionBridgeTitle: 'Constructeur de vocabulaire',
        actionBridgeSubtitle: 'Idéal pour voir d’abord le mot, le son et le sens.',
        actionStartBridge: 'Commencer : Constructeur de vocabulaire',
        actionContinueBridge: 'Continuer : Constructeur de vocabulaire',
        actionLoosePlanksTitle: 'Renforcer — Planches libres',
        actionLoosePlanksSubtitle: 'Renforce avec une pratique ciblée.',
        actionContinueLoosePlanks: 'Continuer : Planches libres',
        actionDeepScriptTitle: 'Défi — Écriture profonde',
        actionDeepScriptSubtitle: 'Teste ta maîtrise par l’écriture et le rappel.',
        actionContinueDeepScript: 'Continuer : Écriture profonde',
        actionReviewTitle: 'Révision',
        actionReviewSubtitle: 'Garde ces mots bien frais.',
        actionReviewPack: 'Réviser ce pack'
      }
    },
    packs: {
      greetings_01: {
        title: 'Salutations',
        description: 'Bonjour, merci et politesse de base'
      },
      pronouns_01: {
        title: 'Pronoms',
        description: 'Je, tu et les pronoms de base'
      },
      pronouns_02: {
        title: 'Pronoms 2',
        description: 'Il, elle, nous et ils'
      },
      family_01: {
        title: 'Famille',
        description: 'Maman, papa, famille et maison'
      },
      family_02: {
        title: 'Famille 2',
        description: 'Ami, enfant, parent, voisin et plus encore'
      },
      food_01: {
        title: 'Nourriture et boisson',
        description: 'Pain, eau, café et plus encore'
      },
      food_02: {
        title: 'Nourriture et boisson 2',
        description: 'Nourriture, eau et café'
      },
      adjectives_01: {
        title: 'Adjectifs',
        description: 'Bon, grand, petit et beau'
      },
      adjectives_02: {
        title: 'Adjectifs 2',
        description: 'Excellent, gentil, beau, mauvais et plus encore'
      },
      adjectives_03: {
        title: 'Adjectifs 3',
        description: 'Laid et étrange'
      },
      numbers_01: {
        title: 'Nombres',
        description: 'Compter de un à cinq'
      },
      colors_01: {
        title: 'Couleurs',
        description: 'Rouge, bleu, vert et plus encore'
      },
      everyday_objects_01: {
        title: 'Objets du quotidien',
        description: 'Livre, téléphone, table et porte'
      },
      everyday_objects_02: {
        title: 'Objets du quotidien 2',
        description: 'Livre, téléphone et chose'
      }
    }
  }
};
