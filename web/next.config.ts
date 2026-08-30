import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // web/ vit dans le repo du backend (pas de .git ici) - evite que Turbopack
  // remonte chercher un lockfile/racine plus haut et emette un warning.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
