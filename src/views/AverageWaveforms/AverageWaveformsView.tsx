import PlotGrid, { PGPlot } from 'components/PlotGrid/PlotGrid';
import { INITIALIZE_ROWS, useSelectedUnitIds } from 'contexts/RowSelectionContext';
import { mean } from 'mathjs';
import Splitter from 'MountainWorkspace/components/Splitter/Splitter';
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import AmplitudeScaleToolbarEntries from 'views/common/AmplitudeScaleToolbarEntries';
import colorForUnitId from 'views/common/ColorHandling/colorForUnitId';
import { ToolbarItem } from 'views/common/Toolbars';
import VerticalScrollView from 'views/common/VerticalScrollView';
import ViewToolbar from 'views/common/ViewToolbar';
import AverageWaveformPlot from './AverageWaveformPlot';
import { AverageWaveformsViewData } from './AverageWaveformsViewData';

type Props = {
    data: AverageWaveformsViewData
    width: number
    height: number
}

const AverageWaveformsView: FunctionComponent<Props> = ({data, width, height}) => {
    const {selectedUnitIds, orderedRowIds, plotClickHandlerGenerator, unitIdSelectionDispatch} = useSelectedUnitIds()

    const [ampScaleFactor, setAmpScaleFactor] = useState<number>(1)
    const [waveformsMode, setWaveformsMode] = useState<string>('geom')

    useEffect(() => {
        unitIdSelectionDispatch({ type: INITIALIZE_ROWS, newRowOrder: data.averageWaveforms.map(aw => aw.unitId).sort((a, b) => a - b) })
    }, [data.averageWaveforms, unitIdSelectionDispatch])

    const plots: PGPlot[] = useMemo(() => data.averageWaveforms.map(aw => ({
        numericId: aw.unitId,
        key: `${aw.unitId}`,
        label: `Unit ${aw.unitId}`,
        labelColor: colorForUnitId(aw.unitId),
        clickHandler: plotClickHandlerGenerator(aw.unitId),
        props: {
            channelIds: aw.channelIds,
            waveform: subtractChannelMeans(aw.waveform),
            waveformStdDev: aw.waveformStdDev,
            layoutMode: waveformsMode,
            channelLocations: data.channelLocations,
            samplingFrequency: data.samplingFrequency,
            noiseLevel: data.noiseLevel,
            ampScaleFactor,
            width: 120,
            height: 120
        }
    })), [data.averageWaveforms, data.channelLocations, data.samplingFrequency, data.noiseLevel, waveformsMode, ampScaleFactor, plotClickHandlerGenerator])

    const _handleWaveformToggle = useCallback(() => {
        setWaveformsMode(m => (m === 'geom' ? 'vertical' : 'geom'))
    }, [])
    
    const scalingActions = useMemo(() => {
        const amplitudeScaleToolbarEntries = AmplitudeScaleToolbarEntries({ampScaleFactor, setAmpScaleFactor})
        const actions: ToolbarItem[] = [
            ...amplitudeScaleToolbarEntries,
            {
                type: 'divider'
            },
            {
                type: 'toggle',
                subtype: 'checkbox',
                callback: _handleWaveformToggle,
                title: waveformsMode === 'geom' ? 'Hide electrode geometry' : 'Show electrode geometry',
                selected: waveformsMode === 'geom'
            }
        ]
        return actions
    }, [waveformsMode, _handleWaveformToggle, ampScaleFactor])
    
    const TOOLBAR_WIDTH = 36 // hard-coded for now
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
                customActions={scalingActions}
            />
            <VerticalScrollView width={0} height={0}>
                <PlotGrid
                    plots={plots}
                    plotComponent={AverageWaveformPlot}
                    selectedPlotKeys={selectedUnitIds}
                    orderedPlotIds={orderedRowIds}
                />
            </VerticalScrollView>
        </Splitter>
    )
}

const subtractChannelMeans = (waveform: number[][]) => {
    return waveform.map(W => {
        const mean0 = computeMean(W)
        return W.map(a => (a - mean0))
    })
}

const computeMean = (ary: number[]) => ary.length > 0 ? mean(ary) : 0

export default AverageWaveformsView