import Splitter from "MountainWorkspace/components/Splitter/Splitter"
import { FunctionComponent, useMemo } from "react"
import { computeSizes } from "./BoxLayoutItemView"
import LayoutItemView from "./LayoutItemView"
import { LayoutItem, SLView } from "./SortingLayoutViewData"

type Props = {
    layoutItem: LayoutItem
    views: SLView[]
    width: number
    height: number
}

const SplitterLayoutItemView: FunctionComponent<Props> = ({layoutItem, views, width, height}) => {
    if (layoutItem.type !== 'Splitter') {
        throw Error('Unexpected')
    }
    const {direction, items, itemProperties} = layoutItem
    if (items.length !== 2) {
        throw Error('Number of items must be 2 for a Splitter layout item')
    }
    if (direction !== 'horizontal') {
        throw Error(`Splitter direction not yet supported: ${direction}`)
    }
    const itemPositions: number[] = useMemo(() => {
        let itemSizes: number[]
        if (direction === 'horizontal') {
            itemSizes = computeSizes(width, items.length, itemProperties || [])
        }
        else {
            // not used until vertical is implemented
            itemSizes = computeSizes(height, items.length, itemProperties || [])
        }
        const ret: number[] = []
        let x = 0
        for (let s of itemSizes) {
            ret.push(x)
            x += s
        }
        return ret
    }, [direction, items, width, height, itemProperties])
    const initialSplitterPosition: number = itemPositions[1]

    // Todo, we need to enforce min/max sizes
    // Todo, we need a vertical splitter
    return (
        <Splitter
            width={width}
            height={height}
            initialPosition={initialSplitterPosition}
        >
            {
                items.map((item, ii) => {
                    return (
                        <LayoutItemView
                            key={ii}
                            layoutItem={item}
                            views={views}
                            width={0} // filled in by splitter
                            height={0} // filled in by splitter
                        />
                    )
                })
            }
        </Splitter>
    )
}

export default SplitterLayoutItemView