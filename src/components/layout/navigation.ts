import {
  Boxes,
  CirclePlus,
  Home,
  MessageSquareText,
  Search,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import type { ActiveWorkspace } from "@/domain/types";

export type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  prominent?: boolean;
};

export const navigationByWorkspace: Record<ActiveWorkspace, NavigationItem[]> =
  {
    buying: [
      { label: "Home", href: "/app/buyer", icon: Home },
      { label: "Search", href: "/app/materials", icon: Search },
      {
        label: "Requests",
        href: "/app/requests?view=sent",
        icon: MessageSquareText,
      },
      { label: "Profile", href: "/app/profile", icon: UserRound },
    ],
    supplying: [
      { label: "Home", href: "/app/supplier", icon: Home },
      { label: "My Listings", href: "/app/listings", icon: Boxes },
      {
        label: "Add",
        href: "/app/listings/new",
        icon: CirclePlus,
        prominent: true,
      },
      {
        label: "Requests",
        href: "/app/requests?view=incoming",
        icon: MessageSquareText,
      },
      { label: "Profile", href: "/app/profile", icon: UserRound },
    ],
  };

/** The active item is the one with the longest matching base path. */
export function activeNavigationHref(
  items: NavigationItem[],
  pathname: string,
) {
  let best: string | undefined;
  for (const { href } of items) {
    const base = href.split("?")[0];
    const matches = pathname === base || pathname.startsWith(`${base}/`);
    if (matches && (!best || base.length > best.split("?")[0].length))
      best = href;
  }
  return best;
}
