// src/lib/aptos.ts
import { AptosClient, Types } from "aptos";

/**
 * NODE URL — Vite uses import.meta.env
 */
export const NODE_URL =
  import.meta.env.VITE_APTOS_NODE_URL ||
  "https://fullnode.devnet.aptoslabs.com/v1";

export const client = new AptosClient(NODE_URL);

/**
 * Published module information
 */
export const MODULE_ADDRESS =
  "0x5238fbcf073759f549491d62b4a8fe35207189073e5f0eb492d6e86df77dcfac";

export const MODULE_NAME = "land_registry";

/**
 * Browser wallet getter
 */
export type WalletLike = {
  address?: string;
  connect?: () => Promise<any>;
  account?: { address?: string };
  signAndSubmitTransaction?: (
    tx: Types.TransactionPayload,
    opts?: any
  ) => Promise<any>;
  signMessage?: (payload: { message: string }) => Promise<any>;
};

export function getBrowserWallet(): WalletLike | null {
  if ((window as any).aptos) return (window as any).aptos;
  if ((window as any).petra) return (window as any).petra;
  if ((window as any).martian) return (window as any).martian;
  if ((window as any).pontem) return (window as any).pontem;
  return null;
}

/**
 * Entry function payload
 */
export function buildEntryFunctionPayload(
  moduleAddress: string,
  moduleName: string,
  fnName: string,
  typeArgs: string[] = [],
  args: any[] = []
): Types.TransactionPayload {
  return {
    type: "entry_function_payload",
    function: `${moduleAddress}::${moduleName}::${fnName}`,
    type_arguments: typeArgs,
    arguments: args.map(arg =>
      typeof arg === "number" ? arg.toString() : arg
    ),
  // send raw number, not string
  } as Types.TransactionPayload;
}

