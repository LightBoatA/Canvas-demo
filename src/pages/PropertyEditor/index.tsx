import React, { useCallback, useMemo } from 'react';
import { green, red, blue, grey } from '@ant-design/colors';
import { ColorPicker, InputNumber, Select, Space } from 'antd';
import './index.less';
import { CANVAS_SCALE_OPTIONS, FONT_SIZE_OPTIONS, colorBtns } from './common';
import { useElement } from '../../hooks/useElement';
import { useCommon } from '../../hooks/useCommon';
import { EElement, IConnection, IShape, MAX_SCALE, MIN_SCALE } from '../Canvas/common';
import { findValueObj, getCanvasEle } from '../../utils/util';

interface IProps {
  rootClassName?: string;
}
export const PropertyEditor: React.FC<IProps> = props => {
  const { rootClassName } = props;
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

  const isShow = useMemo(() => {
    return Boolean(Object.keys(selectedMap).length);
  }, [selectedMap]);

  const handleExport = useCallback(() => {
    const canvas = getCanvasEle();
    // TODO: 比例问题、背景删除、选项删除
    if (canvas) {
      const imageData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imageData;
      link.download = '流程图.png';
      link.click();
    }
  }, [])

  return useMemo(() => {
    return (
      <div className={`comp-property-editor ${rootClassName || ''}`}>
        {/* {!Object.keys(selectedMap).length && <div className="editor-mask"></div>} */}
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
            disabled={!isShow}
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
                disabled={!isShow}
              >
                <div className={`edit-icon-btn ${item.iconClass}`}>{!isShow && <div className="editor-mask"></div>}</div>
              </ColorPicker>
            );
          })}
          <InputNumber
            min={MIN_SCALE}
            max={MAX_SCALE}
            step={0.1}
            value={canvasScale}
            formatter={value => `${((value || 1) * 100).toFixed(0)}%`}
            parser={value => (value?.replace('%', '') as unknown as number) / 100}
            onChange={data => {
              data && updateCanvasScale(data);
            }}
          />
          <div className={`edit-icon-btn icon-export`} onClick={handleExport}></div>
        </Space>
      </div>
    );
  }, [canvasScale, firstShape?.fontSize, handleExport, isShow, presets, rootClassName, selectedMap, updateCanvasScale, updateConnectionByIds, updateShapeByIds]);
};

export default PropertyEditor;
