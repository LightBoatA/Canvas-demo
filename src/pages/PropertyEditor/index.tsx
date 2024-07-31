import React, { useMemo } from 'react';
import {
  generate,
  green,
  presetPalettes,
  red,
  blue,
  grey
} from '@ant-design/colors';
import { ColorPicker, Select, Space, theme } from 'antd';
import type { ColorPickerProps } from 'antd';
import './index.less';
import { colorBtns } from './common';
import { useShapes } from '../../hooks/useShapes';
import { useCommon } from '../../hooks/useCommon';

interface IProps {
  className?: string;
}
export const PropertyEditor: React.FC<IProps> = props => {
  const { className } = props;
  const { shapes, updateShapeByIds } = useShapes();
  const { selectedMap } = useCommon();
  const presets = useMemo(() => {
    return [
      { label: '红色', colors: red },
      { label: '绿色', colors: green },
      { label: '蓝色', colors: blue },
      { label: '灰色', colors: grey }
    ];
  }, []);

  const firstShape = useMemo(() => {
    if (Object.keys(selectedMap).length <= 0) return null;
    const firstId = Object.keys(selectedMap)[0]
  }, [selectedMap])
  return useMemo(() => {
    return (
      <div className={`comp-property-editor ${className || ''}`}>
        {!Object.keys(selectedMap).length && (
          <div className="editor-mask"></div>
        )}
        <Space>
          <Select
            value={ 14 }
            onChange={value => {

            }}
            options={[
              { value: 12, label: '12px' },
              { value: 14, label: '14px' },
              { value: 16, label: '16px' },
              { value: 18, label: '18px' },
              { value: 20, label: '20px' },
            ]}
          />
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
                  updateShapeByIds({
                    ids: Object.keys(selectedMap),
                    key: item.changeKey,
                    data: value.toHexString()
                  });
                }}
              >
                <div className={`edit-icon-btn ${item.iconClass}`}></div>
              </ColorPicker>
            );
          })}
        </Space>
      </div>
    );
  }, [className, presets, selectedMap, updateShapeByIds]);
};

export default PropertyEditor;
