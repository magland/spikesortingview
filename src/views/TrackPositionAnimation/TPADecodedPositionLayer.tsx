import BaseCanvas from 'FigurlCanvas/BaseCanvas'
import { FunctionComponent } from 'react'
import { inferno, magma, plasma, viridis } from 'scale-color-perceptual'
import { DecodedPositionFrame } from './TrackPositionAnimationTypes'

// EXAMPLE: https://www.figurl.org/f?v=http://localhost:3000&d=sha1://096f49d4bf44a052a541d2a9eeac56fbff62a6b8&label=chimi%20animation
// Same example, with decode information pre-made into an object:
// https://figurl.org/f?v=http://localhost:3000&d=sha1://1bd5fbc4302289435cf2da8a55d0ea6f52f59af5&label=chimi%20animation%20v2
// Fixed timestamps:
// https://figurl.org/f?v=http://localhost:3000&d=sha1://f4ab8296bd5f623f444a6240e78f7c7ece57344c&label=chimi%20animation%20v3
// Separate location information:
// https://figurl.org/f?v=http://localhost:3000&d=sha1://5de95504067e3daadc84c98e4412280afee5a2b9&label=chimi-animation-v4

export type DecodeLayerProps = {
    width: number
    height: number
    drawData: DecodeFrameProps
}

type DecodeFrameProps = {
    frame: DecodedPositionFrame | undefined
    colorMap?: ValidColorMap
}

export type ValidColorMap =  'inferno' | 'magma' | 'plasma' | 'viridis'

const baseRed = 168
const baseBlue = 70
const baseGreen = 168

const valuesRange = Array.from({length: 255}, (_, i) => i)
// We have a pretty small number of actual possible values, so just precompute the styles.
const stylesMap = {
    'inferno': valuesRange.map(i => inferno(i/255)),
    'magma': valuesRange.map(i => magma(i/255)),
    // 'plasma': valuesRange.map(i => plasma(i/255)),
    'plasma': valuesRange.map(i => plasma(Math.min(i/125, 1))),
//    'viridis': valuesRange.map(i => viridis(i/255)),
    'viridis': valuesRange.map(i =>  viridis(Math.min(i/125, 1))),
    'base': valuesRange.map((i) => `rgba(${baseRed}, ${baseBlue}, ${baseGreen}, ${i/5})`)
}

const draw = (context: CanvasRenderingContext2D, props: DecodeFrameProps) => {
    const { frame, colorMap } = props
    if (!frame) return
    context.clearRect(0, 0, context.canvas.width, context.canvas.height)

    const { location_rects_px: bins, values } = frame
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

const TPADecodedPositionLayer: FunctionComponent<DecodeLayerProps> = (props: DecodeLayerProps) => {
    const { width, height, drawData } = props

    return (
        <BaseCanvas<DecodeFrameProps>
            // {...props} // can replace width/height/drawData with this, but eh
            width={width}
            height={height}
            draw={draw}
            drawData={drawData}
        />
    )
}

export default TPADecodedPositionLayer
