import React, { FunctionComponent, useEffect, useRef } from 'react';

export type BarBox = {x1: number, x2: number, y1: number, y2: number, tooltip: string}

type Props = {
    barBoxes: BarBox[]
    width: number
    height: number
}

const canvasStyle: React.CSSProperties = {
    position: 'absolute'
}

const paint = (context: CanvasRenderingContext2D, barBoxes: BarBox[]) => {
    const color = 'rgb(140, 120, 200)'
    context.fillStyle = color
    
    barBoxes.forEach(b => {
        context.fillRect(b.x1, b.y1, b.x2 - b.x1, b.y2 - b.y1)
    })
}

const BarPlotMainLayer: FunctionComponent<Props> = ({barBoxes, width, height}) => {
    const ref = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvasElement = ref.current
        const context = canvasElement?.getContext('2d')
        if (!context) return
        paint(context, barBoxes)
    }, [barBoxes])

    return (
        <canvas ref={ref} width={width} height={height} style={canvasStyle} />
    )
}

export default BarPlotMainLayer