import PlotGrid from 'components/PlotGrid/PlotGrid';
import { useSelectedUnitIds } from 'contexts/SortingSelectionContext';
import { mean } from 'mathjs';
import Splitter from 'MountainWorkspace/components/Splitter/Splitter';
import React, { FunctionComponent, useCallback, useMemo, useState } from 'react';
import AmplitudeScaleToolbarEntries from 'views/common/AmplitudeScaleToolbarEntries';
import colorForUnitId from 'views/common/colorForUnitId';
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
    // const [selectedUnitIds, setSelectedUnitIds] = useState<number[]>([])
    const {selectedUnitIds, setSelectedUnitIds} = useSelectedUnitIds()
    const selectedPlotKeys = useMemo(() => (selectedUnitIds.map(u => (`${u}`))), [selectedUnitIds])
    const setSelectedPlotKeys = useCallback((keys: string[]) => {
        setSelectedUnitIds(keys.map(k => (Number(k))))
    }, [setSelectedUnitIds])

    const [ampScaleFactor, setAmpScaleFactor] = useState<number>(1)
    const [waveformsMode, setWaveformsMode] = useState<string>('geom')

    const plots = useMemo(() => (data.averageWaveforms.sort((a1, a2) => (a1.unitId - a2.unitId)).map(aw => ({
        key: `${aw.unitId}`,
        label: `Unit ${aw.unitId}`,
        labelColor: colorForUnitId(aw.unitId),
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
    }))), [data.averageWaveforms, data.channelLocations, data.samplingFrequency, data.noiseLevel, waveformsMode, ampScaleFactor])

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
                    selectedPlotKeys={selectedPlotKeys}
                    setSelectedPlotKeys={setSelectedPlotKeys}
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