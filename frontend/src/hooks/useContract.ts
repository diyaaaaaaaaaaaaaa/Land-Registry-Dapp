// src/hooks/useContract.ts
// (updated version you pasted earlier — included here for completeness)
import { useCallback } from "react";
import { client, getBrowserWallet, buildEntryFunctionPayload, MODULE_ADDRESS, MODULE_NAME } from "@/lib/aptos";
import type { Types } from "aptos";

/**
 * useContract hook
 *
 * Exposes:
 * const { submit, approve, reject, dispute, transfer, getParcel, getNextId } = useContract();
 *
 * NOTE:
 * - All write functions require a connected wallet in the browser that exposes signAndSubmitTransaction.
 * - getParcel and getNextId are read-only and use the Aptos REST client where possible.
 */

export function useContract() {
  // ---------- READS ----------
  const getNextId = useCallback(async (): Promise<number> => {
    try {
      const resourceType = `${MODULE_ADDRESS}::${MODULE_NAME}::Registry`;
      const res = await client.getAccountResource(MODULE_ADDRESS, resourceType);

      const nextId =
        (res && (res.data?.next_parcel_id ?? (res.next_parcel_id ?? undefined))) ||
        (res && (res["next_parcel_id"] ?? undefined));

      if (nextId === undefined) {
        throw new Error("next_parcel_id not found in Registry resource");
      }
      return Number(nextId);
    } catch (err) {
      throw new Error(
        `Failed to read next parcel id from chain: ${(err as Error).message}`
      );
    }
  }, []);

  const getParcel = useCallback(async (parcelId: number) => {
    try {
      const payload = {
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_parcel`,
        type_args: [],
        args: [String(parcelId)],
      };

      const resp = await fetch(`${(client as any).nodeUrl}/views`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (resp.ok) {
        const json = await resp.json();
        return json;
      }

      const registryType = `${MODULE_ADDRESS}::${MODULE_NAME}::Registry`;
      const registry = await client.getAccountResource(MODULE_ADDRESS, registryType);
      const parcelsTable =
        registry?.data?.parcels?.handle ?? registry?.data?.parcels ?? registry?.parcels;
      if (!parcelsTable) {
        throw new Error("parcels table handle not found in Registry resource");
      }

      const tableItem = await client.getTableItem(parcelsTable, "u64", `${MODULE_ADDRESS}::${MODULE_NAME}::LandParcel`, parcelId.toString());
      return tableItem;
    } catch (err) {
      throw new Error(`Failed to fetch parcel ${parcelId}: ${(err as Error).message}`);
    }
  }, []);

  // ---------- WRITES (require wallet) ----------
  const submitTxWithWallet = useCallback(
    async (payload: Types.TransactionPayload) => {
      const wallet = getBrowserWallet();
      if (!wallet || !wallet.signAndSubmitTransaction) {
        throw new Error(
          "No Aptos-compatible wallet found in browser. Install Petra / Martian / Pontem and connect it."
        );
      }

      try {
        if (wallet.connect) await wallet.connect();
      } catch (e) {
        // ignore
      }

      const result = await wallet.signAndSubmitTransaction(payload);
      return result;
    },
    []
  );

  const submit = useCallback(
    async (params: {
      khasra_number: string;
      document_cid: string;
      area_sqm: number;
      notes: string;
      village: string;
      tehsil: string;
      district: string;
    }) => {
      const payload = buildEntryFunctionPayload(
        MODULE_ADDRESS,
        MODULE_NAME,
        "submit_land",
        [],
        [
          params.khasra_number,
          params.document_cid,
          params.area_sqm,
          params.notes,
          params.village,
          params.tehsil,
          params.district,
        ]
      );

      return submitTxWithWallet(payload);
    },
    [submitTxWithWallet]
  );

  const approve = useCallback(
    async (parcelId: number) => {
      const payload = buildEntryFunctionPayload(MODULE_ADDRESS, MODULE_NAME, "approve", [], [
        String(parcelId),
      ]);
      return submitTxWithWallet(payload);
    },
    [submitTxWithWallet]
  );

  const reject = useCallback(
    async (parcelId: number) => {
      const payload = buildEntryFunctionPayload(MODULE_ADDRESS, MODULE_NAME, "reject", [], [
        String(parcelId),
      ]);
      return submitTxWithWallet(payload);
    },
    [submitTxWithWallet]
  );

  const dispute = useCallback(
    async (parcelId: number) => {
      const payload = buildEntryFunctionPayload(MODULE_ADDRESS, MODULE_NAME, "dispute", [], [
        String(parcelId),
      ]);
      return submitTxWithWallet(payload);
    },
    [submitTxWithWallet]
  );

  const transfer = useCallback(
    async (parcelId: number, newOwnerAddress: string) => {
      const payload = buildEntryFunctionPayload(
        MODULE_ADDRESS,
        MODULE_NAME,
        "transfer_ownership",
        [],
        [String(parcelId), newOwnerAddress]
      );
      return submitTxWithWallet(payload);
    },
    [submitTxWithWallet]
  );

  return {
    submit,
    approve,
    reject,
    dispute,
    transfer,
    getParcel,
    getNextId,
  };
}
