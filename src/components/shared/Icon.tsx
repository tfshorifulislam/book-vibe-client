import {
  ArrowRight,
  ArrowUp,
  Award,
  Baby,
  BadgeCheck,
  Bell,
  BookMarked,
  BookOpen,
  Briefcase,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Clock,
  Cpu,
  CreditCard,
  Flame,
  Globe,
  GraduationCap,
  Handshake,
  Headphones,
  Heart,
  History,
  Landmark,
  LayoutGrid,
  Library,
  LoaderCircle,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Moon,
  Package,
  Percent,
  Quote,
  Rss,
  Search,
  Send,
  ShieldCheck,
  ShoppingCart,
  Star,
  Store,
  Sun,
  Tag,
  TrendingUp,
  Truck,
  User,
  Users,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = {
  ArrowRight,
  ArrowUp,
  Award,
  Baby,
  BadgeCheck,
  Bell,
  BookMarked,
  BookOpen,
  Briefcase,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Clock,
  Cpu,
  CreditCard,
  Flame,
  Globe,
  GraduationCap,
  Handshake,
  Headphones,
  Heart,
  History,
  Landmark,
  LayoutGrid,
  Library,
  LoaderCircle,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Moon,
  Package,
  Percent,
  Quote,
  Rss,
  Search,
  Send,
  ShieldCheck,
  ShoppingCart,
  Star,
  Store,
  Sun,
  Tag,
  TrendingUp,
  Truck,
  User,
  Users,
  Wallet,
  X,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

interface IconProps {
  name?: string | null;
  className?: string;
  strokeWidth?: number;
}

export function Icon({ name, className, strokeWidth }: IconProps) {
  const Component =
    name && name in ICONS ? ICONS[name as IconName] : ICONS.BookOpen;

  return (
    <Component
      className={cn("size-5", className)}
      strokeWidth={strokeWidth}
      aria-hidden="true"
    />
  );
}
