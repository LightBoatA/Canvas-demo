import React, { DragEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './index.less';
import {
  CANVAS_HEITHT,
  CANVAS_WIDTH,
  DEFAULT_HELP_LINE_VAL,
  DEFAULT_MOUSE_INFO,
  EElement,
  EMouseMoveMode,
  IConnection,
  IConnectionPoint,
  ICtrlPoint,
  IHelpLineData,
  IMoveStartInfo,
  INPUT_OFFSET,
  IShape,
  IShapeConnectionPoint,
  calcMultipleSelectRect,
  calcResizedShape,
  cursorDirectionMap,
  drawShape,
  getConnectionPointVal,
  getInitShapeData,
  getIntersectedConnectionId,
  getIntersectedConnectionPoint,
  getIntersectedControlPoint,
  getIntersectedShape,
  getSnapData,
  getVirtualEndPoint,
  isPointInLine,
  isPointInShape,
  getMouseMoveInfo,
  IPoint,
  DEFAULT_POINT,
  EDirection,
  IResizeStartInfo,
  COLOR_BORDER,
  getIntersectedInfo
} from './common/index';
import { getCryptoUuid, mapToObject, objectToMap } from '../../utils/util';
import { Typography } from 'antd';
import ContextMenuModal from '../../components/ContextMenuModal';
import { useShapes } from '../../hooks/useShapes';
import { useCommon } from '../../hooks/useCommon';
import { useConnections } from '../../hooks/useConnections';
import { useScale } from '../../hooks/useScale';
import { useBoxSelection } from '../../hooks/useBoxSelection';
import EditInput from '../../components/EditInput';
import { useDrop } from '../../hooks/useDrop';
import { useCursorStyle } from '../../hooks/useCursorStyle';
import ContextMenu from '../../components/ContextMenu';
import SelectionBox from '../../components/SelectionBox';
import { useResizeShape } from '../../hooks/useResizeShape';
import { useMoveShape } from '../../hooks/useMoveShape';
import { useVirtualConnections } from '../../hooks/useVirtualConnection';
import { useHovering } from '../../hooks/useHovering';

interface IProps {
  className?: string;
}

export const Canvas: React.FC<IProps> = props => {
  const { className } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [helpLineVals, setHelpLineVals] = useState<IHelpLineData>(DEFAULT_HELP_LINE_VAL);
  const [mode, setMode] = useState<EMouseMoveMode>(EMouseMoveMode.DEFAULT);
  const [canvasStartOffset, setCanvasStartOffset] = useState<IPoint>(DEFAULT_POINT); // 移动画布起始点
  const { shapes, setShapes } = useShapes();
  const { connections, setConnections } = useConnections();
  const { selectedMap, setSelectedMap, canvasPosition, updateCanvasPosition, canvasScale } = useCommon();
  const { setStartPosition, setCurPosition, updateSelectionBox, handleBoxSelection, boxStyles, selectedShapes, multipleSelectRect } =
    useBoxSelection();
  const { setResizeStartInfo, resizeShapes } = useResizeShape();
  const { setMoveStartInfo, moveShapes } = useMoveShape(multipleSelectRect, setHelpLineVals);
  const { setHoveringElement, setHoveringConnectionPoint, hoveringCtrlPoint, hoveringId, hoveringConnectionId, hoveringConnectionPoint } =
    useHovering();
  const { setStartConnectionPoint, preparedConnection, setPreparedConnection, startConnectionPoint, drawVirtualConnection } =
    useVirtualConnections(hoveringConnectionPoint);
  useScale();
  useDrop();
  useCursorStyle(mode, hoveringCtrlPoint);

  useEffect(() => {
    if (canvasRef.current && !ctxRef.current) {
      ctxRef.current = canvasRef.current.getContext('2d');
    }
  }, []);

  const clearCanvas = useCallback(() => {
    if (ctxRef.current) {
      ctxRef.current.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEITHT);
    }
  }, []);

  useEffect(() => {
    if (ctxRef.current) {
      clearCanvas();
      drawShape(
        ctxRef.current,
        shapes,
        hoveringId,
        hoveringConnectionId,
        preparedConnection,
        connections,
        hoveringConnectionPoint,
        helpLineVals,
        multipleSelectRect,
        canvasScale
      );
    }
  }, [
    canvasScale,
    clearCanvas,
    connections,
    helpLineVals,
    hoveringConnectionId,
    hoveringConnectionPoint,
    hoveringId,
    multipleSelectRect,
    preparedConnection,
    selectedMap,
    shapes
  ]);

  const handleDelete = useCallback(() => {
    if (Object.keys(selectedMap).length > 0) {
      setShapes(shapes.filter(shape => !selectedMap[shape.id]));
      setConnections(connections.filter(shape => !selectedMap[shape.id]));
      setSelectedMap({});
    }
  }, [connections, selectedMap, setConnections, setSelectedMap, setShapes, shapes]);

  const updateStagePosition = useCallback(
    (offsetX: number, offsetY: number) => {
      const { x, y } = canvasStartOffset;
      const DValueX = offsetX - x;
      const DValueY = offsetY - y;
      updateCanvasPosition([canvasPosition[0] + DValueX, canvasPosition[1] + DValueY]);
    },
    [canvasPosition, canvasStartOffset, updateCanvasPosition]
  );

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      const { ctrlKey } = e;
      const offsetX = e.offsetX / canvasScale,
        offsetY = e.offsetY / canvasScale;
      if (e.button === 1) {
        setCanvasStartOffset({ x: offsetX, y: offsetY });
        setMode(EMouseMoveMode.MOVE_CANVAS);
        return;
      }
      const editInputElement = document.getElementById('editing-input-box');
      if (e.target === editInputElement) return;
      const { intersectedConnectionPoint, intersectedShape, intersectConnectionId, intersectedResizeCtrlPoint } = getIntersectedInfo(
        shapes,
        connections,
        multipleSelectRect,
        offsetX,
        offsetY
      );
      if (intersectedConnectionPoint) {
        // 与连接点相交：画线
        setMode(EMouseMoveMode.CONNECT);
        setStartConnectionPoint(intersectedConnectionPoint);
      } else if (intersectedResizeCtrlPoint) {
        // 与缩放控制点相交：缩放
        setMode(EMouseMoveMode.RESIZE);
        setResizeStartInfo({
          oldBox: multipleSelectRect ? { ...multipleSelectRect } : null,
          oldSelectedShapes: [...selectedShapes],
          direction: hoveringCtrlPoint?.direction || EDirection.RIGHT_BOTTOM
        });
      } else if (intersectedShape || intersectConnectionId) {
        // 与图形、连线相交：选择或移动
        // let newMap = new Map(selectedMap);
        let newMap = objectToMap<string, EElement>(selectedMap);
        const id = intersectedShape?.id || intersectConnectionId; // 同时只可能选中一种元素
        if (ctrlKey) {
          // 加选、减选
          if (selectedMap[id]) {
            newMap.delete(id);
          } else {
            const type = intersectedShape?.id ? EElement.SHAPE : EElement.CONNECTION;
            newMap.set(id, type);
          }
        } else {
          if (intersectedShape) {
            // 单选形状
            const isPointInSelectedShape = selectedShapes.find(shape => shape.id === intersectedShape?.id);
            let newSelectedShapes = selectedShapes;

            // 如果点击的是选框外的图形，重新设置选框内容
            if (!isPointInSelectedShape) {
              newSelectedShapes = [intersectedShape];
              newMap = new Map([[intersectedShape.id, EElement.SHAPE]]);
            }
            const newMouseMoveInfo = getMouseMoveInfo(newMap, connections, newSelectedShapes, offsetX, offsetY);
            setMode(EMouseMoveMode.MOVE);
            setMoveStartInfo(newMouseMoveInfo);
          } else if (intersectConnectionId) {
            // 单选连线
            newMap = new Map([[intersectConnectionId, EElement.CONNECTION]]);
          }
        }
        setSelectedMap(mapToObject<string, EElement>(newMap));
      } else {
        // 不与任何元素相交
        setStartPosition({
          x: e.offsetX / canvasScale,
          y: e.offsetY / canvasScale
        });
        setCurPosition({
          x: e.offsetX / canvasScale,
          y: e.offsetY / canvasScale
        });
        setMode(EMouseMoveMode.BOX_SELECTION);
        setSelectedMap({});
      }
    },
    [
      canvasScale,
      connections,
      hoveringCtrlPoint?.direction,
      multipleSelectRect,
      selectedMap,
      selectedShapes,
      setCurPosition,
      setMoveStartInfo,
      setResizeStartInfo,
      setSelectedMap,
      setStartConnectionPoint,
      setStartPosition,
      shapes
    ]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const offsetX = e.offsetX / canvasScale,
        offsetY = e.offsetY / canvasScale;
      setHoveringElement(multipleSelectRect, offsetX, offsetY);

      switch (mode) {
        case EMouseMoveMode.MOVE:
          moveShapes(offsetX, offsetY);
          break;
        case EMouseMoveMode.RESIZE:
          resizeShapes(offsetX, offsetY);
          break;
        case EMouseMoveMode.CONNECT:
          drawVirtualConnection(offsetX, offsetY);
          break;
        case EMouseMoveMode.BOX_SELECTION:
          updateSelectionBox(offsetX, offsetY);
          break;
        case EMouseMoveMode.MOVE_CANVAS:
          updateStagePosition(offsetX, offsetY);
          break;
        default:
          break;
      }
    },
    [
      canvasScale,
      setHoveringElement,
      multipleSelectRect,
      mode,
      moveShapes,
      resizeShapes,
      drawVirtualConnection,
      updateSelectionBox,
      updateStagePosition
    ]
  );

  const resetStates = useCallback(() => {
    setStartConnectionPoint(null);
    setPreparedConnection(null);
    setHelpLineVals(DEFAULT_HELP_LINE_VAL);
    setMode(EMouseMoveMode.DEFAULT);
  }, [setPreparedConnection, setStartConnectionPoint]);

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      const offsetX = e.offsetX / canvasScale,
        offsetY = e.offsetY / canvasScale;
      if (mode === EMouseMoveMode.BOX_SELECTION) {
        handleBoxSelection();
      }
      const connectionPoint = getIntersectedConnectionPoint(shapes, offsetX, offsetY);
      if (connectionPoint && startConnectionPoint) {
        const { shape, point } = startConnectionPoint;
        setConnections([
          ...connections,
          {
            id: getCryptoUuid(),
            fromShape: shape,
            fromPoint: point,
            toShape: connectionPoint.shape,
            toPoint: connectionPoint.point,
            strokeColor: COLOR_BORDER
          }
        ]);
      }
      resetStates();
    },
    [canvasScale, connections, handleBoxSelection, mode, resetStates, setConnections, shapes, startConnectionPoint]
  );

  return useMemo(() => {
    return (
      <div className={`comp-canvas ${className || ''}`}>
        <canvas
          onMouseDown={e => handleMouseDown(e.nativeEvent)}
          onMouseMove={e => handleMouseMove(e.nativeEvent)}
          onMouseUp={e => handleMouseUp(e.nativeEvent)}
          id="drawing"
          width={CANVAS_WIDTH * canvasScale}
          height={CANVAS_HEITHT * canvasScale}
          ref={canvasRef}
          style={{
            left: canvasPosition[0],
            top: canvasPosition[1]
          }}
        >
          这是一个画布
        </canvas>
        <SelectionBox isShow={mode === EMouseMoveMode.BOX_SELECTION} boxStyles={boxStyles} />
        <EditInput />
        <ContextMenu menus={[{ label: '删除', key: 'Delete', handle: handleDelete }]} />
      </div>
    );
  }, [boxStyles, canvasPosition, canvasScale, className, handleDelete, handleMouseDown, handleMouseMove, handleMouseUp, mode]);
};

export default Canvas;
