import { Checkbox, IconButton } from '@material-ui/core';
import React, { FunctionComponent, useMemo } from 'react';


export interface ActionItem {
    type: 'button'
    callback: () => void
    title: string
    icon: any
    selected?: boolean
    keyCode?: number
    disabled?: boolean
}

export interface DividerItem {
    type: 'divider'
}

export interface TextItem {
    type: 'text'
    title: string
    content: string | number
    contentSigFigs?: number
}

export interface CheckboxItem {
    type: 'checkbox'
    callback: () => void
    title: string
    selected?: boolean
    keyCode?: number
    disabled?: boolean
}

export type ViewToolbarAction = ActionItem | DividerItem | TextItem | CheckboxItem

interface Props {
    width: number
    height: number
    actions?: ViewToolbarAction[] | null
}

const iconButtonStyle = {paddingLeft: 6, paddingRight: 6, paddingTop: 4, paddingBottom: 4}

// type Button = {
//     type: 'button' | 'divider' | 'text' | 'checkbox'
//     title: string
//     onClick: () => void
//     icon: any
//     selected: boolean
//     disabled?: boolean
//     content?: string | number
//     contentSigFigs?: number
//     // TODO: Support for indeterminate state for checkboxes?
// }

const ViewToolbar: FunctionComponent<Props> = (props) => {
    const toolbarStyle = useMemo(() => ({
        width: props.width,
        height: props.height,
        overflow: 'hidden'
    }), [props.width, props.height])
    // const buttons = useMemo(() => {
    //     const b: Button[] = []
    //     for (let a of (props.customActions || [])) {
    //         b.push({
    //             type: a.type || 'button',
    //             title: a.title,
    //             onClick: a.callback,
    //             icon: a.icon || '',
    //             selected: a.selected,
    //             disabled: a.disabled,
    //             content: a.content,
    //             contentSigFigs: a.contentSigFigs
    //         });
    //     }
    //     return b
    // }, [props.customActions])
    return (
        <div className="ViewToolBar" style={{position: 'absolute', ...toolbarStyle}}>
            {
                (props.actions || []).map((action, ii) => {
                    if (action.type === 'button') {
                        let color: 'inherit' | 'primary' = 'inherit';
                        if (action.selected) color = 'primary';
                        return (
                            <IconButton title={action.title} onClick={action.callback} key={ii} color={color} style={iconButtonStyle} disabled={action.disabled ? true : false}>
                                {action.icon}
                            </IconButton>
                        );
                    }
                    else if (action.type === 'text') {
                        const numericContent: number = Number.isFinite(action.content)
                            ? action.content as any as number
                            : 0
                        const sigFigs = action.contentSigFigs || 0
                        const roundsToInt = Math.abs(numericContent - Math.round(numericContent)) * (10**(sigFigs + 1)) < 1
                        const _content = Number.isFinite(action.content)
                            ? roundsToInt
                                ? Math.round(numericContent) + ''
                                : (numericContent).toFixed(action.contentSigFigs || 2)
                            : (action.content || '')
                        return (
                            <div
                                key={ii}
                                title={action.title}
                                style={{textAlign: 'center', fontWeight: 'bold'}}
                            >
                                {_content}
                            </div>
                        )
                    }
                    else if (action.type === 'checkbox') {
                        return (
                            <Checkbox
                                key={ii}
                                checked={action.selected}
                                onClick={action.callback}
                                style={{padding: 1, paddingLeft: 6 }}
                                title={action.title}
                                disabled={action.disabled}
                            />
                        )
                    }
                    else if (action.type === 'divider') {
                        return <hr key={ii} />;
                    }
                    else {
                        return <span key={ii} />;
                    }
                })
            }
        </div>
    );
}

export default ViewToolbar