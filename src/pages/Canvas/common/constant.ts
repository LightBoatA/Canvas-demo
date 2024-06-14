import { EDirection } from "./types";

export const STROKE_WIDTH = 2; // 描边尺寸
export const CANVAS_WIDTH = 800; // 画布宽
export const CANVAS_HEITHT = 600; // 画布高
export const GRID_SIZE = 10; // 背景网格线之间的间距

export const CTRL_POINT_HALF_SIZE = 5; // 缩放控制点半边长
export const COMMON_SHAPE_SIZE = 100; // 形状边长

// 文字输入框相对于形状中心坐标的偏移值
export const INPUT_OFFSET = {
    x: COMMON_SHAPE_SIZE / 2,
    y: 10,
}

export const DEFAULT_MOUSE_INFO = {
    isDown: false,
    mouseOffset: {
        x: 0,
        y: 0
    }
}

// 不同方向对应的缩放光标样式
export const cursorDirectionMap = {
    [EDirection.LEFT_TOP]: "nwse-resize",
    [EDirection.LEFT_BOTTOM]: "nesw-resize",
    [EDirection.RIGHT_BOTTOM]: "nwse-resize",
    [EDirection.RIGHT_TOP]: "nesw-resize",
}