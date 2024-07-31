import React, { useMemo } from 'react';
import {
  generate,
  green,
  presetPalettes,
  red,
  blue,
  grey
} from '@ant-design/colors';
import { ColorPicker, theme } from 'antd';
import type { ColorPickerProps } from 'antd';
import './index.less';

interface IProps {
  className?: string;
}
export const PropertyEditor: React.FC<IProps> = props => {
  const { className } = props;

  const presets = useMemo(() => {
    return [
      { label: '红色', colors: red },
      { label: '绿色', colors: green },
      { label: '蓝色', colors: blue },
      { label: '灰色', colors: grey }
    ];
  }, []);

  return useMemo(() => {
    return (
      <div className={`comp-property-editor ${className || ''}`}>
        <ColorPicker
          presets={presets}
          defaultValue="#1677ff"
          onOpenChange={open => {
            // TODO: 修改按钮类actived
          }}
        >
          <div className="edit-icon-btn storke-color"></div>
        </ColorPicker>
      </div>
    );
  }, [className, presets]);
};

export default PropertyEditor;
