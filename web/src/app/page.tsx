import Link from "next/link";
import ScanForm from "./scan-form";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-4 py-16 dark:bg-black sm:py-24">
      <div className="flex w-full max-w-2xl flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Token Scanner</h1>
        <p className="max-w-xl text-zinc-600 dark:text-zinc-400">
          Colle l&apos;adresse d&apos;un mint Solana pour verifier les signaux de rug pull/honeypot : mint &
          freeze authority, concentration des holders, verrouillage de la liquidite, extensions Token-2022 a
          risque.
        </p>
      </div>

      <div className="mt-8 flex w-full flex-col items-center">
        <ScanForm />
      </div>

      <p className="mt-12 max-w-xl text-center text-xs text-zinc-400 dark:text-zinc-600">
        Cet outil fournit une analyse automatisee de signaux on-chain publics. Ce n&apos;est pas un conseil
        financier et ne garantit pas la securite d&apos;un token. Fais toujours tes propres recherches (DYOR)
        avant tout investissement.
      </p>

      <Link
        href="/docs"
        className="mt-4 text-sm font-medium text-zinc-600 underline underline-offset-2 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        Documentation - comment fonctionnent les 7 criteres d&apos;analyse
      </Link>
    </div>
  );
}
