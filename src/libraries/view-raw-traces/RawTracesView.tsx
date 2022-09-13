import { getFileData } from 'libraries/figurl'
import { FunctionComponent, useMemo } from 'react'
import { TimeseriesLayoutOpts } from 'View'
import RawTracesComponent from './RawTracesComponent'
import { RawTracesViewData } from './RawTracesViewData'

type Props = {
    data: RawTracesViewData
    timeseriesLayoutOpts?: TimeseriesLayoutOpts
    width: number
    height: number
}

const RawTracesView: FunctionComponent<Props> = ({data, timeseriesLayoutOpts, width, height}) => {
    const {startTimeSec, samplingFrequency, numFrames, channelIds, chunkSize, tracesChunks} = data
    const getTracesData = useMemo(() => (
        async (q: {ds: number, i: number}) => {
            if (q.ds === 1) {
                const uri = tracesChunks[`${q.ds}-${q.i}`] as string
                const ch = await getFileData(uri, () => {})
                return ch
            }
            else {
                const uri = tracesChunks[`${q.ds}-${q.i}`] as {min: string, max: string}
                const uriMin = uri.min
                const uriMax = uri.max
                const chMin = await getFileData(uriMin, () => {}) 
                const chMax = await getFileData(uriMax, () => {}) 
                return {min: chMin, max: chMax}
            }
        }
    ), [tracesChunks])
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

export default RawTracesView