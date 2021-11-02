import React, { FunctionComponent } from 'react'
import { ElectrodeGeometryViewData } from './ElectrodeGeometryViewData'

type Props = {
    data: ElectrodeGeometryViewData
    width: number
    height: number
}

const ElectrodeGeometryView: FunctionComponent<Props> = ({data, width, height}) => {
    return (
        <div>
            <p>Not yet implemented</p>
            <div>
                <pre>{JSON.stringify(data, null, 4)}</pre>
            </div>
        </div>
    )
}


export default ElectrodeGeometryView