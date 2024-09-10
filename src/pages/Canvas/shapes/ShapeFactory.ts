import { getCryptoUuid } from "../../../utils/util";
import { EShape } from "../../Toolbar/common";
import { COLOR_BORDER, COLOR_SHAPE, EConnectPointDirection, COLOR_FONT, IConnectionPoint, INIT_SHAPE_WIDTH, IShape, getConnectionPointVal } from "../common";

abstract class BaseShapeFactory {
  protected abstract getType(): EShape;
  protected abstract getDimensions(): { width: number, height: number };
  protected getSpecialProps(): Partial<IShape> {
    return {};
  }

  createShapeData(x: number, y: number): IShape {
    const id = getCryptoUuid();
    const { width, height } = this.getDimensions();
    const connectionPoints: IConnectionPoint[] = [
      getConnectionPointVal(x, y, width, height, EConnectPointDirection.TOP),
      getConnectionPointVal(x, y, width, height, EConnectPointDirection.RIGHT),
      getConnectionPointVal(x, y, width, height, EConnectPointDirection.BOTTOM),
      getConnectionPointVal(x, y, width, height, EConnectPointDirection.LEFT)
    ];
    return {
      id,
      type: this.getType(),
      x,
      y,
      width,
      height,
      connectionPoints,
      strokeColor: COLOR_BORDER,
      fillColor: COLOR_SHAPE,
      fontColor: COLOR_FONT,
      fontSize: 14,
      lineWidth: 2,
      text: '',
      ...this.getSpecialProps(), // 添加特定的属性
    }
  }
}

export class ReactangleFactory extends BaseShapeFactory {
  protected getType(): EShape {
    return EShape.RECT;
  }

  protected getDimensions(): { width: number; height: number; } {
    return { width: INIT_SHAPE_WIDTH, height: INIT_SHAPE_WIDTH / 2 };
  }
}

export class CircleFactory extends BaseShapeFactory {
  protected getType(): EShape {
    return EShape.CIRCLE;
  }

  protected getDimensions(): { width: number; height: number } {
    return { width: INIT_SHAPE_WIDTH, height: INIT_SHAPE_WIDTH };
  }
}

export class DiamondFactory extends BaseShapeFactory {
  protected getType(): EShape {
    return EShape.DIAMOND;
  }

  protected getDimensions(): { width: number; height: number } {
    return { width: INIT_SHAPE_WIDTH + 32, height: 64 };
  }
}

export class RoundedRectFactory extends BaseShapeFactory {
  protected getType(): EShape {
    return EShape.ROUNDED_RECT;
  }

  protected getDimensions(): { width: number; height: number } {
    return { width: INIT_SHAPE_WIDTH, height: INIT_SHAPE_WIDTH / 2 };
  }
}

export class ParallelogramFactory extends BaseShapeFactory {
  protected getType(): EShape {
    return EShape.PARALLELOGRAM;
  }

  protected getDimensions(): { width: number; height: number } {
    return { width: INIT_SHAPE_WIDTH + 32, height: INIT_SHAPE_WIDTH / 2 };
  }

  protected getSpecialProps(): Partial<IShape> {
    return { tangentAlpha: 0.6 };
  }
}