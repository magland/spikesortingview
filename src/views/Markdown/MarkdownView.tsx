import validateObject, { isEqualTo, isString } from 'figurl/viewInterface/validateObject';
import { FunctionComponent } from 'react';
import Markdown from './Markdown/Markdown';

export type MarkdownViewData = {
    type: 'Markdown'
    source: string
}
export const isMarkdownViewData = (x: any): x is MarkdownViewData => {
    return validateObject(x, {
        type: isEqualTo('Markdown'),
        source: isString
    })
}

type Props = {
    data: MarkdownViewData
    width: number
    height: number
}

const MarkdownView: FunctionComponent<Props> = ({data, width, height}) => {
    const {source} = data
    return (
        <div style={{margin: 30}}>
            <Markdown
                source={source}
                linkTarget={'_blank'}
            />
        </div>
    )
}

export default MarkdownView