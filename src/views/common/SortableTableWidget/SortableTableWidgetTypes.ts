import { RowSelectionAction } from "contexts/RowSelection/RowSelectionContext"
import { SortingRule } from "contexts/RowSelection/RowSelectionTypes"

export interface SortableTableWidgetRow {
    rowIdNumeric: number | string
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

export type RowsDict = Map<number | string, SortableTableWidgetRow>
export type ColsDict = Map<string, SortableTableWidgetColumn>

export interface SortableTableProps {
    selectedRowIds: Set<number | string>
    selectionDispatch: React.Dispatch<RowSelectionAction>
    columns: SortableTableWidgetColumn[]
    rows: RowsDict
    orderedRowIds: (number | string)[]
    visibleRowIds?: (number | string)[]
    primarySortRule?: SortingRule
    height?: number
    selectionDisabled?: boolean
}
