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

type TimeTick = {
    value: number
    label: string
    major: boolean
}

const getTimeTicks = (timeRange: [number, number], width: number) => {
    const tickUnits: {
        name: string,
        duration: number
        num: number,
        label: (a: number) => string
    }[] = [
        {
            name: '1ms',
            duration: 0.001,
            num: 10,
            label: (a: number) => (`${a % 1000} ms`)
        },
        {
            name: '10ms',
            duration: 0.01,
            num: 10,
            label: (a: number) => (`${(a * 10) % 1000} ms`)
        },
        {
            name: '100ms',
            duration: 0.1,
            num: 10,
            label: (a: number) => (`${(a * 100) % 1000} ms`)
        },
        {
            name: '1s',
            duration: 1,
            num: 10,
            label: (a: number) => (`${a % 60} s`)
        },
        {
            name: '10s',
            duration: 10,
            num: 6,
            label: (a: number) => (`${(a * 10) % 60} s`)
        },
        {
            name: '1min',
            duration: 60,
            num: 10,
            label: (a: number) => (`${a % 60} min`)
        },
        {
            name: '10min',
            duration: 60 * 10,
            num: 6,
            label: (a: number) => (`${(a * 10) % 60} min`)
        },
        {
            name: '1hr',
            duration: 60 * 60,
            num: 6,
            label: (a: number) => (`${a % 24} hr`)
        },
        {
            name: '6hr',
            duration: 60 * 60 * 6,
            num: 4,
            label: (a: number) => (`${(a * 6) % 24} hr`)
        },
        {
            name: '1day',
            duration: 60 * 60 * 24,
            num: 10,
            label: (a: number) => (`${a} day`)
        },
        {
            name: '10day',
            duration: 60 * 60 * 24 * 10,
            num: 10000,
            label: (a: number) => (`${10 * a} day`)
        }
    ]
    const ret: TimeTick[] = []
    for (let u of tickUnits) {
        const i1 = Math.ceil(timeRange[0] / u.duration)
        const i2 = Math.floor(timeRange[1] / u.duration) 
        const n = i2 - i1 + 1
        const pixelsPerTick = width / n
        if (pixelsPerTick > 50) {
            const major = (pixelsPerTick > 200) || (n <= 5)
            for (let i = i1; i <= i2; i++) {
                const v = i % u.num
                if (v !== 0) {
                    ret.push({
                        value: i * u.duration,
                        label: u.label(i),
                        major
                    })
                }
            }
        }
    }
    return ret
}

export const paintAxes = <T extends {[key: string]: any}>(context: CanvasRenderingContext2D, props: TSVAxesLayerProps<T> & {'selectedPanelKeys': string[]}) => {
    // I've left the timeRange in the props list since we will probably want to display something with it at some point
    // Q: maybe it'd be better to look at context.canvas.width rather than the width prop?
    const {width, height, margins, panels, panelHeight, focusTimePixels, perPanelOffset, selectedPanelKeys, timeRange} = props
    context.clearRect(0, 0, context.canvas.width, context.canvas.height)
    
    // x-axes
    context.strokeStyle = 'black'
    drawLine(context, margins.left, height - margins.bottom, width - margins.right, height - margins.bottom)

    // time ticks
    const timeTicks = getTimeTicks(timeRange, width - margins.left - margins.right)
    for (let tt of timeTicks) {
        const frac = (tt.value - timeRange[0]) / (timeRange[1] - timeRange[0])
        const x = margins.left + frac * (width - margins.left - margins.right)
        context.strokeStyle = tt.major ? 'gray' : 'lightgray'
        drawLine(context, x, height - margins.bottom, x, margins.top)
        context.textAlign = 'center'
        context.textBaseline = 'top'
        const y1 = height - margins.bottom + 5
        context.fillStyle = tt.major ? 'black' : 'gray'
        context.fillText(tt.label, x, y1)
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