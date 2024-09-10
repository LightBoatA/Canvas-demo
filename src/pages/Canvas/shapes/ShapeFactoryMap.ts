import { EShape } from "../../Toolbar/common";
import { CircleFactory, DiamondFactory, ParallelogramFactory, ReactangleFactory, RoundedRectFactory } from "./ShapeFactory";

export const shapeFactoryMap = {
  [EShape.RECT]: new ReactangleFactory(),
  [EShape.CIRCLE]: new CircleFactory(),
  [EShape.ROUNDED_RECT]: new RoundedRectFactory(),
  [EShape.DIAMOND]: new DiamondFactory(),
  [EShape.PARALLELOGRAM]: new ParallelogramFactory()
}