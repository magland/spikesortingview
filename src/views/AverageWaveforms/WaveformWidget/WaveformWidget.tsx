import { FunctionComponent, useMemo } from 'react'
import ElectrodeGeometry, { Electrode, LayoutMode } from './sharedDrawnComponents/ElectrodeGeometry'
import { computeElectrodeLocations, xMargin as xMarginDefault } from './sharedDrawnComponents/electrodeGeometryLayout'
import { ElectrodeColors } from './sharedDrawnComponents/electrodeGeometryPainting'
import { getSpikeAmplitudeNormalizationFactor } from './waveformLogic'
import WaveformPlot, { WaveformColors } from './WaveformPlot'


export type WaveformOpts = {
    colors?: WaveformColors
    waveformWidth: number
    showChannelIds: boolean
}

export type WaveformWidgetProps = {
    waveforms: {
        electrodeIndices: number[]
        waveform: number[][]
        waveformStdDev?: number[][]
        waveformColors: WaveformColors
    }[]
    ampScaleFactor: number
    electrodes: Electrode[]
    layoutMode: LayoutMode
    width: number
    height: number
    colors?: ElectrodeColors
    showLabels?: boolean
    peakAmplitude: number
    samplingFrequency: number
    showChannelIds: boolean
    waveformWidth: number
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
    textLight: 'rgb(162, 162, 162)',
    textDark: 'rgb(32, 150, 150)'
}
const waveformColors: WaveformColors = {
    base: 'black'
}

const defaultElectrodeOpts = {
    colors: electrodeColors,
    showLabels: false
}

export const defaultWaveformOpts: WaveformOpts = {
    colors: waveformColors,
    waveformWidth: 2,
    showChannelIds: true
}

// TODO: FIX AVG WAVEFORM NUMPY VIEW
// TODO: FIX SNIPPET BOX
const WaveformWidget: FunctionComponent<WaveformWidgetProps> = (props) => {
    const colors = props.colors ?? defaultElectrodeOpts.colors
    const {electrodes, waveforms, ampScaleFactor: userSpecifiedAmplitudeScaling, layoutMode, width, height, showChannelIds, waveformWidth} = props

    const maxElectrodePixelRadius = 1000

    const geometry = useMemo(() => <ElectrodeGeometry
        electrodes={electrodes}
        width={width}
        height={height}
        layoutMode={layoutMode}
        colors={colors}
        showLabels={showChannelIds}      // Would we ever not want to show labels for this?
        // offsetLabels={true}  // this isn't appropriate for a waveform view--it mislabels the electrodes
        // maxElectrodePixelRadius={defaultMaxPixelRadius}
        maxElectrodePixelRadius={maxElectrodePixelRadius}
        disableSelection={true}      // ??
    />, [electrodes, width, height, layoutMode, colors, showChannelIds])

    // TODO: Don't do this twice, work it out differently
    const { convertedElectrodes, pixelRadius, xMargin: xMarginBase } = computeElectrodeLocations(width, height, electrodes, layoutMode, maxElectrodePixelRadius, {})
    const xMargin = xMarginBase || xMarginDefault

    // Spikes are defined as being some factor greater than the baseline noise.
    const amplitudeNormalizationFactor = useMemo(() => getSpikeAmplitudeNormalizationFactor(props.peakAmplitude), [props.peakAmplitude])
    const yScaleFactor = useMemo(() => (userSpecifiedAmplitudeScaling * amplitudeNormalizationFactor), [userSpecifiedAmplitudeScaling, amplitudeNormalizationFactor])

    // TODO: THIS LOGIC PROBABLY SHOULDN'T BE REPEATED HERE AND IN THE ELECTRODE GEOMETRY PAINT FUNCTION
    const oneElectrodeHeight = layoutMode === 'geom' ? pixelRadius * 2 : height / electrodes.length
    const oneElectrodeWidth = layoutMode === 'geom' ? pixelRadius * 2 : width - xMargin - (showChannelIds ? 2*pixelRadius : 0)
    const waveformPlot = <WaveformPlot
        electrodes={convertedElectrodes}
        waveforms={waveforms}
        oneElectrodeHeight={oneElectrodeHeight}
        oneElectrodeWidth={oneElectrodeWidth}
        yScale={yScaleFactor}
        width={width}
        height={height}
        layoutMode={layoutMode}
        waveformWidth={waveformWidth}
    />

    return (
        <div style={{width, height, position: 'relative'}}>
            {geometry}
            {waveformPlot}
        </div>
    )
}

export default WaveformWidget