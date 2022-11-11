import { Skeleton, Stack } from "@mui/material";
import { useMemo } from "react";
import { Svg } from "../src/assets/svg";
import { defaultLoadingPrice, defaultNaNPrice } from "../src/types";



export function MarketPriceInfo({
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
        {price < defaultLoadingPrice ? (
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
  