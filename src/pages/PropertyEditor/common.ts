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

export const CANVAS_SCALE_OPTIONS = [
  { value: 2, label: '200%' },
  { value: 1.5, label: '150%' },
  { value: 1, label: '100%' },
  { value: 0.75, label: '75%' },
  { value: 0.5, label: '50%' },
]