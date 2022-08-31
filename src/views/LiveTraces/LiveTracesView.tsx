import { runCalculationTaskAsync } from 'figurl'
import { FunctionComponent, useMemo } from 'react'
import { TimeseriesLayoutOpts } from 'View'
import RawTracesComponent from '../RawTraces/RawTracesComponent'
import { LiveTracesViewData } from './LiveTracesViewData'

type Props = {
    data: LiveTracesViewData
    timeseriesLayoutOpts?: TimeseriesLayoutOpts
    width: number
    height: number
}

const LiveTracesView: FunctionComponent<Props> = ({data, timeseriesLayoutOpts, width, height}) => {
    const {startTimeSec, samplingFrequency, numFrames, channelIds, chunkSize, tracesId} = data
    const getTracesData = useMemo(() => (
        async (q: {ds: number, i: number}) => {
            return await runCalculationTaskAsync<number[][] | {min: number[][], max: number[][]}>(
                `getLiveTraces.4.${tracesId}`,
                {
                    ds: q.ds,
                    i: q.i
                }
            )
        }
    ), [tracesId])
    return (
        <RawTracesComponent
            startTimeSec={startTimeSec}
            samplingFrequency={samplingFrequency}
            numFrames={numFrames}
            chunkSize={chunkSize}
            channelIds={channelIds}
            getTracesData={getTracesData}
            timeseriesLayoutOpts={timeseriesLayoutOpts}
            width={width}
            height={height}
        />
    )
}

export default LiveTracesView