"use client";

import * as React from "react";

import type { Listing, ListingFilters, ListingSort } from "@/domain/types";
import { demoListingRepository } from "@/services/demo/listing-repository";

function useListings(
  filters: ListingFilters = {},
  sort: ListingSort = "recent",
) {
  const [state, setState] = React.useState<{
    listings: Listing[];
    status: "loading" | "ready" | "error";
    error: string | null;
  }>({ listings: [], status: "loading", error: null });
  const serializedFilters = JSON.stringify(filters);
  const stableFilters = React.useMemo<ListingFilters>(
    () => JSON.parse(serializedFilters) as ListingFilters,
    [serializedFilters],
  );

  const load = React.useCallback(
    () =>
      demoListingRepository
        .list(stableFilters, sort)
        .then((listings) =>
          setState({ listings, status: "ready", error: null }),
        )
        .catch(() =>
          setState({
            listings: [],
            status: "error",
            error:
              "WoodLoop could not load locally saved sample listings. Try again without clearing your browser data.",
          }),
        ),
    [sort, stableFilters],
  );

  React.useEffect(() => {
    void demoListingRepository
      .list(stableFilters, sort)
      .then((listings) => setState({ listings, status: "ready", error: null }))
      .catch(() =>
        setState({
          listings: [],
          status: "error",
          error:
            "WoodLoop could not load locally saved sample listings. Try again without clearing your browser data.",
        }),
      );
    const refresh = () => void load();
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("woodloop:listings-changed", refresh);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.removeEventListener("woodloop:listings-changed", refresh);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [load, sort, stableFilters]);

  return { ...state, retry: load };
}

export { useListings };
