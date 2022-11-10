import { MenuItem, Select, TextField } from "@mui/material";
import Container from "@mui/material/Container";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import useSwr from "swr";
import { Svg } from "../src/assets/svg";
import { defaultMaxPrice, defaultNaNPrice } from "../src/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const supportMarkets = [
  {
    market: "bigone",
    name: "BigONE",
  },
  { market: "exinone", name: "ExinOne" },
  { market: "mixpay", name: "MixPay" },
];

const unstablePriceMarket = [{ market: "fswap", name: "4swap" }];

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

const nullPrices: PriceItem[] = supportMarkets.map((e) => ({
  market: e.market,
  name: e.name,
  price: defaultMaxPrice,
}));

const nullUnstablePrices: PriceItem[] = unstablePriceMarket.map((e) => ({
  market: e.market,
  name: e.name,
  price: defaultMaxPrice,
}));

export default function Home() {
  const [quoteCurrency, setQuoteCurrency] = useState<string>("USDT");
  const [baseCurrency, setBaseCurrency] = useState<string>("BTC");
  const [quoteAmount, setQuoteAmount] = useState<number>(0);
  const [baseAmount, setBaseAmount] = useState<number | undefined>();
  const [bestPrice, setBestPrice] = useState<number>(0);

  const queryParams = useMemo(() => {
    return `?quote=${quoteCurrency}&base=${baseCurrency}`;
  }, [quoteCurrency, baseCurrency]);

  const fswapQueryParams = useMemo(() => {
    let quoteAmt = quoteAmount === 0 ? 1 : quoteAmount;
    return `?quote=${quoteCurrency}&base=${baseCurrency}&quoteAmount=${quoteAmt}&market=fswap`;
  }, [quoteCurrency, baseCurrency, quoteAmount]);

  const [priceList, setPriceList] = useState<PriceItem[]>(nullPrices);

  const { data } = useSwr<PriceResp>(`/api/price${queryParams}`, fetcher, {
    refreshInterval: 2000,
  });

  const { data: fswapPrice } = useSwr<PriceResp>(
    `/api/price${fswapQueryParams}`,
    fetcher,
    { refreshInterval: 2000 }
  );

  useEffect(() => {
    let stablePriceList: PriceItem[] = nullPrices;
    let unstablePriceList: PriceItem[] = nullUnstablePrices;
    if (data) {
      stablePriceList = data.data.priceList;
    }
    if (fswapPrice) {
      unstablePriceList = fswapPrice.data.priceList;
    }
    let priceList = stablePriceList.concat(unstablePriceList);
    if (!priceList || priceList.length === 0) return;
    priceList.sort((a, b) => a.price - b.price);
    setPriceList(priceList);
    setBestPrice(priceList[0].price);
  }, [data, fswapPrice]);

  useEffect(() => {
    let baseAmount = Number((quoteAmount / bestPrice).toFixed(8));
    setBaseAmount(baseAmount > 0 ? baseAmount : 0);
  }, [bestPrice, quoteAmount]);

  function handleCurrencyChange(value: any, type: string) {
    let quote = quoteCurrency;
    let base = baseCurrency;
    if (type === "quote") {
      if (value === baseCurrency) {
        setBaseCurrency(quote);
        setQuoteCurrency(base);
      } else {
        setQuoteCurrency(value);
      }
    } else {
      if (type === "base") {
        if (value === quoteCurrency) {
          setBaseCurrency(quote);
          setQuoteCurrency(base);
        } else {
          setBaseCurrency(value);
        }
      }
    }
  }

  function handleQuoteAmountChange(value: any) {
    setQuoteAmount(Number(value));
  }

  return (
    <>
      <div className="flex h-[64px] items-center px-[24px] pt-4">
        <Svg name="logo" height={35} width={135}></Svg>
      </div>
      <Container maxWidth="lg" className="mt-6">
        <div className="mb-[16px] flex">
          {/* quote currency */}
          <TextField
            className="w-[60%] opacity-70"
            id="filled-number"
            type="number"
            inputProps={{ inputMode: "numeric" }}
            InputLabelProps={{
              shrink: true,
            }}
            placeholder={"0"}
            onChange={(e) => handleQuoteAmountChange(e.target.value)}
          />
          <div className="w-[38%] ml-auto relative flex justify-center">
            <SelectorWithIcon
              onChange={(e) => handleCurrencyChange(e.target.value, "quote")}
              value={quoteCurrency}
              menuItemList={[
                { name: "USDT", value: "USDT" },
                { name: "USDC", value: "USDC" },
                { name: "BTC", value: "BTC" },
                { name: "ETH", value: "ETH" },
              ]}
            ></SelectorWithIcon>
            <div className="absolute -bottom-5  z-10">
              <Svg name="arrow" width={24} height={24}></Svg>
            </div>
          </div>
        </div>

        <div className="flex">
          {/* base currency */}
          <TextField
            className="w-[60%] opacity-70	"
            id="filled-number"
            type="number"
            inputProps={{ inputMode: "numeric" }}
            value={baseAmount}
            InputLabelProps={{
              shrink: true,
            }}
            placeholder={"0"}
          />
          <div className="w-[38%] ml-auto">
            <SelectorWithIcon
              onChange={(e) => handleCurrencyChange(e.target.value, "base")}
              value={baseCurrency}
              menuItemList={[
                { name: "BTC", value: "BTC" },
                { name: "ETH", value: "ETH" },
                { name: "USDT", value: "USDT" },
                { name: "USDC", value: "USDC" },
              ]}
            ></SelectorWithIcon>
          </div>
        </div>

        <h1 className="mb-[20px] mt-[22px] text-[24px] font-bold">市场</h1>

        {priceList &&
          priceList.map((e, idx) => (
            <MarketPriceInfo
              key={idx}
              index={idx}
              market={e.market}
              name={e.name}
              price={e.price}
              base={baseCurrency}
              quote={quoteCurrency}
              quoteAmount={quoteAmount}
            ></MarketPriceInfo>
          ))}
      </Container>
    </>
  );
}

