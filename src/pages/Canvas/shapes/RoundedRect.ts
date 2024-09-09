import { Shape } from "./Shape";

export class RoundedRect extends Shape {
  draw(ctx: CanvasRenderingContext2D): void {
    this.setStyles(ctx);
    ctx.beginPath();
    ctx.roundRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height, this.height / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    this.drawText(ctx);
  }
}
