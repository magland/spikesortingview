import React, { FunctionComponent } from 'react'
import { computeElectrodesFromIdsAndLocations } from 'views/AverageWaveforms/WaveformWidget/sharedDrawnComponents/electrodeGeometryLayout'
import { UnitLocationsViewData } from './UnitLocationsViewData'
import UnitLocationsWidget from './UnitLocationsWidget'

type UnitLocationsViewProps = {
    data: UnitLocationsViewData
    width: number
    height: number
}

const UnitLocationsView: FunctionComponent<UnitLocationsViewProps> = (props: UnitLocationsViewProps) => {
    const { data, width, height } = props

    const channelIds = Object.keys(data.channelLocations)
    const electrodes = computeElectrodesFromIdsAndLocations(channelIds, data.channelLocations)

    return (
        <UnitLocationsWidget
            width={width}
            height={height}
            electrodes={electrodes}
            units={data.units}
        />
    )
}


export default UnitLocationsView