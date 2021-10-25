import { useSelectedUnitIds } from 'contexts/SortingSelectionContext';
import React, { FunctionComponent, useCallback, useMemo } from 'react';
import { RasterPlotViewData } from './RasterPlotViewData';
import TimeScrollView from './TimeScrollView/TimeScrollView';

type Props = {
    data: RasterPlotViewData
    width: number
    height: number
}

type PanelProps = {
    spikeTimesSec: number[]
}

const paintPanel = (context: CanvasRenderingContext2D, rect: {x: number, y: number, width: number, height: number}, timeRange: [number, number], props: PanelProps) => {
    const times = props.spikeTimesSec.filter(t => ((timeRange[0] <= t) && (t <= timeRange[1])))
    context.strokeStyle = 'darkgray'
    const y1 = rect.y
    const y2 = rect.y + rect.height
    for (let t of times) {
        const x = rect.x + (t - timeRange[0]) / (timeRange[1] - timeRange[0]) * rect.width
        context.beginPath()
        context.moveTo(x, y1)
        context.lineTo(x, y2)
        context.stroke()
    }
}

const RasterPlotView: FunctionComponent<Props> = ({data, width, height}) => {
    const {selectedUnitIds, setSelectedUnitIds} = useSelectedUnitIds()
    const selectedPanelKeys = useMemo(() => (selectedUnitIds.map(u => (`${u}`))), [selectedUnitIds])
    const setSelectedPanelKeys = useCallback((keys: string[]) => {
        setSelectedUnitIds(keys.map(k => (Number(k))))
    }, [setSelectedUnitIds])
    const panels = useMemo(() => (data.plots.map(pp => ({
        key: `${pp.unitId}`,
        label: `${pp.unitId}`,
        props: {
            spikeTimesSec: pp.spikeTimesSec
        },
        paint: paintPanel
    }))), [data.plots])
    return (
        <TimeScrollView
            startTimeSec={data.startTimeSec}
            endTimeSec={data.endTimeSec}
            panels={panels}
            panelSpacing={4}
            selectedPanelKeys={selectedPanelKeys}
            setSelectedPanelKeys={setSelectedPanelKeys}
            width={width}
            height={height}
        />
    )
}

export default RasterPlotView