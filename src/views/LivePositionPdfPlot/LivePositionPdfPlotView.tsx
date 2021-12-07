import { runPureCalculationTaskAsync } from 'figurl'
import React, { FunctionComponent, useMemo } from 'react'
import PositionPdfPlotWidget, { FetchSegmentQuery } from 'views/PositionPdfPlot/PositionPdfPlotWidget'
import { LivePositionPdfPlotViewData } from './LivePositionPdfPlotViewData'

type Props = {
    data: LivePositionPdfPlotViewData
    width: number
    height: number
}

const LivePositionPdfPlotView: FunctionComponent<Props> = ({data, width, height}) => {
    const numPositions = data.numPositions
    const fetchSegment = useMemo(() => (async (query: FetchSegmentQuery) => {
        const ret = await runPureCalculationTaskAsync<number[][]>(
            'spikesortingview.fetch_position_pdf_segment.1',
            {
                pdf_object: data.pdfObject,
                segment_number: query.segmentNumber,
                segment_size: query.segmentSize,
                downsample_factor: query.downsampleFactor
            },
            {}
        )
        return ret
    }), [data.pdfObject])
    return (
        <PositionPdfPlotWidget
            startTimeSec={data.startTimeSec}
            endTimeSec={data.endTimeSec}
            samplingFrequency={data.samplingFrequency}
            fetchSegment={fetchSegment}
            numPositions={numPositions}
            width={width}
            height={height}
        />
    )
}

export default LivePositionPdfPlotView