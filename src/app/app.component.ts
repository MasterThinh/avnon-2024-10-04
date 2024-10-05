import { AppService } from './app.service';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, OnInit, QueryList, ViewChild, ViewChildren, effect } from '@angular/core';

import { RouterOutlet } from '@angular/router';
import { RowComponent } from './components/row/row.component';
import { ParentCategoryComponent } from './components/parent-category/parent-category.component';
import { CellComponent, ICell } from './components/cell/cell.component';
import { FormsModule } from '@angular/forms';
import { CellService } from './components/cell/cell.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule, ParentCategoryComponent, RowComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, AfterViewInit {

  constructor(
    private appService: AppService,
    private cellService: CellService
  ) {
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

  cellRightClick = this.cellService.cellRightClick;
  moveArrow = this.cellService.moveArrow;

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
    this.cellService.updateMoveArrow(null)
  }, { allowSignalWrites: true })

  @ViewChild(`rightClickMenu`) rightClickMenu!: ElementRef;
  @ViewChildren(ParentCategoryComponent) parentCategoryChildren!: QueryList<ParentCategoryComponent>;

  @HostListener('document:contextmenu', ['$event'])
  rightClickout(event: any) {
    this.cellService.updateCellRightClick(null);
  }


  private handleFocusCell() {
    const moveAction = this.moveArrow()?.action;
    const cell = this.moveArrow()?.cell

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

    let cellUp!: CellComponent;
    let { indexParent, indexRow, indexCell } = { ...cell.position };

    let rowLengthOfParent = this.getParent(indexParent as number).rowChildren.length;
    let cellLengthOfRow = this.getRow(indexParent as number, indexRow as number).cellChildren.length;

    if (indexParent !== undefined && indexRow !== undefined && indexCell !== undefined) {
      do {
        if (indexRow > 0) {
          indexRow--;
        } else {
          indexParent--;
          indexRow = rowLengthOfParent - 1;
        }
        cellUp = this.getCell(indexParent, indexRow, indexCell);

      } while (cellUp && cellUp.cell().disabled)

      if (cellUp) {
        cellUp.focus();
      }
    }
  }

  private moveDown(cell: ICell) {
    let cellDown!: CellComponent;
    let { indexParent, indexRow, indexCell } = { ...cell.position };

    let rowLengthOfParent = this.getParent(indexParent as number).rowChildren.length;
    // let cellLengthOfRow = this.getRow(indexParent as number, indexRow as number).cellChildren.length;      

    if (indexParent !== undefined && indexRow !== undefined && indexCell !== undefined) {
      do {
        if (indexRow < rowLengthOfParent - 1) {
          indexRow++;
        } else {
          indexParent++;
          indexRow = 0;
        }
        cellDown = this.getCell(indexParent, indexRow, indexCell);

      } while (cellDown && cellDown.cell().disabled)

      if (cellDown) {
        cellDown.focus();
      }
    }
  }

  private moveLeft(cell: ICell) {

    let cellLeft!: CellComponent;
    let { indexParent, indexRow, indexCell } = { ...cell.position };

    let rowLengthOfParent = this.getParent(indexParent as number).rowChildren.length;
    let cellLengthOfRow = this.getRow(indexParent as number, indexRow as number).cellChildren.length;

    if (indexParent !== undefined && indexRow !== undefined && indexCell !== undefined) {
      do {
        if (indexCell > 0) {
          indexCell--
        } else if (indexRow > 0) {
          indexRow--;
          indexCell = cellLengthOfRow - 1;
        } else {
          indexParent--;
          indexRow = rowLengthOfParent - 1;
          indexCell = cellLengthOfRow - 1;
        }
        cellLeft = this.getCell(indexParent, indexRow, indexCell);

      } while (cellLeft && cellLeft.cell().disabled)

      if (cellLeft) {
        cellLeft.focus();
      }
    }
  }

  private moveRight(cell: ICell) {

    let cellRight!: CellComponent;
    let { indexParent, indexRow, indexCell } = { ...cell.position };

    let rowLengthOfParent = this.getParent(indexParent as number).rowChildren.length;
    let cellLengthOfRow = this.getRow(indexParent as number, indexRow as number).cellChildren.length;

    if (indexParent !== undefined && indexRow !== undefined && indexCell !== undefined) {
      do {
        if (indexCell < cellLengthOfRow - 1) {
          indexCell++
        } else if (indexRow < rowLengthOfParent - 1) {
          indexRow++;
          indexCell = 0;
        } else {
          indexParent++;
          indexRow = 0;
          indexCell = 0;
        }
        cellRight = this.getCell(indexParent, indexRow, indexCell);

      } while (cellRight && cellRight.cell().disabled)

      if (cellRight) {
        cellRight.focus();
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

  onApplyAllCellsForRow() {
    this.rightClickMenu.nativeElement.style.display = 'none';
    const cellRightClick = this.cellRightClick();
    this.appService.updateAllCellsForRow(cellRightClick?.cell as ICell);
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
