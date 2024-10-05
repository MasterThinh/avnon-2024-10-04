import { AppService } from './../../app.service';
import { Component, QueryList, ViewChildren, model } from '@angular/core';
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

  @ViewChildren(`row`) rowChildren!:  QueryList<RowComponent>;

  onRowIncomeChange(evt: ICell[], indexItemCategory: number) {
    this.parentCategory.update(items => {
      return items.map((item, index) => {
        return indexItemCategory === index ? evt : item;
      })
    })
  }

}
