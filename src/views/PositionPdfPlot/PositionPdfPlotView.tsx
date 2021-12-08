import React, { FunctionComponent, useMemo } from 'react'
import { PositionPdfPlotViewData } from './PositionPdfPlotViewData'
import PositionPdfPlotWidget, { allocate2d, FetchSegmentQuery } from './PositionPdfPlotWidget'

type Props = {
    data: PositionPdfPlotViewData
    width: number
    height: number
}

const segmentSize = 10000
const multiscaleFactor = 3

const PositionPdfPlotView: FunctionComponent<Props> = ({data, width, height}) => {
    const numPositions = data.pdf[0].length
    const fetchSegment = useMemo(() => (async (query: FetchSegmentQuery) => {
        const ret = allocate2d(query.segmentSize, numPositions, 0) as number[][]
        for (let i = 0; i < query.segmentSize; i++) {
            for (let a = 0; a < query.downsampleFactor; a++) {
                const i2 = i * query.downsampleFactor + a
                const j = query.segmentNumber * query.segmentSize + i2
                if ((0 <= j) && (j < data.pdf.length)) {
                    for (let p = 0; p < numPositions; p++) {
                        ret[i][p] += data.pdf[j][p]
                    }
                }
            }
        }
        for (let i = 0; i < query.segmentSize; i++) {
            for (let p = 0; p < numPositions; p++) {
                ret[i][p] /= query.downsampleFactor
            }
        }
        return ret
    }), [data.pdf, numPositions])

    const endTimeSec = data.startTimeSec + data.pdf.length / data.samplingFrequency

    return (
        <PositionPdfPlotWidget
            startTimeSec={data.startTimeSec}
            endTimeSec={endTimeSec}
            samplingFrequency={data.samplingFrequency}
            fetchSegment={fetchSegment}
            numPositions={numPositions}
            segmentSize={segmentSize}
            multiscaleFactor={multiscaleFactor}
            width={width}
            height={height}
        />
    )
}

export default PositionPdfPlotView