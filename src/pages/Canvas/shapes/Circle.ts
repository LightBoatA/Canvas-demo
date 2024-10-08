import { Shape } from "./Shape";

export class Circle extends Shape {
  draw(ctx: CanvasRenderingContext2D): void {
    this.setStyles(ctx);
    ctx.beginPath();
    ctx.ellipse(this.x, this.y, this.width / 2, this.height / 2, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    this.drawText(ctx);
  }
}