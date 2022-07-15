import PlotGrid, { PGPlot } from 'components/PlotGrid/PlotGrid';
import { INITIALIZE_UNITS, useSelectedUnitIds } from 'contexts/UnitSelection/UnitSelectionContext';
import Splitter from 'MountainWorkspace/components/Splitter/Splitter';
import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { idToNum } from 'views/AverageWaveforms/AverageWaveformsView';
import { ToolbarItem } from 'views/common/Toolbars';
import VerticalScrollView from 'views/common/VerticalScrollView';
import ViewToolbar from 'views/common/ViewToolbar';
import UnitMetricHistogram, { UnitMetricHistogramProps } from './UnitMetricHistogram';
import { UnitMetricsGraphViewData } from './UnitMetricsGraphViewData';

type Props = {
    data: UnitMetricsGraphViewData
    width: number
    height: number
}

const UnitMetricsGraphView: FunctionComponent<Props> = ({data, width, height}) => {
    const {units, metrics} = data
    const {selectedUnitIds, unitIdSelectionDispatch} = useSelectedUnitIds()
    const [plotBoxScaleFactor, setPlotBoxScaleFactor] = useState<number>(1)

    useEffect(() => {
        unitIdSelectionDispatch({ type: INITIALIZE_UNITS, newUnitOrder: units.map(u => (u.unitId)).sort((a, b) => idToNum(a) - idToNum(b)) })
    }, [units, unitIdSelectionDispatch])

    const customToolbarActions = useMemo(() => {
        const boxSizeActions: ToolbarItem[] = [
            {
                type: 'button',
                callback: () => setPlotBoxScaleFactor(s => (s * 1.3)),
                title: 'Increase box size',
                icon: <FaPlus />
            },
            {
                type: 'button',
                callback: () => setPlotBoxScaleFactor(s => (s / 1.3)),
                title: 'Decrease box size',
                icon: <FaMinus />
            }
        ]
        return [
            ...boxSizeActions
        ]
    }, [])

    const plots: PGPlot[] = useMemo(() => (
        metrics.map(metric => {
            const props: UnitMetricHistogramProps = {
                metric,
                units,
                width: 400 * plotBoxScaleFactor,
                height: 400 * plotBoxScaleFactor,
                selectedUnitIds
            }
            const ret: PGPlot = {
                key: metric.key,
                label: metric.label,
                unitId: '',
                labelColor: 'black',
                props
            }
            return ret
        })
    ), [metrics, selectedUnitIds, units, plotBoxScaleFactor])

    const TOOLBAR_WIDTH = 36 // hard-coded for now
    return (
        <div>
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
                <VerticalScrollView width={0} height={0}>
                    <PlotGrid
                        plots={plots}
                        plotComponent={UnitMetricHistogram}
                    />
                </VerticalScrollView>
            </Splitter>
        </div>
    )
}

export default UnitMetricsGraphView