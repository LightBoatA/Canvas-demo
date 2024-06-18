import { EConnectPointDirection, IConnectionPoint, IPoint, IShape } from "../common";
import AStar from "./AStar";
import { MIN_DISTANCE } from './constant'

let startRect: IShape, endRect: IShape;
let easyMode = false;

/**
 * 获取形状的边界坐标值
 * @param rect 
 * @returns 
 */
export const getRectBounds = (rect: IShape) => {
    const { x, y, width, height } = rect;
    return {
        top: y - height / 2,
        right: x + width / 2,
        bottom: y + height / 2,
        left: x - width / 2
    }
}
// 找出起点的下一个点或终点的前一个点（伪起点或伪终点）
export const findStartNextOrEndPrePoint = (
    rect: IShape, // 可以根据实际类型进行更改
    point: IConnectionPoint
): number[] => {
    const { x, y } = rect;
    const { top, right, bottom, left } = getRectBounds(rect);
    // 起点或终点在左边
    if (point.direction === EConnectPointDirection.LEFT) {
        return [left - MIN_DISTANCE, y];
    } else if (point.direction === EConnectPointDirection.TOP) {
        // 起点或终点在上边
        return [x, top - MIN_DISTANCE];
    } else if (point.direction === EConnectPointDirection.RIGHT) {
        // 起点或终点在右边
        return [right + MIN_DISTANCE, y];
    } else if (point.direction === EConnectPointDirection.BOTTOM) {
        // 起点或终点在下边
        return [x, bottom + MIN_DISTANCE];
    }
    throw new Error("Invalid point or rectangle provided.");
};

// 计算两条线段的交点
export const getIntersection = (
    seg1: [number[], number[]],
    seg2: [number[], number[]]
): number[] | null => {
    // 两条垂直线不会相交
    if (seg1[0][0] === seg1[1][0] && seg2[0][0] === seg2[1][0]) {
        return null;
    }
    // 两条水平线不会相交
    if (seg1[0][1] === seg1[1][1] && seg2[0][1] === seg2[1][1]) {
        return null;
    }
    // seg1是水平线、seg2是垂直线
    if (seg1[0][1] === seg1[1][1] && seg2[0][0] === seg2[1][0]) {
        return [seg2[0][0], seg1[0][1]];
    }
    // seg1是垂直线、seg2是水平线
    if (seg1[0][0] === seg1[1][0] && seg2[0][1] === seg2[1][1]) {
        return [seg1[0][0], seg2[0][1]];
    }
    return null;
};


// 计算出给定点可以形成的最大的矩形的四个顶点
export const getBoundingBox = (points: number[][]): number[][] => {
    let boundingBoxXList: number[] = [];
    let boundingBoxYList: number[] = [];
    points.forEach((item) => {
        boundingBoxXList.push(item[0]);
        boundingBoxYList.push(item[1]);
    });
    let minBoundingBoxX = Math.min(...boundingBoxXList);
    let minBoundingBoxY = Math.min(...boundingBoxYList);
    let maxBoundingBoxX = Math.max(...boundingBoxXList);
    let maxBoundingBoxY = Math.max(...boundingBoxYList);
    return [
        [minBoundingBoxX, minBoundingBoxY],
        [maxBoundingBoxX, minBoundingBoxY],
        [minBoundingBoxX, maxBoundingBoxY],
        [maxBoundingBoxX, maxBoundingBoxY],
    ];
};

// 去重
export const removeDuplicatePoint = (points: number[][]): number[][] => {
    let res: number[][] = [];
    let cache: { [key: string]: boolean } = {};
    points.forEach(([x, y]) => {
        if (!cache[x + "-" + y]) {
            cache[x + "-" + y] = true;
            res.push([x, y]);
        }
    });
    return res;
};

