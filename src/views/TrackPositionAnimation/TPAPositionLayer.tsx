import BaseCanvas from "FigurlCanvas/BaseCanvas"
import { FunctionComponent } from "react"
import { PositionFrame } from "./TrackPositionAnimationTypes"

export type TPAPositionLayerProps = {
    width: number
    height: number
    drawData: PositionProps
}

type PositionProps = {
    frame: PositionFrame
    bottomMargin: number
    dotStyle?: string
}

const DEFAULT_POSITION_DOT_STYLE = 'rgb(210, 128, 0)'

const draw = (context: CanvasRenderingContext2D, props: PositionProps) => {
    const { bottomMargin, frame, dotStyle } = props
    if (!frame) return

    context.font = `${Math.min(Math.floor(bottomMargin * .5), 30)}px sans-serif`
    context.clearRect(0, 0, context.canvas.width, context.canvas.height)
    context.beginPath()
    context.fillStyle = dotStyle || DEFAULT_POSITION_DOT_STYLE
    context.arc(frame.x, frame.y, 10, 0, 2*Math.PI)
    context.fill()
    if (frame.timestamp) {
        context.fillStyle = 'black'
        context.textAlign = 'center'
        context.textBaseline = 'top'
        context.fillText(`${frame.timestamp.toFixed(3)} seconds`, context.canvas.width/2, context.canvas.height - bottomMargin/2)
    }
}

const TPAPositionLayer: FunctionComponent<TPAPositionLayerProps> = (props: TPAPositionLayerProps) => {
    const { width, height, drawData } = props

    return (
        <BaseCanvas<PositionProps>
            width={width}
            height={height}
            draw={draw}
            drawData={drawData}
        />
    )
}

export default TPAPositionLayer
