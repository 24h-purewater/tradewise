export const defaultLoadingPrice = 999999999;
export const defaultNaNPrice = 999999988;


export const supportMarkets = [
  {
    market: "bigone",
    name: "BigONE",
  },
  { market: "exinone", name: "ExinOne" },
  { market: "mixpay", name: "MixPay" },
];

export const unstablePriceMarket = [
  { market: "fswap", name: "4swap" },
  { market: "uniswap", name: "Uniswap" },
];

export interface PriceItem {
  market: string;
  name: string;
  price: number;
}

export interface Prices {
  base: string;
  quote: string;
  priceList: PriceItem[];
}

export interface PriceResp {
  data: Prices;
}

export const nullPrices: PriceItem[] = supportMarkets.map((e) => ({
  market: e.market,
  name: e.name,
  price: defaultLoadingPrice,
}));

export const nullUnstablePrices: PriceItem[] = unstablePriceMarket.map((e) => ({
  market: e.market,
  name: e.name,
  price: defaultLoadingPrice,
}));


export function setPriceInItemList(list: PriceItem[], market: string, price: number) {
  for (let i = 0; i < list.length; i++) {
    if (list[i].market === market) {
      list[i].price = price
    }
  }
}