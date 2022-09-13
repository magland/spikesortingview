import { useSortingCuration } from 'libraries/context-sorting-curation';
import { ColorPatchUnitIdLabel, ColorPatchUnitLabelProps, mergeGroupForUnitId, SortableTableWidget, SortableTableWidgetColumn, SortableTableWidgetRow } from 'libraries/component-sortable-table';
import { sortIds } from 'libraries/context-unit-selection';
import { defaultUnitsTableBottomToolbarOptions, UnitsTableBottomToolbar, UnitsTableBottomToolbarOptions } from 'libraries/ViewToolbar';
import React, { FunctionComponent, KeyboardEventHandler, useCallback, useEffect, useMemo, useState } from 'react';
import { idToNum, INITIALIZE_UNITS, UNIQUE_SELECT_FIRST, UNIQUE_SELECT_LAST, UNIQUE_SELECT_NEXT, UNIQUE_SELECT_PREVIOUS, useSelectedUnitIds } from '../context-unit-selection';
import { UnitsTableViewData } from './UnitsTableViewData';

type Props = {
    data: UnitsTableViewData
    width: number
    height: number
}

const UnitsTableView: FunctionComponent<Props> = ({data, width, height}) => {
    const [toolbarOptions, setToolbarOptions] = useState<UnitsTableBottomToolbarOptions>(
        {...defaultUnitsTableBottomToolbarOptions, onlyShowSelected: false}
    )
    const {selectedUnitIds, orderedUnitIds, visibleUnitIds, primarySortRule, checkboxClickHandlerGenerator, unitIdSelectionDispatch} = useSelectedUnitIds()
    const {sortingCuration} = useSortingCuration()

    const visibleUnitIds2 = useMemo(() => (
        toolbarOptions.onlyShowSelected ? (
            visibleUnitIds ? (
                visibleUnitIds.filter(id => (selectedUnitIds.has(id)))
            ) : (
                [...selectedUnitIds]
            )
        ) : (
            visibleUnitIds
        )
    ), [visibleUnitIds, selectedUnitIds, toolbarOptions.onlyShowSelected])

    const columns = useMemo(() => {
        const ret: SortableTableWidgetColumn[] = []
        ret.push({
            columnName: '_unitId',
            label: 'Unit',
            tooltip: 'Unit ID',
            sort: (a: any, b: any) => (idToNum(a) - idToNum(b)),
            dataElement: (d: ColorPatchUnitLabelProps ) => (<ColorPatchUnitIdLabel unitId={d.unitId} mergeGroup={d.mergeGroup} />),
            calculating: false
        })
        if (sortingCuration) {
            ret.push({
                columnName: '_labels',
                label: 'Labels',
                tooltip: 'Curation labels',
                sort: (a: any, b: any) => (a < b ? -1 : a > b ? 1 : 0),
                dataElement: (d: any) => (<span>{d.join(', ')}</span>),
                calculating: false
            })
        }
        // The filter is rather hacky
        data.columns.filter(c => c.key !== 'unitId').forEach(c => {
            ret.push({
                columnName: c.key,
                label: c.label,
                tooltip: c.label,
                sort: (a: any, b: any) => (a - b),
                dataElement: (d: any) => <span>{d}</span>,
                calculating: false
            })
        })
        return ret
    }, [data.columns, sortingCuration])

    const rows = useMemo(() => (
        data.rows.map(r => {
            const curationLabels = ((sortingCuration?.labelsByUnit || {})[`${r.unitId}`] || [])
            const unitIdData = {
                value: {unitId: r.unitId, mergeGroup: mergeGroupForUnitId(r.unitId, sortingCuration)},
                sortValue: r.unitId
            }
            const rowData: {[key: string]: any} = {
                _unitId: unitIdData,
                _labels: {
                    value: curationLabels,
                    sortValue: curationLabels.join(', ')
                }
            }
            for (let c of data.columns) {
                const text = `${r.values[c.key] !== undefined ? r.values[c.key] : ''}`
                rowData[c.key] = {
                    value: text,
                    sortValue: r.values[c.key]
                }
            }
            return {
                rowId: r.unitId,
                data: rowData,
                checkboxFn: !toolbarOptions.onlyShowSelected ? checkboxClickHandlerGenerator(r.unitId) : undefined
            }
        })
    ), [data.rows, data.columns, sortingCuration, checkboxClickHandlerGenerator, toolbarOptions.onlyShowSelected])

    useEffect(() => {
        unitIdSelectionDispatch({ type: INITIALIZE_UNITS, newUnitOrder: sortIds(rows.map(r => (r.rowId))) })
    }, [rows, unitIdSelectionDispatch])

    const rowMap = useMemo(() => {
        const draft = new Map<number | string, SortableTableWidgetRow>()
        rows.forEach(r => draft.set(r.rowId, r))
        return draft
    }, [rows])

    const bottomToolbarHeight = 30

    const divStyle: React.CSSProperties = useMemo(() => ({
        width: width - 20, // leave room for the scrollbar
        height: height - bottomToolbarHeight,
        top: 0,
        position: 'relative',
        overflowY: 'auto'
    }), [width, height])

    const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.ctrlKey) {
            if (e.key === 'ArrowDown') {
                unitIdSelectionDispatch({
                    type: UNIQUE_SELECT_NEXT
                })
            }
            else if (e.key === 'ArrowUp') {
                unitIdSelectionDispatch({
                    type: UNIQUE_SELECT_PREVIOUS
                })
            }
            else if (e.key === 'Home') {
                unitIdSelectionDispatch({
                    type: UNIQUE_SELECT_FIRST
                })
            }
            else if (e.key === 'End') {
                unitIdSelectionDispatch({
                    type: UNIQUE_SELECT_LAST
                })
            }
            return false
        }
    }, [unitIdSelectionDispatch])

    return (
        <div>
            <div
                style={divStyle}
                onKeyDown={handleKeyDown}
            >
                <SortableTableWidget
                    columns={columns}
                    rows={rowMap}
                    orderedUnitIds={orderedUnitIds}
                    visibleUnitIds={visibleUnitIds2}
                    selectedUnitIds={selectedUnitIds}
                    selectionDispatch={unitIdSelectionDispatch}
                    primarySortRule={primarySortRule}
                    hideSelectionColumn={toolbarOptions.onlyShowSelected}
                />
            </div>
            <div style={{position: 'absolute', top: height - bottomToolbarHeight, height: bottomToolbarHeight, overflow: 'hidden'}}>
                <UnitsTableBottomToolbar
                    options={toolbarOptions}
                    setOptions={setToolbarOptions}
                />
            </div>
        </div>
    )
}

export default UnitsTableView