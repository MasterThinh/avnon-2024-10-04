import { AppService } from './app.service';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, OnInit, QueryList, ViewChild, ViewChildren, effect } from '@angular/core';

import { RouterOutlet } from '@angular/router';
import { RowComponent } from './components/row/row.component';
import { ParentCategoryComponent } from './components/parent-category/parent-category.component';
import { CellComponent, ICell } from './components/cell/cell.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule, ParentCategoryComponent, RowComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, AfterViewInit {

  constructor(private appService: AppService) {
  }

  fromDate = this.appService.fromDate;
  toDate = this.appService.toDate;
  months = this.appService.months;
  incomeParentCategories = this.appService.incomes;
  subTotalsIncomeParentCategories = this.appService.subTotalsIncomes;
  totalsIncomeParentCategories = this.appService.totalsIncomes;

  expensesParentCategories = this.appService.expenses;
  subTotalsExpensesParentCategories = this.appService.subTotalsExpenses;
  totalsExpensesParentCategories = this.appService.totalsExpenses;

  profitLoss = this.appService.profitLoss;
  openingBalance = this.appService.openingBalance;
  closeingBalance = this.appService.closingBalance;

  cellRightClick = this.appService.cellRightClick;

  effectRightClick = effect(() => {
    const cellRightClick = this.cellRightClick();
    if (cellRightClick) {
      this.rightClickMenu.nativeElement.style.display = 'block';
      this.rightClickMenu.nativeElement.style.top = cellRightClick.clickPosition.pageY + 'px';
      this.rightClickMenu.nativeElement.style.left = cellRightClick.clickPosition.pageX + 'px';
    } else {
      this.rightClickMenu.nativeElement.style.display = 'none';
    }
  })



  effectMonth = effect(() => {
    if (this.months().length > 0) {
      if (this.parentCategoryChildren.toArray().length) {
        this.parentCategoryChildren.toArray()[0].rowChildren.toArray()[0].cellChildren.toArray()[0].focus();
      }
    }
  })

  effectMoveArrow = effect(() => {
    this.handleFocusCell();
  })

  @ViewChild(`rightClickMenu`) rightClickMenu!: ElementRef;
  @ViewChildren(ParentCategoryComponent) parentCategoryChildren!: QueryList<ParentCategoryComponent>;

  @HostListener('document:contextmenu', ['$event'])
  rightClickout(event: any) {
    this.appService.updateCellRightClick(null);
  }


  private handleFocusCell() {
    const moveAction = this.appService.moveArrow()?.action;
    const cell = this.appService.moveArrow()?.cell

    switch (moveAction) {
      case 'ArrowLeft':
        cell && this.moveLeft(cell);
        break;

      case 'ArrowRight':
        cell && this.moveRight(cell);
        break;

      case 'ArrowDown':
        cell && this.moveDown(cell);
        break;

      case 'ArrowUp':
        cell && this.moveUp(cell);
        break;

    }
  }

  private moveUp(cell: ICell) {

    let parentUp: ParentCategoryComponent;
    let rowUp: RowComponent;
    let cellRight: CellComponent;

    let { indexParent, indexRow, indexCell } = { ...cell.position };

    if (indexParent !== undefined && indexRow !== undefined && indexCell !== undefined) {

      rowUp = this.getRow(indexParent, indexRow - 1);
      cellRight = this.getCell(indexParent, indexRow - 1, indexCell)
      if (cellRight) {
        cellRight.focus()
        return;
      }


      if (indexParent - 1 >= 0) {
        parentUp = this.getParent(indexParent - 1);
        rowUp = this.getRow(indexParent - 1, 0);
        cellRight = this.getCell(indexParent - 1, parentUp.rowChildren.length - 1, indexCell)
        if (cellRight) {
          cellRight.focus()
          return;
        }
      }
    }
  }

  private moveDown(cell: ICell) {
    let cellDown: CellComponent;
    let { indexParent, indexRow, indexCell } = { ...cell.position };

    if (indexParent !== undefined && indexRow !== undefined && indexCell !== undefined) {

      cellDown = this.getCell(indexParent, indexRow + 1, indexCell)
      if (cellDown) {
        cellDown.focus()
        return;
      }

      cellDown = this.getCell(indexParent + 1, 0, indexCell)
      if (cellDown) {
        cellDown.focus()
        return;
      }
    }
  }

  private moveLeft(cell: ICell) {

    let parentUp: ParentCategoryComponent;
    let rowUp: RowComponent;
    let cellRight: CellComponent;

    let { indexParent, indexRow, indexCell } = { ...cell.position };

    if (indexParent !== undefined && indexRow !== undefined && indexCell !== undefined) {

      cellRight = this.getCell(indexParent, indexRow, indexCell - 1)
      if (cellRight) {
        cellRight.focus()
        return;
      }

      rowUp = this.getRow(indexParent, indexRow - 1);
      cellRight = this.getCell(indexParent, indexRow - 1, rowUp?.cellChildren.length - 1)
      if (cellRight) {
        cellRight.focus()
        return;
      }


      if (indexParent - 1 >= 0) {
        parentUp = this.getParent(indexParent - 1);
        rowUp = this.getRow(indexParent - 1, 0);
        cellRight = this.getCell(indexParent - 1, parentUp.rowChildren.length - 1, rowUp.cellChildren.length - 1)
        if (cellRight) {
          cellRight.focus()
          return;
        }
      }
    }
  }

  private moveRight(cell: ICell) {

    let cellRight: CellComponent;
    let { indexParent, indexRow, indexCell } = { ...cell.position };

    if (indexParent !== undefined && indexRow !== undefined && indexCell !== undefined) {

      cellRight = this.getCell(indexParent, indexRow, indexCell + 1)
      if (cellRight) {
        cellRight.focus()
        return;
      }

      cellRight = this.getCell(indexParent, indexRow + 1, 0)
      if (cellRight) {
        cellRight.focus()
        return;
      }

      cellRight = this.getCell(indexParent + 1, 0, 0)
      if (cellRight) {
        cellRight.focus()
        return;
      }

    }
  }

  private getParent(indexParent: number) {
    return this.parentCategoryChildren.toArray()[indexParent];
  }

  private getRow(indexParent: number, indexRow: number) {
    return this.parentCategoryChildren.toArray()[indexParent]?.rowChildren.toArray()[indexRow];
  }

  private getCell(indexParent: number, indexRow: number, indexCell: number) {
    return this.parentCategoryChildren.toArray()[indexParent]?.rowChildren.toArray()[indexRow]?.cellChildren.toArray()[indexCell];
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.getCell(0, 0, 0).focus();
    }, 0);
  }


  onIncomeParentCategoryChange(evt: Array<ICell[]>, indexItemCategory: number) {
    this.appService.updateIncomesByIndex(evt, indexItemCategory);
  }

  onExpensesParentCategoryChange(evt: Array<ICell[]>, indexItemCategory: number) {
    this.appService.updateExpensesByIndex(evt, indexItemCategory);

  }

  onApplyAll() {
    this.rightClickMenu.nativeElement.style.display = 'none';
    const cellRightClick = this.cellRightClick();
    this.appService.applyValueAllCell(cellRightClick?.cell.value);
  }

  onDeleteRow() {
    this.rightClickMenu.nativeElement.style.display = 'none';
    const cellRightClick = this.cellRightClick();
    this.appService.deleteRowOfParentAtIndex(cellRightClick?.cell.position?.indexParent as number, cellRightClick?.cell.position?.indexRow as number);
  }

  onDeleteParent() {
    this.rightClickMenu.nativeElement.style.display = 'none';
    const cellRightClick = this.cellRightClick();
    this.appService.deleteParentAtIndex(cellRightClick?.cell.position?.indexParent as number);
  }

  onInsertRow() {
    this.rightClickMenu.nativeElement.style.display = 'none';
    const cellRightClick = this.cellRightClick();
    this.appService.insertRowOfParentAtIndex(cellRightClick?.cell.position?.indexParent as number, cellRightClick?.cell.position?.indexRow as number);
  }

  onInsertParent() {
    this.rightClickMenu.nativeElement.style.display = 'none';
    const cellRightClick = this.cellRightClick();
    this.appService.insertParentAtIndex(cellRightClick?.cell.position?.indexParent as number);
  }

}
