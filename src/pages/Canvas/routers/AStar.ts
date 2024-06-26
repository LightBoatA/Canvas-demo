import { checkIsSamePoint, getNextPoints } from "./utils";

// A*算法类
export default class AStar {

  startPoint: number[] | null;

  endPoint: number[] | null;

  pointList: number[][];

  openList: { point: number[], cost: number, parent: any }[];

  closeList: { point: number[], cost: number, parent: any }[];

  constructor() {
    this.startPoint = null;
    this.endPoint = null;
    this.pointList = [];
    this.openList = [];
    this.closeList = [];
  }

  // 算法主流程
  start(startPoint: number[], endPoint: number[], pointList: number[][]): number[][] {
    this.startPoint = startPoint;
    this.endPoint = endPoint;
    this.pointList = pointList;
    this.openList = [
      {
        point: this.startPoint, // 起点加入openList
        cost: 0, // 代价
        parent: null, // 父节点
      },
    ];
    this.closeList = [];
    while (this.openList.length) {
      // 在openList中找出优先级最高的点
      let point = this.getBestPoint();
      if (!point) {
        return [];
      }
      // point为终点，那么算法结束，输出最短路径
      if (checkIsSamePoint(point.point, this.endPoint)) {
        return this.getRoutes(point);
      } else {
        // 将point从openList中删除
        this.removeFromOpenList(point);
        // 将point添加到closeList中
        this.closeList.push(point);
        // 遍历point周围的点
        let nextPoints = getNextPoints(point.point, this.pointList);
        for (let i = 0; i < nextPoints.length; i++) {
          let cur = nextPoints[i];
          // 如果该点在closeList中，那么跳过该点
          if (this.checkIsInList(cur, this.closeList)) {
            continue;
          } else if (!this.checkIsInList(cur, this.openList)) {
            // 如果该点也不在openList中
            let pointObj = {
              point: cur,
              parent: point,// 设置point为当前点的父节点
              cost: 0,
            };
            // 计算当前点的代价
            this.computeCost(pointObj);
            // 添加到openList中
            this.openList.push(pointObj);
          }
        }
      }
    }
    return [];
  }

  // 获取openList中优先级最高的点
  getBestPoint(): { point: number[], cost: number, parent: any } | null {
    let min = Infinity;
    let point = null;
    this.openList.forEach((item) => {
      if (item.cost < min) {
        point = item;
        min = item.cost;
      }
    });
    return point;
  }

  // 从point出发，找出其所有祖宗节点，也就是最短路径
  getRoutes(point: { point: number[], cost: number, parent: any }): number[][] {
    let res = [point];
    let par = point.parent;
    while (par) {
      res.unshift(par);
      par = par.parent;
    }
    return res.map((item) => {
      return item.point;
    });
  }

  // 将点从openList中删除
  removeFromOpenList(point: { point: number[], cost: number, parent: any }) {
    let index = this.openList.findIndex((item) => {
      return checkIsSamePoint(point.point, item.point);
    });
    this.openList.splice(index, 1);
  }

  // 检查点是否在列表中
  checkIsInList(point: number[], list: { point: number[], cost: number, parent: any }[]): boolean {
    return list.find((item) => {
      return checkIsSamePoint(item.point, point);
    }) !== undefined;
  }

  // 计算一个点的代价
  computeCost(point: { point: number[], cost: number, parent: any }) {
    point.cost = this.computedGCost(point) + this.computedHCost(point);
  }

  // 计算代价g(n)
  computedGCost(point: { parent: any }): number {
    let res = 0;
    let par = point.parent;
    while (par) {
      res += par.cost;
      par = par.parent;
    }
    return res;
  }

  // 计算代价h(n)，曼哈顿距离
  computedHCost(point: { point: number[] }): number {
    return (
      Math.abs(this.endPoint![0] - point.point[0]) +
      Math.abs(this.endPoint![1] - point.point[1])
    );
  }
}