// 计算所有可能经过的点
export const computedProbablyPoints = (
    rect1: IShape,
    rect2: IShape,
    startPoint: IConnectionPoint,
    endPoint: IConnectionPoint,
    easy: boolean
): {
    startPoint: number[];
    endPoint: number[];
    fakeStartPoint: number[];
    fakeEndPoint: number[];
    points: number[][];
} => {
    // 初始化全局变量
    startRect = rect1;
    endRect = rect2;
    easyMode = easy;

    // 获取图形边界数据
    const { top: top1, right: right1, left: left1, bottom: bottom1 } = getRectBounds(rect1);
    const { top: top2, right: right2, left: left2, bottom: bottom2 } = getRectBounds(rect2);

    // 保存所有可能经过的点
    let points: number[][] = [];

    // 传入的startPoint并非number[]结构，在此转换一下
    const formattedStartPoint: number[] = [startPoint.x, startPoint.y],
        formattedEndPoint: number[] = [endPoint.x, endPoint.y];
    // 宽松模式则把真正的起点和终点加入点列表中
    if (easy) {
        points.push(formattedStartPoint, formattedEndPoint);
    }

    // 伪起点：经过起点且垂直于起点所在边的线与包围框线的交点
    let fakeStartPoint = findStartNextOrEndPrePoint(rect1, startPoint!);

    points.push(fakeStartPoint);

    // 伪终点：经过终点且垂直于终点所在边的线与包围框线的交点
    let fakeEndPoint = findStartNextOrEndPrePoint(rect2, endPoint!);

    points.push(fakeEndPoint);

    // 经过起点且垂直于起点所在边的线 与 经过终点且垂直于终点所在边的线 的交点
    let startEndPointVerticalLineIntersection = getIntersection(
        [formattedStartPoint!, fakeStartPoint],
        [formattedEndPoint!, fakeEndPoint]
    );
    startEndPointVerticalLineIntersection &&
        points.push(startEndPointVerticalLineIntersection);

    // 当 经过起点且垂直于起点所在边的线 与 经过终点且垂直于终点所在边的线 平行时，计算一条垂直线与经过另一个点的伪点的水平线 的节点
    if (!startEndPointVerticalLineIntersection) {
        let p1 = getIntersection(
            [formattedStartPoint!, fakeStartPoint], // 假设经过起点的垂直线是垂直的
            [fakeEndPoint, [fakeEndPoint[0] + 10, fakeEndPoint[1]]] // 那么就要计算经过伪终点的水平线。水平线上的点y坐标相同，所以x坐标随便加减多少数值都可以
        );
        p1 && points.push(p1);
        let p2 = getIntersection(
            [formattedStartPoint!, fakeStartPoint], // 假设经过起点的垂直线是水平的
            [fakeEndPoint, [fakeEndPoint[0], fakeEndPoint[1] + 10]] // 那么就要计算经过伪终点的垂直线。
        );
        p2 && points.push(p2);
        // 下面同上
        let p3 = getIntersection(
            [formattedEndPoint!, fakeEndPoint],
            [fakeStartPoint, [fakeStartPoint[0] + 10, fakeStartPoint[1]]]
        );
        p3 && points.push(p3);
        let p4 = getIntersection(
            [formattedEndPoint!, fakeEndPoint],
            [fakeStartPoint, [fakeStartPoint[0], fakeStartPoint[1] + 10]]
        );
        p4 && points.push(p4);
    }

    // 伪起点和伪终点形成的矩形 和 起点元素包围框 组成一个大矩形 的四个顶点
    points.push(
        ...getBoundingBox([
            // 伪起点终点
            fakeStartPoint,
            fakeEndPoint,
            // 起点元素包围框
            [left1 - MIN_DISTANCE, top1 - MIN_DISTANCE], // 左上顶点
            [right1 + MIN_DISTANCE, bottom1 + MIN_DISTANCE], // 右下顶点
        ])
    );

    // 伪起点和伪终点形成的矩形 和 终点元素包围框 组成一个大矩形 的四个顶点
    points.push(
        ...getBoundingBox([
            // 伪起点终点
            fakeStartPoint,
            fakeEndPoint,
            // 终点元素包围框
            [left2 - MIN_DISTANCE, top2 - MIN_DISTANCE], // 左上顶点
            [right2 + MIN_DISTANCE, bottom2 + MIN_DISTANCE], // 右下顶点
        ])
    );

    // 去重
    points = removeDuplicatePoint(points);

    return {
        startPoint: formattedStartPoint!,
        endPoint: formattedEndPoint!,
        fakeStartPoint,
        fakeEndPoint,
        points,
    };
};

// 检测是否为同一个点
export const checkIsSamePoint = (a: number[], b: number[]): boolean => {
    if (!a || !b) {
        return false;
    }
    return a[0] === b[0] && a[1] === b[1];
};

