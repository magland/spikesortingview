import { Table, TableBody, TableCell, TableContainer } from '@material-ui/core';
import { allRowSelectionState, voidClickHandler } from 'contexts/RowSelection/RowSelectionFunctions';
import React, { FunctionComponent, useCallback, useEffect, useMemo } from 'react';
import './SortableTableWidget.css';
import SortableTableWidgetContentRow from './SortableTableWidgetContentRow';
import SortableTableWidgetHeaderRow, { sorterCallbackWrapper } from './SortableTableWidgetHeader';
import { ColsDict, SortableTableProps, SortableTableWidgetRow } from './SortableTableWidgetTypes';

const SortableTableWidget: FunctionComponent<SortableTableProps> = (props) => {
    const { selectedRowIds, selectionDispatch, rows, columns, orderedRowIds, visibleRowIds, primarySortRule, height, selectionDisabled } = props
    const _visibleRowIds = useMemo(() => {return visibleRowIds && visibleRowIds.length > 0 ? visibleRowIds : orderedRowIds}, [visibleRowIds, orderedRowIds])
    const allRowSelectionStatus = useMemo(() => allRowSelectionState({selectedRowIds, orderedRowIds, visibleRowIds: _visibleRowIds}), [selectedRowIds, orderedRowIds, _visibleRowIds])
    const rowSorter = useCallback((colsDict: ColsDict) => sorterCallbackWrapper(rows, colsDict), [rows])

    useEffect(() => {
        if (_visibleRowIds.some(id => !rows.has(id))) throw Error('Rows missing from row dict')
    }, [rows, _visibleRowIds])

    const header = useMemo(() => {
        return (<SortableTableWidgetHeaderRow
            columns={columns}
            primarySortRule={primarySortRule}
            allRowSelectionStatus={allRowSelectionStatus}
            rowSorterCallback={rowSorter}
            selectionDispatch={selectionDispatch}
            selectionDisabled={selectionDisabled}
        />)
    }, [columns, primarySortRule, allRowSelectionStatus, rowSorter, selectionDispatch, selectionDisabled])

    const _contentFieldsByRow = useMemo(() => {
        const contentDict: {[key: string]: JSX.Element[]} = {}
        rows.forEach((row) => {
            const columnValues = columns.map(column => (
                <TableCell key={column.columnName}>
                    <div title={column.tooltip}>
                        {column.dataElement(row.data[column.columnName].value)}
                    </div>
                </TableCell>
            ))
            contentDict[row.rowId] = columnValues
        })
        return contentDict
    }, [rows, columns])

    // This subselection could be combined into the one below it, but this version seems to be working faster,
    // even though it should make no difference. It's probably all in my head, but I'm leaving it.
    const visibleRows = useMemo(() => {
        if (!rows) return []
        const realizedRows = _visibleRowIds.map(id => rows.get(id))
        if (realizedRows.some(r => r === undefined)) throw Error('Rows missing from row dict')
        return realizedRows as any as SortableTableWidgetRow[]
    }, [_visibleRowIds, rows])

    // TODO: Is this still rerendering too much/too often?
    const _projectedRows = useMemo(() => {
        return visibleRows.map((row) => {
            return (
                <SortableTableWidgetContentRow
                    key={row.rowId}
                    rowId={row.rowId}
                    selected={selectedRowIds.has(Number(row.rowId))}
                    onClick={row.checkboxFn || voidClickHandler}
                    isDisabled={selectionDisabled || false}
                    contentRepository={_contentFieldsByRow}
                />
            )
        })
    }, [selectedRowIds, visibleRows,_contentFieldsByRow, selectionDisabled])

    return (
        <TableContainer style={height !== undefined ? {maxHeight: height} : {}}>
            <Table stickyHeader className="SortableTableWidget">
                {header}
                <TableBody>
                    {_projectedRows}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default SortableTableWidget