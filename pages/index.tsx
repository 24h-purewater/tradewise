import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import Container from "@mui/material/Container";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import useSwr from "swr";
import { Svg } from "../src/assets/svg";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const supportMarkets = [
  {
    market: "bigone",
    name: "BigONE",
  },
  { market: "fswap", name: "4swap" },
  { market: "exinone", name: "ExinOne" },
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

const nullPrices: PriceItem[] = supportMarkets.map((e) => ({
  market: e.market,
  name: e.name,
  price: 0,
}));

export default function Home() {
  const [quoteCurrency, setQuoteCurrency] = useState<string>("USDT");
  const [baseCurrency, setBaseCurrency] = useState<string>("BTC");
  const [quoteAmount, setQuoteAmount] = useState<number>(0);
  const [baseAmount, setBaseAmount] = useState<number>(0);
  const [bestPrice, setBestPrice] = useState<number>(0)

  const queryParams = useMemo(() => {
    return `?quote=${quoteCurrency}&base=${baseCurrency}`;
  }, [quoteCurrency, baseCurrency]);

  const [priceList, setPriceList] = useState<PriceItem[]>(nullPrices);

  const { data, error } = useSwr<PriceResp>(
    `/api/price${queryParams}`,
    fetcher
  );

  useEffect(() => {
    if (data) {
      setPriceList(data.data.priceList);
      setBestPrice(data.data.priceList[0].price)
    }
  }, [data]);

  useEffect(()=> {
    let baseAmount = Number((quoteAmount / bestPrice).toFixed(8));
    setBaseAmount(baseAmount)
  }, [bestPrice, quoteAmount])

  function handleQuoteAmountChange(value: any) {
    setQuoteAmount(Number(value))
    setBaseAmount(baseAmount);
  }

  // if (!data) return <div>Loading...</div>;

  return (
    <Container maxWidth="lg" className="mt-24">
      <div className="mb-[20px] flex">
        {/* quote currency */}
        <TextField
          className="w-7/12 inline-block "
          id="filled-number"
          type="number"
          InputLabelProps={{
            shrink: true,
          }}
          onChange={(e) => handleQuoteAmountChange(e.target.value)}
        />
        <Select
          className="w-4/12 ml-auto"
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={quoteCurrency}
          label="Age"
          onChange={(e) => setQuoteCurrency(e.target.value)}
        >
          <MenuItem value={"USDT"}>USDT</MenuItem>
          <MenuItem value={"USDC"}>USDC</MenuItem>
        </Select>
      </div>

      <div className="flex">
        {/* base currency */}
        <TextField
          className="w-7/12 inline-block "
          id="filled-number"
          type="number"
          value={baseAmount}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <Select
          className="w-4/12 ml-auto"
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={baseCurrency}
          label="Age"
          onChange={(e) => setBaseCurrency(e.target.value)}
        >
          <MenuItem value={"BTC"}>BTC</MenuItem>
          <MenuItem value={"ETH"}>ETH</MenuItem>
        </Select>
      </div>

      <h1 className="mb-[20px] mt-[24px] text-3xl font-bold">市场</h1>

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
  );
}

function MarketPriceInfo({
  index,
  market,
  name,
  price,
  base,
  quote,
  quoteAmount
}: {
  index: number;
  name: string;
  market: string;
  price: number;
  base: string;
  quote: string;
  quoteAmount: number
}) {
  
  const baseAmount = useMemo(()=> {
    return Number((Number(quoteAmount) / price).toFixed(8));
  },[quoteAmount, price])

  return (
    <Container
      maxWidth="lg"
      className="h-[72px] p-[16px] border-2 mb-[14px] border-grey-600 flex w-full items-center"
    >
      <Svg name={market}></Svg>

      <div className="ml-4">
        <h2 className="text-base">{name}</h2>
        {index === 0 && (
          <span className="bg-green-500 text-[10px] py-[1px] px-[8px]">
            最好价格
          </span>
        )}
      </div>
      <div className="ml-auto text-right	">
        <h3>
          {baseAmount} {base}
        </h3>
        <span>
          {" "}
          {price} {base}/{quote}
        </span>
      </div>
    </Container>
  );
}