// 检查两个点组成的线段是否穿过起终点元素
export const checkLineThroughElements = (a: number[], b: number[]): boolean => {
    let rects = [startRect, endRect];
    let minX = Math.min(a[0], b[0]);
    let maxX = Math.max(a[0], b[0]);
    let minY = Math.min(a[1], b[1]);
    let maxY = Math.max(a[1], b[1]);
  
    // 水平线
    if (a[1] === b[1]) {
      for (let i = 0; i < rects.length; i++) {
        let rect = rects[i];
        const { top, left, right, bottom } = getRectBounds(rect);
        if (
          minY > top - MIN_DISTANCE &&
          minY < bottom + MIN_DISTANCE &&
          minX < right + MIN_DISTANCE &&
          maxX > left - MIN_DISTANCE
        ) {
          return true;
        }
      }
    } else if (a[0] === b[0]) {
      // 垂直线
      for (let i = 0; i < rects.length; i++) {
        let rect = rects[i];
        const { top, left, right, bottom } = getRectBounds(rect);
        if (
          minX > left - MIN_DISTANCE &&
          minX < right + MIN_DISTANCE &&
          minY < bottom + MIN_DISTANCE &&
          maxY > top - MIN_DISTANCE
        ) {
          return true;
        }
      }
    }
  
    return false;
  };

// 找出水平或垂直方向上最近的点
export const getNextPoint = (
    x: number,
    y: number,
    list: number[][],
    dir: "x" | "y"
  ): number[][] => {
    let index = dir === "x" ? 0 : 1; // 求水平方向上最近的点，那么它们y坐标都是相同的，要比较x坐标，反之亦然
    let value = dir === "x" ? x : y;
    let nextLeftTopPoint: number[] | null = null;
    let nextRightBottomPoint: number[] | null = null;
    for (let i = 0; i < list.length; i++) {
      let cur = list[i];
      // 检查当前点和目标点的连线是否穿过起终点元素，宽松模式下直接跳过该检测
      if (!easyMode && checkLineThroughElements([x, y], cur)) {
        continue;
      }
      // 左侧或上方最近的点
      if (cur[index] < value) {
        if (!nextLeftTopPoint || cur[index] > nextLeftTopPoint[index]) {
          nextLeftTopPoint = cur;
        }
      }
      // 右侧或下方最近的点
      if (cur[index] > value) {
        if (!nextRightBottomPoint || cur[index] < nextRightBottomPoint[index]) {
          nextRightBottomPoint = cur;
        }
      }
    }
    return [nextLeftTopPoint, nextRightBottomPoint].filter((point) => !!point) as number[][];
  };

// 找出一个点周边的点
export const getNextPoints = (point: number[], points: number[][]): number[][] => {
    let [x, y] = point;
    let xSamePoints: number[][] = [];
    let ySamePoints: number[][] = [];

    // 找出x或y坐标相同的点
    points.forEach((item) => {
        // 跳过目标点
        if (checkIsSamePoint(point, item)) {
            return;
        }
        if (item[0] === x) {
            xSamePoints.push(item);
        }
        if (item[1] === y) {
            ySamePoints.push(item);
        }
    });

    // 找出x方向最近的点
    let xNextPoints = getNextPoint(x, y, ySamePoints, "x");

    // 找出y方向最近的点
    let yNextPoints = getNextPoint(x, y, xSamePoints, "y");

    return [...xNextPoints, ...yNextPoints];
};

/**
 * 根据起始图形及起始点，计算路由
 * @param fromShape 
 * @param toShape 
 * @param fromPoint 
 * @param toPoint 
 */
export const getConnectionRoutes = (fromShape: IShape, toShape: IShape, fromPoint: IConnectionPoint, toPoint: IConnectionPoint, easy: boolean = false) => {
    const { startPoint, endPoint, fakeStartPoint, fakeEndPoint, points } = computedProbablyPoints(fromShape!, toShape!, fromPoint!, toPoint!, easy);
    const aStar = new AStar();
    const routes = aStar.start(fakeStartPoint, fakeEndPoint, points);
    // 把起止两个端点加入路由数组
    routes.unshift(startPoint);
    routes.push(endPoint);

    return routes;
}