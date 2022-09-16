import { PlotGrid, PGPlot } from 'libraries/component-plot-grid';
import { idToNum, INITIALIZE_UNITS, sortIds } from 'libraries/context-unit-selection';
import {Splitter} from 'libraries/component-splitter';
import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import {CorrelogramPlot} from 'libraries/view-autocorrelograms';
import { LockableSelectUnitsWidget } from 'libraries/SelectUnitsWidget';
import { useLocalSelectedUnitIds } from 'libraries/SelectUnitsWidget';
import { CrossCorrelogramData, CrossCorrelogramsViewData } from './CrossCorrelogramsViewData';
import { colorForUnitId } from '@figurl/spikesortingview.core-utils';
import { ToolbarItem, ViewToolbar } from 'libraries/ViewToolbar';
import { VerticalScrollView } from 'libraries/component-vertical-scroll-view';

type Props = {
    data: CrossCorrelogramsViewData
    width: number
    height: number
}

const MAX_UNITS_SELECTED = 10

const CrossCorrelogramsView: FunctionComponent<Props> = ({data, width, height}) => {
    const {selectedUnitIds, orderedUnitIds, visibleUnitIds, primarySortRule, checkboxClickHandlerGenerator, unitIdSelectionDispatch, selectionLocked, toggleSelectionLocked} = useLocalSelectedUnitIds()

    const allIds = useMemo(() => {
        let allIds: (number | string)[] = []
        for (let x of data.crossCorrelograms) {
            allIds.push(x.unitId1)
            allIds.push(x.unitId2)
        }
        allIds = [...new Set(allIds)]
        return allIds
    }, [data.crossCorrelograms])

    useEffect(() => {
        unitIdSelectionDispatch({ type: INITIALIZE_UNITS, newUnitOrder: sortIds(allIds) })
    }, [allIds, unitIdSelectionDispatch])

    const unitIds = useMemo(() => (
        sortIds([...selectedUnitIds])
    ), [selectedUnitIds])

    const listLengthScaler = useMemo(() => Math.pow(10, Math.ceil(Math.log10(unitIds.length))), [unitIds])

    const content = (
        <CrossCorrelogramsViewChild
            data={data}
            width={0} // filled in by splitter
            height={0} // filled in by splitter
            unitIds={unitIds}
            listLengthScaler={listLengthScaler}
        />
    )

    return (
        <Splitter
            width={width}
            height={height}
            initialPosition={200}
        >
            {
                !data.hideUnitSelector &&
                <LockableSelectUnitsWidget
                    unitIds={allIds}
                    selectedUnitIds={selectedUnitIds}
                    orderedUnitIds={orderedUnitIds}
                    visibleUnitIds={visibleUnitIds}
                    primarySortRule={primarySortRule}
                    checkboxClickHandlerGenerator={checkboxClickHandlerGenerator}
                    unitIdSelectionDispatch={unitIdSelectionDispatch}
                    locked={selectionLocked}
                    toggleLockStateCallback={toggleSelectionLocked}
                />
            }
            {
                content
            }
        </Splitter>
    )
}

type ChildProps = {
    data: CrossCorrelogramsViewData
    unitIds: (number | string)[]
    width: number
    height: number
    listLengthScaler: number
}

const CrossCorrelogramsViewChild: FunctionComponent<ChildProps> = ({data, width, height, unitIds}) => {
    const [showXAxis, setShowXAxis] = useState<boolean>(false)

    const crossCorrelogramsSorted = useMemo(() => {
        const C = data.crossCorrelograms.filter(a => (unitIds.includes(a.unitId1) && (unitIds.includes(a.unitId2))))
        const ret: (CrossCorrelogramData | undefined)[] = []
        for (let i1 of unitIds) {
            for (let i2 of unitIds) {
                const c = C.filter(x => ((x.unitId1 === i1) && (x.unitId2 === i2)))[0]
                if (c) {
                    ret.push(c)
                }
                else {
                    ret.push(undefined)
                }
            }
        }
        return ret
    }, [data.crossCorrelograms, unitIds])

    const TOOLBAR_WIDTH = 36 // hard-coded for now
    const W = width - TOOLBAR_WIDTH
    const H = height
    const plots: PGPlot[] = useMemo(() => {
        const nn = unitIds.length
        const {plotWidth, plotHeight} = determinePlotSizeForSquareMatrixGrid(W, H, nn)
        return crossCorrelogramsSorted.map((cc, ii) => ({
            key: `${ii}`,
            unitId: cc ? cc.unitId1 : 0,
            label: cc ? (plotWidth > 80 ? `Unit ${cc.unitId1}/${cc.unitId2}` : `${cc.unitId1}/${cc.unitId2}`) : '',
            labelColor: 'black',
            clickHandler: undefined,
            props: {
                binEdgesSec: cc ? cc.binEdgesSec: undefined,
                binCounts: cc ? cc.binCounts : undefined,
                color: cc?.unitId1 === cc?.unitId2 ? colorForUnitId(idToNum(cc?.unitId1)) : 'gray',
                width: plotWidth,
                height: plotHeight,
                hideXAxis: !showXAxis
            }
        }))
    }, [crossCorrelogramsSorted, W, H, unitIds, showXAxis])

    const customToolbarActions = useMemo(() => {
        const showXAxisAction: ToolbarItem = {
            type: 'toggle',
            subtype: 'checkbox',
            callback: () => setShowXAxis(a => (!a)),
            title: 'Show X Axis',
            selected: showXAxis === true
        }
        return [
            showXAxisAction
        ]
    }, [showXAxis])

    return (
        <Splitter
            width={width}
            height={height}
            initialPosition={TOOLBAR_WIDTH}
            adjustable={false}
        >
            <ViewToolbar
                width={TOOLBAR_WIDTH}
                height={height}
                customActions={customToolbarActions}
            />
            <VerticalScrollView width={0} height={0} disableScroll={true}>
                {
                    unitIds.length > MAX_UNITS_SELECTED ? (
                        <div>Not showing cross-correlogram matrix. Too many units selected (max = {MAX_UNITS_SELECTED}).</div>
                    ) : unitIds.length === 0 ? (
                        <div>Select one or more units to view cross-correlograms.</div>
                    ) : (
                        <PlotGrid
                            plots={plots}
                            plotComponent={CorrelogramPlot}
                            selectedPlotKeys={undefined}
                            numPlotsPerRow={unitIds.length}
                        />
                    )
                }
            </VerticalScrollView>
        </Splitter>
    )
}

export const determinePlotSizeForSquareMatrixGrid = (W: number, H: number, nn: number) => {
    const plotHeight = Math.min((W - 30 - (nn - 1) * 7)  / nn, (H - 30 - (nn - 1) * 7)  / nn)
    const plotWidth = plotHeight
    return {plotWidth, plotHeight}
}

export default CrossCorrelogramsView