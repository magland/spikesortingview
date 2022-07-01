import BaseCanvas from "FigurlCanvas/BaseCanvas";
import { FunctionComponent, useCallback, useMemo, useState } from "react";
import { AffineTransform, applyAffineTransform, applyAffineTransformInv, createAffineTransform, identityAffineTransform, inverseAffineTransform, multAffineTransforms } from "./AffineTransform";

type Props = {
    unitIds: (number | string)[]
    selectedUnitIds: Set<string | number>
    onSetSelectedUnitIds: (x: (string | number)[]) => void
    matrix: number[][]
    width: number
    height: number
}

const MatrixWidget: FunctionComponent<Props> = ({unitIds, selectedUnitIds, onSetSelectedUnitIds, matrix, width, height}) => {
    const [affineTransform, setAffineTransform] = useState<AffineTransform>(identityAffineTransform)
    // const indsForIds = useMemo(() => {
    //     const indsForIds: { [k: number | string]: number } = {}
    //     unitIds.forEach((id, i) => {
    //         indsForIds[id] = i
    //     })
    //     return indsForIds
    // }, [unitIds])
    const size = Math.min(width, height)
    const offsetX = (width - size) / 2
    const offsetY = (height - size) / 2
    const indToPixel = useMemo(() => (o: {i1: number, i2: number}) => (
        applyAffineTransform(affineTransform, {
            x: offsetX + o.i1 / unitIds.length * size,
            y: offsetY + o.i2 / unitIds.length * size
        })
    ), [unitIds.length, size, offsetX, offsetY, affineTransform])
    const pixelToInd = useMemo(() => (p: {x: number, y: number}) => {
        const p2 = applyAffineTransformInv(affineTransform, p)
        const i1 = Math.floor((p2.x - offsetX) / size * unitIds.length)
        const i2 =Math.floor((p2.y - offsetY) / size * unitIds.length)
        return (
            (0 <= i1) && (i1 < unitIds.length) && (0 <= i2) && (i2 < unitIds.length)
        ) ? {i1, i2} : undefined
    }, [unitIds.length, size, offsetX, offsetY, affineTransform])
    const paint = useCallback((ctxt: CanvasRenderingContext2D) => {
        ctxt.clearRect(0, 0, width, height)
        unitIds.forEach((u1, i1) => {
            unitIds.forEach((u2, i2) => {
                const {x: x1, y: y1} = indToPixel({i1, i2})
                const {x: x2, y: y2} = indToPixel({i1: i1 + 1, i2: i2 + 1})
                const col = colorForValue(matrix[i1][i2])
                ctxt.fillStyle = col
                ctxt.fillRect(x1, y1, x2 - x1, y2 - y1)
                if ((selectedUnitIds.has(u1)) && (selectedUnitIds.has(u2))) {
                    const col2 = colorForValue(matrix[i1][i2], true)
                    ctxt.strokeStyle = col2
                    const w = x2 - x1 >= 10 ? 3 : x2 - x1 >= 6 ? 2 : x2 - x1 >= 4 ? 1 : 0
                    ctxt.lineWidth = w
                    ctxt.strokeRect(x1, y1, x2 - x1 - w, y2 - y1 - w)
                }
            })
        })
    }, [indToPixel, matrix, unitIds, selectedUnitIds, width, height])
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        const boundingRect = e.currentTarget.getBoundingClientRect()
        const point = {x: e.clientX - boundingRect.x, y: e.clientY - boundingRect.y}
        const ind = pixelToInd(point)
        if (!ind) return
        onSetSelectedUnitIds([unitIds[ind.i1], unitIds[ind.i2]])
    }, [onSetSelectedUnitIds, unitIds, pixelToInd])
    const handleWheel = useCallback((e: React.WheelEvent) => {
        const boundingRect = e.currentTarget.getBoundingClientRect()
        const point = {x: e.clientX - boundingRect.x, y: e.clientY - boundingRect.y}
        const deltaY = e.deltaY
        const scaleFactor = 1.3
        let X = createAffineTransform([
            [scaleFactor, 0, (1 - scaleFactor) * point.x],
            [0, scaleFactor, (1 - scaleFactor) * point.y]
        ])
        if (deltaY > 0) X = inverseAffineTransform(X)
        let newTransform = multAffineTransforms(
            X,
            affineTransform
        )
        // test to see if we should snap back to identity
        const p00 = applyAffineTransform(newTransform, indToPixel({i1: 0, i2: 0}))
        const p11 = applyAffineTransform(newTransform, indToPixel({i1: unitIds.length, i2: unitIds.length}))
        if ((0 <= p00.x) && (p00.x < width) && (0 <= p00.y) && (p00.y < height)) {
            if ((0 <= p11.x) && (p11.x < width) && (0 <= p11.y) && (p11.y < height)) {
                newTransform = identityAffineTransform
            }
        }

        setAffineTransform(newTransform)
    }, [affineTransform, height, indToPixel, unitIds.length, width])
    return (
        <div
            style={{width, height, position: 'relative'}}
            onMouseDown={handleMouseDown}
            onWheel={handleWheel}
        >
            <BaseCanvas
                width={width}
                height={height}
                draw={paint}
                drawData={null}
            />
        </div>
    )
}

const colorForValue = (v: number, highlight?: boolean) => {
    if (isNaN(v)) {
        return `rgb(50, 20, 0)`
    }
    const a = Math.min(255, Math.max(0, Math.floor(v * 255)))
    const b = Math.min(255, Math.max(0, 255 - a - 30))
    return !highlight ? `rgb(${a}, ${a}, ${a})` : `rgb(${b}, ${b}, 255)`
}

export default MatrixWidget