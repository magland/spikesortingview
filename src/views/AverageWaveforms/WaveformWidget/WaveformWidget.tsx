import { FunctionComponent, useMemo } from 'react'
import ElectrodeGeometry, { defaultMaxPixelRadius, Electrode, LayoutMode } from './sharedDrawnComponents/ElectrodeGeometry'
import { computeElectrodeLocations, xMargin as xMarginDefault } from './sharedDrawnComponents/electrodeGeometryLayout'
import { ElectrodeColors } from './sharedDrawnComponents/electrodeGeometryPainting'
import { getSpikeAmplitudeNormalizationFactor } from './waveformLogic'
import WaveformPlot, { WaveformColors, WaveformPoint } from './WaveformPlot'


export type WaveformWidgetProps = {
    waveform?: number[][]
    ampScaleFactor: number
    electrodes: Electrode[]
    layoutMode: LayoutMode
    width: number
    height: number
    selectedElectrodeIds: number[]
    // selectionDispatch: RecordingSelectionDispatch
    colors?: ElectrodeColors
    showLabels?: boolean
    noiseLevel: number
    samplingFrequency: number
    waveformOpts: {
        colors?: WaveformColors
        waveformWidth: number
    }
}

const electrodeColors: ElectrodeColors = {
    border: 'rgb(120, 100, 120)',
    base: 'rgb(240, 240, 240)',
    selected: 'rgb(196, 196, 128)',
    hover: 'rgb(128, 128, 255)',
    selectedHover: 'rgb(200, 200, 196)',
    dragged: 'rgb(0, 0, 196)',
    draggedSelected: 'rgb(180, 180, 150)',
    dragRect: 'rgba(196, 196, 196, 0.5)',
    textLight: 'rgb(32, 92, 92)',
    textDark: 'rgb(32, 150, 150)'
}
const waveformColors: WaveformColors = {
    base: 'black'
}

const defaultElectrodeOpts = {
    colors: electrodeColors,
    showLabels: false
}

export const defaultWaveformOpts = {
    colors: waveformColors,
    waveformWidth: 2
}

// TODO: FIX AVG WAVEFORM NUMPY VIEW
// TODO: FIX SNIPPET BOX
const WaveformWidget: FunctionComponent<WaveformWidgetProps> = (props) => {
    const showLabels = props.showLabels ?? defaultElectrodeOpts.showLabels
    const colors = props.colors ?? defaultElectrodeOpts.colors
    const waveformOpts = useMemo(() => ({...defaultWaveformOpts, ...props.waveformOpts}), [props.waveformOpts])
    const {electrodes, selectedElectrodeIds, waveform, ampScaleFactor: userSpecifiedAmplitudeScaling, layoutMode, width, height} = props

    const geometry = useMemo(() => <ElectrodeGeometry
        electrodes={electrodes}
        selectedElectrodeIds={selectedElectrodeIds}
        // selectionDispatch={selectionDispatch}
        width={width}
        height={height}
        layoutMode={layoutMode}
        colors={colors}
        showLabels={showLabels}      // Would we ever not want to show labels for this?
        offsetLabels={true}
        maxElectrodePixelRadius={defaultMaxPixelRadius}
        disableSelection={true}      // ??
    />, [electrodes, selectedElectrodeIds, width, height, layoutMode, colors, showLabels])

    // TODO: Don't do this twice, work it out differently
    const { convertedElectrodes, pixelRadius, xMargin: xMarginBase } = computeElectrodeLocations(width, height, electrodes, layoutMode, defaultMaxPixelRadius)
    const xMargin = xMarginBase || xMarginDefault

    // Spikes are defined as being some factor greater than the baseline noise.
    const amplitudeNormalizationFactor = useMemo(() => getSpikeAmplitudeNormalizationFactor(props.noiseLevel), [props.noiseLevel])
    const yScaleFactor = useMemo(() => (userSpecifiedAmplitudeScaling * amplitudeNormalizationFactor), [userSpecifiedAmplitudeScaling, amplitudeNormalizationFactor])

    // 'waveforms' is a list of lists of points. There's one outer list per channel (so far so good).
    // The inner list is just a list of numbers, but they should be interpreted as pairs of (amplitude, time).
    // So to get the job result into something structured, you need to iterate *pairwise* over the inner list.
    const baseWaveformPoints: WaveformPoint[][] = waveform?.map(waveformDataSet => 
        {
            return waveformDataSet.map((amplitude, time) => {
                return { amplitude, time } as WaveformPoint
            })
        }) ?? []
    
    // TODO: THIS LOGIC PROBABLY SHOULDN'T BE REPEATED HERE AND IN THE ELECTRODE GEOMETRY PAINT FUNCTION
    const oneElectrodeHeight = layoutMode === 'geom' ? pixelRadius * 2 : height / electrodes.length
    const oneElectrodeWidth = layoutMode === 'geom' ? pixelRadius * 2 : width - xMargin - (showLabels ? 2*pixelRadius : 0)
    const waveformPlot = <WaveformPlot
        electrodes={convertedElectrodes}
        waveformPoints={baseWaveformPoints}
        waveformOpts={waveformOpts}
        oneElectrodeHeight={oneElectrodeHeight}
        oneElectrodeWidth={oneElectrodeWidth}
        yScale={yScaleFactor}
        width={width}
        height={height}
        layoutMode={layoutMode}
    />

    return (
        <div style={{width, height, position: 'relative'}}>
            {geometry}
            {waveformPlot}
        </div>
    )
}

export default WaveformWidget