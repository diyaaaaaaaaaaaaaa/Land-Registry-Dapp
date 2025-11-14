import { aptos, MODULE } from "./aptos";
import { InputTransactionData } from "@aptos-labs/ts-sdk";

export async function view_getParcel(id: number) {
  return aptos.view({
    payload: {
      function: `${MODULE}::get_parcel`,
      functionArguments: [id],
    },
  });
}

export async function view_getNextId() {
  return aptos.view({
    payload: {
      function: `${MODULE}::get_next_parcel_id`,
      functionArguments: [],
    },
  });
}

export async function view_getCouncil() {
  return aptos.view({
    payload: {
      function: `${MODULE}::get_council_members`,
      functionArguments: [],
    },
  });
}

export async function submitLand(sender: string, args: any) {
  const payload: InputTransactionData = {
    data: {
      function: `${MODULE}::submit_land`,
      functionArguments: [
        args.khasra,
        args.cid,
        args.area,
        args.notes,
        args.village,
        args.tehsil,
        args.district,
      ],
    },
  };

  return aptos.transaction.build.signAndSubmitTransaction({
    sender,
    data: payload.data!,
  });
}

export async function approve(sender: string, parcelId: any) {
  const payload: InputTransactionData = {
    data: {
      function: `${MODULE}::approve`,
      functionArguments: [parcelId],
    },
  };

  return aptos.transaction.build.signAndSubmitTransaction({
    sender,
    data: payload.data!,
  });
}

export async function reject(sender: string, parcelId: number) {
  const payload: InputTransactionData = {
    data: {
      function: `${MODULE}::reject`,
      functionArguments: [parcelId],
    },
  };

  return aptos.transaction.build.signAndSubmitTransaction({
    sender,
    data: payload.data!,
  });
}

export async function dispute(sender: string, parcelId: number) {
  const payload: InputTransactionData = {
    data: {
      function: `${MODULE}::dispute`,
      functionArguments: [parcelId],
    },
  };

  return aptos.transaction.build.signAndSubmitTransaction({
    sender,
    data: payload.data!,
  });
}

export async function transferOwnership(sender: string, parcelId: number, newOwner: string) {
  const payload: InputTransactionData = {
    data: {
      function: `${MODULE}::transfer_ownership`,
      functionArguments: [parcelId, newOwner],
    },
  };

  return aptos.transaction.build.signAndSubmitTransaction({
    sender,
    data: payload.data!,
  });
}
