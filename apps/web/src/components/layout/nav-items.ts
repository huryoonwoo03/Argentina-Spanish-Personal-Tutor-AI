import {
  BookOpen,
  Globe2,
  LayoutDashboard,
  LineChart,
  type LucideIcon,
  Mic,
  MessageCircle,
  Repeat,
  Settings,
} from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/practice", label: "Practice", icon: Mic },
  { to: "/shadowing", label: "Shadowing", icon: Repeat },
  { to: "/conversation", label: "Conversation", icon: MessageCircle },
  { to: "/vocabulary", label: "Vocabulary", icon: BookOpen },
  { to: "/culture", label: "Culture", icon: Globe2 },
  { to: "/progress", label: "Progress", icon: LineChart },
  { to: "/settings", label: "Settings", icon: Settings },
];
