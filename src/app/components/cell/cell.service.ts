import { Injectable, signal } from '@angular/core';
import { ICell, IMove, IRightClick } from './cell.component';

@Injectable({
  providedIn: 'root'
})
export class CellService {

  constructor() { }

  moveArrow = signal<IMove | null>(null)
  updateMoveArrow(move: IMove | null) {
    this.moveArrow.update(() => move);
  }

  cellRightClick = signal<IRightClick | null>(null)
  updateCellRightClick(rightClick: IRightClick | null) {
    this.cellRightClick.update(() => rightClick);
  }

  create(cell?: Partial<ICell>): ICell {
    return {
      value: cell?.value || '',
      isCellOfMonth: cell?.isCellOfMonth || false,
      isNumber: cell?.isNumber || false,
      edit: cell?.edit || false,
      disabled: cell?.disabled || false
    }
  }

}
