import { SortingRule, UnitSelectionAction } from "@figurl/spike-sorting-views"
export interface SortableTableWidgetRow {
    rowId: string | number
    data: {[key: string]: {
        value: any,
        sortValue: any
    }}
    checkboxFn?: (evt: React.MouseEvent) => void
}

export interface SortableTableWidgetColumn {
    columnName: string
    label: string
    tooltip: string
    sort: (a: any, b: any) => number
    dataElement: (d: any) => JSX.Element
    calculating?: boolean
}

export type RowsDict = Map<number | string, SortableTableWidgetRow>
export type ColsDict = Map<string, SortableTableWidgetColumn>

export interface SortableTableProps {
    selectedUnitIds: Set<number | string>
    selectionDispatch: React.Dispatch<UnitSelectionAction>
    columns: SortableTableWidgetColumn[]
    rows: RowsDict
    orderedUnitIds: (number | string)[]
    visibleUnitIds?: (number | string)[]
    primarySortRule?: SortingRule
    height?: number
    selectionDisabled?: boolean
    hideSelectionColumn?: boolean
}
