import { runCalculationTaskAsync } from '@figurl/interface'
import React, { FunctionComponent, useMemo } from 'react'
import { TimeseriesLayoutOpts } from 'View'
import PositionPdfPlotWidget, { FetchSegmentQuery } from './PositionPdfPlotWidget'
import { LivePositionPdfPlotViewData } from './LivePositionPdfPlotViewData'

type Props = {
    data: LivePositionPdfPlotViewData
    timeseriesLayoutOpts?: TimeseriesLayoutOpts
    width: number
    height: number
}

const LivePositionPdfPlotView: FunctionComponent<Props> = ({data, timeseriesLayoutOpts, width, height}) => {
    const numPositions = data.numPositions
    const fetchSegment = useMemo(() => (async (query: FetchSegmentQuery) => {
        const ret = await runCalculationTaskAsync<number[][]>(
            'spikesortingview.fetch_position_pdf_segment.1',
            {
                pdf_object: data.pdfObject,
                segment_number: query.segmentNumber,
                downsample_factor: query.downsampleFactor
            }
        )
        return ret
    }), [data.pdfObject])
    return (
        <PositionPdfPlotWidget
            startTimeSec={data.startTimeSec}
            endTimeSec={data.endTimeSec}
            samplingFrequency={data.samplingFrequency}
            fetchSegment={fetchSegment}
            segmentSize={data.segmentSize}
            multiscaleFactor={data.multiscaleFactor}
            numPositions={numPositions}
            linearPositions={data.linearPositions}
            timeseriesLayoutOpts={timeseriesLayoutOpts}
            width={width}
            height={height}
        />
    )
}

export default LivePositionPdfPlotView