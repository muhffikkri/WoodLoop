import {
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
      {
        label: "Add",
        href: "/app/listings/new",
        icon: CirclePlus,
        prominent: true,
      },
      { label: "Profile", href: "/app/profile", icon: UserRound },
    ],
  };
