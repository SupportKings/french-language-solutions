export const AvailableChartColors = {
  blue: "blue",
  cyan: "cyan",
  emerald: "emerald",
  green: "green",
  lime: "lime",
  yellow: "yellow",
  amber: "amber",
  orange: "orange",
  red: "red",
  rose: "rose",
  pink: "pink",
  fuchsia: "fuchsia",
  purple: "purple",
  violet: "violet",
  indigo: "indigo",
  teal: "teal",
  sky: "sky",
  gray: "gray",
  neutral: "neutral",
  stone: "stone",
  zinc: "zinc",
  slate: "slate",
} as const;

export type AvailableChartColorsKeys = keyof typeof AvailableChartColors;

export const defaultColors: AvailableChartColorsKeys[] = Object.values(AvailableChartColors) as AvailableChartColorsKeys[];

export const constructCategoryColors = (
  categories: string[],
  colors?: AvailableChartColorsKeys[]
): Map<string, AvailableChartColorsKeys> => {
  const categoryColors = new Map<string, AvailableChartColorsKeys>();
  const defaultColors = Object.values(AvailableChartColors) as AvailableChartColorsKeys[];
  const colorsToUse = colors || defaultColors;
  
  categories.forEach((category, index) => {
    categoryColors.set(category, colorsToUse[index % colorsToUse.length]);
  });
  
  return categoryColors;
};

export const getColorClassName = (color: AvailableChartColorsKeys, type: "bg" | "text" | "border" | "ring" | "stroke" | "fill") => {
  const colorClassMap: Record<AvailableChartColorsKeys, Record<string, string>> = {
    blue: {
      bg: "bg-blue-500",
      text: "text-blue-500",
      border: "border-blue-500",
      ring: "ring-blue-500",
      stroke: "stroke-blue-500",
      fill: "fill-blue-500",
    },
    cyan: {
      bg: "bg-cyan-500",
      text: "text-cyan-500",
      border: "border-cyan-500",
      ring: "ring-cyan-500",
      stroke: "stroke-cyan-500",
      fill: "fill-cyan-500",
    },
    emerald: {
      bg: "bg-emerald-500",
      text: "text-emerald-500",
      border: "border-emerald-500",
      ring: "ring-emerald-500",
      stroke: "stroke-emerald-500",
      fill: "fill-emerald-500",
    },
    green: {
      bg: "bg-green-500",
      text: "text-green-500",
      border: "border-green-500",
      ring: "ring-green-500",
      stroke: "stroke-green-500",
      fill: "fill-green-500",
    },
    lime: {
      bg: "bg-lime-500",
      text: "text-lime-500",
      border: "border-lime-500",
      ring: "ring-lime-500",
      stroke: "stroke-lime-500",
      fill: "fill-lime-500",
    },
    yellow: {
      bg: "bg-yellow-500",
      text: "text-yellow-500",
      border: "border-yellow-500",
      ring: "ring-yellow-500",
      stroke: "stroke-yellow-500",
      fill: "fill-yellow-500",
    },
    amber: {
      bg: "bg-amber-500",
      text: "text-amber-500",
      border: "border-amber-500",
      ring: "ring-amber-500",
      stroke: "stroke-amber-500",
      fill: "fill-amber-500",
    },
    orange: {
      bg: "bg-orange-500",
      text: "text-orange-500",
      border: "border-orange-500",
      ring: "ring-orange-500",
      stroke: "stroke-orange-500",
      fill: "fill-orange-500",
    },
    red: {
      bg: "bg-red-500",
      text: "text-red-500",
      border: "border-red-500",
      ring: "ring-red-500",
      stroke: "stroke-red-500",
      fill: "fill-red-500",
    },
    rose: {
      bg: "bg-rose-500",
      text: "text-rose-500",
      border: "border-rose-500",
      ring: "ring-rose-500",
      stroke: "stroke-rose-500",
      fill: "fill-rose-500",
    },
    pink: {
      bg: "bg-pink-500",
      text: "text-pink-500",
      border: "border-pink-500",
      ring: "ring-pink-500",
      stroke: "stroke-pink-500",
      fill: "fill-pink-500",
    },
    fuchsia: {
      bg: "bg-fuchsia-500",
      text: "text-fuchsia-500",
      border: "border-fuchsia-500",
      ring: "ring-fuchsia-500",
      stroke: "stroke-fuchsia-500",
      fill: "fill-fuchsia-500",
    },
    purple: {
      bg: "bg-purple-500",
      text: "text-purple-500",
      border: "border-purple-500",
      ring: "ring-purple-500",
      stroke: "stroke-purple-500",
      fill: "fill-purple-500",
    },
    violet: {
      bg: "bg-violet-500",
      text: "text-violet-500",
      border: "border-violet-500",
      ring: "ring-violet-500",
      stroke: "stroke-violet-500",
      fill: "fill-violet-500",
    },
    indigo: {
      bg: "bg-indigo-500",
      text: "text-indigo-500",
      border: "border-indigo-500",
      ring: "ring-indigo-500",
      stroke: "stroke-indigo-500",
      fill: "fill-indigo-500",
    },
    teal: {
      bg: "bg-teal-500",
      text: "text-teal-500",
      border: "border-teal-500",
      ring: "ring-teal-500",
      stroke: "stroke-teal-500",
      fill: "fill-teal-500",
    },
    sky: {
      bg: "bg-sky-500",
      text: "text-sky-500",
      border: "border-sky-500",
      ring: "ring-sky-500",
      stroke: "stroke-sky-500",
      fill: "fill-sky-500",
    },
    gray: {
      bg: "bg-gray-500",
      text: "text-gray-500",
      border: "border-gray-500",
      ring: "ring-gray-500",
      stroke: "stroke-gray-500",
      fill: "fill-gray-500",
    },
    neutral: {
      bg: "bg-neutral-500",
      text: "text-neutral-500",
      border: "border-neutral-500",
      ring: "ring-neutral-500",
      stroke: "stroke-neutral-500",
      fill: "fill-neutral-500",
    },
    stone: {
      bg: "bg-stone-500",
      text: "text-stone-500",
      border: "border-stone-500",
      ring: "ring-stone-500",
      stroke: "stroke-stone-500",
      fill: "fill-stone-500",
    },
    zinc: {
      bg: "bg-zinc-500",
      text: "text-zinc-500",
      border: "border-zinc-500",
      ring: "ring-zinc-500",
      stroke: "stroke-zinc-500",
      fill: "fill-zinc-500",
    },
    slate: {
      bg: "bg-slate-500",
      text: "text-slate-500",
      border: "border-slate-500",
      ring: "ring-slate-500",
      stroke: "stroke-slate-500",
      fill: "fill-slate-500",
    },
  };

  return colorClassMap[color][type];
};