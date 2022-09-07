import { BaseCanvas } from "libraries/FigurlCanvas"
import { cos, sin } from "mathjs"
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
    dotStyle?: string // TODO: Make this configurable by adding a draw callback generator
}

const DEFAULT_POSITION_DOT_STYLE = 'rgb(210, 128, 0)'
const defaultPositionRadius = 10
const defaultHeadRadius = 18
const rightAngle = Math.PI/2
const defaultTrianglePartialRadius = defaultPositionRadius * 1

const draw = (context: CanvasRenderingContext2D, props: PositionProps) => {
    const { bottomMargin, frame, dotStyle } = props
    if (!frame) return

    context.font = `${Math.min(Math.floor(bottomMargin * .5), 30)}px sans-serif`
    context.clearRect(0, 0, context.canvas.width, context.canvas.height)
    context.beginPath()
    context.fillStyle = dotStyle || DEFAULT_POSITION_DOT_STYLE
    context.arc(frame.x, frame.y, defaultPositionRadius, 0, 2*Math.PI)
    context.fill()
    if (frame.headDirection) {
        const localHeadDirection = frame.headDirection
        // remember, in pixelspace the y axis is flipped so its positive direction is down, not up.
        // so we should be subtracting, not adding, the sin values.
        const headX = frame.x + defaultHeadRadius * cos(localHeadDirection)
        const headY = frame.y - defaultHeadRadius * sin(localHeadDirection)
        const triAX = frame.x + defaultTrianglePartialRadius * cos(localHeadDirection + rightAngle)
        const triAY = frame.y - defaultTrianglePartialRadius * sin(localHeadDirection + rightAngle)
        const triBX = frame.x + defaultTrianglePartialRadius * cos(localHeadDirection - rightAngle)
        const triBY = frame.y - defaultTrianglePartialRadius * sin(localHeadDirection - rightAngle)

        context.beginPath()
        context.moveTo(headX, headY)
        context.lineTo(triAX, triAY)
        context.lineTo(triBX, triBY)
        context.closePath()
        // context.lineTo(defaultHeadRadius * cos(frame.headDirection), defaultHeadRadius * sin(frame.headDirection))
        context.fill()
    }

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
