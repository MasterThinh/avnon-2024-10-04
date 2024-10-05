import { AppService } from './../../app.service';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild, effect, model, signal } from '@angular/core';
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

  constructor(private appService: AppService, private elementRef: ElementRef) {

  }

  input = model('');
  cell = model.required<ICell>()
  isEditing = signal<boolean>(false)

  // inputCellViewChild = viewChild<ElementRef>(`inputCell`)
  @ViewChild(`inputCell`) inputCellViewChild!: ElementRef;
  // @ViewChild(`menu`) menu!: ElementRef;

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    this.appService.updateCellRightClick(null);
    // if (!this.elementRef.nativeElement.contains(event.target)) {
    //   this.menu.nativeElement.style.display = 'none';
    // }
  }

  // @HostListener('document:contextmenu', ['$event'])
  // rightClickout(event: any) {
  //   if (!this.elementRef.nativeElement.contains(event.target)) {
  //     this.menu.nativeElement.style.display = 'none';
  //   }
  // }

  effectInput = effect(() => {
    this.cell.update((item) => ({ ...item, value: this.input() }))
  }, { allowSignalWrites: true })


  focus() {
    this.inputCellViewChild?.nativeElement.focus();
  }

  onKeyDown(evt: KeyboardEvent) {

    const key = evt.key;
    if (key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight') {
      this.appService.updateMoveArrow({ cell: this.cell(), action: key })
    } else {

      if (key == 'Enter') {
        this.appService.updateMoveArrow({ cell: this.cell(), action: 'ArrowDown' })
        return;
      }

      if (this.isEditing() === false && key !== 'Tab') {
        this.isEditing.update(() => true);
        this.input.update(() => '')
      }
    }
  }

  onRightClick(evt: PointerEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    this.appService.updateCellRightClick({ cell: this.cell(), clickPosition: { pageX: evt.pageX, pageY: evt.pageY } });
  }

  onChangeEditMode() {
    this.isEditing.update((item) => (true));
  }

  onChangeViewMode() {
    this.isEditing.update((item) => (false));
  }





}
