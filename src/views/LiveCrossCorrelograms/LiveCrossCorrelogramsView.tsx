import { PGPlot, PlotGrid } from 'libraries/PlotGrid';
import { Splitter } from 'libraries/Splitter';
import { sortIds } from 'libraries/UnitSelectionContext';
import { FunctionComponent, useMemo } from 'react';
import { LockableSelectUnitsWidget } from 'libraries/SelectUnitsWidget';
import { useLocalSelectedUnitIds } from 'libraries/SelectUnitsWidget';
import LiveCrossCorrelogramPlot from './LiveCrossCorrelogramPlot';
import { LiveCrossCorrelogramsViewData } from './LiveCrossCorrelogramsViewData';

type Props = {
    data: LiveCrossCorrelogramsViewData
    width: number
    height: number
}

const LiveCrossCorrelogramsView: FunctionComponent<Props> = ({data, width, height}) => {
    const {selectedUnitIds, orderedUnitIds, visibleUnitIds, primarySortRule, checkboxClickHandlerGenerator, unitIdSelectionDispatch, selectionLocked, toggleSelectionLocked} = useLocalSelectedUnitIds()

    const listLengthScaler = useMemo(() => Math.pow(10, Math.ceil(Math.log10(data.unitIds.length))), [data.unitIds])

    const unitIds = useMemo(() => (
        sortIds([...selectedUnitIds])
    ), [selectedUnitIds])

    return (
        <Splitter
            width={width}
            height={height}
            initialPosition={200}
        >
            <LockableSelectUnitsWidget
                unitIds={data.unitIds}
                selectedUnitIds={selectedUnitIds}
                orderedUnitIds={orderedUnitIds}
                visibleUnitIds={visibleUnitIds}
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
                unitIds={unitIds}
                listLengthScaler={listLengthScaler}
            />
        </Splitter>
    )
}

type ChildProps = {
    data: LiveCrossCorrelogramsViewData
    unitIds: (number | string)[]
    width: number
    height: number
    listLengthScaler: number
}

const maxNumUnits = 6

const LiveCrossCorrelogramsViewChild: FunctionComponent<ChildProps> = ({data, unitIds, height}) => {
    const plots = useMemo(() => {
        if (unitIds.length > maxNumUnits) return []
        const plotHeight = height / unitIds.length - 30
        const plotWidth = plotHeight
        const plots: PGPlot[] = []

        unitIds.forEach(unitId1 => {
            unitIds.forEach(unitId2 => {
                plots.push({
                    key: `${unitId1}-${unitId2}`,
                    unitId: unitId1,
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
    }, [unitIds, data.dataUri, height])

    if (unitIds.length === 0) {
        return <div>Select at least one unit.</div>
    }
    if (unitIds.length > maxNumUnits) {
        return <div>Select at most {maxNumUnits} units.</div>
    }
    return (
        <PlotGrid
            plots={plots}
            plotComponent={LiveCrossCorrelogramPlot}
            selectedPlotKeys={undefined}
            numPlotsPerRow={unitIds.length}
        />
    )
}

export default LiveCrossCorrelogramsView