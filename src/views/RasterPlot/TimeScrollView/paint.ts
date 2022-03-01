import { TSVAxesLayerProps } from "./TSVAxesLayer";
import { TSVHighlightLayerProps } from './TSVHighlightLayer';
import { MainLayerProps } from "./TSVMainLayer";

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

// some nice purples: [161, 87, 201], or darker: [117, 56, 150]
// dark blue: 0, 30, 255
const defaultSpanHighlightColor = [0, 30, 255]

export const paintSpanHighlights = (context: CanvasRenderingContext2D, props: TSVHighlightLayerProps) => {
    const { height, margins, highlightSpans } = props
    context.clearRect(0, 0, context.canvas.width, context.canvas.height)
    if (!highlightSpans || highlightSpans.length === 0) { return }

    const visibleHeight = height - margins.bottom - margins.top
    const zeroHeight = margins.top
    highlightSpans.forEach(h => {
        const definedColor = h.color || defaultSpanHighlightColor
        const [r, g, b, a] = [...definedColor]
        if (a) context.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`

        h.pixelSpans.forEach((span) => {
            if (!a) {
                const alpha = span.width < 2 ? 1 : 0.2
                context.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
            }
            context.fillRect(span.start, zeroHeight, span.width, visibleHeight)
        })
    })
}


export const paintAxes = <T extends {[key: string]: any}>(context: CanvasRenderingContext2D, props: TSVAxesLayerProps<T> & {'selectedPanelKeys': string[]}) => {
    // I've left the timeRange in the props list since we will probably want to display something with it at some point
    // Q: maybe it'd be better to look at context.canvas.width rather than the width prop?
    const {width, height, margins, panels, panelHeight, perPanelOffset, selectedPanelKeys, timeTicks, hideTimeAxis} = props
    context.clearRect(0, 0, context.canvas.width, context.canvas.height)
    
    // x-axes
    if (!hideTimeAxis) {
        context.strokeStyle = 'black'
        drawLine(context, margins.left, height - margins.bottom, width - margins.right, height - margins.bottom)
    }

    // time ticks
    for (let tt of timeTicks) {
        // const frac = (tt.value - timeRange[0]) / (timeRange[1] - timeRange[0])
        // const x = margins.left + frac * (width - margins.left - margins.right)
        context.strokeStyle = tt.major ? 'gray' : 'lightgray'
        // this is the tick line inside the plot view
        drawLine(context, tt.pixelXposition, height - margins.bottom, tt.pixelXposition, margins.top)
        if (!hideTimeAxis) {
            // this is the tick line that extends below the plot view
            drawLine(context, tt.pixelXposition, height - margins.bottom, tt.pixelXposition, height - margins.bottom + 5)
            context.textAlign = 'center'
            context.textBaseline = 'top'
            const y1 = height - margins.bottom + 7
            context.fillStyle = tt.major ? 'black' : 'gray'
            context.fillText(tt.label, tt.pixelXposition, y1)
        }
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

    // // Highlighted spans
    // if (highlightSpans && highlightSpans.length > 0) {
    //     paintSpanHighlights(context, margins.top, context.canvas.height - margins.bottom - margins.top, highlightSpans)
    // }


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