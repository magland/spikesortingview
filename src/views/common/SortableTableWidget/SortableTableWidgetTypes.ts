import { RowSelectionAction, SortingRule } from 'contexts/RowSelectionContext'

export interface SortableTableWidgetRow {
    rowIdNumeric: number
    rowId: string
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

export type RowsDict = Map<number, SortableTableWidgetRow>
export type ColsDict = Map<string, SortableTableWidgetColumn>

export interface SortableTableProps {
    selectedRowIds: Set<number>
    selectionDispatch: React.Dispatch<RowSelectionAction>
    columns: SortableTableWidgetColumn[]
    rows: RowsDict
    orderedRowIds: number[]
    visibleRowIds?: number[]
    primarySortRule?: SortingRule
    height?: number
    selectionDisabled?: boolean
}
