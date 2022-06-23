import { FunctionComponent, useMemo } from "react"
import LayoutItemView from "./LayoutItemView"
import { LayoutItem, SLView } from "./SortingLayoutViewData"

type Props = {
    layoutItem: LayoutItem
    views: SLView[]
    width: number
    height: number
}

type ItemPosition = {
    left: number,
    top: number,
    width: number,
    height: number
}

export const computeSizes = (
    totalSize: number,
    itemCount: number,
    itemProperties: {
        minSize?: number, maxSize?: number, stretch?: number
    }[]
) => {
    while (itemProperties.length < itemCount) {
        itemProperties.push({})
    }
    let ret: number[] = []
    let remainingSize = totalSize
    for (let x of itemProperties) {
        ret.push(x.minSize || 0)
        remainingSize -= x.minSize || 0
    }
    while (remainingSize > 1e-3) {
        let totalStretch = 0
        for (let x of itemProperties) {
            totalStretch += x.stretch ? x.stretch : 1
        }
        if (totalStretch === 0) break
        const remainingSize0 = remainingSize
        let somethingChanged = false
        for (let i = 0; i < itemProperties.length; i++) {
            const s = ret[i]
            const str = itemProperties[i].stretch
            let newS = s + remainingSize0 * (str ? str : 1) / totalStretch
            if (itemProperties[i].maxSize !== undefined) {
                newS = Math.min(newS, itemProperties[i].maxSize || 0)
            }
            if (newS > s) {
                ret[i] = newS
                remainingSize -= (newS - s)
                somethingChanged = true
            }
        }
        if (!somethingChanged) break
    }
    return ret
}
    

const BoxLayoutItemView: FunctionComponent<Props> = ({layoutItem, views, width, height}) => {
    if (layoutItem.type !== 'Box') {
        throw Error('Unexpected')
    }
    const {direction, items, itemProperties} = layoutItem
    const itemPositions: ItemPosition[] = useMemo(() => {
        if (direction === 'horizontal') {
            const ret: ItemPosition[] = []
            const itemWidths = computeSizes(width, items.length, itemProperties || [])
            let x = 0
            for (let i=0; i<items.length; i++) {
                ret.push({
                    left: x,
                    top: 0,
                    width: itemWidths[i],
                    height
                })
                x += itemWidths[i]
            }
            return ret
        }
        else {
            const ret: ItemPosition[] = []
            const itemHeights = computeSizes(height, items.length, itemProperties || [])
            let y = 0
            for (let i=0; i<items.length; i++) {
                ret.push({
                    left: 0,
                    top: y,
                    width,
                    height: itemHeights[i]
                })
                y += itemHeights[i]
            }
            return ret
        }
    }, [direction, items, width, height, itemProperties])

    return (
        <div style={{position: 'absolute', left: 0, top: 0, width, height}}>
            {
                items.map((item, i) => {
                    const p = itemPositions[i]
                    return (
                        <div key={i} style={{position: 'absolute', left: p.left, top: p.top, width: p.width, height: p.height}}>
                            <LayoutItemView
                                layoutItem={item}
                                views={views}
                                width={p.width}
                                height={p.height}
                            />
                        </div>
                    )
                })
            }
        </div>
    )
}

export default BoxLayoutItemView