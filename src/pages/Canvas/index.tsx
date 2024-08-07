import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './index.less';
import {
  CANVAS_HEITHT,
  CANVAS_WIDTH,
  DEFAULT_HELP_LINE_VAL,
  EElement,
  EMouseMoveMode,
  IHelpLineData,
  drawShape,
  getMouseMoveInfo,
  IPoint,
  DEFAULT_POINT,
  EDirection,
  getIntersectedInfo
} from './common/index';
import { mapToObject, objectToMap } from '../../utils/util';
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
import { useAddConnection } from '../../hooks/useAddConnection';

interface IProps {
  className?: string;
}

export const Canvas: React.FC<IProps> = props => {
  const { className } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  // 辅助线
  const [helpLineVals, setHelpLineVals] = useState<IHelpLineData>(DEFAULT_HELP_LINE_VAL);
  // 鼠标操作模式
  const [mode, setMode] = useState<EMouseMoveMode>(EMouseMoveMode.DEFAULT);
  // 画布起始位置
  const [canvasStartOffset, setCanvasStartOffset] = useState<IPoint>(DEFAULT_POINT);
  // 形状
  const { shapes, setShapes } = useShapes();
  // 连线
  const { connections, setConnections } = useConnections();
  // 常用参数
  const { selectedMap, setSelectedMap, canvasPosition, updateCanvasPosition, canvasScale } = useCommon();
  // 框选相关
  const { setStartPosition, setCurPosition, updateSelectionBox, handleBoxSelection, boxStyles, selectedShapes, multipleSelectRect } =
    useBoxSelection();
  // 缩放相关
  const { setResizeStartInfo, resizeShapes } = useResizeShape();
  // 鼠标悬停相关
  const { setHoveringElement, hoveringCtrlPoint, hoveringId, hoveringConnectionId, hoveringConnectionPoint } = useHovering();
  // 添加连线
  const { handleAddConnection } = useAddConnection();
  // 舞台缩放
  useScale();
  // 形状拖放
  useDrop();
  // 移动相关
  const { setMoveStartInfo, moveShapes } = useMoveShape(multipleSelectRect, setHelpLineVals);
  // 连线虚线相关
  const { setStartConnectionPoint, preparedConnection, setPreparedConnection, startConnectionPoint, drawVirtualConnection } =
    useVirtualConnections(hoveringConnectionPoint);
  // 鼠标样式
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
      const offsetX = e.offsetX / canvasScale;
      const offsetY = e.offsetY / canvasScale;
      // 编辑框
      if (e.target === document.getElementById('editing-input-box')) return;
      // 中键：拖动画布
      if (e.button === 1) {
        setCanvasStartOffset({ x: offsetX, y: offsetY });
        setMode(EMouseMoveMode.MOVE_CANVAS);
        return;
      }

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
        let newMap = objectToMap<string, EElement>(selectedMap);
        const id = intersectedShape?.id || intersectConnectionId; // 同时只可能选中一种元素
        if (e.ctrlKey) {
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
          x: e.offsetX,
          y: e.offsetY
        });
        setCurPosition({
          x: e.offsetX,
          y: e.offsetY
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
      const offsetX = e.offsetX / canvasScale;
      const offsetY = e.offsetY / canvasScale;

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
          updateSelectionBox(e.offsetX, e.offsetY);
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
      const offsetX = e.offsetX / canvasScale;
      const offsetY = e.offsetY / canvasScale;
      if (mode === EMouseMoveMode.BOX_SELECTION) {
        handleBoxSelection();
      } else if (mode === EMouseMoveMode.CONNECT) {
        handleAddConnection(startConnectionPoint, offsetX, offsetY);
      }
      resetStates();
    },
    [canvasScale, handleAddConnection, handleBoxSelection, mode, resetStates, startConnectionPoint]
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
