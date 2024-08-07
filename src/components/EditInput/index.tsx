import React, { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCommon } from '../../hooks/useCommon';
import { useShapes } from '../../hooks/useShapes';
import { INPUT_OFFSET, isPointInShape, EElement } from '../../pages/Canvas/common';
import { getCanvasEle } from '../../utils/util';
import './index.less';
interface IProps {}
export const EditInput: React.FC<IProps> = props => {
  const { shapes, updateShapeByIds } = useShapes();
  const { canvasPosition, setSelectedMap, canvasScale } = useCommon();
  const [editingText, setEditingText] = useState<string>('');
  const [editingId, setEditingId] = useState<string>('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const updateShapeText = useCallback(
    (id: string, newText: string) => {
      updateShapeByIds({
        ids: [id],
        key: 'text',
        data: newText
      });
    },
    [updateShapeByIds]
  );

  const startEditing = useCallback(
    (x: number, y: number) => {
      const clickedShape = shapes.find(shape => isPointInShape(x, y, shape));
      if (clickedShape) {
        setSelectedMap({ [clickedShape.id]: EElement.SHAPE });
        setEditingId(clickedShape.id);
        setEditingText(clickedShape.text);
        updateShapeText(clickedShape.id, '');
      }
    },
    [setSelectedMap, shapes, updateShapeText]
  );

  useEffect(() => {
    const canvas = getCanvasEle();
    const handleDoubleClick = (e: MouseEvent) => {
      const { offsetX, offsetY } = e;
      startEditing(offsetX / canvasScale, offsetY / canvasScale);
    };

    canvas?.addEventListener('dblclick', handleDoubleClick);
    return () => {
      canvas?.removeEventListener('dblclick', handleDoubleClick);
    };
  }, [canvasScale, startEditing]);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingId]);

  const inputStyle = useMemo(() => {
    const editingShape = shapes.find(shape => shape.id === editingId);
    let style: CSSProperties = {};
    if (editingShape) {
      const { x, y, width, height, fontSize, text } = editingShape;
      console.log(editingShape);

      style = {
        left: (x  - width / 2) * canvasScale  + canvasPosition[0],
        top: (y - height / 2) * canvasScale + canvasPosition[1],
        width: `${width * canvasScale}px`,
        height: `${height * canvasScale}px`,
        fontSize: fontSize * canvasScale,
      };
    }
    return style;
  }, [canvasPosition, canvasScale, editingId, shapes]);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditingText(e.target.value);
  }, []);

  const handleTextSubmit = useCallback(() => {
    updateShapeText(editingId, editingText);
    setEditingText('');
    setEditingId('');
  }, [editingId, editingText, updateShapeText]);

  return useMemo(() => {
    return (
      <>
        {editingId && (
          <div 
          className="input-text-wrap"
            style={inputStyle}
          >
            <textarea
              className="input-text"
              id="editing-input-box"
              ref={inputRef}
              value={editingText}
              onChange={handleTextChange}
              onBlur={handleTextSubmit}
            />
          </div>
        )}
      </>
    );
  }, [editingId, editingText, handleTextChange, handleTextSubmit, inputStyle]);
};

export default EditInput;
