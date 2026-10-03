export const FEE_ITEM_LABELS: Record<string, string> = {
  TUITION: "Tuition",
  TRANSPORT: "Transport",
  BOARDING: "Hostel / Accommodation",
  LUNCH: "Meals",
  ACTIVITY: "Student activities",
  UNIFORM: "Uniform & tools",
  OTHER: "Other",
};

export function feeLabel(name: string): string {
  return FEE_ITEM_LABELS[name] ?? name;
}
