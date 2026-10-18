"use client";

import * as React from "react";

import type { Listing, MaterialRequest } from "@/domain/types";
import { demoListingRepository } from "@/services/demo/listing-repository";
import { demoRequestRepository } from "@/services/demo/request-repository";

type SupplierWorkspaceState = {
  listings: Listing[];
  requests: MaterialRequest[];
  status: "loading" | "ready" | "error";
};

function useSupplierWorkspace(supplierId: string | undefined) {
  const [state, setState] = React.useState<SupplierWorkspaceState>({
    listings: [],
    requests: [],
    status: "loading",
  });

  const fetchState = React.useCallback(
    async (): Promise<SupplierWorkspaceState> => {
      try {
        const [listings, requests] = await Promise.all([
          demoListingRepository.listBySupplier(supplierId ?? ""),
          demoRequestRepository.listForUser(supplierId ?? "", "incoming"),
        ]);
        return { listings, requests, status: "ready" };
      } catch {
        return { listings: [], requests: [], status: "error" };
      }
    },
    [supplierId],
  );

  React.useEffect(() => {
    if (!supplierId) return;
    let active = true;
    const refresh = () =>
      void fetchState().then((next) => {
        if (active) setState(next);
      });
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    refresh();
    window.addEventListener("woodloop:listings-changed", refresh);
    window.addEventListener("woodloop:requests-changed", refresh);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      active = false;
      window.removeEventListener("woodloop:listings-changed", refresh);
      window.removeEventListener("woodloop:requests-changed", refresh);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [fetchState, supplierId]);

  const retry = React.useCallback(() => {
    setState((current) => ({ ...current, status: "loading" }));
    return fetchState().then(setState);
  }, [fetchState]);

  return { ...state, retry };
}

export { useSupplierWorkspace };
