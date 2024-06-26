import { EShape } from "../../Toolbar/common";
import { EDirection, IHelpLineData, IMouseInfo, IShape } from "./types";

export const STROKE_WIDTH = 2; // 描边尺寸
export const CANVAS_WIDTH = 800; // 画布宽
export const CANVAS_HEITHT = 600; // 画布高
export const GRID_SIZE = 10; // 背景网格线之间的间距

export const CTRL_POINT_HALF_SIZE = 5; // 缩放控制点半边长
export const COMMON_SHAPE_SIZE = 100; // 形状边长
export const INIT_SHAPE_WIDTH = 100;
export const CONNECT_POINT_RADIUS = 4;
export const SNAP_DISTANCE = 3; // 吸附阈值
export const STRING_CONNECTOR = ':'; // 两个字符串组合的连接符，连接两个ID等
export const HALF_LINE_WIDTH = 5; // 连线粗细的一半

export const COLOR_CONNECT_POINT = "#FF6969";

// export const COLOR_SHAPE = "#EF9C66";#585e64
export const COLOR_SHAPE = "#FFF";
// export const COLOR_BORDER = "#365E32";
export const COLOR_BORDER = "#585e64";
export const COLOR_BORDER_HOVER = "#FF7F3E";
export const COLOR_CTRL_POINT = "#365E32";
export const COLOR_BG = "#FDFFE2";
export const COLOR_GRID = "#E0E0E0";
export const FONT_COLOR = "#000";
export const COLOR_DASHLINE = "grey";
export const COLOR_CONNECTION = "black";



export const INIT_COMMON_SHAPE_DATA = {

}
export const INIT_SHAPES: { [ key: string]: IShape } = {
    // common: {
    //     id: '',
    //     type: EShape.RECT,
    //     x: 0,
    //     y: 0,
    //     text: "",
    //     data: {},
    //     width: 0,
    //     height: 0,
    // },
    [EShape.RECT as string]: {
        id: '',
        type: EShape.RECT,
        x: 0,
        y: 0,
        text: "",
        width: INIT_SHAPE_WIDTH,
        height: INIT_SHAPE_WIDTH / 2,
        data: {},
        connectionPoints: [],
    },
    [EShape.CIRCLE as string]: {
        id: '',
        type: EShape.CIRCLE,
        x: 0,
        y: 0,
        text: "",
        data: {},
        width: INIT_SHAPE_WIDTH,
        height: INIT_SHAPE_WIDTH,
        connectionPoints: [],
    },
    [EShape.DIAMOND as string]: {
        id: '',
        type: EShape.DIAMOND,
        x: 0,
        y: 0,
        text: "",
        data: {},
        width: INIT_SHAPE_WIDTH + 32,
        height: 64,
        connectionPoints: [],
    },
    [EShape.ROUNDED_RECT as string]: {
        id: '',
        type: EShape.ROUNDED_RECT,
        x: 0,
        y: 0,
        text: "",
        data: {
            
        },
        width: INIT_SHAPE_WIDTH,
        height: INIT_SHAPE_WIDTH / 2,
        connectionPoints: [],
    },
    [EShape.PARALLELOGRAM as string]: {
        id: '',
        type: EShape.PARALLELOGRAM,
        x: 0,
        y: 0,
        text: "",
        data: {
            tangentAlpha: 0.6, // 平行四边形两边的三角，高/alpha角的对边 
        },
        width: INIT_SHAPE_WIDTH + 32,
        height: INIT_SHAPE_WIDTH / 2,
        connectionPoints: [],
    }
}
// 文字输入框相对于形状中心坐标的偏移值
export const INPUT_OFFSET = {
    x: COMMON_SHAPE_SIZE / 2,
    y: 10,
}

export const DEFAULT_MOUSE_INFO: IMouseInfo = {
    isDown: false,
    rectOffset: { distanceX: 0, distanceY: 0 },
    offsetMap: new Map(),
}

export const DEFAULT_HELP_LINE_VAL: IHelpLineData = {
    hVals: [],
    vVals: [],
}

// 不同方向对应的缩放光标样式
export const cursorDirectionMap = {
    [EDirection.LEFT_TOP]: "nwse-resize",
    [EDirection.LEFT_BOTTOM]: "nesw-resize",
    [EDirection.RIGHT_BOTTOM]: "nwse-resize",
    [EDirection.RIGHT_TOP]: "nesw-resize",
}