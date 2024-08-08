import { IConnection, IShape } from "../pages/Canvas/common";

export interface IHistoryState {
  shapes: IShape[];
  connections: IConnection[];
}

