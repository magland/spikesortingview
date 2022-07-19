import PlotGrid, { PGPlot } from 'components/PlotGrid/PlotGrid';
import { useUnitMetricSelection } from 'contexts/UnitMetricSelectionContext';
import { INITIALIZE_UNITS, useSelectedUnitIds } from 'contexts/UnitSelection/UnitSelectionContext';
import Splitter from 'MountainWorkspace/components/Splitter/Splitter';
import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { idToNum } from 'views/AverageWaveforms/AverageWaveformsView';
import { ToolbarItem } from 'views/common/Toolbars';
import VerticalScrollView from 'views/common/VerticalScrollView';
import ViewToolbar from 'views/common/ViewToolbar';
import { determinePlotSizeForSquareMatrixGrid } from 'views/CrossCorrelograms/CrossCorrelogramsView';
import UnitMetricPlot, { UnitMetricPlotProps } from './UnitMetricPlot';
import { UMGMetric, UnitMetricsGraphViewData } from './UnitMetricsGraphViewData';

type Props = {
    data: UnitMetricsGraphViewData
    width: number
    height: number
}

const UnitMetricsGraphViewChild: FunctionComponent<Props> = ({data, width, height}) => {
    const {units, metrics} = data
    const {selectedUnitIds, unitIdSelectionDispatch} = useSelectedUnitIds()
    const {selectedUnitMetrics} = useUnitMetricSelection()
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

    const TOOLBAR_WIDTH = 36 // hard-coded for now

    const plots: PGPlot[] = useMemo(() => {
        const setSelectedUnitIds = (unitIds: (string | number)[]) => {
            unitIdSelectionDispatch({
                type: 'SET_SELECTION',
                incomingSelectedUnitIds: unitIds
            })
        }
        if (selectedUnitMetrics.length === 0) {
            return metrics.map(metric => {
                const props: UnitMetricPlotProps = {
                    type: 'histogram',
                    metric1: metric,
                    metric2: metric,
                    units,
                    width: 400 * plotBoxScaleFactor,
                    height: 400 * plotBoxScaleFactor,
                    selectedUnitIds,
                    setSelectedUnitIds
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
        }
        else {
            const {plotWidth, plotHeight} = determinePlotSizeForSquareMatrixGrid(width - TOOLBAR_WIDTH, height, selectedUnitMetrics.length)
            const ret: PGPlot[] = []
            for (let m1 of selectedUnitMetrics) {
                const metric1: UMGMetric | undefined = metrics.filter(x => (x.key === m1))[0]
                for (let m2 of selectedUnitMetrics) {
                    const metric2: UMGMetric | undefined = metrics.filter(x => (x.key === m2))[0]
                    if (metric1 && metric2) {
                        const props: UnitMetricPlotProps = {
                            type: m1 === m2 ? 'histogram': 'scatter',
                            metric1: metric1,
                            metric2: metric2,
                            units,
                            width: plotWidth,
                            height: plotHeight,
                            selectedUnitIds,
                            setSelectedUnitIds
                        }
                        ret.push({
                            key: `${m1}-${m2}`,
                            label: props.type === 'histogram' ? m1 : `${m2} vs. ${m1}`,
                            unitId: '',
                            labelColor: 'black',
                            props
                        })
                    }
                }
            }
            return ret
        }
    }, [metrics, selectedUnitIds, units, plotBoxScaleFactor, selectedUnitMetrics, width, height, unitIdSelectionDispatch])

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
                        plotComponent={UnitMetricPlot}
                    />
                </VerticalScrollView>
            </Splitter>
        </div>
    )
}

export default UnitMetricsGraphViewChild