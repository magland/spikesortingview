import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Checkbox, Grid, LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core'
import { allRowSelectionState, clickHandlerWithCurriedRow, DESELECT_ALL, RowSelectionAction, SET_ROW_ORDER, TOGGLE_SELECT_ALL } from 'contexts/RowSelectionContext'
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react'
import './SortableTableWidget.css'
import { useMemoCompare } from './useMemoCompare'


export interface SortableTableWidgetRow {
    rowId: string
    rowIdNumeric: number
    data: {[key: string]: {
        value: any,
        sortValue: any
    }}
    checkboxFn?: clickHandlerWithCurriedRow
}

export interface SortableTableWidgetColumn {
    columnName: string
    label: string
    tooltip: string
    sort: (a: any, b: any) => number
    dataElement: (d: any) => JSX.Element
    calculating?: boolean
}

type HeaderRowProps = {
    headers: ColumnHeaderInfo[]
    onColumnClick: (columnName: string) => void
    onDeselectAll?: (() => void)
    onSelectAll?: (() => void)
    allRowsSelected: boolean
    selectionDisabled?: boolean
}

type ColumnHeaderInfo = {
    name: string
    tooltip?: string
    label?: string
    isCalculating: boolean
    isPrimarySort: boolean
    isAscendingSort: boolean
}

const SortCaret = (ascending?: boolean) => (
    ascending
        ? <FontAwesomeIcon icon={faCaretUp} />
        : <FontAwesomeIcon icon={faCaretDown} />
)

const HeaderRow: FunctionComponent<HeaderRowProps> = (props) => {
    const { headers, onColumnClick, onDeselectAll, onSelectAll, allRowsSelected, selectionDisabled } = props
    const _renderedHeaders = useMemo(() => {
        return headers.map(column => {
            const tooltip = (column.tooltip || column.label || '') + ' (click to sort)'
            return (
                <TableCell key={column.name} onClick={() => onColumnClick(column.name)} title={tooltip} style={{cursor: 'pointer'}}>
                    <Grid container justifyContent="flex-start" style={{flexFlow: 'row'}}>
                        <Grid item key="icon">
                            <span style={{fontSize: 16, color: 'gray', paddingLeft: 3, paddingRight: 5, paddingTop: 2}}>
                                {
                                    (column.isPrimarySort) && (SortCaret(column.isAscendingSort))
                                }
                            </span>
                        </Grid>
                        <Grid item key="text">
                            <span>
                                <span key="label">{column.label}</span>
                                <span key="progress">{column.isCalculating && <LinearProgress />}</span>
                            </span>
                        </Grid>
                    </Grid>
                </TableCell>
            )
        })
    }, [headers, onColumnClick]) // referential equality should be fine here b/c we can control the construction of the list.

    return (
        <TableHead>
            <TableRow>
                {
                    <TableCell key="_checkbox" width="30px">
                        <RowCheckbox 
                            rowId={'all'}
                            selected={false}
                            onClick={(allRowsSelected ? onDeselectAll : onSelectAll) || (() => {return})}
                            isDeselectAll={allRowsSelected}
                            isDisabled={selectionDisabled}
                        />
                    </TableCell>
                }
                {_renderedHeaders}
            </TableRow>
        </TableHead>
    )
}

type CheckboxProps = {
    rowId: string,
    selected: boolean,
    onClick: (evt: React.MouseEvent) => void,
    isDeselectAll?: boolean,
    isDisabled?: boolean
}

const RowCheckbox: FunctionComponent<CheckboxProps> = (props: CheckboxProps) => {
    const { rowId, selected, onClick, isDeselectAll, isDisabled } = props
    return (
        <Checkbox
            checked={selected}
            indeterminate={isDeselectAll ? true : false}
            onClick={onClick}
            style={{
                padding: 1
            }}
            title={isDeselectAll ? "Deselect all" : `Select ${rowId}`}
            disabled={isDisabled}
        />
    )
}

