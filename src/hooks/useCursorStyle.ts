import { useEffect } from "react";
import { EMouseMoveMode, ICtrlPoint, cursorDirectionMap } from "../pages/Canvas/common";
import { getCanvasEle } from "../utils/util";

export const useCursorStyle = (mode: EMouseMoveMode, hoveringCtrlPoint: ICtrlPoint | null, isSpaceKeyDown: boolean) => {
    const canvas = getCanvasEle();
    useEffect(() => {
      if (canvas) {
        let cursor = 'default';
        if (mode === EMouseMoveMode.MOVE_CANVAS || isSpaceKeyDown) {
          cursor = 'grab';
        }
        if (hoveringCtrlPoint) {
          cursor = `${cursorDirectionMap[hoveringCtrlPoint.direction]}`;
        }
  
        canvas.style.cursor = cursor;
      }
    }, [canvas, hoveringCtrlPoint, isSpaceKeyDown, mode]);
  
}