import React, { FunctionComponent, useMemo } from 'react'
import { PositionPdfPlotViewData } from './PositionPdfPlotViewData'
import PositionPdfPlotWidget, { FetchSegmentQuery } from './PositionPdfPlotWidget'

type Props = {
    data: PositionPdfPlotViewData
    width: number
    height: number
}

const segmentSize = 10000
const multiscaleFactor = 3

// Helper function, could be moved somewhere more general
// Still assumes the underlying array is not ragged
const vectorAverage = (vectorSet: number[][], startIndex: number, chunkLength: number): number[] => {
    // if startIndex + chunkLength exceeds the available, slice() will just return up to the end of the array
    const slice = vectorSet.slice(startIndex, startIndex + chunkLength)
    // does component-wise sum of vectors
    const componentSummation = (total: number[], vector: number[]) => {
        vector.forEach((component, index) => total[index] += component)
        return total
    }
    // reduce applies the sum to the vector list, starting from an appropriately-sized array of 0s
    const summedVectors = slice.reduce(componentSummation, Array(slice[0].length).fill(0))
    return summedVectors.map(component => component / slice.length)
}

const downsample = (data: number[][], downsampleFactor: number, startIndex: number = 0): number[][] => {
    const downsampled: number[][] = []
    // This downsamples from a starting index to the end of the data set.
    // If you wanted to stop early, could just slice the incoming data array to begin with
    const iterations = Math.ceil((data.length - startIndex) / downsampleFactor)
    for (let i = 0; i < iterations; i++) {
        downsampled.push(vectorAverage(data, startIndex + (i * downsampleFactor), downsampleFactor))
    }
    return downsampled
}

const PositionPdfPlotView: FunctionComponent<Props> = ({data, width, height}) => {
    const numPositions = data.pdf[0].length
    const fetchSegment = useMemo(() => (async (query: FetchSegmentQuery) => {
        return downsample(data.pdf, query.downsampleFactor, query.segmentNumber * query.segmentSize)

        // // Downsample data.pdf[], a number[][] array of vectors.
        // // We'd like to replace the full-resolution observations of pdf vectors
        // // by splitting the range into (downsampleFactor)-sized chunks. Each
        // // resulting index i will be the average of the next (downsampleFactor) observations.
        // const ret = allocate2d(query.segmentSize, numPositions, 0) as number[][]
        // const baseIndex = query.segmentNumber * query.segmentSize
        // if (query.segmentNumber < 0 || query.segmentSize < 0 || query.downsampleFactor < 0) {
        //     console.warn('Error: segment counts or sizes, and downsampling factors, must all be non-negative.')
        //     return ret
        // }
        // for (let i = 0; i < query.segmentSize; i++) {
        //     // I'm not sure this is the right limit--don't we wind up going too far forward?
        //     const sampleStartIndex = i * query.downsampleFactor
        //     for (let a = 0; a < query.downsampleFactor; a++) {
        //         const j = baseIndex + sampleStartIndex + a
        //         // j cannot be < 0
        //         // j always increases, so if we pass the end, we can just break
        //         if (j < data.pdf.length) break // inner for-loop
        //         // sum the vectors, component-wise
        //         for (let p = 0; p < numPositions; p++) {
        //             ret[i][p] += data.pdf[j][p]
        //         }
        //     }
        //     // now divide each component by the number of observations to complete the sum
        //     // (Note: dividing by downsampleFactor might be incorrect if we ran out of underlying
        //     // data before completing a downsampling segment.)
        //     for (let p = 0; p < numPositions; p++) {
        //         ret[i][p] /= query.downsampleFactor
        //     }
        // }
        // return ret
    }), [data.pdf])

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