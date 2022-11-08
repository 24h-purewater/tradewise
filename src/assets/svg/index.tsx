import Image from "next/image";

export function Svg({ name }: { name: string }) {
  return <Image alt={name} src={`/svg/${name}.svg`} height={40} width={40} />;
}
