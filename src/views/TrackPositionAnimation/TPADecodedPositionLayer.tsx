import BaseCanvas, { DrawFn } from 'FigurlCanvas/BaseCanvas'
import { FunctionComponent, useCallback } from 'react'
import { inferno, magma, plasma, viridis } from 'scale-color-perceptual'
import { DecodedPositionFramePx } from './TrackPositionAnimationTypes'

// EXAMPLE:
// https://figurl.org/f?v=http://localhost:3000&d=sha1://516fcb16508607f56e666a973451b06ab6fac35f&label=chimi-animation-v6b



export type DecodeLayerProps = {
    width: number
    height: number
    drawData: DecodeFrameProps
    configuredDrawFnCallback: DrawFn<DecodeFrameProps>
}

type DecodeFrameProps = {
    frame: DecodedPositionFramePx | undefined
}

export type ValidColorMap =  'inferno' | 'magma' | 'plasma' | 'viridis'

const baseRed = 168
const baseBlue = 70
const baseGreen = 168

const valuesRange = Array.from({length: 255}, (_, i) => i)
// We have a pretty small number of actual possible values, so just precompute the styles.
const stylesMap = {
    // 'inferno': valuesRange.map(i => inferno(i/255)),
    'inferno': valuesRange.map(i => inferno(Math.min(i/125, 1))),
    // 'magma': valuesRange.map(i => magma(i/255)),
    'magma': valuesRange.map(i => magma(Math.min(i/125, 1))),
    // 'plasma': valuesRange.map(i => plasma(i/255)),
    'plasma': valuesRange.map(i => plasma(Math.min(i/125, 1))),
    // 'viridis': valuesRange.map(i => viridis(i/255)),
    'viridis': valuesRange.map(i =>  viridis(Math.min(i/125, 1))),
    'base': valuesRange.map((i) => `rgba(${baseRed}, ${baseBlue}, ${baseGreen}, ${i/5})`)
}

const draw = (context: CanvasRenderingContext2D, props: DecodeFrameProps, colorMap?: ValidColorMap) => {
    const { frame } = props
    if (!frame) return
    context.clearRect(0, 0, context.canvas.width, context.canvas.height)

    const { locationRectsPx: bins, values } = frame
    // TODO: Test efficiency. It may be preferable to order by intensity to avoid changing styles (though current performance is fine).
    // TODO: Test whether we can expand the regions being drawn to create a smoother effect.
    // TODO: Maybe a useful form of preprocessing would convert the scalar value to the styles and then sort by those keys?

    values.forEach((v, i) => {
        const style = stylesMap[colorMap || 'base'][v]
        context.beginPath()
        context.fillStyle = style
        context.strokeStyle = style
        const r = bins[i]
        context.rect(r[0], r[1], r[2], r[3])
        context.stroke()
        context.fill()
    })
}

export const useConfiguredPositionDrawFunction = (colorMap?: ValidColorMap) => {
    return useCallback((context: CanvasRenderingContext2D, props: DecodeFrameProps) => draw(context, props, colorMap), [colorMap])
}

const TPADecodedPositionLayer: FunctionComponent<DecodeLayerProps> = (props: DecodeLayerProps) => {
    const { width, height, drawData, configuredDrawFnCallback } = props

    return (
        <BaseCanvas<DecodeFrameProps>
            // {...props} // can replace width/height/drawData with this, but eh
            width={width}
            height={height}
            draw={configuredDrawFnCallback}
            drawData={drawData}
        />
    )
}

export default TPADecodedPositionLayer
