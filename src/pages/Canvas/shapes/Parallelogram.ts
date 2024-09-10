import { IConnectionPoint, IShape } from "../common";
import { Shape } from "./Shape";

export class Parallelogram extends Shape {
  private readonly tangentAlpha: number;

  constructor(
    shapeData: IShape,
    tangentAlpha: number, // 额外的属性
    
    ) {
    super(shapeData);
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
