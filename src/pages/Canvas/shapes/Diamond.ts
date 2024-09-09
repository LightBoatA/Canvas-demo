import { Shape } from "./Shape";

export class Diamond extends Shape {
  draw(ctx: CanvasRenderingContext2D): void {
    this.setStyles(ctx);
    ctx.beginPath();
    ctx.moveTo(this.x, this.y - this.height / 2); // 上方顶点
    ctx.lineTo(this.x + this.width / 2, this.y);
    ctx.lineTo(this.x, this.y + this.height / 2);
    ctx.lineTo(this.x - this.width / 2, this.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    this.drawText(ctx);
  }
}