function MarketPriceInfo({
  index,
  market,
  name,
  price,
  base,
  quote,
  quoteAmount,
}: {
  index: number;
  name: string;
  market: string;
  price: number;
  base: string;
  quote: string;
  quoteAmount: number;
}) {
  const baseAmount = useMemo(() => {
    if (price === defaultNaNPrice) {
      return 0;
    }
    return Number((Number(quoteAmount) / price).toFixed(8));
  }, [quoteAmount, price]);

  const priceDisplay = useMemo(() => {
    return price === defaultNaNPrice ? "暂无价格" : price;
  }, [price]);

  return (
    <div className="h-[72px] p-[16px] border-2 mb-[14px] border-grey-600 flex w-full items-center market-price-item">
      {price < defaultMaxPrice ? (
        <>
          <Svg name={market} height={40} width={40}></Svg>

          {/* <Img name={market} width={40} height={40}></Img> */}
          <div className="ml-4">
            <h2 className="text-base">{name}</h2>
            {index === 0 && (
              <span className="bg-green-500 text-[10px] py-[1px] px-[8px] rounded-lg">
                最好价格
              </span>
            )}
          </div>
          <div className="ml-auto text-right	">
            <h3 className="text-[14px]">
              {baseAmount} {base}
            </h3>
            <span className="text-[12px] opacity-70	">
              {priceDisplay} {quote}/{base}
            </span>
          </div>
        </>
      ) : (
        <Stack
          direction="row"
          className="w-full"
          spacing={2}
          alignItems="center"
        >
          {/* For variant="text", adjust the height via font-size */}
          <Skeleton
            animation="wave"
            variant="circular"
            width={40}
            height={40}
          />
          <Skeleton
            animation="wave"
            variant="rounded"
            className="w-10/12"
            height={48}
          />
        </Stack>
      )}
    </div>
  );
}

interface MenuItem {
  name: string;
  value: string;
}

function SelectorWithIcon({
  onChange,
  value,
  menuItemList,
}: {
  value: string;
  onChange: (e: any) => void;
  menuItemList: MenuItem[];
}) {
  return (
    <Select
    className="w-full"
      labelId="demo-simple-select-label"
      id="demo-simple-select"
      value={value}
      onChange={(e) => onChange(e)}
    >
      {menuItemList &&
        menuItemList.map((e) => (
          <MenuItem value={e.value} key={e.name}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Svg name={e.name} height={24} width={24}></Svg>
              <div className="ml-2">{e.name}</div>
            </div>
          </MenuItem>
        ))}
    </Select>
  );
}
