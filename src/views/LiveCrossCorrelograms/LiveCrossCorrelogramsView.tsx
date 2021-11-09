import PlotGrid from 'components/PlotGrid/PlotGrid';
import Splitter from 'MountainWorkspace/components/Splitter/Splitter';
import { FunctionComponent, useMemo } from 'react';
import LockableSelectUnitsWidget from 'views/SpikeAmplitudes/LockableSelectUnitsWidget';
import useLocalSelectedUnitIds from 'views/SpikeAmplitudes/useLocalSelectedUnitIds';
import LiveCrossCorrelogramPlot from './LiveCrossCorrelogramPlot';
import { LiveCrossCorrelogramsViewData } from './LiveCrossCorrelogramsViewData';

type Props = {
    data: LiveCrossCorrelogramsViewData
    width: number
    height: number
}

const LiveCrossCorrelogramsView: FunctionComponent<Props> = ({data, width, height}) => {
    const {selectedUnitIds, setSelectedUnitIds, selectionLocked, toggleSelectionLocked} = useLocalSelectedUnitIds()

    return (
        <Splitter
            width={width}
            height={height}
            initialPosition={200}
        >
            <LockableSelectUnitsWidget
                unitIds={data.unitIds}
                selectedUnitIds={selectedUnitIds}
                setSelectedUnitIds={setSelectedUnitIds}
                locked={selectionLocked}
                toggleLockStateCallback={toggleSelectionLocked}
            />
            <LiveCrossCorrelogramsViewChild
                data={data}
                width={0} // filled in by splitter
                height={0} // filled in by splitter
                unitIds={selectedUnitIds}
            />
        </Splitter>
    )
}

type ChildProps = {
    data: LiveCrossCorrelogramsViewData
    unitIds: number[]
    width: number
    height: number
}

const maxNumUnits = 6

const LiveCrossCorrelogramsViewChild: FunctionComponent<ChildProps> = ({data, unitIds, width, height}) => {
    const plots = useMemo(() => {
        if (unitIds.length > maxNumUnits) return []
        const plotHeight = height / unitIds.length - 30
        const plotWidth = plotHeight
        const plots = []
        for (let unitId1 of unitIds) {
            for (let unitId2 of unitIds) {
                plots.push({
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
            }
        }
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
            setSelectedPlotKeys={undefined}
            numPlotsPerRow={unitIds.length}
        />
    )
}

export default LiveCrossCorrelogramsView