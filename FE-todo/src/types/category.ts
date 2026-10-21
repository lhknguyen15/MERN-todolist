export type CategoryColor = "emerald" | "blue" | "violet" | "amber" | "rose" | "slate";

export interface Category {
  id: string;
  name: string;
  color: CategoryColor;
}

export interface ApiCategory {
  _id: string;
  name: string;
  color: CategoryColor;
}

export const categoryColors: { id: CategoryColor; label: string; dot: string; badge: string }[] = [
  { id: "emerald", label: "Xanh lá", dot: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200" },
  { id: "blue", label: "Xanh dương", dot: "bg-blue-500", badge: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200" },
  { id: "violet", label: "Tím", dot: "bg-violet-500", badge: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200" },
  { id: "amber", label: "Vàng", dot: "bg-amber-500", badge: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200" },
  { id: "rose", label: "Đỏ hồng", dot: "bg-rose-500", badge: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200" },
  { id: "slate", label: "Xám", dot: "bg-slate-500", badge: "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200" },
];

export const mapApiCategory = (category: ApiCategory): Category => ({
  id: category._id,
  name: category.name,
  color: category.color,
});
