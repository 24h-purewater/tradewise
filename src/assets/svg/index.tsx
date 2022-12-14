import Bigone from "./bigone.svg";
import BTC from "./BTC.svg";
import ETH from "./ETH.svg";
import Exinone from "./exinone.svg";
import Fswap from "./fswap.svg";
import Mixpay from "./mixpay.svg";
import Tradewise from "./tradewise.svg";
import Logo from "./logo.svg";
import USDC from "./USDC.svg";
import USDT from "./USDT.svg";
import Arrow from "./arrow.svg";
import Uniswap from "./uniswap.svg";

export function Svg({
  name,
  height = 40,
  width = 40,
}: {
  name: string;
  height: number;
  width: number;
}) {
  function loadSVG() {
    switch (name) {
      case "bigone":
        return <Bigone />;
      case "ETH":
        return <ETH />;
      case "exinone":
        return <Exinone />;
      case "fswap":
        return <Fswap />;
      case "logo":
        return <Logo />;
      case "USDC":
        return <USDC />;
      case "USDT":
        return <USDT />;
      case "BTC":
        return <BTC />;
      case "mixpay":
        return <Mixpay />;
      case "tradewise":
        return <Tradewise />;
      case "arrow":
        return <Arrow />;
      case "uniswap":
        return <Uniswap />;
      default:
        return <Logo />;
    }
  }
  return <div style={{width: width, height: height} }>{loadSVG()}</div>;
}
