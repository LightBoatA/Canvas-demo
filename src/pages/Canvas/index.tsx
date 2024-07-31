import React, { CSSProperties, DragEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  IBounds,
  findElementsInBox,
  EDirection,
  IResizeStartInfo
} from './common/index';
import { HistoryManager } from './common/HistoryManager';
import { EShape } from '../Toolbar/common';
import { getCryptoUuid, mapToObject, objectToMap } from '../../utils/util';
import { Typography } from 'antd';
import ContextMenuModal from '../../components/ContextMenuModal';
import { useShapes } from '../../hooks/useShapes';
import { useCommon } from '../../hooks/useCommon';

interface IProps {
  className?: string;
}

const historyManager = new HistoryManager<IShape[]>();

export const Canvas: React.FC<IProps> = props => {
  const { className } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  // const [shapes, setShapes] = useState<IShape[]>([]);
  // 选中的元素
  // const [selectedMap, setSelectedMap] = useState<Map<string, EElement>>(new Map());
  // 移动开始信息
  const [moveStartInfo, setMoveStartInfo] = useState<IMoveStartInfo>(DEFAULT_MOUSE_INFO);
  // 缩放开始信息
  const [resizeStartInfo, setResizeStartInfo] = useState<IResizeStartInfo | null>(null);

  const [editingText, setEditingText] = useState<string>('');
  const [editingId, setEditingId] = useState<string>('');
  // 鼠标悬停在缩放控制点上
  const [hoveringCtrlPoint, setHoveringCtrlPoint] = useState<ICtrlPoint | null>(null);
  // 鼠标悬停在形状上
  const [hoveringId, setHoveringId] = useState<string>('');
  // const [fromConnectionPointInfo, setfromConnectionPointInfo] = useState<string>(""); // shapeId-connectionPointDirection
  const [startConnectionPoint, setStartConnectionPoint] = useState<IShapeConnectionPoint | null>(null);
  const [preparedConnection, setPreparedConnection] = useState<IConnection | null>(null);
  const [connections, setConnections] = useState<IConnection[]>([]);
  const [hoveringConnectionPoint, setHoveringConnectionPoint] = useState<IShapeConnectionPoint | null>(null);
  const [hoveringConnectionId, setHoveringConnectionId] = useState<string>('');
  const [helpLineVals, setHelpLineVals] = useState<IHelpLineData>(DEFAULT_HELP_LINE_VAL);
  const [isShowContextMenu, setIsShowContextMenu] = useState<boolean>(false);
  const [contextMenuModalStyle, setContextMenuModalStyle] = useState<CSSProperties>({ top: 0, left: 0, margin: 0 });
  const [mode, setMode] = useState<EMouseMoveMode>(EMouseMoveMode.DEFAULT);
  const [startPosition, setStartPosition] = useState<IPoint>(DEFAULT_POINT); // 框选起始点
  const [curPosition, setCurPosition] = useState<IPoint>(DEFAULT_POINT); // 框选当前点

  const { shapes, setShapes, updateShapeByIds } = useShapes();
  const { selectedMap, setSelectedMap } = useCommon();
  // const selectionRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (canvasRef.current && !ctxRef.current) {
      ctxRef.current = canvasRef.current.getContext('2d');
    }
  }, []);

  // 鼠标移动到缩放点时，光标样式修改
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.style.cursor = hoveringCtrlPoint ? `${cursorDirectionMap[hoveringCtrlPoint.direction]}` : `default`;
    }
  }, [hoveringCtrlPoint]);

  const clearCanvas = useCallback(() => {
    if (ctxRef.current) {
      ctxRef.current.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEITHT);
    }
  }, []);

  const selectedShapes = useMemo(() => {
    if (Object.keys(selectedMap).length <= 0) return [];
    return shapes.filter(shape => selectedMap[shape.id]);
  }, [selectedMap, shapes]);

  const multipleSelectRect = useMemo(() => {
    const realMap = objectToMap<string, EElement>(selectedMap); // 锚点
    return calcMultipleSelectRect(realMap, connections, selectedShapes) || null;
  }, [connections, selectedMap, selectedShapes]);

  useEffect(() => {
    if (ctxRef.current) {
      clearCanvas();
      drawShape(ctxRef.current, shapes, hoveringId, hoveringConnectionId, preparedConnection, connections, hoveringConnectionPoint, helpLineVals, multipleSelectRect);
    }
  }, [clearCanvas, connections, helpLineVals, hoveringConnectionId, hoveringConnectionPoint, hoveringId, multipleSelectRect, preparedConnection, selectedMap, shapes]);

  const handleContextMenu = useCallback((e: MouseEvent) => {
    e.preventDefault();
    const { clientX, clientY } = e;
    setIsShowContextMenu(true);
    setContextMenuModalStyle({
      top: clientY,
      left: clientX,
      margin: 0
    });
  }, []);

  useEffect(() => {
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [handleContextMenu]);

  const handleUndo = useCallback(() => {
    const prevShapes = historyManager.undo();
    if (prevShapes) {
      setShapes(prevShapes);
    }
  }, [setShapes]);

  const handleRedo = useCallback(() => {
    const nextShapes = historyManager.redo();
    if (nextShapes) {
      setShapes(nextShapes);
    }
  }, [setShapes]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'z') {
        handleUndo();
      } else if (e.ctrlKey && e.key === 'y') {
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  });

  const addShape = useCallback((name: EShape, offsetX: number, offsetY: number) => {
    const shape = getInitShapeData(name, offsetX, offsetY);
    setSelectedMap({ [shape.id]: EElement.SHAPE });

    setShapes([
      ...shapes,
      shape
    ])
  }, [setSelectedMap, setShapes, shapes]);

  const updateShapeText = useCallback((id: string, newText: string) => {
    updateShapeByIds({
      ids: [id], 
      key: 'text', 
      data: newText
    })
  }, [updateShapeByIds]);

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
    if (editingId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingId]);

  const aaa = useCallback(() => {}, []);

  const boxStyles = useMemo(() => {
    const minX = Math.min(curPosition.x, startPosition.x);
    const minY = Math.min(curPosition.y, startPosition.y);
    const width = Math.abs(curPosition.x - startPosition.x);
    const height = Math.abs(curPosition.y - startPosition.y);
    return {
      top: minY,
      left: minX,
      width,
      height,
      backgroundColor: 'rgba(0, 0, 255, 0.3)',
      border: '1px solid blue'
    };
  }, [curPosition.x, curPosition.y, startPosition.x, startPosition.y]);

  const handleBoxSelection = useCallback(() => {
    const { top, left, width, height } = boxStyles;
    const bounds: IBounds = {
      top,
      left,
      right: left + width,
      bottom: top + height
    };
    const eleMap = findElementsInBox(bounds, shapes, connections);
    setSelectedMap(mapToObject<string, EElement>(eleMap));
  }, [boxStyles, connections, setSelectedMap, shapes]);

  const updateSelectionBox = useCallback((offsetX: number, offsetY: number) => {
    setCurPosition({ x: offsetX, y: offsetY });
  }, []);

  const handleDelete = useCallback(() => {
    if (Object.keys(selectedMap).length > 0) {
      setShapes(shapes.filter(shape => !selectedMap[shape.id]))
      setConnections(oldConnection => oldConnection.filter(shape => !selectedMap[shape.id]));
      setSelectedMap({});
    }
  }, [selectedMap, setSelectedMap, setShapes, shapes]);

  const moveShapes = useCallback(
    (newX: number, newY: number) => {
      const { rectOffset, offsetMap } = moveStartInfo;
      if (multipleSelectRect) {
        const { width: rectWidth, height: rectHeight } = multipleSelectRect;
        const newRectX = newX - rectOffset.distanceX,
          newRectY = newY - rectOffset.distanceY;
        const selectedShapeIds = selectedShapes.map(shape => shape.id);
        const { snapX: rectSnapX, snapY: rectSnapY, helpLine } = getSnapData(newRectX, newRectY, rectWidth, rectHeight, selectedShapeIds, shapes);
        setHelpLineVals(helpLine);
        const newShapes = shapes.map(shape => {
          if (selectedMap[shape.id]) {
            const { width, height, id } = shape;
            const distanceData = offsetMap.get(id);
            const distanceX = distanceData?.distanceX || 0;
            const distanceY = distanceData?.distanceY || 0;
            const shapeX = rectSnapX - distanceX,
              shapeY = rectSnapY - distanceY;
            return {
              ...shape,
              x: shapeX,
              y: shapeY,
              connectionPoints: shape.connectionPoints.map(point => getConnectionPointVal(shapeX, shapeY, width, height, point.direction))
            };
          } else return shape;
        });
        setShapes(newShapes);
      }
    },
    [moveStartInfo, multipleSelectRect, selectedMap, selectedShapes, setShapes, shapes]
  );

  const resizeShapes = useCallback(
    (cursorX: number, cursorY: number) => {
      if (resizeStartInfo) {
        const map = calcResizedShape(cursorX, cursorY, resizeStartInfo);
        const newShapes = shapes.map(shape => (map.has(shape.id) ? map.get(shape.id)! : shape));
        setShapes(newShapes)
      }
    },
    [resizeStartInfo, setShapes, shapes]
  );

  const handleDragover = (e: DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = useCallback(
    (e: any) => {
      const { offsetX, offsetY } = e;
      const { name } = JSON.parse(e.dataTransfer.getData('json'));
      addShape(name, offsetX, offsetY);
    },
    [addShape]
  );

  const handleDoubleClick = useCallback(
    (e: MouseEvent) => {
      const { offsetX, offsetY } = e;
      startEditing(offsetX, offsetY);
    },
    [startEditing]
  );

  const drawVirtualConnection = useCallback(
    (offsetX: number, offsetY: number) => {
      // 从连接点到鼠标移动位置画虚线
      if (startConnectionPoint) {
        const { shape, point } = startConnectionPoint;
        const { x: fromX, y: fromY } = point;
        let toShape: IShape, toPoint: IConnectionPoint;
        // 鼠标移到了目标连接点上
        if (hoveringConnectionPoint) {
          toShape = hoveringConnectionPoint.shape;
          toPoint = hoveringConnectionPoint.point;
        } else {
          // 鼠标移到的地方没有形状及连接点
          const endPoint = getVirtualEndPoint(offsetX, offsetY, fromX, fromY);
          toShape = endPoint.shape;
          toPoint = endPoint.point;
        }

        setPreparedConnection({
          id: 'prepared-connection',
          fromShape: shape,
          fromPoint: point,
          toPoint,
          toShape
        });
      }
    },
    [hoveringConnectionPoint, startConnectionPoint]
  );

  // const handleClick = useCallback((e: MouseEvent) => {

  // }, [])

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      const { offsetX, offsetY, ctrlKey } = e;
      if (e.target === inputRef.current) return;
      // 与光标相交的连接点
      const intersectedConnectionPoint = getIntersectedConnectionPoint(shapes, offsetX, offsetY);
      // 与光标相交的形状
      const intersectedShape = getIntersectedShape(shapes, offsetX, offsetY); // TODO: 这里一定要先计算出来吗？
      // 与光标相交的连接线
      const intersectConnectionId = getIntersectedConnectionId(offsetX, offsetY, connections);
      // 与光标相交的缩放控制点
      const intersectedResizeCtrlPoint = getIntersectedControlPoint(offsetX, offsetY, multipleSelectRect);
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
        setStartPosition({ x: e.offsetX, y: e.offsetY });
        setCurPosition({ x: e.offsetX, y: e.offsetY });
        setMode(EMouseMoveMode.BOX_SELECTION);
        setSelectedMap({});
      }
    },
    [connections, hoveringCtrlPoint?.direction, multipleSelectRect, selectedMap, selectedShapes, setSelectedMap, shapes]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const { offsetX, offsetY } = e;
      const [hoveringShape] = shapes.filter(shape => isPointInShape(offsetX, offsetY, shape));
      const [hoveringConnection] = connections.filter(connection => isPointInLine(offsetX, offsetY, connection.id));
      // 设置悬停连接线
      hoveringConnection ? setHoveringConnectionId(hoveringConnection.id) : setHoveringConnectionId('');
      // 设置悬停形状
      hoveringShape ? setHoveringId(hoveringShape.id) : setHoveringId('');
      // 设置悬停缩放控制点
      if (multipleSelectRect) {
        const ctrlPoint = getIntersectedControlPoint(offsetX, offsetY, multipleSelectRect);
        setHoveringCtrlPoint(ctrlPoint);
      }
      // 设置悬停连接点
      const connectionPoint = getIntersectedConnectionPoint(shapes, offsetX, offsetY);
      connectionPoint ? setHoveringConnectionPoint(connectionPoint) : setHoveringConnectionPoint(null);

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
        default:
          break;
      }
    },
    [connections, drawVirtualConnection, mode, multipleSelectRect, shapes, moveShapes, updateSelectionBox, resizeShapes]
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      const { offsetX, offsetY } = e;
      if (mode === EMouseMoveMode.BOX_SELECTION) {
        handleBoxSelection();
      }
      const connectionPoint = getIntersectedConnectionPoint(shapes, offsetX, offsetY);
      if (connectionPoint && startConnectionPoint) {
        const { shape, point } = startConnectionPoint;
        setConnections(prevConnections => {
          return [
            ...prevConnections,
            {
              id: getCryptoUuid(),
              fromShape: shape,
              fromPoint: point,
              toShape: connectionPoint.shape,
              toPoint: connectionPoint.point
            }
          ];
        });
      }
      setStartConnectionPoint(null);
      setPreparedConnection(null);
      setHelpLineVals(DEFAULT_HELP_LINE_VAL);
      setMode(EMouseMoveMode.DEFAULT);
      historyManager.push(shapes);
    },
    [handleBoxSelection, mode, shapes, startConnectionPoint]
  );

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingText(e.target.value);
  }, []);

  const handleTextSubmit = useCallback(() => {
    updateShapeText(editingId, editingText);
    setEditingText('');
    setEditingId('');
  }, [editingId, editingText, updateShapeText]);

  const inputStyle = useMemo(() => {
    const editingShape = shapes.find(shape => shape.id === editingId);
    let style: { [key: string]: any } = {
      position: 'absolute'
    };
    if (editingShape) {
      const { x, y, width } = editingShape;
      style = {
        ...style,
        // left: editingShape.x - INPUT_OFFSET.x,
        left:  x - width / 2 - 2,
        top: y - INPUT_OFFSET.y,
        width: `${editingShape.width}px`
      };
    }
    return style;
  }, [editingId, shapes]);

  return useMemo(() => {
    return (
      <div className={`comp-canvas ${className || ''}`}>
        <canvas
          onDragOver={handleDragover}
          onDrop={e => handleDrop(e.nativeEvent)}
          onMouseDown={e => handleMouseDown(e.nativeEvent)}
          onMouseMove={e => handleMouseMove(e.nativeEvent)}
          onMouseUp={e => handleMouseUp(e.nativeEvent)}
          onDoubleClick={e => handleDoubleClick(e.nativeEvent)}
          // onClick={(e) => handleClick(e.nativeEvent)}
          id="drawing"
          width={CANVAS_WIDTH}
          height={CANVAS_HEITHT}
          ref={canvasRef}>
          这是一个画布
        </canvas>
        {mode === EMouseMoveMode.BOX_SELECTION && <div style={{ pointerEvents: 'none', position: 'absolute', ...boxStyles }}></div>}
        {editingId && <input style={inputStyle} className="input-text" ref={inputRef} value={editingText} type="text" onChange={handleTextChange} onBlur={handleTextSubmit} />}
        <ContextMenuModal
          open={isShowContextMenu}
          style={contextMenuModalStyle}
          onCancel={() => {
            setIsShowContextMenu(false);
          }}>
          <div>
            <Typography.Link className="w100p" onClick={handleDelete}>
              <div className="context-menu-item">
                <span>删除</span>
                <span className="key">Delete</span>
              </div>
            </Typography.Link>
          </div>
        </ContextMenuModal>
      </div>
    );
  }, [boxStyles, className, contextMenuModalStyle, editingId, editingText, handleDelete, handleDoubleClick, handleDrop, handleMouseDown, handleMouseMove, handleMouseUp, handleTextChange, handleTextSubmit, inputStyle, isShowContextMenu, mode]);
};

export default Canvas;
