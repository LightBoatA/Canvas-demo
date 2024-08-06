import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCommon } from '../../hooks/useCommon';
import { useShapes } from '../../hooks/useShapes';
import { INPUT_OFFSET, isPointInShape, EElement } from '../../pages/Canvas/common';
import { getCanvasEle } from '../../utils/util';
interface IProps {
}
export const EditInput: React.FC<IProps> = props => {
  const { shapes, updateShapeByIds } = useShapes();
  const { canvasPosition, setSelectedMap, canvasScale } = useCommon();
  const [editingText, setEditingText] = useState<string>('');
  const [editingId, setEditingId] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

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
      startEditing(offsetX, offsetY);
    };

    canvas?.addEventListener('dblclick', handleDoubleClick);
    return () => {
      canvas?.removeEventListener('dblclick', handleDoubleClick);
    };
  }, [startEditing]);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingId]);

  const inputStyle = useMemo(() => {
    const editingShape = shapes.find(shape => shape.id === editingId);
    let style: { [key: string]: any } = {
      position: 'absolute'
    };
    if (editingShape) {
      const { x, y, width } = editingShape;
      style = {
        ...style,
        left: x - width / 2 - 2 + canvasPosition[0],
        top: y - INPUT_OFFSET.y + canvasPosition[1],
        width: `${editingShape.width}px`
      };
    }
    return style;
  }, [canvasPosition, editingId, shapes]);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
          <input
            style={inputStyle}
            className="input-text"
            id="editing-input-box"
            ref={inputRef}
            value={editingText}
            type="text"
            onChange={handleTextChange}
            onBlur={handleTextSubmit}
          />
        )}
      </>
    );
  }, [editingId, editingText, handleTextChange, handleTextSubmit, inputStyle]);
};

export default EditInput;
