import { EElement, IConnection, IShape } from '../Canvas/common';

export const colorBtns: {
  iconClass: string;
  changeKey: keyof IShape | keyof IConnection;
}[] = [
  { iconClass: 'fill-color', changeKey: 'fillColor' },
  { iconClass: 'storke-color', changeKey: 'strokeColor' },
  { iconClass: 'font-color', changeKey: 'fontColor' }
];

export const FONT_SIZE_OPTIONS = [
  { value: 12, label: '12px' },
  { value: 14, label: '14px' },
  { value: 16, label: '16px' },
  { value: 18, label: '18px' },
  { value: 20, label: '20px' }
];
