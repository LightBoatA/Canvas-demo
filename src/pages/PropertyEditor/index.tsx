import React, { useMemo } from 'react';
import {
  generate,
  green,
  presetPalettes,
  red,
  blue,
  grey
} from '@ant-design/colors';
import { ColorPicker, Space, theme } from 'antd';
import type { ColorPickerProps } from 'antd';
import './index.less';
import { colorBtns } from './common';
import { useShapes } from '../../hooks/useShapes';

interface IProps {
  className?: string;
}
export const PropertyEditor: React.FC<IProps> = props => {
  const { className } = props;
  const { shapes, updateShapeById } = useShapes();
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
        <Space>
          {colorBtns.map(item => {
            return (
              <ColorPicker
                key={item.changeKey}
                presets={presets}
                defaultValue="#1677ff"
                onOpenChange={open => {
                  // TODO: 修改按钮类actived
                }}
                onChange={value => {
                  console.log(value.toHexString());
                }}
              >
                <div className={`edit-icon-btn ${item.iconClass}`}></div>
              </ColorPicker>
            );
          })}
        </Space>
      </div>
    );
  }, [className, presets]);
};

export default PropertyEditor;
