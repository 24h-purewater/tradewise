import { TextField } from "@mui/material";
import Container from "@mui/material/Container";
import { useCallback, useEffect, useMemo, useState } from "react";
import useSwr from "swr";
import { MarketPriceInfo } from "../components/MarketPriceInfo";
import { SelectorWithIcon } from "../components/SelectorWithIcon";
import { getUniswapQuote } from "../src/api/uniswap";
import { Svg } from "../src/assets/svg";
import { usePriceFetch } from "../src/hooks/usePriceFetch";
import { nullPrices, nullUnstablePrices, PriceItem, PriceResp, setPriceInItemList } from "../src/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());


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

  const fetchUniswapPrice = useCallback(() => {
    return getUniswapQuote(quoteCurrency, baseCurrency, quoteAmount);
  }, [quoteCurrency, baseCurrency, quoteAmount]);

  const { price: uniswapPrice } = usePriceFetch(fetchUniswapPrice);

  useEffect(() => {
    let stablePriceList: PriceItem[] = nullPrices;
    let unstablePriceList: PriceItem[] = nullUnstablePrices;
    if (data) {
      stablePriceList = data.data.priceList;
    }
    if (fswapPrice) {
      setPriceInItemList(unstablePriceList, 'fswap', fswapPrice.data.priceList[0].price)
    }
    console.log('uniswap price', uniswapPrice);
    
    if (uniswapPrice) {
      setPriceInItemList(unstablePriceList, 'uniswap', uniswapPrice)
    }
    let priceList = stablePriceList.concat(unstablePriceList);
    if (!priceList || priceList.length === 0) return;
    priceList.sort((a, b) => a.price - b.price);
    setPriceList(priceList);
    setBestPrice(priceList[0].price);
  }, [data, fswapPrice, uniswapPrice]);

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
