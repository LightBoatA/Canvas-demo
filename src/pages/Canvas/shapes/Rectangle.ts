import { Shape } from "./Shape";

export class Rectangle extends Shape {
  draw(ctx: CanvasRenderingContext2D): void {
    this.setStyles(ctx);
    ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    ctx.strokeRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    this.drawText(ctx);
  }
}
