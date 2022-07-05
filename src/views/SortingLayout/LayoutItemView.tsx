import { FunctionComponent } from "react"
import BoxLayoutItemView from "./BoxLayoutItemView"
import IndividualLayoutItemView from "./IndividualLayoutItemView"
import MountainLayoutItemView from "./MountainLayoutItemView"
import { LayoutItem, SLView } from "./SortingLayoutViewData"
import SplitterLayoutItemView from "./SplitterLayoutItemView"

type Props = {
    layoutItem: LayoutItem
    views: SLView[]
    width: number
    height: number
}

const LayoutItemView: FunctionComponent<Props> = ({layoutItem, views, width, height}) => {
    return (
        layoutItem.type === 'Box' ? (
            <BoxLayoutItemView
                layoutItem={layoutItem}
                views={views}
                width={width}
                height={height}
            />
        ) : layoutItem.type === 'Splitter' ? (
            <SplitterLayoutItemView
                layoutItem={layoutItem}
                views={views}
                width={width}
                height={height}
            />
        ) : layoutItem.type === 'Mountain' ? (
            <MountainLayoutItemView
                layoutItem={layoutItem}
                views={views}
                width={width}
                height={height}
            />
        ) : layoutItem.type === 'View' ? (
            <IndividualLayoutItemView
                layoutItem={layoutItem}
                views={views}
                width={width}
                height={height}
            />
        ) : (
            <div>Unrecognized layout item type</div>
        )
    )
}

export default LayoutItemView