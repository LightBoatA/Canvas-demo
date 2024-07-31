import { EElement, IShape } from "../Canvas/common"

export const colorBtns: {
  iconClass: string,
  changeKey: keyof IShape,
}[] = [
  { iconClass: 'fill-color', changeKey: 'fillColor' },
  { iconClass: 'storke-color', changeKey: 'strokeColor' },
  { iconClass: 'font-color', changeKey: 'fontColor' },
]
