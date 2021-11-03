import PlotGrid from 'components/PlotGrid/PlotGrid';
import { useSelectedUnitIds } from 'contexts/SortingSelectionContext';
import React, { FunctionComponent, useCallback, useMemo, useState } from 'react';
import { AverageWaveformsViewData } from './AverageWaveformsViewData';
import AverageWaveformPlot from './AverageWaveformPlot';
import colorForUnitId from 'views/common/colorForUnitId';
import {mean, number} from 'mathjs';
import ViewToolbar, { ViewToolbarAction } from 'views/common/ViewToolbar';
import Splitter from 'MountainWorkspace/components/Splitter/Splitter';
import VerticalScrollView from 'views/common/VerticalScrollView';
import { FaArrowDown, FaArrowUp, FaRegTimesCircle } from 'react-icons/fa'

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
    const _handleScaleAmplitudeUp = useCallback(() => {
        setAmpScaleFactor(x => (x * 1.2))
    }, [])
    const _handleScaleAmplitudeDown = useCallback(() => {
        setAmpScaleFactor(x => (x / 1.2))
    }, [])
    const _handleResetAmplitude = useCallback(() => {
        setAmpScaleFactor(1)
    }, [])
    
    const scalingActions = useMemo(() => {
        const actions: ViewToolbarAction[] = [
            {
                type: 'button',
                callback: _handleScaleAmplitudeUp,
                title: 'Scale amplitude up [up arrow]',
                icon: <FaArrowUp />,
                keyCode: 38
            },
            {
                type: 'button',
                callback: _handleResetAmplitude,
                title: 'Reset scale amplitude',
                icon: <FaRegTimesCircle />
            },
            {
                type: 'button',
                callback: _handleScaleAmplitudeDown,
                title: 'Scale amplitude down [down arrow]',
                icon: <FaArrowDown />,
                keyCode: 40
            },
            {
                type: 'text',
                title: 'Zoom level',
                content: ampScaleFactor,
                contentSigFigs: 2
            },
            {
                type: 'divider'
            },
            {
                type: 'checkbox',
                callback: _handleWaveformToggle,
                title: waveformsMode === 'geom' ? 'Hide electrode geometry' : 'Show electrode geometry',
                selected: waveformsMode === 'geom'
            }
        ]
        return actions
    }, [waveformsMode, _handleResetAmplitude, _handleScaleAmplitudeDown, _handleScaleAmplitudeUp, _handleWaveformToggle, ampScaleFactor])
    
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
                actions={scalingActions}
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