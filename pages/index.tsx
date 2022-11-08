import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import Container from "@mui/material/Container";
import * as React from "react";
import { useEffect, useMemo } from "react";
import useSwr from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const supportMarkets = ["bigone", "fswap", "exinone"];

export interface PriceItem {
  market: string;
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
  market: e,
  price: 0,
}));

export default function Home() {
  const [quoteCurrency, setQuoteCurrency] = React.useState<string>("USDT");
  const [baseCurrency, setBaseCurrency] = React.useState<string>("BTC");

  const queryParams = useMemo(() => {
    return `?quote=${quoteCurrency}&base=${baseCurrency}`;
  }, [quoteCurrency, baseCurrency]);

  const [priceList, setPriceList] = React.useState<PriceItem[]>(nullPrices);

  const { data, error } = useSwr<PriceResp>(
    ["/api/price", queryParams],
    fetcher
  );

  useEffect(() => {
    if (data) {
      setPriceList(data.data.priceList);
      console.log(data.data.priceList, data);
    }
  }, [data]);

  // if (!data) return <div>Loading...</div>;

  return (
    <Container maxWidth="lg" className="mt-24">
      <FormControl fullWidth className="mb-8">
        {/* quote currency */}
        <InputLabel id="demo-simple-select-label">Quote</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={quoteCurrency}
          label="Age"
          onChange={(e) => setQuoteCurrency(e.target.value)}
        >
          <MenuItem value={10}>USDT</MenuItem>
          <MenuItem value={20}>USDC</MenuItem>
        </Select>
      </FormControl>
      <FormControl fullWidth>
        {/* base currency */}
        <InputLabel id="demo-simple-select-label">Base</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={baseCurrency}
          label="Age"
          onChange={(e) => setBaseCurrency(e.target.value)}
        >
          <MenuItem value={10}>BTC</MenuItem>
          <MenuItem value={20}>ETH</MenuItem>
        </Select>
      </FormControl>

      <h1 className="mb-[20px] mt-[24px] text-3xl font-bold">市场</h1>

      {priceList &&
        priceList.map((e) => (
          <MarketPriceInfo
          key={e.market}
            name={e.market}
            price={e.price}
            icon="bigone"
          ></MarketPriceInfo>
        ))}
    </Container>
  );
}

function MarketPriceInfo({
  name,
  icon,
  price,
}: {
  name: string;
  icon: string;
  price: number;
}) {
  return (
    <Container
      maxWidth="lg"
      className="h-16 border-2 mb-[14px] border-grey-600"
    >
      {name}
      {price}
      {icon}
    </Container>
  );
}