type RowProps = {
    rowId: string,
    selected: boolean,
    onClick: (evt: React.MouseEvent) => void,
    isDisabled: boolean,
    contentRepository: {[key: string]: JSX.Element[]}
}
const ContentRow: FunctionComponent<RowProps> = (props: RowProps) => {
    const {rowId, selected, onClick, isDisabled, contentRepository} = props
    const content = contentRepository[rowId]
    return <TableRow key={rowId} className={selected ? "selectedRow": ""}>
        <TableCell key="_checkbox">
            <RowCheckbox
                rowId={rowId}
                selected={selected}
                onClick={onClick}
                isDisabled={isDisabled}
            />
        </TableCell>
        {content}
    </TableRow>
}

interface TableProps {
    selectedRowIds: Set<number>
    selectionDispatch: React.Dispatch<RowSelectionAction>
    columns: SortableTableWidgetColumn[]
    rows: Map<number, SortableTableWidgetRow>
    orderedRowIds: number[]
    visibleRowIds?: number[]
    defaultSortColumnName?: string
    height?: number
    selectionDisabled?: boolean
}

type sortFieldEntry = {columnName: string, keyOrder: number, sortAscending: boolean}
const interpretSortFields = (fields: string[]): sortFieldEntry[] => {
    const result: sortFieldEntry[] = []
    for (let i = 0; i < fields.length; i ++) {
        // We are ascending unless two fields in a row are the same
        const sortAscending = (fields[i - 1] !== fields[i])
        result.push({columnName: fields[i], keyOrder: i, sortAscending})
    }
    return result
}

