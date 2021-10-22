import React, { FunctionComponent, useEffect, useRef } from 'react';
import { TimeScrollViewPanel } from './TimeScrollView';

type Props = {
    panels: TimeScrollViewPanel[]
    timeRange: [number, number]
    margins: {left: number, right: number, top: number, bottom: number}
    width: number
    height: number
}

const drawLine = (context: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) => {
    context.beginPath()
    context.moveTo(x1, y1)
    context.lineTo(x2, y2)
    context.stroke()
}

export const paint = (context: CanvasRenderingContext2D, props: Props, layer: 'main' | 'axes') => {
    const {width, height, margins, timeRange, panels} = props
    context.clearRect(0, 0, width, height)
    const panelHeight = (height - margins.top - margins.bottom) / panels.length
    if (layer === 'main') {
        for (let i = 0; i < panels.length; i++) {
            const p = panels[i]
            const y1 = margins.top + i * panelHeight
            const rect = {x: margins.left, y: y1, width: width - margins.left - margins.right, height: panelHeight}
            p.paint(context, rect, timeRange, p.props)
        }
    }
    else if (layer === 'axes') {
        // x-axes
        context.strokeStyle = 'black'
        drawLine(context, margins.left, height - margins.bottom, width - margins.right, height - margins.bottom)

        // panel axes
        for (let i = 0; i < panels.length; i++) {
            const p = panels[i]
            context.textAlign = 'right'
            context.textBaseline = 'middle'
            const y1 = margins.top + i * panelHeight
            context.fillText(p.label, margins.left - 5, y1 + panelHeight / 2)
        }
    }
}

const canvasStyle: React.CSSProperties = {position: 'absolute'}

const TSVMainLayer: FunctionComponent<Props> = ({width, height, panels, timeRange, margins}) => {
    const ref = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const context = ref.current?.getContext('2d')
        if (!context) return
        if (panels.length === 0) return

        paint(context, {width, height, panels, timeRange, margins}, 'main')
    }, [width, height, panels, timeRange, margins])

    return (
        <canvas ref={ref} width={width} height={height} style={canvasStyle} />
    )
}

export default TSVMainLayer