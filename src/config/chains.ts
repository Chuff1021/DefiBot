import type { ChainConfig } from "../domain/types.js";

export const chainRegistry: ChainConfig[] = [
  {
    id: "base",
    name: "Base",
    enabled: true,
    rpcUrls: [],
    nativeToken: "ETH",
    explorerUrl: "https://basescan.org",
    priority: 1,
  },
  {
    id: "arbitrum",
    name: "Arbitrum",
    enabled: true,
    rpcUrls: [],
    nativeToken: "ETH",
    explorerUrl: "https://arbiscan.io",
    priority: 2,
  },
  {
    id: "optimism",
    name: "Optimism",
    enabled: true,
    rpcUrls: [],
    nativeToken: "ETH",
    explorerUrl: "https://optimistic.etherscan.io",
    priority: 3,
  },
  {
    id: "bnb",
    name: "BNB Chain",
    enabled: false,
    rpcUrls: [],
    nativeToken: "BNB",
    explorerUrl: "https://bscscan.com",
    priority: 4,
  },
];
