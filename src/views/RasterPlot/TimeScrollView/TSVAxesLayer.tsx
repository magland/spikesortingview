import React, { FunctionComponent, useEffect, useRef } from 'react';
import { TimeScrollViewPanel } from './TimeScrollView';
import { paint } from './TSVMainLayer';

type Props = {
    panels: TimeScrollViewPanel[]
    timeRange: [number, number]
    margins: {left: number, right: number, top: number, bottom: number}
    width: number
    height: number
}

const canvasStyle: React.CSSProperties = {position: 'absolute'}

const TSVAxesLayer: FunctionComponent<Props> = ({width, height, panels, timeRange, margins}) => {
    const ref = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const context = ref.current?.getContext('2d')
        if (!context) return
        if (panels.length === 0) return

        paint(context, {width, height, panels, timeRange, margins}, 'axes')
    }, [width, height, panels, timeRange, margins])

    return (
        <canvas ref={ref} width={width} height={height} style={canvasStyle} />
    )
}

export default TSVAxesLayer