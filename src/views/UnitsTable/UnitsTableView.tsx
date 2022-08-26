import { useSortingCuration } from 'contexts/SortingCurationContext';
import { INITIALIZE_UNITS, UNIQUE_SELECT_FIRST, UNIQUE_SELECT_LAST, UNIQUE_SELECT_NEXT, UNIQUE_SELECT_PREVIOUS, useSelectedUnitIds } from 'contexts/UnitSelection/UnitSelectionContext';
import React, { FunctionComponent, KeyboardEventHandler, useCallback, useEffect, useMemo, useState } from 'react';
import { idToNum } from 'views/AverageWaveforms/AverageWaveformsView';
import { SortableTableWidgetColumn, SortableTableWidgetRow } from 'views/common/SortableTableWidget/SortableTableWidgetTypes';
import UnitsTableBottomToolbar, { defaultUnitsTableBottomToolbarOptions, UnitsTableBottomToolbarOptions } from 'views/common/UnitsTableBottomToolbar';
import ColorPatchUnitIdLabel, { ColorPatchUnitLabelProps, mergeGroupForUnitId } from '../common/SortableTableWidget/ColorPatchUnitIdLabel';
import SortableTableWidget from '../common/SortableTableWidget/SortableTableWidget';
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

export const sortIds = (ids: (string | number)[]) => {
    // Handle cases:
    //    1, 2, 3, ... These are numbers
    //    A1, A2, A3, ..., A10, A11, B1, B2, B3, ... Note: A2 comes before A10
    //    axyz, bxyz, bzzz, ... These are strings

    return [...ids].sort((id1, id2) => {
        if ((typeof(id1) === 'number') && (typeof(id2) === 'number')) {
            return id1 - id2
        }
        else {
            if ((!isNaN(parseInt(id1 + ''))) && (!isNaN(parseInt(id2 + '')))) {
                return parseInt(id1 + '') - parseInt(id2 + '')
            }
            const firstChar1 = (id1 + '')[0]
            const firstChar2 = (id2 + '')[0]
            if (firstChar1 === firstChar2) {
                const s1 = (id1 + '').slice(1)
                const s2 = (id2 + '').slice(1)
                if ((!isNaN(parseInt(s1))) && (!isNaN(parseInt(s2)))) {
                    return parseInt(s1) - parseInt(s2)
                }
                else return id1 < id2 ? -1 : id1 > id2 ? 1 : 0
            }
            else return id1 < id2 ? -1 : id1 > id2 ? 1 : 0
        }
    })
}

export default UnitsTableView