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
    const {width, height, margins, panels, panelHeight, focusTimePixels, perPanelOffset, selectedPanelKeys} = props
    context.clearRect(0, 0, context.canvas.width, context.canvas.height)
    
    // x-axes
    context.strokeStyle = 'black'
    drawLine(context, margins.left, height - margins.bottom, width - margins.right, height - margins.bottom)

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

    // focus time
    if (focusTimePixels !== undefined) {
        context.strokeStyle = 'red'
        context.beginPath()
        context.moveTo(focusTimePixels, margins.top)
        context.lineTo(focusTimePixels, context.canvas.height - margins.bottom)
        context.stroke()
    }
}

const drawLine = (context: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) => {
    context.beginPath()
    context.moveTo(x1, y1)
    context.lineTo(x2, y2)
    context.stroke()
}