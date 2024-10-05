import { CellService } from './cell.service';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild, effect, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface ICell {
  value: any;
  isNumber: boolean;
  isCellOfMonth: boolean,
  disabled: boolean,
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

export interface IRightClick {
  cell: ICell;
  clickPosition: { pageX: number, pageY: number }
}


@Component({
  selector: 'app-cell',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cell.component.html',
  styleUrl: './cell.component.scss'
})
export class CellComponent {

  constructor(
    private cellService: CellService,
  ) {

  }

  input = model('');
  cell = model.required<ICell>()
  isEditing = signal<boolean>(false)

  // inputCellViewChild = viewChild<ElementRef>(`inputCell`)
  @ViewChild(`inputCell`) inputCellViewChild!: ElementRef;

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    this.cellService.updateCellRightClick(null);

  }

  effectInput = effect(() => {
    this.cell.update((item) => ({ ...item, value: this.input() }))
  }, { allowSignalWrites: true })


  focus() {
    console.log(`focus`);
    this.inputCellViewChild?.nativeElement.focus();
  }

  onKeyDown(evt: KeyboardEvent) {
    const key = evt.key;
    if (key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight') {
      this.cellService.updateMoveArrow({ cell: this.cell(), action: key })
    } else {

      if (key == 'Enter') {
        this.cellService.updateMoveArrow({ cell: this.cell(), action: 'ArrowDown' })
        return;
      }

      if (this.isEditing() === false && key !== 'Tab') {
        this.isEditing.update(() => true);
        this.input.update(() => '')
      }
    }
  }

  onRightClick(evt: PointerEvent) {
    if (this.cell().edit) {
      evt.preventDefault();
      evt.stopPropagation();
      this.cellService.updateCellRightClick({ cell: this.cell(), clickPosition: { pageX: evt.pageX, pageY: evt.pageY } });
    }
  }

  onChangeEditMode() {
    this.isEditing.update((item) => (true));
  }

  onChangeViewMode() {
    this.isEditing.update((item) => (false));
  }





}
