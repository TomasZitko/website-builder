export type PageType = "dashboard" | "editor" | "billing" | "settings";

export interface Project {
  id: string;
  name: string;
  url: string;
  status: "active" | "draft" | "paused";
}

export interface StatCard {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
  change: string;
  theme: "dark" | "light";
}

export interface ActivityItem {
  action: string;
  time: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface BillingRecord {
  date: string;
  amount: string;
  status: "paid" | "pending" | "failed";
  invoice: string;
}

export interface QuickAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}
