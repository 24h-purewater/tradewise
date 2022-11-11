import BigNumber from "bignumber.js";


export type Numberish = number | string | BigNumber

export function BnAdd(a: Numberish, b: Numberish): BigNumber {
  let _a = new BigNumber(a)
  let _b = new BigNumber(b)
  return _a.plus(_b)
}

export function BnSub(a: Numberish, b: Numberish): BigNumber {
  let _a = new BigNumber(a)
  let _b = new BigNumber(b)
  return _a.minus(_b)
}



export function BnMul(a: Numberish, b: Numberish): BigNumber {
  let _a = new BigNumber(a)
  let _b = new BigNumber(b)
  return _a.multipliedBy(_b)
}

export function BnDiv(a: Numberish, b: Numberish): BigNumber {
  let _a = new BigNumber(a)
  let _b = new BigNumber(b)
  return _a.dividedBy(_b)
}



export function hexFeltToString(hexFelt: string): string {
  let felt: bigint = BigInt(hexFelt);
  const newStrB = Buffer.from(felt.toString(16), "hex");
  return newStrB.toString();
}

export const hexToDecimalNumber = (hex) => Number(hexToDecimal(hex));

export const hexToDecimal = (hex) => BigInt(hex).toString(10);

export function stringToFelt(str: any) {
  return "0x" + Buffer.from(str).toString("hex");
}

// big number
export const ten = new BigNumber(10);

export function newBnWithDecimals(base: number | string | BigNumber, decimals: number): BigNumber {
  let _decimals = new BigNumber(decimals);
  let _base = new BigNumber(base);
  return _base.multipliedBy(ten.pow(_decimals));
}

export const toMessageTimestamp = (date: Date | number): number => {
  return Number((new Date(date).getTime() / 10).toFixed(0));
};

export function unwrapDecimals(base: number | string | BigNumber, decimals: number, places?: number): BigNumber {
  let _decimals = new BigNumber(decimals);
  let _base = new BigNumber(base);
  let ret = _base.div(ten.pow(_decimals));
  if (places > 0) {
    ret = new BigNumber(ret.toFixed(places, BigNumber.ROUND_DOWN));
  }
  return ret;
}