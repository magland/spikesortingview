import React, { FunctionComponent } from 'react'
import ElectrodeGeometry from 'views/AverageWaveforms/WaveformWidget/sharedDrawnComponents/ElectrodeGeometry'
import { computeElectrodesFromIdsAndLocations } from 'views/AverageWaveforms/WaveformWidget/sharedDrawnComponents/electrodeGeometryLayout'
import { ElectrodeGeometryViewData } from './ElectrodeGeometryViewData'

type ElectrodeGeometryViewProps = {
    data: ElectrodeGeometryViewData
    width: number
    height: number
}

const ElectrodeGeometryView: FunctionComponent<ElectrodeGeometryViewProps> = (props: ElectrodeGeometryViewProps) => {
    const { data, width, height } = props
    const channelIds = Object.keys(data.channelLocations).map(id => parseInt(id))
    const electrodes = computeElectrodesFromIdsAndLocations(channelIds, data.channelLocations)

    return (
        <ElectrodeGeometry
            width={width}
            height={height}
            electrodes={electrodes}
        />
    )
}


export default ElectrodeGeometryView