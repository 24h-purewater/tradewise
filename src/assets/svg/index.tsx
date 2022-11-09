import Image from "next/image";

export function Svg({
  name,
  height = 40,
  width = 40,
}: {
  name: string;
  height: number;
  width: number;
}) {
  return (
    <Image alt={name} src={`/svg/${name}.svg`} height={height} width={width} />
  );
}
