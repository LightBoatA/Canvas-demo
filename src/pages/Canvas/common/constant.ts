import { EDirection, IHelpLineData, IMoveStartInfo, IPoint } from "./types";

export const STROKE_WIDTH = 2; // 描边尺寸
export const CANVAS_WIDTH = 1200; // 画布宽
export const CANVAS_HEITHT = 720; // 画布高
export const GRID_SIZE = 15; // 背景网格线之间的间距
export const CTRL_POINT_HALF_SIZE = 4; // 缩放控制点半边长
export const COMMON_SHAPE_SIZE = 100; // 形状边长
export const INIT_SHAPE_WIDTH = 100;
export const CONNECT_POINT_RADIUS = 4;
export const SNAP_DISTANCE = 3; // 吸附阈值
export const STRING_CONNECTOR = ':'; // 两个字符串组合的连接符，连接两个ID等
export const HALF_LINE_WIDTH = 5; // 连线粗细的一半
export const ARROW_LENGTH = 10; // 箭头大小
export const ARROW_WIDTH = 5; // 箭头宽度
export const MIN_SCALE = 0.5;
export const MAX_SCALE = 4;

export const COLOR_CONNECT_POINT = "#FF6969";
export const COLOR_SHAPE = "#FFF";
export const COLOR_BORDER = "#585e64";
export const COLOR_BORDER_HOVER = "#FF7F3E";
export const COLOR_CTRL_POINT = "#365E32";
export const COLOR_BG = "#FDFFE2";
export const COLOR_GRID = "#f2f2f2";
export const COLOR_GRID_DARK = "#e5e5e5";
export const COLOR_SELECTED_COLOR = "#067bef"
export const COLOR_FONT = "#000";
export const COLOR_DASHLINE = "grey";
export const COLOR_CONNECTION = "black";


export const DEFAULT_POINT: IPoint = {
    x: 0,
    y: 0,
}

// 文字输入框相对于形状中心坐标的偏移值
export const INPUT_OFFSET = {
    x: COMMON_SHAPE_SIZE / 2,
    y: 10,
}

export const DEFAULT_MOUSE_INFO: IMoveStartInfo = {
    rectInfo: { rectWidth: 0, rectHeight: 0 },
    rectOffset: { distanceX: 0, distanceY: 0 },
    offsetMap: new Map(),
}

export const DEFAULT_HELP_LINE_VAL: IHelpLineData = {
    hVals: [],
    vVals: [],
}

// 不同方向对应的缩放光标样式
export const cursorDirectionMap: { [key: string] : string } = {
    [EDirection.LEFT_TOP]: "nwse-resize",
    [EDirection.LEFT_BOTTOM]: "nesw-resize",
    [EDirection.RIGHT_BOTTOM]: "nwse-resize",
    [EDirection.RIGHT_TOP]: "nesw-resize",
}