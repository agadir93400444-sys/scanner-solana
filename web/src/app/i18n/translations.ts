export type Locale = "fr" | "en" | "ar" | "zh";

export interface Dictionary {
  common: {
    backToScanner: string;
  };
  support: {
    title: string;
    text: string;
    copy: string;
    copied: string;
    thanks: string;
  };
  home: {
    title: string;
    subtitle: string;
    inputPlaceholder: string;
    scanButton: string;
    scanningButton: string;
    disclaimer: string;
    docsLink: string;
    pointsLabel: string;
    warningsNote: string;
    networkError: string;
    unknownError: string;
  };
  checks: {
    mintAuthority: string;
    freezeAuthority: string;
    holderConcentration: string;
    metadataAuthority: string;
    lpLock: string;
    tokenExtensions: string;
    earlySniperConcentration: string;
  };
  risk: {
    LOW: string;
    MEDIUM: string;
    HIGH: string;
    CRITICAL: string;
  };
  docs: {
    title: string;
    intro: string;
    checksHeading: string;
    checksIntro: string; // contient {max}
    riskHeading: string;
    riskIntro: string;
    riskLowFull: string;
    riskMediumFull: string;
    riskHighFull: string;
    riskCriticalFull: string;
    apiHeading: string;
    apiIntro: string;
    limitsHeading: string;
    limit1: string;
    limit2: string;
    limit3: string;
    disclaimer: string;
    checkDescriptions: {
      mintAuthority: string;
      freezeAuthority: string;
      holderConcentration: string;
      metadataAuthority: string;
      lpLock: string;
      tokenExtensions: string;
      earlySniperConcentration: string;
    };
  };
}

