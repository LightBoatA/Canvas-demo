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
  EDirection,
  getSelectedShapes,
  calcMultipleSelectRect,
  IShape,
  IShapeConnectionPoint,
  getIntersectedConnectionPoint,
  getIntersectedControlPoint,
  getIntersectedShape,
  getIntersectedConnectionId
} from './common/index';
import { mapToObject, objectToMap } from '../../utils/util';
import { useCommon } from '../../hooks/useCommon';
import { useElement } from '../../hooks/useElement';
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
import { useDeleteElement } from '../../hooks/useDeleteElement';
import { useHistory } from '../../hooks/useHistory';
import { useMoveStage } from '../../hooks/useMoveStage';
import { useKeyDown } from '../../hooks/useKeyDown';

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
  // 本地形状集合（防止频繁更新redux状态）
  const [localShapes, setLocalShapes] = useState<IShape[]>([]);
  // 是否在频繁修改形状状态
  const [isFrequentlyUpdating, setIsFrequentlyUpdating] = useState<boolean>(false);
  // 形状及连线
  const { shapes, connections } = useElement();
  // 历史记录
  useHistory();
  // 常用参数
  const { selectedMap, setSelectedMap, canvasPosition, canvasScale } = useCommon();
  // 鼠标悬停相关
  const { setHoveringElement, hoveringCtrlPoint, hoveringId, hoveringConnectionId, hoveringConnectionPoint } = useHovering();
  // 添加连线
  const { handleAddConnection } = useAddConnection();
  // 删除元素
  const { handleDelete } = useDeleteElement();
  // 舞台缩放
  useScale();
  // 舞台移动
  const { handleStageMoveStart, handleStageMoving } = useMoveStage();
  // 形状拖放
  useDrop();
  // 缩放相关
  const { handleResizeStart, handleResizing, handleResizeEnd } = useResizeShape(localShapes, setLocalShapes, setIsFrequentlyUpdating);
  // 移动相关
  const { handleMoveStart, handleMoveEnd, handleMoving } = useMoveShape(setHelpLineVals, localShapes, setLocalShapes, setIsFrequentlyUpdating);
  // 框选相关
  const { handleBoxSelectStart, handleBoxSelecting, handleBoxSelectEnd, boxStyles } = useBoxSelection();
  // 连线虚线相关
  const { handleConnectStart, preparedConnection, setPreparedConnection, startConnectionPoint, handleConnecting } =
    useVirtualConnections(hoveringConnectionPoint);
  // 键盘按下
  const { isSpaceKeyDown } = useKeyDown();
  // 鼠标样式
  useCursorStyle(mode, hoveringCtrlPoint, isSpaceKeyDown);

  // 多选框Rect
  const multipleSelectRect = useMemo(() => {
    const curShapes = isFrequentlyUpdating ? localShapes : shapes;
    const selectedShapes = getSelectedShapes(selectedMap, curShapes);
    const realMap = objectToMap<string, EElement>(selectedMap);
    return calcMultipleSelectRect(realMap, connections, selectedShapes) || null;
  }, [connections, isFrequentlyUpdating, localShapes, selectedMap, shapes]);

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
        isFrequentlyUpdating ? localShapes : shapes, // 移动优化，移动过程中使用本地数据
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
    isFrequentlyUpdating,
    localShapes,
    multipleSelectRect,
    preparedConnection,
    selectedMap,
    shapes
  ]);

  // 开始移动画布
  const startMoveStageHandler = useCallback(
    (offsetX: number, offsetY: number) => {
      handleStageMoveStart({ x: offsetX, y: offsetY });
      setMode(EMouseMoveMode.MOVE_CANVAS);
    },
    [handleStageMoveStart]
  );

  // 开始连线
  const startConnectHandler = useCallback(
    (intersectedConnectionPoint: IShapeConnectionPoint | null) => {
      setMode(EMouseMoveMode.CONNECT);
      handleConnectStart(intersectedConnectionPoint);
    },
    [handleConnectStart]
  );

  // 开始缩放
  const startResizeHandler = useCallback(() => {
    setMode(EMouseMoveMode.RESIZE);
    handleResizeStart({
      oldBox: multipleSelectRect ? { ...multipleSelectRect } : null,
      oldSelectedShapes: [...getSelectedShapes(selectedMap, shapes)],
      direction: hoveringCtrlPoint?.direction || EDirection.RIGHT_BOTTOM
    });
  }, [handleResizeStart, hoveringCtrlPoint?.direction, multipleSelectRect, selectedMap, shapes]);

  // 加选、减选
  const addAndRemoveSelectHandler = useCallback(
    (intersectedShape: IShape | null, intersectConnectionId: string, newMap: Map<string, EElement>) => {
      const id = intersectedShape?.id || intersectConnectionId; // 同时只可能选中一种元素
      if (selectedMap[id]) {
        newMap.delete(id);
      } else {
        const type = intersectedShape?.id ? EElement.SHAPE : EElement.CONNECTION;
        newMap.set(id, type);
      }
    },
    [selectedMap]
  );

  // 开始移动形状
  const startMoveShapesHandler = useCallback(
    (offsetX: number, offsetY: number, newMap: Map<string, EElement>, selectedShapes: IShape[]) => {
      const newMouseMoveInfo = getMouseMoveInfo(newMap, connections, selectedShapes, offsetX, offsetY);
      setMode(EMouseMoveMode.MOVE);
      handleMoveStart(newMouseMoveInfo);
    },
    [connections, handleMoveStart]
  );

  // 单选某一形状
  const singleSelectShapeHandler = useCallback(
    (offsetX: number, offsetY: number, intersectedShape: IShape, newMap: Map<string, EElement>) => {
      // 单选形状
      const selectedShapes = getSelectedShapes(selectedMap, shapes);
      const isPointInSelectedShape = selectedShapes.find(shape => shape.id === intersectedShape?.id);
      let newSelectedShapes = selectedShapes;

      // 如果点击的是选框外的图形，重新设置选框内容
      if (!isPointInSelectedShape) {
        newSelectedShapes = [intersectedShape];
        newMap = new Map([[intersectedShape.id, EElement.SHAPE]]);
      }
      // 开始移动
      startMoveShapesHandler(offsetX, offsetY, newMap, newSelectedShapes);

      return newMap;
    },
    [selectedMap, shapes, startMoveShapesHandler]
  );

  // 开始框选
  const startBoxSelectHandler = useCallback(
    (x: number, y: number) => {
      handleBoxSelectStart({ x, y });
      setMode(EMouseMoveMode.BOX_SELECTION);
      setSelectedMap({});
    },
    [handleBoxSelectStart, setSelectedMap]
  );

  // 选择图形/连线
  const selectElementHandler = useCallback(
    (offsetX: number, offsetY: number, isPressCtrlKey: boolean, intersectedShape: IShape | null, intersectConnectionId: string) => {
      let newMap = objectToMap<string, EElement>(selectedMap);
      if (isPressCtrlKey) {
        addAndRemoveSelectHandler(intersectedShape, intersectConnectionId, newMap);
      } else {
        if (intersectedShape) {
          // 单选形状、移动
          newMap = singleSelectShapeHandler(offsetX, offsetY, intersectedShape, newMap);
        } else if (intersectConnectionId) {
          // 单选连线
          newMap = new Map([[intersectConnectionId, EElement.CONNECTION]]);
        }
      }
      setSelectedMap(mapToObject<string, EElement>(newMap));
    },
    [addAndRemoveSelectHandler, selectedMap, setSelectedMap, singleSelectShapeHandler]
  );

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      const offsetX = e.offsetX / canvasScale;
      const offsetY = e.offsetY / canvasScale;

      const isChooseInput = e.target === document.getElementById('editing-input-box');
      if (isChooseInput) {
        return;
      }

      const isChooseStage = e.button === 1 || isSpaceKeyDown;
      if (isChooseStage) {
        startMoveStageHandler(offsetX, offsetY);
        return;
      }

      const intersectedConnectionPoint = getIntersectedConnectionPoint(shapes, offsetX, offsetY);
      const isChooseConnectPoint = Boolean(intersectedConnectionPoint);
      if (isChooseConnectPoint) {
        startConnectHandler(intersectedConnectionPoint);
        return;
      }

      const intersectedResizeCtrlPoint = getIntersectedControlPoint(offsetX, offsetY, multipleSelectRect);
      const isChooseResizePoint = Boolean(intersectedResizeCtrlPoint);
      if (isChooseResizePoint) {
        startResizeHandler();
        return;
      }

      const intersectedShape = getIntersectedShape(shapes, offsetX, offsetY);
      const intersectConnectionId = getIntersectedConnectionId(offsetX, offsetY, connections);
      const isChooseShapeOrLine = Boolean(intersectedShape || intersectConnectionId);
      if (isChooseShapeOrLine) {
        selectElementHandler(offsetX, offsetY, e.ctrlKey, intersectedShape, intersectConnectionId);
        return;
      }

      startBoxSelectHandler(e.offsetX, e.offsetY);
      return;
    },
    [
      canvasScale,
      isSpaceKeyDown,
      shapes,
      connections,
      multipleSelectRect,
      startMoveStageHandler,
      startConnectHandler,
      startResizeHandler,
      selectElementHandler,
      startBoxSelectHandler
    ]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const offsetX = e.offsetX / canvasScale;
      const offsetY = e.offsetY / canvasScale;

      setHoveringElement(multipleSelectRect, offsetX, offsetY);

      switch (mode) {
        case EMouseMoveMode.MOVE:
          handleMoving(offsetX, offsetY);
          break;
        case EMouseMoveMode.RESIZE:
          handleResizing(offsetX, offsetY);
          break;
        case EMouseMoveMode.CONNECT:
          handleConnecting(offsetX, offsetY);
          break;
        case EMouseMoveMode.BOX_SELECTION:
          handleBoxSelecting(e.offsetX, e.offsetY);
          break;
        case EMouseMoveMode.MOVE_CANVAS:
          handleStageMoving(offsetX, offsetY);
          break;
        default:
          break;
      }
    },
    [canvasScale, setHoveringElement, multipleSelectRect, mode, handleMoving, handleResizing, handleConnecting, handleBoxSelecting, handleStageMoving]
  );

  const resetStates = useCallback(() => {
    handleConnectStart(null);
    setPreparedConnection(null);
    setHelpLineVals(DEFAULT_HELP_LINE_VAL);
    setMode(EMouseMoveMode.DEFAULT);
  }, [setPreparedConnection, handleConnectStart]);

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      const offsetX = e.offsetX / canvasScale;
      const offsetY = e.offsetY / canvasScale;

      switch (mode) {
        case EMouseMoveMode.MOVE:
          handleMoveEnd();
          break;
        case EMouseMoveMode.RESIZE:
          handleResizeEnd();
          break;
        case EMouseMoveMode.CONNECT:
          handleAddConnection(startConnectionPoint, offsetX, offsetY);
          break;
        case EMouseMoveMode.BOX_SELECTION:
          handleBoxSelectEnd();
          break;
        default:
          break;
      }

      resetStates();
    },
    [canvasScale, handleAddConnection, handleBoxSelectEnd, handleMoveEnd, handleResizeEnd, mode, resetStates, startConnectionPoint]
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
        ></canvas>
        <SelectionBox isShow={mode === EMouseMoveMode.BOX_SELECTION} boxStyles={boxStyles} />
        <EditInput />
        <ContextMenu menus={[{ label: '删除', key: 'Delete', handle: handleDelete }]} />
      </div>
    );
  }, [boxStyles, canvasPosition, canvasScale, className, handleDelete, handleMouseDown, handleMouseMove, handleMouseUp, mode]);
};

export default Canvas;
