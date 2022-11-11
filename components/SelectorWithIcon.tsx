import { MenuItem, Select } from "@mui/material";
import { Svg } from "../src/assets/svg";

export interface MenuItem {
  name: string;
  value: string;
}

export function SelectorWithIcon({
  onChange,
  value,
  menuItemList,
}: {
  value: string;
  onChange: (e: any) => void;
  menuItemList: MenuItem[];
}) {
  return (
    <Select
      className="w-full"
      labelId="demo-simple-select-label"
      id="demo-simple-select"
      value={value}
      onChange={(e) => onChange(e)}
    >
      {menuItemList &&
        menuItemList.map((e) => (
          <MenuItem value={e.value} key={e.name}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Svg name={e.name} height={24} width={24}></Svg>
              <div className="ml-2">{e.name}</div>
            </div>
          </MenuItem>
        ))}
    </Select>
  );
}
