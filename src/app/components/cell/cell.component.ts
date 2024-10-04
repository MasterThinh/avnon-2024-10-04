import { AppService } from './../../app.service';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, effect, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface ICell {
  value: any;
  isNumber: boolean;
  edit: boolean;
  position?: {
    indexParent: number,
    indexRow: number,
    indexCell: number
  }
}

export interface IMove {
  cell: ICell
  action: 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight'
}

@Component({
  selector: 'app-cell',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cell.component.html',
  styleUrl: './cell.component.scss'
})
export class CellComponent {

  constructor(private appService: AppService) {

  }

  input = model('');
  cell = model.required<ICell>()
  isEditing = signal<boolean>(false)

  // inputCellViewChild = viewChild<ElementRef>(`inputCell`)
  @ViewChild(`inputCell`) inputCellViewChild!: ElementRef;

  effectInput = effect(() => {
    this.cell.update((item) => ({ ...item, value: this.input() }))
  }, { allowSignalWrites: true })

  // onChangeCell(cellValue: any) {
  //   this.cell.update((item) => ({...item, value: cellValue}))
  // }

  focus() {
    this.inputCellViewChild?.nativeElement.focus();
  }

  onKeyDown(evt: KeyboardEvent) {

    if (!this.isEditing()) {
      const key = evt.key;
      if (key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight') {
        this.appService.updateMoveArrow({ cell: this.cell(), action: key })
      }
    }
  }

  onChangeEditMode() {
    this.isEditing.update((item) => (true));
  }

  onChangeViewMode() {
    this.isEditing.update((item) => (false));
  }


}
