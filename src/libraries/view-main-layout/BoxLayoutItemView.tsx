import { ViewComponentProps } from "libraries/core-view-component-props"
import React, { FunctionComponent, useMemo } from "react"
import LayoutItemView from "./LayoutItemView"
import { LayoutItem, MLView } from "./MainLayoutViewData"

type Props = {
    layoutItem: LayoutItem
    ViewComponent: FunctionComponent<ViewComponentProps>
    views: MLView[]
    width: number
    height: number
}

type ItemPosition = {
    left: number,
    top: number,
    width: number,
    height: number,
    title?: string
}

export const computeSizes = (
    totalSize: number | undefined,  // undefined means we're using a scrollbar
    itemCount: number,
    itemProperties: {
        minSize?: number, maxSize?: number, stretch?: number
    }[]
) => {
    while (itemProperties.length < itemCount) {
        itemProperties.push({})
    }
    let ret: number[] = []
    let remainingSize = totalSize || 0
    for (let x of itemProperties) {
        ret.push(x.minSize || 0)
        remainingSize -= x.minSize || 0
    }
    if (totalSize !== undefined) {
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
    }
    return ret
}
    

const BoxLayoutItemView: FunctionComponent<Props> = ({layoutItem, ViewComponent, views, width, height}) => {
    if (layoutItem.type !== 'Box') {
        throw Error('Unexpected')
    }
    const {direction, scrollbar, items, itemProperties, showTitles} = layoutItem
    const itemPositions: ItemPosition[] = useMemo(() => {
        if (direction === 'horizontal') {
            const ret: ItemPosition[] = []
            const itemWidths = computeSizes(!scrollbar ? width : undefined, items.length, itemProperties || [])
            let x = 0
            for (let i=0; i<items.length; i++) {
                ret.push({
                    left: x,
                    top: 0,
                    width: itemWidths[i],
                    height,
                    title: (itemProperties || [])[i]?.title
                })
                x += itemWidths[i]
            }
            return ret
        }
        else {
            const ret: ItemPosition[] = []
            const itemHeights = computeSizes(!scrollbar ? height : undefined, items.length, itemProperties || [])
            let y = 0
            for (let i=0; i<items.length; i++) {
                ret.push({
                    left: 0,
                    top: y,
                    width,
                    height: itemHeights[i],
                    title: (itemProperties || [])[i]?.title
                })
                y += itemHeights[i]
            }
            return ret
        }
    }, [direction, items, width, height, itemProperties, scrollbar])

    const divStyle: React.CSSProperties = useMemo(() => {
        const ret: React.CSSProperties = {
            position: 'absolute',
            left: 0,
            top: 0,
            width,
            height
        }
        if (scrollbar) {
            if (direction === 'horizontal') {
                ret.overflowX = 'auto'
                ret.overflowY = 'hidden'
            }
            else if (direction === 'vertical') {
                ret.overflowY = 'auto'
                ret.overflowX = 'hidden'
            }
        }
        else {
            ret.overflow = 'hidden'
        }
        return ret
    }, [scrollbar, width, height, direction])

    const titleFontSize = direction === 'vertical' ? 25 : 20
    const titleDim = titleFontSize + 3
    return (
        <div style={divStyle}>
            {
                items.map((item, i) => {
                    const p = itemPositions[i]
                    let titleBox = {left: 0, top: 0, width: 0, height: 0}
                    let itemBox = {left: 0, top: 0, width: p.width, height: p.height}
                    if (showTitles) {
                        if (direction === 'horizontal') {
                            titleBox = {left: 0, top: 0, width: p.width, height: titleDim}
                            itemBox = {left: 0, top: titleDim, width: p.width, height: p.height - titleDim}
                        }
                        else if (direction === 'vertical') {
                            titleBox = {left: 0, top: 0, width: titleDim, height: p.height}
                            itemBox = {left: titleDim, top: 0, width: p.width - titleDim, height: p.height}
                        }
                    }
                    const itemView = (
                        <LayoutItemView
                            layoutItem={item}
                            ViewComponent={ViewComponent}
                            views={views}
                            width={itemBox.width}
                            height={itemBox.height}
                        />
                    )
                    const titleRotationStyle: React.CSSProperties = direction === 'horizontal' ? {} : {
                        writingMode: 'vertical-lr',
                        transform: 'rotate(-180deg)',
                    }
                    return (
                        <div key={i} style={{position: 'absolute', left: p.left, top: p.top, width: p.width, height: p.height}}>
                            {
                                showTitles ? (
                                    <span>
                                        <div style={{position: 'absolute', textAlign: 'center', fontSize: titleFontSize, ...titleBox, ...titleRotationStyle}}>
                                            {p.title || ''}
                                        </div>
                                        <div style={{position: 'absolute', ...itemBox}}>
                                            {itemView}
                                        </div>
                                    </span>
                                ) : (
                                    itemView
                                )
                            }
                        </div>
                    )
                })
            }
        </div>
    )
}

export default BoxLayoutItemView