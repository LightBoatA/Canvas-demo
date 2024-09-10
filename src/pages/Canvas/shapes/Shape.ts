import { COLOR_BORDER, COLOR_BORDER_HOVER, CONNECT_POINT_RADIUS, IConnectionPoint, IShape, IShapeConnectionPoint } from '../common';

export abstract class Shape {
  public readonly id: string;

  protected readonly x: number;

  protected readonly y: number;

  protected readonly width: number;

  protected readonly height: number;

  protected readonly fillColor: string;

  protected readonly strokeColor: string;

  protected readonly lineWidth: number;

  protected readonly text: string;

  protected readonly fontColor: string;

  protected readonly fontSize: number;
  
  protected readonly connectionPoints: IConnectionPoint[];

  constructor({ id, x, y, width, height, fillColor, strokeColor, lineWidth, text, fontColor, fontSize, connectionPoints }: IShape) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.fillColor = fillColor;
    this.strokeColor = strokeColor;
    this.lineWidth = lineWidth;
    this.text = text;
    this.fontColor = fontColor;
    this.fontSize = fontSize;
    this.connectionPoints = connectionPoints;
  }

  abstract draw(ctx: CanvasRenderingContext2D): void;

  protected setStyles(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.fillColor;
    ctx.strokeStyle = this.strokeColor;
    ctx.lineWidth = this.lineWidth;
  }

  protected drawText(ctx: CanvasRenderingContext2D) {
    if (this.text) {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = this.fontColor;
      ctx.font = `${this.fontSize}px sans-serif`;

      const words = this.text.split('');
      let line = '';
      let lines: string[] = [];

      // 分割文字成多行
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + '';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;

        if (testWidth > this.width && n > 0) {
          lines.push(line);
          line = words[n] + '';
        } else {
          line = testLine;
        }
      }
      lines.push(line); // 添加最后一行

      // 计算总的文本高度，用于垂直居中
      const lineHeight = this.fontSize + 5; // 假设行高为字体大小加 5
      const totalHeight = lines.length * lineHeight;
      const startY = this.y - totalHeight / 2 + lineHeight / 2;
      const startX = this.x;

      // 绘制每一行，并保持垂直居中
      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], startX, startY + i * lineHeight);
      }
    }
  }

  protected drawHoveringShape = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = COLOR_BORDER;
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
  };

  protected drawConnectPoints = (ctx: CanvasRenderingContext2D, hovingConnectionPoint: IShapeConnectionPoint | null) => {
    ctx.fillStyle = '#FFF';
    ctx.lineWidth = 1;
    this.connectionPoints.forEach(point => {
      const { x: _x, y: _y } = point;
      const ishovering = hovingConnectionPoint && hovingConnectionPoint.shape.id === this.id && hovingConnectionPoint.point.direction === point.direction;
      ctx.strokeStyle = ishovering ? COLOR_BORDER_HOVER : COLOR_BORDER;
      ctx.lineWidth = ishovering ? 2 : 1;
      ctx.beginPath();
      ctx.arc(_x, _y, CONNECT_POINT_RADIUS, 0, 2 * Math.PI, false);
      ctx.fill();
      ctx.stroke();
    });
  };

  public drawHoverEffect(ctx: CanvasRenderingContext2D, hovingConnectionPoint: IShapeConnectionPoint | null) {
    this.drawHoveringShape(ctx);
    this.drawConnectPoints(ctx, hovingConnectionPoint);
  }
}
