import PlotGrid, { PGPlot } from 'components/PlotGrid/PlotGrid';
import Splitter from 'MountainWorkspace/components/Splitter/Splitter';
import { FunctionComponent, useMemo } from 'react';
import { idToNum } from 'views/AverageWaveforms/AverageWaveformsView';
import LockableSelectUnitsWidget from 'views/common/SelectUnitsWidget/LockableSelectUnitsWidget';
import useLocalSelectedUnitIds from 'views/common/SelectUnitsWidget/useLocalSelectedUnitIds';
import LiveCrossCorrelogramPlot from './LiveCrossCorrelogramPlot';
import { LiveCrossCorrelogramsViewData } from './LiveCrossCorrelogramsViewData';

type Props = {
    data: LiveCrossCorrelogramsViewData
    width: number
    height: number
}

const LiveCrossCorrelogramsView: FunctionComponent<Props> = ({data, width, height}) => {
    const {selectedUnitIds, orderedRowIds, visibleRowIds, primarySortRule, checkboxClickHandlerGenerator, unitIdSelectionDispatch, selectionLocked, toggleSelectionLocked} = useLocalSelectedUnitIds()

    const listLengthScaler = useMemo(() => Math.pow(10, Math.ceil(Math.log10(data.unitIds.length))), [data.unitIds])

    return (
        <Splitter
            width={width}
            height={height}
            initialPosition={200}
        >
            <LockableSelectUnitsWidget
                unitIds={data.unitIds}
                selectedUnitIds={selectedUnitIds}
                orderedRowIds={orderedRowIds}
                visibleRowIds={visibleRowIds}
                primarySortRule={primarySortRule}
                checkboxClickHandlerGenerator={checkboxClickHandlerGenerator}
                unitIdSelectionDispatch={unitIdSelectionDispatch}
                locked={selectionLocked}
                toggleLockStateCallback={toggleSelectionLocked}
            />
            <LiveCrossCorrelogramsViewChild
                data={data}
                width={0} // filled in by splitter
                height={0} // filled in by splitter
                unitIds={selectedUnitIds}
                listLengthScaler={listLengthScaler}
            />
        </Splitter>
    )
}

type ChildProps = {
    data: LiveCrossCorrelogramsViewData
    unitIds: Set<number | string>
    width: number
    height: number
    listLengthScaler: number
}

const maxNumUnits = 6

const LiveCrossCorrelogramsViewChild: FunctionComponent<ChildProps> = ({data, unitIds, width, height, listLengthScaler}) => {
    const plots = useMemo(() => {
        if (unitIds.size > maxNumUnits) return []
        const plotHeight = height / unitIds.size - 30
        const plotWidth = plotHeight
        const plots: PGPlot[] = []

        unitIds.forEach(unitId1 => {
            unitIds.forEach(unitId2 => {
                plots.push({
                    // unique id invariant to number of units selected
                    numericId: idToNum(unitId1) * listLengthScaler + idToNum(unitId2),
                    key: `${unitId1}-${unitId2}`,
                    label: `Unit ${unitId1}/${unitId2}`,
                    labelColor: 'black',
                    props: {
                        width: plotWidth,
                        height: plotHeight,
                        dataUri: data.dataUri,
                        unitId1,
                        unitId2
                    }
                })
            })
        })
        return plots
    }, [unitIds, listLengthScaler, data.dataUri, height])

    if (unitIds.size === 0) {
        return <div>Select at least one unit.</div>
    }
    if (unitIds.size > maxNumUnits) {
        return <div>Select at most {maxNumUnits} units.</div>
    }
    // The IDs of the plots in this case do not correspond to the IDs of the units, so we must provide
    // our own list of sorted IDs.
    const orderedIds = plots.map(p => p.numericId).sort((a, b) => idToNum(a) - idToNum(b))
    return (
        <PlotGrid
            plots={plots}
            plotComponent={LiveCrossCorrelogramPlot}
            selectedPlotKeys={undefined}
            numPlotsPerRow={unitIds.size}
            orderedPlotIds={orderedIds}
        />
    )
}

export default LiveCrossCorrelogramsView