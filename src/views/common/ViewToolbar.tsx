import { Checkbox, FormGroup, IconButton, Switch } from '@material-ui/core';
import React, { FunctionComponent, useMemo } from 'react';
import "./ToolbarStyles.css";

interface Props {
    width: number
    height: number
    top?: number
    customActions?: any[] | null
    useHorizontalLayout?: boolean
}

// interface PropsPlus extends Props {
//     controls: JSX.Element[]
// }

const iconButtonStyle = {paddingLeft: 6, paddingRight: 6, paddingTop: 4, paddingBottom: 4}

type ToolbarElement = {
    type: string
    subtype?: string
    title: string
    onClick?: () => void
    icon?: any
    selected: boolean
    disabled?: boolean
    content?: string | number
    contentSigFigs?: number
    contentAlwaysShowDecimal?: boolean
    // TODO: Support for indeterminate state for checkboxes?
    elementIndex: number
    useHorizontalLayout?: boolean
}

const ToolbarButton: FunctionComponent<ToolbarElement> = (props: ToolbarElement) => {
    const color = props.selected ? 'secondary' : 'inherit'
    return (
        <span title={props.title} key={props.elementIndex + '-span'}>
            <IconButton
                title={props.title}
                onClick={props.onClick}
                key={props.elementIndex}
                color={color}
                style={iconButtonStyle}
                disabled={props.disabled ? true : false}>
                {props.icon}
            </IconButton>
        </span>
    )
}

const ToolbarDivider: FunctionComponent<ToolbarElement> = (props: ToolbarElement) => {
    return props.useHorizontalLayout ? <></> : <hr key={props.elementIndex} />
}

const ToolbarText: FunctionComponent<ToolbarElement> = (props: ToolbarElement) => {
    const numericContent: number = Number.isFinite(props.content)
        ? props.content as any as number
        : 0
    const sigFigs = props.contentSigFigs || 0
    const roundsToInt = Math.abs(numericContent - Math.round(numericContent)) * (10**(sigFigs + 1)) < 1
    const _content = Number.isFinite(props.content)
        ? roundsToInt && !props.contentAlwaysShowDecimal
            ? Math.round(numericContent) + ''
            : (numericContent).toFixed(props.contentSigFigs || 2)
        : (props.content || '')
    const tagType = props.useHorizontalLayout ? 'span' : 'div'
    return React.createElement(
        tagType,
        {
            key: props.elementIndex,
            title: props.title,
            style: {textAlign: 'center', fontWeight: 'bold', cursor: 'default'}
        },
        _content
    )
}

const ToolbarToggle: FunctionComponent<ToolbarElement> = (props: ToolbarElement) => {
    switch (props.subtype) {
        case 'checkbox':
            return <ToolbarCheckbox {...props} />
        case 'slider':
            return <ToolbarSlider {...props} />
        default:
            return <span key={props.elementIndex}>ERROR: Bad toggle subtype {props.subtype}</span>
    }
}

const ToolbarCheckbox: FunctionComponent<ToolbarElement> = (props: ToolbarElement) => {
    return (
        <Checkbox
            key={props.elementIndex}
            checked={props.selected}
            onClick={props.onClick}
            style={{padding: 1, paddingLeft: 6 }}
            title={props.title}
            disabled={props.disabled}
        />
    )
}

const ToolbarSlider: FunctionComponent<ToolbarElement> = (props: ToolbarElement) => {
    // TODO: This actually suggests that we could do a better job of rewriting this entire section of functionality
    // to better support accessibility practices/logical form-control grouping.
    // (I.e. probably everything should be in a FormGroup or something.)
    // I don't know enough to do this right now, but we'll want to come back to it.
    // TODO: Compare this with what we do in LockableSelectUnitsWidget.
    return (
        <FormGroup key={props.elementIndex}>
            <Switch
                    checked={props.selected}
                    size={"small"} // TODO: make styling more configurable
                    style={{left: -3}} // Note: this seems to center it in the 36-pixel spaces we've been using.
                                        // There's probably a better way to do this...
                    onChange={props.onClick}
                    disabled={props.disabled}
                    title={props.title}
            />
        </FormGroup>
    )
}

const ToolbarItem: FunctionComponent<ToolbarElement> = (props: ToolbarElement) => {
    switch (props.type) {
        case 'button':
            return <ToolbarButton {...props} />
        case 'divider':
            return <ToolbarDivider {...props} />
        case 'text':
            return <ToolbarText {...props} />
        case 'toggle':
            return <ToolbarToggle {...props} />
        default:
            return <span key={props.elementIndex} />
   }
}

const rectifyElements = (elements?: any[] | null): ToolbarElement[] => {
    return (elements || []).map((e, ii) => ({
        type: e.type || 'button',
        subtype: e.subtype,
        title: e.title,
        onClick: e.callback,
        icon: e.icon || '',
        selected: e.selected,
        disabled: e.disabled,
        content: e.content,
        contentSigFigs: e.contentSigFigs,
        contentAlwaysShowDecimal: e.boolean,
        elementIndex: ii
    }))
}

// const HorizontalToolbar: FunctionComponent<PropsPlus> = (props) => {
//     const { controls } = props
//     // in horizontal layout, width and height should have different values from in vertical layout...
//     // NEED TO SET PADDING TO CENTER THE ELEMENT MAYBE
//     const toolbarStyle = useMemo(() => ({
//         width: props.width, // need this?
//         height: props.height,
//         top: props.top ?? 0,
//     }), [props.width, props.height, props.top])

//     return (<div className="HorizontalToolbar" style={{...toolbarStyle}}>
//         {controls}
//     </div>)
// }

// const VerticalToolbar: FunctionComponent<PropsPlus> = (props) => {
//     const { controls } = props
//     const toolbarStyle = useMemo(() => ({
//         width: props.width,
//         height: props.height,
//         top: props.top ?? 0,
//     }), [props.width, props.height, props.top])
//     // const elements: ToolbarElement[] = useMemo(() => rectifyElements(props.customActions), [props.customActions])
//     // // The 'key' prop won't ever get used in this way, because the ToolbarItem is really a catch-all that gets replaced
//     // // with more specific components, but this makes React happier.
//     // const renderedElements = useMemo(() => elements.map((e) => <ToolbarItem {...e} key={e.elementIndex}/>), [elements])
//     return (
//         <div className="VerticalToolbar" style={{...toolbarStyle}}>
//             {controls}
//         </div>
//     );
// }

const ViewToolbar: FunctionComponent<Props> = (props) => {
    const rectifiedControls = useMemo(() => rectifyElements(props.customActions), [props.customActions])
    const renderedControls = useMemo(() =>
        rectifiedControls.map((e) => <ToolbarItem {...e} useHorizontalLayout={props.useHorizontalLayout} />),
        [rectifiedControls, props.useHorizontalLayout])

    const toolbarStyle = useMemo(() => ({
        width: props.width,
        height: props.height,
        top: props.top ?? 0,
    }), [props.width, props.height, props.top])

    const className = props.useHorizontalLayout ? "HorizontalToolbar" : "VerticalToolbar"

    return (
        <div className={className} style={{...toolbarStyle}}>
            {renderedControls}
        </div>
    )

    // return useHorizontalLayout
    //     ? <HorizontalToolbar {...props} controls={renderedControls} />
    //     : <VerticalToolbar {...props} controls={renderedControls} />
}

export default ViewToolbar