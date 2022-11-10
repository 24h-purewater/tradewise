import type { NextApiRequest, NextApiResponse } from "next";
import HttpsProxyAgent from "https-proxy-agent";
import got, { Got } from "got";
import { defaultNaNPrice } from "../../src/types";

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
      https: agent,
    },
  });
}

const gotClient = createGotClient();

function getQueryString(q: string | string[] | undefined): string {
  if (!q) return "";
  return Array.isArray(q) ? q[0] : String(q);
}

export default async function priceHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    query: { market, base, quote, quoteAmount },
    method,
  } = req;
  let baseCurrency = getQueryString(base);
  let quoteCurrency = getQueryString(quote);
  if (!baseCurrency) baseCurrency = "BTC";
  if (!quoteCurrency) quoteCurrency = "USDT";

  switch (method) {
    case "GET":
      if (market === "fswap") {
        let quoteAmountString = getQueryString(quoteAmount);
        let price_fswap = await getfswapPrice(
          baseCurrency,
          quoteCurrency,
          quoteAmountString
        );
        let priceList = [
          {
            market: "fswap",
            name: "4swap",
            price: price_fswap,
          },
        ];
        res.status(200).json({
          data: {
            base: baseCurrency,
            quote: quoteCurrency,
            priceList: priceList,
          },
        });
        return;
      }

      let price_bigone = await getBigonePrice(baseCurrency, quoteCurrency);
      let price_exinone = await getExinonePrice(baseCurrency, quoteCurrency);
      let price_mixpay = await getMixPayPrice(baseCurrency, quoteCurrency);

      let priceList = [
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
        {
          market: "tradewise",
          name: "TradeWise",
          price: price_mixpay,
        },
      ];

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
  quote: string,
  quoteAmount: string
): Promise<number> {
  let baseAssetId = currencyToAssetId(base);
  let quoteAssetId = currencyToAssetId(quote);
  let fswapURL = "https://mtgswap-api.fox.one";
  let fswapURL1 = "https://api.4swap.org";
  const { data } = await gotClient
    .post(`${fswapURL}/api/orders/pre`, {
      json: {
        pay_asset_id: quoteAssetId,
        fill_asset_id: baseAssetId,
        pay_amount: quoteAmount,
        // fill_amount: "1"
      },
    })
    .json<any>();
  let price = Number(data.pay_amount / data.fill_amount).toFixed(8);
  return Number(price);
}

/**
 *  settle 0.00001BTC， USDT -> BTC
 *  https://api.mixpay.me/v1/payments_estimated?paymentAssetId=4d8c508b-91c5-375b-92b0-ee702ed2dac5&settlementAssetId=c6d0c728-2624-429b-8e0d-d9d19b6592fa&quoteAmount=0.00001000&quoteAssetId=c6d0c728-2624-429b-8e0d-d9d19b6592fa
 *  settle 1USDT , BTC -> USDT
 *  https://api.mixpay.me/v1/payments_estimated?paymentAssetId=c6d0c728-2624-429b-8e0d-d9d19b6592fa&settlementAssetId=4d8c508b-91c5-375b-92b0-ee702ed2dac5&quoteAmount=1.00000000&quoteAssetId=4d8c508b-91c5-375b-92b0-ee702ed2dac5
 *
 */
export async function getMixPayPrice(
  base: string,
  quote: string
): Promise<number> {
  let baseAssetId = currencyToAssetId(base);
  let quoteAssetId = currencyToAssetId(quote);
  let quoteAmount = "0.001";
  let paymentAmount = "0.001"
  if (
    ["USDT", "USDC"].indexOf(base) > -1 &&
    ["USDT", "USDC"].indexOf(quote) > -1
  ) {
    quoteAmount = "1";
  }
  if (
    ["BTC", "ETH"].indexOf(quote) > -1 &&
    ["BTC", "ETH"].indexOf(base) === -1
  ) {
    quoteAmount = "100";
  }
  if (["USDT", "USDC"].indexOf(quote) > -1) {
    paymentAmount = "100"
  }

  try {
    const { data } = await gotClient
      .get(`https://api.mixpay.me/v1/payments_estimated`, {
        searchParams: {
          paymentAssetId: quoteAssetId,
          settlementAssetId: baseAssetId,
          // quoteAmount: quoteAmount,
          paymentAmount: paymentAmount,
          quoteAssetId: baseAssetId,
        },
      })
      .json<any>();
    let price = data.price;
    return price;
  } catch (e) {
    console.log("get mixpay price error", e);
    return defaultNaNPrice;
  }
}

export async function getBigonePrice(
  base: string,
  quote: string
): Promise<number> {
  let isSwap;
  [base, quote, isSwap] = swapBaseQuote(base, quote);
  try {
    const { data } = await gotClient
      .get(`https://big.one/api/v3/asset_pairs/${base}-${quote}/trades`)
      .json<any>();
    if (data.length > 0) {
      let price = data[0].price;
      return isSwap ? Number((1 / price).toFixed(8)) : price;
    }
    return defaultNaNPrice;
  } catch (e) {
    console.log("get bigone price error", e);
    return defaultNaNPrice;
  }
}

export async function getExinonePrice(
  base: string,
  quote: string
): Promise<number> {
  let isSwap;
  [base, quote, isSwap] = swapBaseQuote(base, quote);
  try {
    const { data } = await gotClient(
      "https://app.eiduwejdk.com/mixin-social/pair"
    ).json<any>();
    let pairName = `${base}/${quote}`;
    let pairItem = data.filter((e: any) => e.pair === pairName);
    if (pairItem && pairItem.length > 0) {
      let price = pairItem[0].buyPrice;
      return isSwap ? Number((1 / price).toFixed(8)) : price;
    }
    return defaultNaNPrice;
  } catch (e) {
    console.log("get exinone price error", e);
    return defaultNaNPrice;
  }
}

export function swapBaseQuote(
  baseCurrency: string,
  quoteCurrency: string
): [string, string, boolean] {
  let isSwap = false;

  let swapCondition1 =
    (baseCurrency === "USDT" || baseCurrency === "USDC") &&
    (quoteCurrency === "BTC" || quoteCurrency === "ETH");
  let swapCondition2 = baseCurrency === "BTC" && quoteCurrency === "ETH";

  if (swapCondition1 || swapCondition2) {
    isSwap = true;
    [baseCurrency, quoteCurrency] = [quoteCurrency, baseCurrency];
  }
  return [baseCurrency, quoteCurrency, isSwap];
}
