import { Injectable, computed, effect, signal } from '@angular/core';
import moment from 'moment';
import { ICell, IMove } from './components/cell/cell.component';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  fromDate = signal<string>(`2024-01`);
  toDate = signal<string>(`2024-12`);

  months = computed(() => {
    const momentFromDate = moment.utc(this.fromDate());
    const momentToDate = moment.utc(this.toDate());
    const diffMonth = moment(momentToDate).diff(momentFromDate, 'month');
    if (!this.fromDate() || diffMonth < 0) {
      return [];
    }

    const months = Array(diffMonth + 1).fill(null).map((month, i) => {
      return moment.utc(momentFromDate).add(i, 'M').toISOString()
    });

    return months
  })

  effectMonth = effect(() => {

    if (this.months().length > 0) {
      this.incomes.set([
        this.createParentCategoryRows()
      ])

      this.expenses.set([
        this.createParentCategoryRows()
      ])
    } else {
      this.incomes.set([])
      this.expenses.set([])
    }

  }, { allowSignalWrites: true })

  incomes = signal<Array<Array<ICell[]>>>([]);

  expenses = signal<Array<Array<ICell[]>>>([]);

  subTotalsIncomes = computed(() => {
    const subTotalIncomes = this.incomes().map(itemParentCategory => {
      return itemParentCategory.reduce((acc, current) => {
        return acc.map((item, index) => {

          if (index < acc.length - this.months().length) {
            return item
          }

          return {
            ...item,
            edit: false,
            value: Number(item.value) + Number(current[index].value)
          }
        });

      }, this.createTotalRow(`Sub Totals`))
    })
    return subTotalIncomes;
  })

  totalsIncomes = computed(() => {
    const totalsIncomes = this.subTotalsIncomes().reduce((acc, current) => {
      return acc.map((item, index) => {

        if (index < acc.length - this.months().length) {
          return item
        }

        return {
          ...item,
          edit: false,
          value: Number(item.value) + Number(current[index].value)
        }
      });

    }, this.createTotalRow(`Income Total`))

    return totalsIncomes;
  })

  subTotalsExpenses = computed(() => {
    const subTotalExpenses = this.expenses().map(itemParentCategory => {
      return itemParentCategory.reduce((acc, current) => {
        return acc.map((item, index) => {

          if (index < acc.length - this.months().length) {
            return item
          }

          return {
            ...item,
            edit: false,
            value: Number(item.value) + Number(current[index].value)
          }
        });

      }, this.createTotalRow(`Sub Totals`))
    })
    return subTotalExpenses;
  })

  totalsExpenses = computed(() => {
    const totalsExpenses = this.subTotalsExpenses().reduce((acc, current) => {
      return acc.map((item, index) => {

        if (index < acc.length - this.months().length) {
          return item
        }

        return {
          ...item,
          edit: false,
          value: Number(item.value) + Number(current[index].value)
        }
      });

    }, this.createTotalRow(`Total Expenses`))

    return totalsExpenses;
  })

  effectSetIndexIncome = effect(() => {

    this.incomes.update((items => {
      return items.map((itemParent, indexParent) => {
        return itemParent.map((itemRow, indexRow) => {
          return itemRow.map((itemCell, indexCell) => {
            return {
              ...itemCell,
              position: {
                indexParent: indexParent,
                indexRow: indexRow,
                indexCell: indexCell
              }
            }
          })
        })
      });
    }))

    this.incomes();

  }, { allowSignalWrites: true })

  effectSetIndexExpenses = effect(() => {

    this.expenses.update((items => {
      return items.map((itemParent, indexParent) => {
        return itemParent.map((itemRow, indexRow) => {
          return itemRow.map((itemCell, indexCell) => {
            return {
              ...itemCell,
              position: {
                indexParent: indexParent + this.incomes().length,
                indexRow: indexRow,
                indexCell: indexCell
              }
            }
          })
        })
      });
    }))

    this.expenses();

  }, { allowSignalWrites: true })

  profitLoss = computed(() => {
    let profitLoss = this.createTotalRow(`Profit / Loss`);
    return profitLoss.map((item, index) => {
      if (index < profitLoss.length - this.months().length) {
        return item
      }
      return {
        ...item,
        value: Number(this.totalsIncomes()[index].value) - Number(this.totalsExpenses()[index].value)
      }
    })
  })

  openingBalance = computed(() => {
    let openingBalance = this.createTotalRow(`Opening Balance`);
    let curOpeningBalance = 0;

    return openingBalance.map((item, index) => {

      if (index < openingBalance.length - this.months().length) {
        return item
      }

      return {
        ...item,
        value: (index === openingBalance.length - this.months().length) ? 0 : this.closingBalance()[index - 1].value
      }
    })
  })

  closingBalance = computed(() => {
    let closingBalance = this.createTotalRow(`Closing Balance`);
    let curClosingBalance = 0;

    return closingBalance.map((item, index) => {

      if (index < closingBalance.length - this.months().length) {
        return item
      }

      curClosingBalance += Number(this.totalsIncomes()[index].value) - Number(this.totalsExpenses()[index].value);

      return {
        ...item,
        value: curClosingBalance
      }
    })
  })

  moveArrow = signal<IMove | null>(null)

  updateMoveArrow(move: IMove) {
    this.moveArrow.update(() => move)
  }

  createCategoryRow(name = ''): ICell[] {
    return [
      {
        value: name,
        isNumber: false,
        edit: true
      },
      ...this.months().map(elMonthYear => {
        return {
          value: null,
          isNumber: true,
          edit: true
        }
      })]
  }

  createParentCategoryRows(): Array<ICell[]> {
    return [
      this.createCategoryRow(),
      this.createCategoryRow(),
      this.createCategoryRow(),
    ]
  }

  createTotalRow(name = ''): ICell[] {
    return [
      {
        value: name,
        isNumber: false,
        edit: false
      },
      ...this.months().map(elMonthYear => {
        return {
          value: null,
          isNumber: true,
          edit: false
        }
      })]
  }


  // Income

  updateIncomesByIndex(categoryParent: Array<ICell[]>, indexCategoryParent: number) {
    this.incomes.update(items => items.map((item, index) => indexCategoryParent === index ? categoryParent : item))
  }

  addIncomeParentCategory() {
    this.incomes.update(items => [
      ...items,
      this.createParentCategoryRows()
    ]);
  }

  addIncomeCategoryAtIndex(indexCategoryParent: number, indexItemCategory: number) {
    this.incomes.update(
      items => items.map((item, index) => {

        let addedCategory = [...item];
        addedCategory.splice(indexItemCategory, 0, this.createCategoryRow())

        return indexCategoryParent === index ? addedCategory : item;
      })
    )
  }

  removeIncomeCategoryAtIndex(indexCategoryParent: number, indexItemCategory: number) {

    let isRemoveParentCategory = false;

    this.incomes.update(
      items => items.map((item, index) => {

        if (indexCategoryParent === index) {
          let removedCategory = [...item];
          removedCategory.splice(indexItemCategory, 1)

          if (removedCategory.length === 0) {
            isRemoveParentCategory = true;
          }

          return removedCategory
        }

        return item;
      })
    )

    if (isRemoveParentCategory) {
      this.removeIncomeParentCategoryAtIndex(indexCategoryParent);
    }
  }

  removeIncomeParentCategoryAtIndex(indexCategoryParent: number) {
    this.incomes.update(
      items => items.filter((item, index) => {
        return indexCategoryParent !== index;
      })
    )
  }

  //Expenses 

  updateExpensesByIndex(categoryParent: Array<ICell[]>, indexCategoryParent: number) {
    this.expenses.update(items => items.map((item, index) => indexCategoryParent === index ? categoryParent : item))
  }

  addExpensesParentCategory() {
    this.expenses.update(items => [
      ...items,
      this.createParentCategoryRows()
    ]);

  }

  addExpensesCategoryAtIndex(indexCategoryParent: number, indexItemCategory: number) {
    this.expenses.update(
      items => items.map((item, index) => {

        let addedCategory = [...item];
        addedCategory.splice(indexItemCategory, 0, this.createCategoryRow())

        return indexCategoryParent === index ? addedCategory : item;
      })
    )
  }

  removeExpensesCategoryAtIndex(indexCategoryParent: number, indexItemCategory: number) {

    let isRemoveParentCategory = false;

    this.expenses.update(
      items => items.map((item, index) => {

        if (indexCategoryParent === index) {
          let removedCategory = [...item];
          removedCategory.splice(indexItemCategory, 1)

          if (removedCategory.length === 0) {
            isRemoveParentCategory = true;
          }

          return removedCategory
        }

        return item;
      })
    )

    if (isRemoveParentCategory) {
      this.removeExpensesParentCategoryAtIndex(indexCategoryParent);
    }
  }

  removeExpensesParentCategoryAtIndex(indexCategoryParent: number) {
    this.expenses.update(
      items => items.filter((item, index) => {
        return indexCategoryParent !== index;
      })
    )
  }

}
