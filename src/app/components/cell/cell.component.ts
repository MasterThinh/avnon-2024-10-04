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
  @ViewChild(`menu`) menu!: ElementRef;

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.menu.nativeElement.style.display = 'none';
    }
  }

  @HostListener('document:contextmenu', ['$event'])
  rightClickout(event: any) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.menu.nativeElement.style.display = 'none';
    }
  }

  effectInput = effect(() => {
    this.menu.nativeElement.style.display = 'none';
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
      if (this.isEditing() === false && key !== 'Tab') {
        this.isEditing.update(() => true);
        this.input.update(() => '')
      }
    }
  }

  onRightClick(evt: PointerEvent) {
    evt.preventDefault();
    this.menu.nativeElement.style.display = 'block';
    this.menu.nativeElement.style.top = evt.pageY + 'px';
    this.menu.nativeElement.style.left = evt.pageX + 'px';
  }

  disappearContext() {
    this.menu.nativeElement.style.display = 'none';
  }

  onChangeEditMode() {
    this.isEditing.update((item) => (true));
  }

  onChangeViewMode() {
    this.isEditing.update((item) => (false));
  }

  onApplyAll() {
    this.menu.nativeElement.style.display = 'none';
    this.appService.applyValueAllCell(this.input());
  }

  onDeleteRow() {
    this.menu.nativeElement.style.display = 'none';
    this.appService.deleteRowOfParentAtIndex(this.cell().position?.indexParent as number, this.cell().position?.indexRow as number);
  }

  onDeleteParent() {
    this.menu.nativeElement.style.display = 'none';
    this.appService.deleteParentAtIndex(this.cell().position?.indexParent as number);
  }

  onInsertRow() {
    this.menu.nativeElement.style.display = 'none';
    this.appService.insertRowOfParentAtIndex(this.cell().position?.indexParent as number, this.cell().position?.indexRow as number);
  }

  onInsertParent() {
    this.menu.nativeElement.style.display = 'none';
    this.appService.insertParentAtIndex(this.cell().position?.indexParent as number);
  }

}
