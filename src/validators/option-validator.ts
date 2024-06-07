//bg-zinc-900 border-zinc-900
//bg-blue-950 border-blue-950
//bg-rose-950 border-rose-950
//bg-emerald-900 border-emerald-900

import { PRODUCT_PRICES } from "@/config/Products";

export const COLORS = [
  {
    label: "Black",
    value: "black",
    tw: "zinc-900",
  },
  {
    label: "Blue",
    value: "blue",
    tw: "blue-950",
  },
  {
    label: "Rose",
    value: "rose",
    tw: "rose-950",
  },
  {
    label: "Emerald",
    value: "emerald",
    tw: "emerald-900",
  },
] as const;

export const MODELS = {
  name: "models",
  options: [
    {
      label: "iPhone X",
      value: "iphonex",
    },
    {
      label: "iPhone 11",
      value: "iphone11",
    },
    {
      label: "iPhone 12",
      value: "iphone12",
    },
    {
      label: "iPhone 13",
      value: "iphone13",
    },
    {
      label: "iPhone 14",
      value: "iphone14",
    },
    {
      label: "iPhone 15",
      value: "iphone15",
    },
  ],
} as const;

export const MATERIALS = {
  name: "material",
  options: [
    {
      label: "Silicone",
      value: "silicone",
      desc: undefined,
      price: PRODUCT_PRICES.material.silicone,
    },
    {
      label: "Poly Carbonate",
      value: "polycarbonate",
      desc: "Scratch resistance coating",
      price: PRODUCT_PRICES.material.polycarbonate,
    },
  ],
} as const;

export const FINISHES = {
  name: "finish",
  options: [
    {
      label: "Smooth",
      value: "smooth",
      desc: undefined,
      price: PRODUCT_PRICES.finish.smooth,
    },
    {
      label: "Textured finish",
      value: "textured",
      desc: "Soft and cool texture",
      price: PRODUCT_PRICES.finish.textured,
    },
  ],
} as const;
