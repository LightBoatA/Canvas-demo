import { useCallback, useState } from "react";
import { IResizeStartInfo, calcResizedShape } from "../pages/Canvas/common";
import { useShapes } from "./useShapes";

export const useResizeShape = () => {
  // 缩放开始信息
  const [resizeStartInfo, setResizeStartInfo] = useState<IResizeStartInfo | null>(null);
  const { shapes, setShapes } = useShapes();
  const resizeShapes = useCallback(
    (cursorX: number, cursorY: number) => {
      if (resizeStartInfo) {
        const map = calcResizedShape(cursorX, cursorY, resizeStartInfo);
        const newShapes = shapes.map(shape => (map.has(shape.id) ? map.get(shape.id)! : shape));
        setShapes(newShapes);
      }
    },
    [resizeStartInfo, setShapes, shapes]
  );

  return {
    setResizeStartInfo,
    resizeShapes,
  }
}