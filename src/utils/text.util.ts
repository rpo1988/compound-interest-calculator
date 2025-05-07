export const formatText = (
  value: string,
  format: "capitalize" | "uppercase" | "lowercase"
) => {
  return format === "uppercase"
    ? value.toUpperCase()
    : format === "lowercase"
    ? value.toLowerCase()
    : value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
};

export const parseNumber = (value: number | string) => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value));
};
