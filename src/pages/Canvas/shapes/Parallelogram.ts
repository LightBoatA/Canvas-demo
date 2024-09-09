import { IConnectionPoint } from "../common";
import { Shape } from "./Shape";

export class Parallelogram extends Shape {
  public tangentAlpha: number;

  constructor(
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    fillColor: string,
    strokeColor: string,
    lineWidth: number,
    text: string,
    fontColor: string,
    fontSize: number,
    connectionPoints: IConnectionPoint[],
    tangentAlpha: number, // 额外的属性
    
    ) {
    super(id, x, y, width, height, fillColor, strokeColor, lineWidth, text, fontColor, fontSize, connectionPoints );
    this.tangentAlpha = tangentAlpha;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.setStyles(ctx);
    const rectangleEdge = this.tangentAlpha * this.height; // 使用this来访问实例属性
    const halfRectEdge = this.width / 2 - rectangleEdge;
    // 绘制平行四边形
    ctx.beginPath();
    ctx.moveTo(this.x - halfRectEdge, this.y - this.height / 2);
    ctx.lineTo(this.x + this.width / 2, this.y - this.height / 2);
    ctx.lineTo(this.x + halfRectEdge, this.y + this.height / 2);
    ctx.lineTo(this.x - this.width / 2, this.y + this.height / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    this.drawText(ctx);
  }
}
