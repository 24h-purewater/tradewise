
// import got from "got";
import axios from 'axios'
import { defaultNaNPrice } from '../types';

import { BnDiv, newBnWithDecimals } from "../utils";

// https://api.uniswap.org/v1/quote?protocols=v2%2Cv3%2Cmixed&tokenInAddress=0xdAC17F958D2ee523a2206206994597C13D831ec7&tokenInChainId=1&tokenOutAddress=0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599&tokenOutChainId=1&amount=10000000000&type=exactIn

interface ERC20 {
    id: string
    decimals: number
}
const tokenAddrMap = new Map<string, ERC20>([
    ['BTC', {
        id: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        decimals: 8
    }],
    ['USDT', {
        id: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        decimals: 6,
    }],
    ['USDC', {
        id: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        decimals: 6,
    }],
    ['ETH', {
        id: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        decimals: 18,
    }],
])


export async function getUniswapQuote(quote: string, base: string, inAmount: number): Promise<number> {
    inAmount = inAmount === 0 ? 1 : inAmount
    let tokenIn = tokenAddrMap.get(quote)
    let tokenOut = tokenAddrMap.get(base)
    if (!tokenIn || !tokenOut) {
        throw new Error(`not supported uniswap currency, ${quote} ${base}`)
    }

    let tokenInAmount = newBnWithDecimals(inAmount, tokenIn.decimals)
    try {
        let res = await axios.get('https://api.uniswap.org/v1/quote', {
            params: {
                protocols: 'v2,v3,mixed',
                tokenInAddress: tokenIn.id,
                tokenInChainId: 1,
                tokenOutAddress: tokenOut.id,
                tokenOutChainId: 1,
                amount: tokenInAmount.toString(),
                type: 'exactIn'
            }
        })
        return Number((inAmount / res.data.quoteDecimals).toFixed(8))
    } catch (e) {
        console.log('get uniswap price error', e);
        return defaultNaNPrice
    }
}