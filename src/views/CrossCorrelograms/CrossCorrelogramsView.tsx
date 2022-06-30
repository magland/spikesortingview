import PlotGrid, { PGPlot } from 'components/PlotGrid/PlotGrid';
import { INITIALIZE_UNITS } from 'contexts/UnitSelection/UnitSelectionContext';
import Splitter from 'MountainWorkspace/components/Splitter/Splitter';
import React, { FunctionComponent, useEffect, useMemo } from 'react';
import CorrelogramPlot from 'views/Autocorrelograms/CorrelogramPlot';
import { idToNum } from 'views/AverageWaveforms/AverageWaveformsView';
import LockableSelectUnitsWidget from 'views/common/SelectUnitsWidget/LockableSelectUnitsWidget';
import useLocalSelectedUnitIds from 'views/common/SelectUnitsWidget/useLocalSelectedUnitIds';
import { CrossCorrelogramData, CrossCorrelogramsViewData } from './CrossCorrelogramsViewData';

type Props = {
    data: CrossCorrelogramsViewData
    width: number
    height: number
}

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
        unitIdSelectionDispatch({ type: INITIALIZE_UNITS, newUnitOrder: allIds.sort((a, b) => idToNum(a) - idToNum(b)) })
    }, [allIds, unitIdSelectionDispatch])

    const unitIds = useMemo(() => (
        [...selectedUnitIds].sort((a, b) => (idToNum(a) - idToNum(b)))
    ), [selectedUnitIds])

    const listLengthScaler = useMemo(() => Math.pow(10, Math.ceil(Math.log10(unitIds.length))), [unitIds])

    return (
        <Splitter
            width={width}
            height={height}
            initialPosition={200}
        >
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
            <CrossCorrelogramsViewChild
                data={data}
                width={0} // filled in by splitter
                height={0} // filled in by splitter
                unitIds={unitIds}
                listLengthScaler={listLengthScaler}
            />
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

    const plots: PGPlot[] = useMemo(() => {
        const plotHeight = height / unitIds.length - 30
        const plotWidth = plotHeight
        return crossCorrelogramsSorted.map((cc, ii) => ({
            key: `${ii}`,
            unitId: cc ? cc.unitId1 : 0,
            label: cc ? `Unit ${cc.unitId1}/${cc.unitId2}` : '',
            labelColor: 'black',
            clickHandler: undefined,
            props: {
                binEdgesSec: cc ? cc.binEdgesSec: undefined,
                binCounts: cc ? cc.binCounts : undefined,
                color: 'gray',
                width: plotWidth,
                height: plotHeight
            }
        }))
    }, [crossCorrelogramsSorted, height, unitIds])

    const divStyle: React.CSSProperties = useMemo(() => ({
        width: width - 20, // leave room for the scrollbar
        height: height,
        position: 'relative',
        overflowY: 'auto'
    }), [width, height])
    return (
        <div style={divStyle}>
            <PlotGrid
                plots={plots}
                plotComponent={CorrelogramPlot}
                selectedPlotKeys={undefined}
                numPlotsPerRow={unitIds.length}
            />
        </div>
    )
}

export default CrossCorrelogramsView