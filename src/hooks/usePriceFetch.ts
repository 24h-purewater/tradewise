import { useState } from "react";
import { useInterval } from 'react-use';


const intervel = 3000


export function usePriceFetch(fn: () => any) {
    const [price, setPrice] = useState<number>(0)

    useInterval(
        async () => {
            // setPrice(defaultLoadingPrice)
            let price = await fn()
            setPrice(price)
        },
        intervel
    );
    return { price };
}