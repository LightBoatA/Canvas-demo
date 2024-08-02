import React, { useMemo } from 'react';
import { green, red, blue, grey } from '@ant-design/colors';
import { ColorPicker, Select, Space } from 'antd';
import './index.less';
import { FONT_SIZE_OPTIONS, colorBtns } from './common';
import { useShapes } from '../../hooks/useShapes';
import { useCommon } from '../../hooks/useCommon';
import { EElement, IConnection, IShape } from '../Canvas/common';
import { findValueObj } from '../../utils/util';
import { useConnections } from '../../hooks/useConnections';

interface IProps {
  className?: string;
}
export const PropertyEditor: React.FC<IProps> = props => {
  const { className } = props;
  const { shapes, updateShapeByIds } = useShapes();
  const { updateConnectionByIds } = useConnections();
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
    const keys = Object.keys(selectedMap);
    if (keys.length <= 0) return null;
    for (let i = 0; i < keys.length; i++) {
      if (selectedMap[keys[i]] === EElement.SHAPE) {
        const shape = findValueObj(shapes, 'id', keys[i]);
        return shape;
      }
    }
    return null;
  }, [selectedMap, shapes]);

  return useMemo(() => {
    return (
      <div className={`comp-property-editor ${className || ''}`}>
        {!Object.keys(selectedMap).length && (
          <div className="editor-mask"></div>
        )}
        <Space>
          <Select
            value={firstShape?.fontSize || 14}
            onChange={value => {
              updateShapeByIds({
                ids: Object.keys(selectedMap),
                key: 'fontSize',
                data: value
              });
            }}
            options={FONT_SIZE_OPTIONS}
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
                    key: item.changeKey as keyof IShape,
                    data: value.toHexString()
                  });
                  updateConnectionByIds({
                    ids: Object.keys(selectedMap),
                    key: item.changeKey as keyof IConnection,
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
  }, [className, firstShape?.fontSize, presets, selectedMap, updateConnectionByIds, updateShapeByIds]);
};

export default PropertyEditor;