export const translations: Record<Locale, Dictionary> = {
  fr: {
    common: {
      backToScanner: "← Retour au scanner",
    },
    support: {
      title: "Soutenir le projet",
      text: "Si cet outil t'a été utile, tu peux faire un don à cette adresse Solana :",
      copy: "Copier",
      copied: "Copié !",
      thanks: "Merci pour ton soutien 🙏",
    },
    home: {
      title: "Token Scanner",
      subtitle:
        "Colle l'adresse d'un mint Solana pour vérifier les signaux de rug pull/honeypot : mint & freeze authority, concentration des holders, verrouillage de la liquidité, extensions Token-2022 à risque.",
      inputPlaceholder: "Adresse du mint (ex: DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263)",
      scanButton: "Scanner",
      scanningButton: "Scan en cours...",
      disclaimer:
        "Cet outil fournit une analyse automatisée de signaux on-chain publics. Ce n'est pas un conseil financier et ne garantit pas la sécurité d'un token. Fais toujours tes propres recherches (DYOR) avant tout investissement.",
      docsLink: "Documentation - comment fonctionnent les 7 critères d'analyse",
      pointsLabel: "points",
      warningsNote:
        "avertissement(s) technique(s) pendant le scan (voir détails ci-dessus si un check est marqué non vérifiable).",
      networkError: "Impossible de contacter le serveur de scan. Réessaie dans un instant.",
      unknownError: "Erreur inconnue",
    },
    checks: {
      mintAuthority: "Mint authority",
      freezeAuthority: "Freeze authority",
      holderConcentration: "Concentration des holders",
      metadataAuthority: "Mutabilité des metadata",
      lpLock: "Verrouillage de la liquidité (LP)",
      tokenExtensions: "Extensions Token-2022",
      earlySniperConcentration: "Concentration des acheteurs précoces",
    },
    risk: {
      LOW: "Risque faible",
      MEDIUM: "Risque modéré",
      HIGH: "Risque élevé",
      CRITICAL: "Risque critique",
    },
    docs: {
      title: "Documentation",
      intro:
        "Token Scanner est un outil gratuit qui analyse des signaux publics on-chain pour détecter des risques de rug pull ou de honeypot sur des tokens Solana. Voici comment il fonctionne, en détail.",
      checksHeading: "Les 7 critères analysés",
      checksIntro: "Chaque scan additionne le score de chaque critère réussi. Le score total est sur {max} points.",
      riskHeading: "Niveaux de risque",
      riskIntro: "Le niveau de risque est calculé à partir du pourcentage du score total obtenu :",
      riskLowFull: "≥ 80% du score max → Risque faible",
      riskMediumFull: "≥ 50% → Risque modéré",
      riskHighFull: "≥ 20% → Risque élevé",
      riskCriticalFull: "< 20% → Risque critique",
      apiHeading: "Utiliser l'API directement",
      apiIntro: "L'API est gratuite et ouverte. Le schéma complet (OpenAPI) est disponible sur /api/openapi.json.",
      limitsHeading: "Limites connues",
      limit1:
        "La concentration des holders et le verrouillage de LP ne distinguent pas les wallets personnels des comptes de pool - un pool légitime peut donc faire baisser artificiellement ces scores.",
      limit2:
        "La détection des acheteurs précoces ne s'active que pour les pools jeunes et peu actifs - c'est une limite réelle de l'API Solana (impossible de remonter l'historique d'un pool très actif sans surcharger le scan), pas un choix arbitraire.",
      limit3:
        "Aucun check ne simule d'achat/vente réel (honeypot par simulation) - cela demanderait un wallet financé ou une infrastructure de test dédiée.",
      disclaimer:
        "Cet outil fournit une analyse automatisée de signaux on-chain publics. Ce n'est pas un conseil financier et ne garantit pas la sécurité d'un token. Fais toujours tes propres recherches (DYOR).",
      checkDescriptions: {
        mintAuthority:
          "Vérifie si l'autorité de mint (qui peut créer de nouveaux tokens) a été révoquée. Si elle est active, le créateur peut diluer le supply à volonté.",
        freezeAuthority:
          "Vérifie si l'autorité de gel (qui peut bloquer un compte de tokens) a été révoquée. Si elle est active, le créateur peut empêcher un holder de vendre - signal honeypot fort.",
        holderConcentration:
          "Calcule la part du supply détenue par les 10 plus gros comptes. Une forte concentration signifie qu'un petit nombre de wallets peut faire chuter le prix en vendant.",
        metadataAuthority:
          "Vérifie si le nom, le symbole ou le logo du token (metadata Metaplex) peuvent encore être changés par le créateur - un vecteur de rebranding trompeur.",
        lpLock:
          "Vérifie quelle part des LP tokens du pool Raydium principal est brûlée ou verrouillée. Si le créateur garde le contrôle de la liquidité, il peut la retirer (rug pull classique).",
        tokenExtensions:
          "Détecte les extensions Token-2022 à risque : permanent delegate (vol direct des tokens d'un holder), transfer hook (code arbitraire à chaque transfert), taxe de transfert cachée, comptes gelés par défaut.",
        earlySniperConcentration:
          "Pour les pools récents (< 7 jours) et peu actifs, analyse les premières transactions pour détecter si un petit nombre de wallets a raflé le supply au lancement (sniping/bundling). Neutre pour les tokens plus anciens ou à fort volume - non vérifiable de façon fiable dans ces cas.",
      },
    },
  },

  en: {
    common: {
      backToScanner: "← Back to scanner",
    },
    support: {
      title: "Support the project",
      text: "If this tool was useful to you, you can send a donation to this Solana address:",
      copy: "Copy",
      copied: "Copied!",
      thanks: "Thanks for your support 🙏",
    },
    home: {
      title: "Token Scanner",
      subtitle:
        "Paste a Solana mint address to check for rug pull/honeypot signals: mint & freeze authority, holder concentration, liquidity lock, risky Token-2022 extensions.",
      inputPlaceholder: "Mint address (e.g. DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263)",
      scanButton: "Scan",
      scanningButton: "Scanning...",
      disclaimer:
        "This tool provides automated analysis of public on-chain signals. This is not financial advice and does not guarantee the safety of any token. Always do your own research (DYOR) before investing.",
      docsLink: "Documentation - how the 7 analysis criteria work",
      pointsLabel: "points",
      warningsNote: "technical warning(s) during the scan (see details above if a check is marked unverifiable).",
      networkError: "Unable to reach the scan server. Please try again in a moment.",
      unknownError: "Unknown error",
    },
    checks: {
      mintAuthority: "Mint authority",
      freezeAuthority: "Freeze authority",
      holderConcentration: "Holder concentration",
      metadataAuthority: "Metadata mutability",
      lpLock: "Liquidity lock (LP)",
      tokenExtensions: "Token-2022 extensions",
      earlySniperConcentration: "Early buyer concentration",
    },
    risk: {
      LOW: "Low risk",
      MEDIUM: "Moderate risk",
      HIGH: "High risk",
      CRITICAL: "Critical risk",
    },
    docs: {
      title: "Documentation",
      intro:
        "Token Scanner is a free tool that analyzes public on-chain signals to detect rug pull or honeypot risks on Solana tokens. Here's exactly how it works.",
      checksHeading: "The 7 criteria analyzed",
      checksIntro: "Each scan adds up the score of every check that passes. The total score is out of {max} points.",
      riskHeading: "Risk levels",
      riskIntro: "The risk level is calculated from the percentage of the total score obtained:",
      riskLowFull: "≥ 80% of max score → Low risk",
      riskMediumFull: "≥ 50% → Moderate risk",
      riskHighFull: "≥ 20% → High risk",
      riskCriticalFull: "< 20% → Critical risk",
      apiHeading: "Using the API directly",
      apiIntro: "The API is free and open. The full schema (OpenAPI) is available at /api/openapi.json.",
      limitsHeading: "Known limitations",
      limit1:
        "Holder concentration and LP lock checks don't distinguish personal wallets from pool accounts - so a legitimate pool can artificially lower these scores.",
      limit2:
        "Early buyer detection only activates for young, low-activity pools - this is a real limitation of the Solana API (it's not possible to walk back the full history of a very active pool without slowing down the scan), not an arbitrary choice.",
      limit3:
        "No check simulates an actual buy/sell transaction (honeypot detection via simulation) - that would require a funded wallet or dedicated test infrastructure.",
      disclaimer:
        "This tool provides automated analysis of public on-chain signals. This is not financial advice and does not guarantee the safety of any token. Always do your own research (DYOR).",
      checkDescriptions: {
        mintAuthority:
          "Checks whether the mint authority (which can create new tokens) has been revoked. If still active, the creator can dilute the supply at will.",
        freezeAuthority:
          "Checks whether the freeze authority (which can lock a token account) has been revoked. If still active, the creator can prevent a holder from selling - a strong honeypot signal.",
        holderConcentration:
          "Calculates the share of supply held by the 10 largest accounts. High concentration means a small number of wallets can crash the price by selling.",
        metadataAuthority:
          "Checks whether the token's name, symbol, or logo (Metaplex metadata) can still be changed by the creator - a possible vector for deceptive rebranding.",
        lpLock:
          "Checks what share of the LP tokens in the main Raydium pool are burned or locked. If the creator keeps control of the liquidity, they can withdraw it (a classic rug pull).",
        tokenExtensions:
          "Detects risky Token-2022 extensions: permanent delegate (direct theft of a holder's tokens), transfer hook (arbitrary code on every transfer), hidden transfer tax, accounts frozen by default.",
        earlySniperConcentration:
          "For recent (< 7 days) and low-activity pools, analyzes the earliest transactions to detect whether a small number of wallets grabbed most of the supply at launch (sniping/bundling). Neutral for older or high-volume tokens - not reliably verifiable in those cases.",
      },
    },
  },

  ar: {
    common: {
      backToScanner: "← العودة إلى الماسح",
    },
    support: {
      title: "دعم المشروع",
      text: "إذا كانت هذه الأداة مفيدة لك، يمكنك إرسال تبرع إلى عنوان سولانا هذا:",
      copy: "نسخ",
      copied: "تم النسخ!",
      thanks: "شكراً على دعمك 🙏",
    },
    home: {
      title: "Token Scanner",
      subtitle:
        "الصق عنوان mint على سولانا للتحقق من مؤشرات الاحتيال (rug pull) أو الفخاخ (honeypot): صلاحية mint وfreeze، تركّز الحائزين، قفل السيولة، وامتدادات Token-2022 الخطرة.",
      inputPlaceholder: "عنوان الـ mint (مثال: DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263)",
      scanButton: "فحص",
      scanningButton: "جارٍ الفحص...",
      disclaimer:
        "توفر هذه الأداة تحليلاً آلياً لإشارات علنية على السلسلة. هذه ليست نصيحة مالية ولا تضمن أمان أي توكن. قم دائماً بأبحاثك الخاصة (DYOR) قبل أي استثمار.",
      docsLink: "التوثيق - كيف تعمل معايير التحليل السبعة",
      pointsLabel: "نقطة",
      warningsNote: "تحذير(ات) تقني(ة) أثناء الفحص (انظر التفاصيل أعلاه إذا كان أحد المعايير غير قابل للتحقق).",
      networkError: "تعذر الاتصال بخادم الفحص. حاول مرة أخرى بعد قليل.",
      unknownError: "خطأ غير معروف",
    },
    checks: {
      mintAuthority: "صلاحية الإصدار (Mint Authority)",
      freezeAuthority: "صلاحية التجميد (Freeze Authority)",
      holderConcentration: "تركّز الحائزين",
      metadataAuthority: "قابلية تعديل البيانات الوصفية",
      lpLock: "قفل السيولة (LP)",
      tokenExtensions: "امتدادات Token-2022",
      earlySniperConcentration: "تركّز المشترين الأوائل",
    },
    risk: {
      LOW: "خطر منخفض",
      MEDIUM: "خطر متوسط",
      HIGH: "خطر مرتفع",
      CRITICAL: "خطر حرج",
    },
    docs: {
      title: "التوثيق",
      intro:
        "Token Scanner أداة مجانية تحلل إشارات علنية على السلسلة لاكتشاف مخاطر الاحتيال (rug pull) أو الفخاخ (honeypot) في توكنات سولانا. إليك كيف تعمل بالتفصيل.",
      checksHeading: "المعايير السبعة المحلَّلة",
      checksIntro: "كل عملية فحص تجمع نقاط كل معيار ناجح. المجموع الكلي من {max} نقطة.",
      riskHeading: "مستويات الخطر",
      riskIntro: "يُحسب مستوى الخطر بناءً على النسبة المئوية من النتيجة الكلية:",
      riskLowFull: "‏≥ 80% من النتيجة القصوى ← خطر منخفض",
      riskMediumFull: "‏≥ 50% ← خطر متوسط",
      riskHighFull: "‏≥ 20% ← خطر مرتفع",
      riskCriticalFull: "‏< 20% ← خطر حرج",
      apiHeading: "استخدام الواجهة البرمجية (API) مباشرة",
      apiIntro: "الواجهة البرمجية مجانية ومفتوحة. المخطط الكامل (OpenAPI) متوفر على /api/openapi.json.",
      limitsHeading: "القيود المعروفة",
      limit1:
        "لا يميّز تركّز الحائزين وقفل السيولة بين المحافظ الشخصية وحسابات المجمّع (pool) - لذا قد يخفّض مجمّع شرعي هذه النتائج بشكل مصطنع.",
      limit2:
        "لا يُفعَّل كشف المشترين الأوائل إلا للمجمّعات الحديثة وقليلة النشاط - هذا قيد حقيقي في واجهة سولانا البرمجية (يستحيل استرجاع كامل تاريخ مجمّع نشط جداً دون إبطاء الفحص)، وليس خياراً عشوائياً.",
      limit3:
        "لا يحاكي أي معيار عملية شراء/بيع حقيقية (كشف الفخاخ بالمحاكاة) - سيتطلب ذلك محفظة ممولة أو بنية اختبار مخصصة.",
      disclaimer:
        "توفر هذه الأداة تحليلاً آلياً لإشارات علنية على السلسلة. هذه ليست نصيحة مالية ولا تضمن أمان أي توكن. قم دائماً بأبحاثك الخاصة (DYOR).",
      checkDescriptions: {
        mintAuthority:
          "يتحقق مما إذا كانت صلاحية الإصدار (القدرة على إنشاء توكنات جديدة) قد أُلغيت. إذا كانت لا تزال فعالة، يمكن للمنشئ تخفيف قيمة العرض الكلي كما يشاء.",
        freezeAuthority:
          "يتحقق مما إذا كانت صلاحية التجميد (القدرة على تجميد حساب توكنات) قد أُلغيت. إذا كانت فعالة، يمكن للمنشئ منع حائز من البيع - إشارة قوية على وجود فخ (honeypot).",
        holderConcentration:
          "يحسب حصة العرض التي يملكها أكبر 10 حسابات. التركّز العالي يعني أن عدداً قليلاً من المحافظ يمكنه إسقاط السعر بالبيع.",
        metadataAuthority:
          "يتحقق مما إذا كان بإمكان المنشئ ما زال تغيير اسم التوكن أو رمزه أو شعاره (البيانات الوصفية عبر Metaplex) - وسيلة محتملة لإعادة تسمية مضللة.",
        lpLock:
          "يتحقق من نسبة توكنات السيولة (LP) في مجمّع Raydium الرئيسي المحروقة أو المقفلة. إذا احتفظ المنشئ بالتحكم في السيولة، يمكنه سحبها (احتيال rug pull كلاسيكي).",
        tokenExtensions:
          "يكتشف امتدادات Token-2022 الخطرة: permanent delegate (سرقة مباشرة لتوكنات حائز)، transfer hook (كود عشوائي عند كل تحويل)، ضريبة تحويل مخفية، حسابات مجمّدة افتراضياً.",
        earlySniperConcentration:
          "بالنسبة للمجمّعات الحديثة (أقل من 7 أيام) والقليلة النشاط، يحلل المعاملات الأولى لاكتشاف ما إذا كان عدد قليل من المحافظ قد استحوذ على العرض عند الإطلاق (sniping/bundling). محايد بالنسبة للتوكنات الأقدم أو ذات النشاط المرتفع - غير قابل للتحقق بشكل موثوق في هذه الحالات.",
      },
    },
  },

  zh: {
    common: {
      backToScanner: "← 返回扫描器",
    },
    support: {
      title: "支持本项目",
      text: "如果这个工具对你有帮助，欢迎向这个 Solana 地址捐赠：",
      copy: "复制",
      copied: "已复制！",
      thanks: "感谢你的支持 🙏",
    },
    home: {
      title: "Token Scanner",
      subtitle:
        "粘贴 Solana 代币的 mint 地址，检测跑路（rug pull）或蜜罐（honeypot）风险信号：铸造权限与冻结权限、持币集中度、流动性锁定情况，以及有风险的 Token-2022 扩展。",
      inputPlaceholder: "Mint 地址（例如：DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263）",
      scanButton: "扫描",
      scanningButton: "扫描中...",
      disclaimer:
        "本工具基于公开链上数据提供自动化分析，不构成财务建议，也不保证任何代币的安全性。投资前请始终自行研究（DYOR）。",
      docsLink: "文档 - 了解七项分析标准的工作原理",
      pointsLabel: "分",
      warningsNote: "个技术警告（如果某项检查标记为无法验证，请查看上方详情）。",
      networkError: "无法连接扫描服务器，请稍后重试。",
      unknownError: "未知错误",
    },
    checks: {
      mintAuthority: "铸造权限（Mint Authority）",
      freezeAuthority: "冻结权限（Freeze Authority）",
      holderConcentration: "持币集中度",
      metadataAuthority: "元数据可变性",
      lpLock: "流动性锁定（LP）",
      tokenExtensions: "Token-2022 扩展",
      earlySniperConcentration: "早期买家集中度",
    },
    risk: {
      LOW: "低风险",
      MEDIUM: "中等风险",
      HIGH: "高风险",
      CRITICAL: "极高风险",
    },
    docs: {
      title: "文档",
      intro:
        "Token Scanner 是一款免费工具，通过分析公开链上数据来检测 Solana 代币的跑路（rug pull）或蜜罐（honeypot）风险。以下是其详细工作原理。",
      checksHeading: "七项分析标准",
      checksIntro: "每次扫描会累加每项通过检查的得分，总分为 {max} 分。",
      riskHeading: "风险等级",
      riskIntro: "风险等级根据总分的百分比计算得出：",
      riskLowFull: "≥ 满分的 80% → 低风险",
      riskMediumFull: "≥ 50% → 中等风险",
      riskHighFull: "≥ 20% → 高风险",
      riskCriticalFull: "< 20% → 极高风险",
      apiHeading: "直接使用 API",
      apiIntro: "API 完全免费开放。完整的 OpenAPI 规范可在 /api/openapi.json 获取。",
      limitsHeading: "已知局限",
      limit1: "持币集中度和流动性锁定检查无法区分个人钱包和资金池账户 - 因此一个合法的资金池也可能人为拉低这些分数。",
      limit2:
        "早期买家检测仅对较新且交易量较低的资金池生效 - 这是 Solana API 的真实限制（无法在不拖慢扫描速度的情况下回溯高活跃度资金池的完整历史），而非人为设定的限制。",
      limit3: "没有任何检查会模拟真实的买入/卖出交易（通过模拟检测蜜罐）- 这需要一个已注资的钱包或专门的测试基础设施。",
      disclaimer:
        "本工具基于公开链上数据提供自动化分析，不构成财务建议，也不保证任何代币的安全性。投资前请始终自行研究（DYOR）。",
      checkDescriptions: {
        mintAuthority:
          "检查铸造权限（可创建新代币的权限）是否已被撤销。如果仍然有效，创建者可以随意增发代币，稀释持币者的份额。",
        freezeAuthority:
          "检查冻结权限（可冻结代币账户的权限）是否已被撤销。如果仍然有效，创建者可以阻止持币者卖出 - 这是强烈的蜜罐信号。",
        holderConcentration: "计算前 10 大账户持有的代币占总供应量的比例。集中度过高意味着少数钱包抛售即可导致价格暴跌。",
        metadataAuthority:
          "检查创建者是否仍可更改代币的名称、符号或图标（Metaplex 元数据）- 这是一种潜在的虚假改名手段。",
        lpLock:
          "检查 Raydium 主要资金池中已销毁或已锁定的 LP 代币比例。如果创建者仍掌控流动性，就可以随时撤走（典型的跑路手法）。",
        tokenExtensions:
          "检测高风险的 Token-2022 扩展：永久代理（permanent delegate，可直接盗取持币者代币）、转账钩子（transfer hook，每次转账执行任意代码）、隐藏转账税，以及默认冻结账户。",
        earlySniperConcentration:
          "对于较新（不足 7 天）且交易量较低的资金池，分析最早的交易以检测是否有少数钱包在代币上线时抢购了大部分供应量（狙击/捆绑交易）。对于较旧或交易量较高的代币，此项为中性 - 在这些情况下无法可靠验证。",
      },
    },
  },
};
