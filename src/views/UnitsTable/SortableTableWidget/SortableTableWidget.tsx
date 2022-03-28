import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Checkbox, Grid, LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core'
import { allRowSelectionState, DESELECT_ALL, realizeVisibleRowIndices, rowCheckboxClickHandlerType, RowSelectionAction, SET_ROW_ORDER, TOGGLE_SELECT_ALL } from 'contexts/RowSelectionContext'
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
    // checkboxFn?: (evt: React.MouseEvent, allRowsSorted: number[]) => void // TODO: Remove
    checkboxFn?: rowCheckboxClickHandlerType
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
    // const handleClick: React.MouseEventHandler<HTMLButtonElement> = useCallback((evt) => {
    //     const modifier = evt.shiftKey ? 'shift' : null
    //     onClick(modifier)
    // }, [onClick])
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
    // onClick: (m: Modifier, rowId: string) => void,
    // handleClick: (m: Modifier) => void,
    onClick: (evt: React.MouseEvent) => void,
    isDisabled: boolean,
    contentRepository: {[key: string]: JSX.Element[]}
}
const ContentRow: FunctionComponent<RowProps> = (props: RowProps) => {
    const {rowId, selected, onClick, isDisabled, contentRepository} = props
    return <TableRow key={rowId} className={selected ? "selectedRow": ""}>
        <TableCell key="_checkbox">
            <RowCheckbox
                rowId={rowId}
                selected={selected}
                onClick={onClick}
                isDisabled={isDisabled}
            />
        </TableCell>
        {contentRepository[rowId]}
    </TableRow>
}

// type RowDict = { [key: number]: SortableTableWidgetRow }
// type ColDict = { [key: number]: SortableTableWidgetColumn }

interface TableProps {
    selectedRowIds: Set<number>
    selectionDispatch: React.Dispatch<RowSelectionAction>
    // rows: SortableTableWidgetRow[]
    columns: SortableTableWidgetColumn[]
    // rows: RowDict
    rows: Map<number, SortableTableWidgetRow>
    // columns: ColDict
    orderedRowIds: number[]
    visibleRowIndices?: number[]
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
    const { selectedRowIds, selectionDispatch, rows, columns, orderedRowIds, visibleRowIndices, defaultSortColumnName, height, selectionDisabled } = props
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
    // const resort = useMemo(() => {
    useEffect(() => {
        console.log(`Resorting.`)
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

    // const sortedRows = useMemo(() => {
    //     let _draft = [...rows]
    //     for (const r of sortingRules) {
    //         const columnName = r.columnName
    //         const column = columnForName(columnName)
    //         _draft.sort((a, b) => {
    //             const dA = (a.data[columnName] || {})
    //             const dB = (b.data[columnName] || {})
    //             const valueA = dA.sortValue
    //             const valueB = dB.sortValue
    
    //             return r.sortAscending ? column.sort(valueA, valueB) : column.sort(valueB, valueA)
    //         })
    //     }
    //     return _draft
    // }, [rows, sortingRules, columnForName])

    const displayRows = useMemo(() => {
        if (!rows) return []
        const visibleIds = realizeVisibleRowIndices(orderedRowIds, visibleRowIndices)
        const realizedRows = visibleIds.map(id => rows.get(id))
        if (realizedRows.some(r => r === undefined)) throw Error('Rows missing from row dict')
        return realizedRows as any as SortableTableWidgetRow[]
    }, [orderedRowIds, visibleRowIndices, rows])

    // const visibleRows = useMemo(() => sortedRows.slice(0, displayedRowCount || sortedRows.length), [sortedRows, displayedRowCount])
    // const allRowIds = useMemo(() => visibleRows.map(r => r.rowId), [visibleRows])
    // const allRowsSelected = useMemo(() => allRowIds.every(id => selectedRowIds.has(Number(id))), [selectedRowIds, allRowIds])
    const rowSelectionStatus = useMemo(() => allRowSelectionState({selectedRowIds, orderedRowIds, visibleRowIndices}), [selectedRowIds, orderedRowIds, visibleRowIndices])
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

    const headers = useMemo(() => {
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
            headers={headers}
            onColumnClick={handleColumnClick}
            onDeselectAll={allRowsSelected ? handleDeselectAll : undefined}
            onSelectAll={allRowsSelected ? undefined : handleSelectAll }
            allRowsSelected={allRowsSelected}
            selectionDisabled={selectionDisabled}
        />)
    }, [headers, handleColumnClick, allRowsSelected, handleDeselectAll, handleSelectAll, selectionDisabled])

    const _metricsByRow = useMemo(() => {
        const contents = Object.assign(
            {},
            Array.from(rows.values()).map((row) => {
                // console.log(`Processing row with ID ${row.rowIdNumeric} with data ${JSON.stringify(row.data)}`)
                const columnValues = columns.map(column => (
                    <TableCell key={column.columnName}>
                        <div title={column.tooltip}>
                            {column.dataElement(row.data[column.columnName].value)}
                        </div>
                    </TableCell>
                ))
                // console.log(`Returning ${row.rowId} mapped to ${columnValues.length} elements`)
                return {[row.rowId]: columnValues}
            })
        )
        return contents as any as {[key: string]: JSX.Element[]}
    }, [rows, columns])

    // Trying to pre-build the rendered rows and then update the subset with changes.
    // ...which doesn't actually work, because a) it's still redoing all of them each time bu
    // b) the effect hook keeps react from recognizing the change, so the DOM doesn't update.
    // This achieves the opposite of both our goals, but I'll keep the code for now.
    // const _rowsByRowId = useMemo(() => {
    //     console.log(`Rebuilding row set. ${Date.now()}`)
    //     const contents = Object.assign(
    //         {},
    //         ..._rows.map((row) => {
    //             const rendered = (
    //                 <ContentRow 
    //                     rowId={row.rowId}
    //                     selected={false}
    //                     onClick={toggleSelectedRowId}
    //                     isDisabled={selectionDisabled || false}
    //                     contentRepository={_metricsByRow}
    //                 />
    //             )
    //             return {[row.rowId]: rendered}
    //         })
    //     )
    //     return contents as any as {[key: string]: JSX.Element}
    // }, [_rows, _metricsByRow, toggleSelectedRowId, selectionDisabled])

    // useEffect(() => {
    //     selectionDelta.forEach((rowId) => {
    //         // console.log(`Toggling selection of row ${rowId}`)
    //         _rowsByRowId[rowId] = <ContentRow
    //                                 rowId={rowId}
    //                                 selected={selectedRowsSet.has(rowId)}
    //                                 onClick={toggleSelectedRowId}
    //                                 isDisabled={selectionDisabled || false}
    //                                 contentRepository={_metricsByRow}
    //         />
    //     })
    // }, [_rowsByRowId, selectionDelta, selectedRowsSet, toggleSelectedRowId, selectionDisabled, _metricsByRow])

    // This memoization is not effective, since it's still rebuilding the *entire* list
    // every time the selections change, instead of just touching the rows whose selection
    // status changed...
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