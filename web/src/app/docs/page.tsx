import Link from "next/link";

const CHECKS = [
  {
    id: "mintAuthority",
    name: "Mint authority",
    weight: 25,
    desc: "Verifie si l'autorite de mint (qui peut creer de nouveaux tokens) a ete revoquee. Si elle est active, le createur peut diluer le supply a volonte.",
  },
  {
    id: "freezeAuthority",
    name: "Freeze authority",
    weight: 25,
    desc: "Verifie si l'autorite de gel (qui peut bloquer un compte de tokens) a ete revoquee. Si elle est active, le createur peut empecher un holder de vendre - signal honeypot fort.",
  },
  {
    id: "holderConcentration",
    name: "Concentration des holders",
    weight: 20,
    desc: "Calcule la part du supply detenue par les 10 plus gros comptes. Une forte concentration signifie qu'un petit nombre de wallets peut faire chuter le prix en vendant.",
  },
  {
    id: "metadataAuthority",
    name: "Mutabilite des metadata",
    weight: 15,
    desc: "Verifie si le nom, le symbole ou le logo du token (metadata Metaplex) peuvent encore etre changes par le createur - un vecteur de rebranding trompeur.",
  },
  {
    id: "lpLock",
    name: "Verrouillage de la liquidite",
    weight: 20,
    desc: "Verifie quelle part des LP tokens du pool Raydium principal est brulee ou verrouillee. Si le createur garde le controle de la liquidite, il peut la retirer (rug pull classique).",
  },
  {
    id: "tokenExtensions",
    name: "Extensions Token-2022",
    weight: 25,
    desc: "Detecte les extensions Token-2022 a risque : permanent delegate (vol direct des tokens d'un holder), transfer hook (code arbitraire a chaque transfert), taxe de transfert cachee, comptes geles par defaut.",
  },
  {
    id: "earlySniperConcentration",
    name: "Concentration des acheteurs precoces",
    weight: 15,
    desc: "Pour les pools recents (< 7 jours) et peu actifs, analyse les premieres transactions pour detecter si un petit nombre de wallets a raffle le supply au lancement (sniping/bundling). Neutre pour les tokens plus anciens ou a fort volume - non verifiable de facon fiable dans ces cas.",
  },
];

export default function DocsPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-16 sm:py-24">
      <div>
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
          ← Retour au scanner
        </Link>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Documentation</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Token Scanner est un outil gratuit qui analyse des signaux publics on-chain pour detecter des risques
          de rug pull ou de honeypot sur des tokens Solana. Voici comment il fonctionne, en detail.
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Les 7 criteres analyses</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Chaque scan additionne le score de chaque critere reussi. Le score total est sur{" "}
          {CHECKS.reduce((sum, c) => sum + c.weight, 0)} points.
        </p>
        <div className="flex flex-col gap-3">
          {CHECKS.map((check) => (
            <div
              key={check.id}
              className="rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{check.name}</span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">{check.weight} pts</span>
              </div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{check.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Niveaux de risque</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Le niveau de risque est calcule a partir du pourcentage du score total obtenu :
        </p>
        <ul className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
          <li>≥ 80% du score max → <span className="font-medium text-emerald-700 dark:text-emerald-400">Risque faible</span></li>
          <li>≥ 50% → <span className="font-medium text-amber-700 dark:text-amber-400">Risque modere</span></li>
          <li>≥ 20% → <span className="font-medium text-orange-700 dark:text-orange-400">Risque eleve</span></li>
          <li>&lt; 20% → <span className="font-medium text-red-700 dark:text-red-400">Risque critique</span></li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Utiliser l&apos;API directement</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          L&apos;API est gratuite et ouverte. Le schema complet (OpenAPI) est disponible sur{" "}
          <a href="/api/openapi.json" className="underline">/api/openapi.json</a>.
        </p>
        <div className="flex flex-col gap-2">
          <pre className="overflow-x-auto rounded-lg bg-zinc-900 px-4 py-3 text-sm text-zinc-100">
            <code>GET /api/scan/&lt;adresse-du-mint&gt;</code>
          </pre>
          <pre className="overflow-x-auto rounded-lg bg-zinc-900 px-4 py-3 text-sm text-zinc-100">
            <code>GET /api/history/&lt;adresse-du-mint&gt;</code>
          </pre>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Limites connues</h2>
        <ul className="flex list-disc flex-col gap-2 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
          <li>
            La concentration des holders et le verrouillage de LP ne distinguent pas les wallets personnels des
            comptes de pool - un pool legitime peut donc faire baisser artificiellement ces scores.
          </li>
          <li>
            La detection des acheteurs precoces ne s&apos;active que pour les pools jeunes et peu actifs - c&apos;est
            une limite reelle de l&apos;API Solana (impossible de remonter l&apos;historique d&apos;un pool tres
            actif sans surcharger le scan), pas un choix arbitraire.
          </li>
          <li>Aucun check ne simule d&apos;achat/vente reel (honeypot par simulation) - cela demanderait un wallet finance ou une infrastructure de test dediee.</li>
        </ul>
      </section>

      <p className="text-xs text-zinc-400 dark:text-zinc-600">
        Cet outil fournit une analyse automatisee de signaux on-chain publics. Ce n&apos;est pas un conseil
        financier et ne garantit pas la securite d&apos;un token. Fais toujours tes propres recherches (DYOR).
      </p>
    </div>
  );
}
