import { TSVAxesLayerProps } from "./TSVAxesLayer"
import { MainLayerProps } from "./TSVMainLayer"

export const paintPanels = <T extends {[key: string]: any}>(context: CanvasRenderingContext2D, props: MainLayerProps<T>) => {
    const {margins, panels, perPanelOffset } = props
    context.resetTransform()
    context.clearRect(0, 0, context.canvas.width, context.canvas.height)
    context.translate(margins.left, margins.top)
    for (let i = 0; i < panels.length; i++) {
        const p = panels[i]
        p.paint(context, p.props)
        context.translate(0, perPanelOffset)
    }
}

const highlightedRowFillStyle = '#c5e1ff' // TODO: This should be standardized across the application

export const paintAxes = <T extends {[key: string]: any}>(context: CanvasRenderingContext2D, props: TSVAxesLayerProps<T> & {'selectedPanelKeys': string[]}) => {
    // I've left the timeRange in the props list since we will probably want to display something with it at some point
    // Q: maybe it'd be better to look at context.canvas.width rather than the width prop?
    const {width, height, margins, panels, panelHeight, perPanelOffset, selectedPanelKeys, timeTicks} = props
    context.clearRect(0, 0, context.canvas.width, context.canvas.height)
    
    // x-axes
    context.strokeStyle = 'black'
    drawLine(context, margins.left, height - margins.bottom, width - margins.right, height - margins.bottom)

    // time ticks
    for (let tt of timeTicks) {
        // const frac = (tt.value - timeRange[0]) / (timeRange[1] - timeRange[0])
        // const x = margins.left + frac * (width - margins.left - margins.right)
        context.strokeStyle = tt.major ? 'gray' : 'lightgray'
        drawLine(context, tt.pixelXposition, height - margins.bottom, tt.pixelXposition, margins.top)
        context.textAlign = 'center'
        context.textBaseline = 'top'
        const y1 = height - margins.bottom + 5
        context.fillStyle = tt.major ? 'black' : 'gray'
        context.fillText(tt.label, tt.pixelXposition, y1)
    }

    // selected panels
    if (selectedPanelKeys) {
        for (let i = 0; i < panels.length; i++) {
            const p = panels[i]
            if (selectedPanelKeys.includes(p.key)) {
                const y1 = margins.top + i * (perPanelOffset)
                const rect = {x: 0, y: y1, width: width, height: panelHeight}
                context.fillStyle = highlightedRowFillStyle
                context.fillRect(rect.x, rect.y, rect.width, rect.height)
            }
        }
    }

    // panel axes
    for (let i = 0; i < panels.length; i++) {
        const p = panels[i]
        context.textAlign = 'right'
        context.textBaseline = 'middle'
        const y1 = margins.top + i * (perPanelOffset)
        context.fillStyle = 'black'
        context.fillText(p.label, margins.left - 5, y1 + panelHeight / 2)
    }
}

const drawLine = (context: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) => {
    context.beginPath()
    context.moveTo(x1, y1)
    context.lineTo(x2, y2)
    context.stroke()
}