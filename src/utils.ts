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


// big number
export const ten = new BigNumber(10);

export function newBnWithDecimals(base: number | string | BigNumber, decimals: number): BigNumber {
  let _decimals = new BigNumber(decimals);
  let _base = new BigNumber(base);
  return _base.multipliedBy(ten.pow(_decimals));
}