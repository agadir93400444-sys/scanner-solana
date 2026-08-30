const RAYDIUM_POOLS_ENDPOINT = "https://api-v3.raydium.io/pools/info/mint";
const FETCH_TIMEOUT_MS = 8000;

export interface RaydiumPool {
  type: string;
  id: string;
  tvl: number;
  burnPercent?: number;
  lpAmount?: number;
  openTime?: string; // unix seconds, en string cote API
}

interface RaydiumPoolsResponse {
  success: boolean;
  data: {
    count: number;
    data: RaydiumPool[];
  };
}

// L'API publique Raydium calcule deja le % de LP tokens brules/verrouilles
// (burnPercent) par pool - on evite de re-deriver les adresses de pool et de
// parser les comptes LP nous-memes (layouts Raydium/Orca non stables).
export async function fetchStandardPools(mintAddress: string): Promise<RaydiumPool[]> {
  const url = `${RAYDIUM_POOLS_ENDPOINT}?mint1=${mintAddress}&poolType=standard&poolSortField=liquidity&sortType=desc&pageSize=5&page=1`;
  const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });

  if (!res.ok) {
    throw new Error(`Raydium API a repondu ${res.status}`);
  }

  const json = (await res.json()) as RaydiumPoolsResponse;
  if (!json.success) {
    throw new Error("Raydium API: reponse non reussie");
  }

  return json.data.data;
}
