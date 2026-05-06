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
  }
};
