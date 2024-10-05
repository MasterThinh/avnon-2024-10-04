import { CellService } from './components/cell/cell.service';
import { Injectable, computed, effect, signal } from '@angular/core';
import moment from 'moment';
import { ICell, IMove, IRightClick } from './components/cell/cell.component';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor(private cellService: CellService) {
  }

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

      }, this.createRowForParent(
        { value: `Sub Totals`, disabled: true },
        this.createCellsForMonth({ isNumber: true, disabled: true }
        )))
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

    }, this.createRowForParent(
      { value: `Income Total`, disabled: true },
      this.createCellsForMonth({ isNumber: true, disabled: true }
      )))

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

      }, this.createRowForParent(
        { value: `Sub Totals`, disabled: true },
        this.createCellsForMonth({ isNumber: true, disabled: true }
        )))
    })
    return subTotalExpenses;
  })

  totalsExpenses = computed(() => {
    const totalsExpenses = this.subTotalsExpenses().reduce((acc, current) => {
      return acc.map((item: ICell, index: number) => {

        if (index < acc.length - this.months().length) {
          return item
        }

        return {
          ...item,
          edit: false,
          value: Number(item.value) + Number(current[index].value)
        }
      });

    }, this.createRowForParent(
      { value: `Total Expenses`, disabled: true },
      this.createCellsForMonth({ isNumber: true, disabled: true }
      )))

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
    let profitLoss = this.createRowForParent(
      { value: `Profit / Loss`, disabled: true },
      this.createCellsForMonth({ isNumber: true, disabled: true }

      ));
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
    let openingBalance = this.createRowForParent(
      { value: `Opening Balance`, disabled: true },
      this.createCellsForMonth({ isNumber: true, disabled: true }
      ));

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
    let closingBalance = this.createRowForParent(
      { value: `Closing Balance`, disabled: true },
      this.createCellsForMonth({ isNumber: true, disabled: true }
      ));

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



  updateAllCellsForRow(cell: ICell) {

    // this.expenses.update((items => {
    //   return items.map((parentMap, indexParent) => {
    //     return parentMap.map((rowMap, indexRow) => {
    //       return rowMap.map((cellMap, indexCell) => {
    //         return cellMap.isCellOfMonth ?
    //           {
    //             ...cellMap,
    //             value: cell.value
    //           } :
    //           cellMap
    //       })
    //     })
    //   });
    // }))

    // const { indexParent, indexRow, indexCell } = { ...cell.position };
    const indexParentOfCell = cell.position?.indexParent as number;
    const indexRowOfCell = cell.position?.indexRow as number;

    if (indexParentOfCell < this.incomes().length) {
      this.incomes.update((items => {
        return items.map((parentMap, indexParentMap) => {
          return parentMap.map((rowMap, indexRowMap) => {
            if (indexParentMap === indexParentOfCell && indexRowMap === indexRowOfCell) {
              return rowMap.map((cellMap, indexCellMap) => {
                return cellMap.isCellOfMonth ?
                  {
                    ...cellMap,
                    value: cell.value
                  } :
                  cellMap
              })
            }
            return rowMap
          })
        });
      }))
    } else {

      const indexParentOfCellExpendses = indexParentOfCell % this.incomes().length;

      this.expenses.update((items => {
        return items.map((parentMap, indexParentMap) => {
          return parentMap.map((rowMap, indexRowMap) => {
            if (indexParentMap === indexParentOfCellExpendses && indexRowMap === indexRowOfCell) {
              return rowMap.map((cellMap, indexCellMap) => {
                return cellMap.isCellOfMonth ?
                  {
                    ...cellMap,
                    value: cell.value
                  } :
                  cellMap
              })
            }
            return rowMap
          })
        });
      }))
    }

  }

  deleteRowOfParentAtIndex(indexParent: number, indexRow: number) {
    if (indexParent < this.incomes().length) {
      this.removeRowOfParentIncomeAtIndex(indexParent, indexRow)
    } else {
      this.removeRowOfParentExpensesAtIndex(indexParent % this.incomes().length, indexRow)
    }
  }

  deleteParentAtIndex(indexParent: number) {
    if (indexParent < this.incomes().length) {
      this.removeParentIncomeAtIndex(indexParent)
    } else {
      this.removeParentExpensesAtIndex(indexParent % this.incomes().length)
    }
  }

  insertRowOfParentAtIndex(indexParent: number, indexRow: number) {
    if (indexParent < this.incomes().length) {
      this.insertRowOfParentIncomeAtIndex(indexParent, indexRow + 1)
    } else {
      this.insertRowOfParentExpensesAtIndex(indexParent % this.incomes().length, indexRow + 1)
    }
  }

  insertParentAtIndex(indexParent: number) {
    if (indexParent < this.incomes().length) {
      this.addIncomeParentCategory(indexParent + 1)
    } else {
      this.addExpensesParentCategory(indexParent % this.incomes().length + 1)
    }
  }

  createCellsForMonth(cell?: Partial<ICell>): ICell[] {
    return this.months().map(elMonthYear => {
      return this.cellService.create(cell)
    })
  }

  createRowForParent(
    cell?: Partial<ICell>,
    cellOfMonths?: ICell[]
  ): ICell[] {
    cellOfMonths = cellOfMonths ? cellOfMonths : this.createCellsForMonth({ isNumber: true, edit: true })
    return [
      this.cellService.create(cell),
      ...cellOfMonths
    ]
  }

  createParentCategoryRows(): Array<ICell[]> {
    return [
      this.createRowForParent({ edit: true }, this.createCellsForMonth({ isNumber: true, disabled: true })),
      this.createRowForParent({ edit: true }, this.createCellsForMonth({ isNumber: true, isCellOfMonth: true, edit: true })),
      this.createRowForParent({ edit: true }, this.createCellsForMonth({ isNumber: true, isCellOfMonth: true, edit: true })),
      this.createRowForParent({ edit: true }, this.createCellsForMonth({ isNumber: true, isCellOfMonth: true, edit: true })),
    ]
  }


  // Income

  updateIncomesByIndex(categoryParent: Array<ICell[]>, indexParentOfIncome: number) {
    this.incomes.update(items => items.map((item, index) => indexParentOfIncome === index ? categoryParent : item))
  }

  addIncomeParentCategory(indexParentOfIncome: number) {
    this.incomes.update(
      items => {
        let addedParent = [...items];
        addedParent.splice(indexParentOfIncome, 0, this.createParentCategoryRows())
        return addedParent;
      }
    )
  }

  insertRowOfParentIncomeAtIndex(indexParentOfIncome: number, indexRow: number) {
    this.incomes.update(
      items => items.map((item, index) => {

        let addedCategory = [...item];
        addedCategory.splice(
          indexRow, 0,
          this.createRowForParent({ edit: true },
            this.createCellsForMonth({ isNumber: true, isCellOfMonth: true, edit: true }))
        )

        return indexParentOfIncome === index ? addedCategory : item;
      })
    )
  }

  removeRowOfParentIncomeAtIndex(indexParentOfIncome: number, indexRow: number) {

    let isRemoveParentCategory = false;

    this.incomes.update(
      items => items.map((item, index) => {

        if (indexParentOfIncome === index) {
          let removedCategory = [...item];
          removedCategory.splice(indexRow, 1)

          if (removedCategory.length === 0) {
            isRemoveParentCategory = true;
          }

          return removedCategory
        }

        return item;
      })
    )

    if (isRemoveParentCategory) {
      this.removeParentIncomeAtIndex(indexParentOfIncome);
    }
  }

  removeParentIncomeAtIndex(indexParentOfIncome: number) {
    this.incomes.update(
      items => items.filter((item, index) => {
        return indexParentOfIncome !== index;
      })
    )
  }

  //Expenses 

  updateExpensesByIndex(categoryParent: Array<ICell[]>, indexParentExpenses: number) {
    this.expenses.update(items => items.map((item, index) => indexParentExpenses === index ? categoryParent : item))
  }

  addExpensesParentCategory(indexParentExpenses: number) {
    this.expenses.update(
      items => {
        let addedParent = [...items];
        addedParent.splice(indexParentExpenses, 0, this.createParentCategoryRows())
        return addedParent;
      }
    )

  }

  insertRowOfParentExpensesAtIndex(indexParentExpenses: number, indexRow: number) {
    this.expenses.update(
      items => items.map((item, index) => {

        let addedCategory = [...item];
        addedCategory.splice(
          indexRow,
          0,
          this.createRowForParent({ edit: true }, this.createCellsForMonth({ isNumber: true, isCellOfMonth: true, edit: true }))
        )

        return indexParentExpenses === index ? addedCategory : item;
      })
    )
  }

  removeRowOfParentExpensesAtIndex(indexParentExpenses: number, indexRow: number) {

    let isRemoveParentCategory = false;

    this.expenses.update(
      items => items.map((item, index) => {

        if (indexParentExpenses === index) {
          let removedCategory = [...item];
          removedCategory.splice(indexRow, 1)

          if (removedCategory.length === 0) {
            isRemoveParentCategory = true;
          }

          return removedCategory
        }

        return item;
      })
    )

    if (isRemoveParentCategory) {
      this.removeParentExpensesAtIndex(indexParentExpenses);
    }
  }

  removeParentExpensesAtIndex(indexParentExpenses: number) {
    this.expenses.update(
      items => items.filter((item, index) => {
        return indexParentExpenses !== index;
      })
    )
  }

}
