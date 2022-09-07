import { Table, TableBody, TableCell, TableContainer } from '@material-ui/core';
import { allUnitSelectionState, voidClickHandler } from 'libraries/UnitSelectionContext';
import { FunctionComponent, useCallback, useEffect, useMemo } from 'react';
import './SortableTableWidget.css';
import SortableTableWidgetContentRow from './SortableTableWidgetContentRow';
import SortableTableWidgetHeaderRow, { sorterCallbackWrapper } from './SortableTableWidgetHeader';
import { ColsDict, SortableTableProps, SortableTableWidgetRow } from './SortableTableWidgetTypes';

const SortableTableWidget: FunctionComponent<SortableTableProps> = (props) => {
    const { selectedUnitIds, selectionDispatch, rows, columns, orderedUnitIds, visibleUnitIds, primarySortRule, height, selectionDisabled, hideSelectionColumn } = props
    const _visibleUnitIds = useMemo(() => {return visibleUnitIds && visibleUnitIds.length > 0 ? visibleUnitIds : orderedUnitIds}, [visibleUnitIds, orderedUnitIds])
    const allUnitSelectionStatus = useMemo(() => allUnitSelectionState({selectedUnitIds, orderedUnitIds, visibleUnitIds: _visibleUnitIds}), [selectedUnitIds, orderedUnitIds, _visibleUnitIds])
    const rowSorter = useCallback((colsDict: ColsDict) => sorterCallbackWrapper(rows, colsDict), [rows])

    useEffect(() => {
        if (_visibleUnitIds.some(id => !rows.has(id))) throw Error('Rows missing from row dict')
    }, [rows, _visibleUnitIds])

    const header = useMemo(() => {
        return (<SortableTableWidgetHeaderRow
            columns={columns}
            primarySortRule={primarySortRule}
            allUnitSelectionStatus={allUnitSelectionStatus}
            rowSorterCallback={rowSorter}
            selectionDispatch={selectionDispatch}
            selectionDisabled={selectionDisabled}
            hideSelectionColumn={hideSelectionColumn}
        />)
    }, [columns, primarySortRule, allUnitSelectionStatus, rowSorter, selectionDispatch, selectionDisabled, hideSelectionColumn])

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
        const realizedRows = _visibleUnitIds.map(id => rows.get(id))
        if (realizedRows.some(r => r === undefined)) throw Error('Rows missing from row dict')
        return realizedRows as any as SortableTableWidgetRow[]
    }, [_visibleUnitIds, rows])

    // TODO: Is this still rerendering too much/too often?
    const _projectedRows = useMemo(() => {
        return visibleRows.map((row) => {
            return (
                <SortableTableWidgetContentRow
                    key={row.rowId}
                    rowId={row.rowId}
                    selected={selectedUnitIds.has(row.rowId)}
                    onClick={!hideSelectionColumn ? (row.checkboxFn || voidClickHandler) : undefined}
                    isDisabled={selectionDisabled || false}
                    contentRepository={_contentFieldsByRow}
                />
            )
        })
    }, [selectedUnitIds, visibleRows,_contentFieldsByRow, selectionDisabled, hideSelectionColumn])

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