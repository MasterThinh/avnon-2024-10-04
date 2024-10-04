import { AppService } from './../../app.service';
import { Component, QueryList, ViewChildren, input, model, output } from '@angular/core';
import { CellComponent, ICell } from '../cell/cell.component';
import { RowComponent } from '../row/row.component';

@Component({
  selector: 'app-parent-category, [appParentCategory]',
  standalone: true,
  imports: [CellComponent, RowComponent],
  templateUrl: './parent-category.component.html',
  styleUrl: './parent-category.component.scss'
})
export class ParentCategoryComponent {

  constructor(private appService: AppService) { }

  parentCategory = model.required<Array<ICell[]>>()
  subTotalsParentCategory = model.required<ICell[]>()

  add = input<boolean>(false)
  addCategory = output<number>();
  remove = input<boolean>(false)
  removeCategory = output<number>();
  removeParent = input<boolean>(false)
  removeParentCategory = output();

  // rowChildren = viewChildren<RowComponent>(RowComponent);
  @ViewChildren(`row`) rowChildren!:  QueryList<RowComponent>;


  onAddCategoryAtIndex(indexItemCategory: number) {
    this.addCategory.emit(indexItemCategory)
  }

  onRemoveCategoryAtIndex(indexItemCategory: number) {
    this.removeCategory.emit(indexItemCategory)
  }

  onRemoveParentCategoryAtIndex() {
    this.removeParentCategory.emit()
  }

  onRowIncomeChange(evt: ICell[], indexItemCategory: number) {
    this.parentCategory.update(items => {
      return items.map((item, index) => {
        return indexItemCategory === index ? evt : item;
      })
    })
  }

}
