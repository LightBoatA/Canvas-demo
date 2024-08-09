import React, { useMemo } from 'react';
import { green, red, blue, grey } from '@ant-design/colors';
import { ColorPicker, Select, Space } from 'antd';
import './index.less';
import { CANVAS_SCALE_OPTIONS, FONT_SIZE_OPTIONS, colorBtns } from './common';
import { useElement } from '../../hooks/useElement';
import { useCommon } from '../../hooks/useCommon';
import { EElement, IConnection, IShape } from '../Canvas/common';
import { findValueObj } from '../../utils/util';

interface IProps {
  className?: string;
}
export const PropertyEditor: React.FC<IProps> = props => {
  const { className } = props;
  const { shapes, updateShapeByIds, updateConnectionByIds } = useElement();
  const { selectedMap, canvasScale, updateCanvasScale } = useCommon();
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
          <Select
            value={canvasScale}
            onChange={value => {
              updateCanvasScale(value);
            }}
            options={CANVAS_SCALE_OPTIONS}
          />
        </Space>
      </div>
    );
  }, [
    canvasScale,
    className,
    firstShape?.fontSize,
    presets,
    selectedMap,
    updateCanvasScale,
    updateConnectionByIds,
    updateShapeByIds
  ]);
};

export default PropertyEditor;
