import { FunctionComponent } from 'react';
import LayoutItemView from './LayoutItemView';
import { SortingLayoutViewData } from './SortingLayoutViewData';

type Props = {
    data: SortingLayoutViewData
    width: number
    height: number
}

const SortingLayoutView: FunctionComponent<Props> = ({data, width, height}) => {
    const {layout, views} = data
    return (
        <LayoutItemView
            layoutItem={layout}
            views={views}
            width={width}
            height={height}
        />
    )
}

export default SortingLayoutView