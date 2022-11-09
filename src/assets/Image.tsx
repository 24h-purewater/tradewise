import Image from "next/image";

export function Img({
  name,
  height = 40,
  width = 40,
}: {
  name: string;
  height: number;
  width: number;
}) {
  return (
    <Image alt={name} src={`/img/${name}.png`} height={height} width={width} />
  );
}