const SortableTableWidget: FunctionComponent<TableProps> = (props) => {
    // useCheckForChanges('TableWidget', props)
    const { selectedRowIds, selectionDispatch, rows, columns, orderedRowIds, visibleRowIds, defaultSortColumnName, height, selectionDisabled } = props
    const visibleRows = useMemo(() => {return visibleRowIds || orderedRowIds}, [visibleRowIds, orderedRowIds])
    const [sortFieldOrder, setSortFieldOrder] = useState<string[]>([])

    useEffect(() => {
        if ((sortFieldOrder.length === 0) && (defaultSortColumnName)) {
            setSortFieldOrder([defaultSortColumnName])
        }
    }, [sortFieldOrder, setSortFieldOrder, defaultSortColumnName])

    const columnForName = useCallback((columnName: string): SortableTableWidgetColumn => (columns.filter(c => (c.columnName === columnName))[0]), [columns])
    const sortingRules = useMemoCompare<sortFieldEntry[]>('sortingRules', interpretSortFields(sortFieldOrder), [])

    // TODO: This seems awkward as a useEffect callback...
    // TODO: DOES THIS STATE BELONG IN THE REDUCER AS WELL???
    useEffect(() => {
        let _draft = Array.from(rows.values())
        sortingRules.forEach(rule => {
            const columnName = rule.columnName
            const column = columnForName(columnName)
            _draft.sort((a, b) => {
                const dA = (a.data[columnName] || {})
                const dB = (b.data[columnName] || {})
                const valueA = dA.sortValue
                const valueB = dB.sortValue

                return rule.sortAscending ? column.sort(valueA, valueB) : column.sort(valueB, valueA)
            })
        })
        const newSortedRowIds = _draft.map(row => row.rowIdNumeric)
        selectionDispatch({ type: SET_ROW_ORDER, newRowOrder: newSortedRowIds })
    }, [rows, sortingRules, columnForName, selectionDispatch])

    const displayRows = useMemo(() => {
        if (!rows) return []
        const visibleIds = visibleRowIds && visibleRowIds.length > 0 ? visibleRowIds : orderedRowIds
        const realizedRows = visibleIds.map(id => rows.get(id))
        if (realizedRows.some(r => r === undefined)) throw Error('Rows missing from row dict')
        return realizedRows as any as SortableTableWidgetRow[]
    }, [orderedRowIds, visibleRowIds, rows])

    const rowSelectionStatus = useMemo(() => allRowSelectionState({selectedRowIds, orderedRowIds, visibleRowIds: visibleRows}), [selectedRowIds, orderedRowIds, visibleRows])
    const allRowsSelected = useMemo(() => rowSelectionStatus === 'all', [rowSelectionStatus])

    // TODO: THESE TWO THINGS CAN BE SIMPLIFIED MAYBE?
    const handleSelectAll = useCallback(() => {
        selectionDispatch({type: TOGGLE_SELECT_ALL})
    }, [selectionDispatch])

    const handleDeselectAll = useCallback(() => {
        selectionDispatch({type: DESELECT_ALL})
    }, [selectionDispatch])

    // TODO: DOES THIS BELONG IN THE REDUCER?
    const handleColumnClick = useCallback((columnName) => {
        const len = sortFieldOrder.length
        const priorSortField = len === 0 ? '' : sortFieldOrder[sortFieldOrder.length - 1]
        const lastTwoSortingColumnsMatch = len > 1 && sortFieldOrder[len - 1] === sortFieldOrder[len - 2]
        // Three cases:
        //   Case 1: The new click is the same sort as the last one and the one before. Choosing the same click 3x has
        // the same effect as choosing it once, so to keep the list short we'll trim the last one so it only appears once.
        //   Case 2: The new click is the same as the last one, but the last two don't match. That means the user is
        // toggling from ascending to descending sort, & we need both in the list. Just add the clicked column name.
        //   Case 3: The new click is not the same as the last one. We want to add an ascending sort by the clicked column,
        // but to keep the list trimmed, we remove any preceding sorts by this column (which can't impact the order any more).
        const newSortfieldOrder =
            priorSortField === columnName
                ? lastTwoSortingColumnsMatch
                    ? sortFieldOrder.slice(0, sortFieldOrder.length - 1)
                    : [...sortFieldOrder, columnName]
                : [...sortFieldOrder.filter(m => (m !== columnName)), columnName]
        setSortFieldOrder(newSortfieldOrder)
    }, [sortFieldOrder, setSortFieldOrder])

    const primaryRule = sortingRules[sortingRules.length - 1]

    const columnHeaders = useMemo(() => {
        return columns.map((c) => ({
            name: c.columnName,
            tooltip: c.tooltip,
            label: c.label,
            isCalculating: c.calculating || false,
            isPrimarySort: c.columnName === primaryRule?.columnName,
            isAscendingSort: primaryRule?.sortAscending || false
        }))
    }, [columns, primaryRule])

    const header = useMemo(() => {
        return (<HeaderRow
            headers={columnHeaders}
            onColumnClick={handleColumnClick}
            onDeselectAll={allRowsSelected ? handleDeselectAll : undefined}
            onSelectAll={allRowsSelected ? undefined : handleSelectAll }
            allRowsSelected={allRowsSelected}
            selectionDisabled={selectionDisabled}
        />)
    }, [columnHeaders, handleColumnClick, allRowsSelected, handleDeselectAll, handleSelectAll, selectionDisabled])

    const _metricsByRow = useMemo(() => {
        const contents = Object.assign(
            {},
            ...Array.from(rows.values()).map((row) => {
                const columnValues = columns.map(column => (
                    <TableCell key={column.columnName}>
                        <div title={column.tooltip}>
                            {column.dataElement(row.data[column.columnName].value)}
                        </div>
                    </TableCell>
                ))
                return {[row.rowId]: columnValues}
            })
        )
        return contents as any as {[key: string]: JSX.Element[]}
    }, [rows, columns])

    // TODO: Is this still rerendering too much/too often?
    const _unitrows = useMemo(() => {
        return displayRows.map((row) => {
            return (
                <ContentRow
                    key={row.rowId}
                    rowId={row.rowId}
                    selected={selectedRowIds.has(Number(row.rowId))}
                    onClick={row.checkboxFn || voidFn}
                    isDisabled={selectionDisabled || false}
                    contentRepository={_metricsByRow}
                />
            )
        })
    }, [selectedRowIds, displayRows, _metricsByRow, selectionDisabled])

    return (
        <TableContainer style={height !== undefined ? {maxHeight: height} : {}}>
            <Table stickyHeader className="SortableTableWidget">
                {header}
                <TableBody>
                    {_unitrows}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

const voidFn = (evt: React.MouseEvent) => {}

export default SortableTableWidget