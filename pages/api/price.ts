import type { NextApiRequest, NextApiResponse } from "next";
import HttpsProxyAgent from "https-proxy-agent";
import got, { Got } from "got";

var agent = HttpsProxyAgent(process.env.LOCAL_HTTP_PROXY ?? "");

const USDT = "USDT";
const PUSD = "pUSD";
const ETH = "ETH";
const BTC = "BTC";
const USDC = "USDC";

export enum Markets {
  Bigone = "bigone",
  Fswap = "4swap",
  Exinone = "exinone",
}

export function currencyToAssetId(currency: string): string {
  let ret = "";
  switch (currency) {
    case PUSD:
      ret = "31d2ea9c-95eb-3355-b65b-ba096853bc18";
      break;
    case USDT:
      ret = "4d8c508b-91c5-375b-92b0-ee702ed2dac5";
      break;
    case BTC:
      ret = "c6d0c728-2624-429b-8e0d-d9d19b6592fa";
      break;
    case ETH:
      ret = "43d61dcd-e413-450d-80b8-101d5e903357";
      break;
    case USDC:
      ret = "9b180ab6-6abe-3dc0-a13f-04169eb34bfa";
      break;
  }
  return ret;
}



function createGotClient() {
  if (!process.env.LOCAL_HTTP_PROXY) {
    return got.extend({
      responseType: "json",
      resolveBodyOnly: true,
    });
  }
  return got.extend({
    responseType: "json",
    resolveBodyOnly: true,
    agent: {
      http: agent,
      https: agent
    }
  });
}

const gotClient = createGotClient()

function getQueryString(q: string | string[] | undefined): string {
  if (!q) return "";
  return Array.isArray(q) ? q[0] : String(q);
}

export default async function priceHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    query: { market, base, quote },
    method,
  } = req;
  let baseCurrency = getQueryString(base);
  let quoteCurrency = getQueryString(quote);
  if (!baseCurrency) baseCurrency = "BTC";
  if (!quoteCurrency) quoteCurrency = "USDT";

  switch (method) {
    case "GET":
      let price_bigone = await getBigonePrice(baseCurrency, quoteCurrency);
      let price_exinone = await getExinonePrice(baseCurrency, quoteCurrency);
      let price_fswap = price_bigone - 1;

      let priceList = [
        {
          market: "fswap",
          name: "4swap",
          price: price_fswap,
        },
        {
          market: "bigone",
          name: "BigONE",
          price: price_bigone,
        },
        {
          market: "exinone",
          name: "ExinOne",
          price: price_exinone,
        },
      ];

      priceList.sort((a, b) => a.price - b.price);

      res.status(200).json({
        data: {
          base: baseCurrency,
          quote: quoteCurrency,
          priceList: priceList,
        },
      });
      break;
    default:
      res.setHeader("Allow", ["GET", "PUT"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

export async function getfswapPrice(
  base: string,
  quote: string
): Promise<number> {
  return 0;
}

export async function getBigonePrice(
  base: string,
  quote: string
): Promise<number> {
  const { data } = await gotClient(
    `https://big.one/api/v3/asset_pairs/${base}-${quote}/trades`
  ).json<any>();
  if (data.length > 0) {
    return data[0].price;
  }
  return 0;
}

export async function getExinonePrice(
  base: string,
  quote: string
): Promise<number> {
  const { data } = await gotClient(
    "https://app.eiduwejdk.com/mixin-social/pair"
  ).json<any>();
  let pairName = `${base}/${quote}`;
  let pairItem = data.filter((e: any) => e.pair === pairName);
  if (pairItem && pairItem.length > 0) {
    return pairItem[0].buyPrice;
  }
  return 0;
}
