import { Component, QueryList, ViewChildren, effect, input, model, output, signal, viewChildren } from '@angular/core';
import { CellComponent, ICell } from '../cell/cell.component';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-row, [appRow]',
  standalone: true,
  imports: [CommonModule, CellComponent],
  templateUrl: './row.component.html',
  styleUrl: './row.component.scss'
})
export class RowComponent {

  row = model.required<ICell[]>()

  onCellChange(evt: ICell, indexCell: number) {
    this.row.update(items => {
      return items.map((item, index) => {
        return indexCell === index ? evt : item;
      })
    })
  }

  @ViewChildren(CellComponent) cellChildren!: QueryList<CellComponent>;

  // add = input<boolean>(false)
  // addCategory = output();
  // remove = input<boolean>(false)
  // removeCategory = output();

  // onAddCategory() {
  //   this.addCategory.emit()
  // }

  // onRemoveCategory() {
  //   this.removeCategory.emit()
  // }

}
