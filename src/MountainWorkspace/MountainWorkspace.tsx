import OpenInBrowserIcon from '@material-ui/icons/OpenInBrowser';
import Expandable from './components/Expandable/Expandable';
import Splitter from './components/Splitter/Splitter';
import React, { FunctionComponent, useCallback, useReducer } from 'react';
import openViewsReducer from './openViewsReducer';
import MWViewContainer from './MWContainer';
import MWViewLauncher from './MWViewLauncher';
import { MWView, MWViewPlugin } from './MWViewPlugin';
import MWViewWidget from './MWViewWidget';

type Props = {
    viewPlugins: MWViewPlugin[]
    viewProps: {[key: string]: any}
    width: number
    height: number
}

const initialLeftPanelWidth = 320

const MountainWorkspace: FunctionComponent<Props> = ({width, height, viewPlugins, viewProps}) => {
    const [openViews, openViewsDispatch] = useReducer(openViewsReducer, [])

    const launchIcon = <span style={{color: 'gray'}}><OpenInBrowserIcon /></span>
    
    const handleLaunchView = useCallback((plugin: MWViewPlugin) => {
        openViewsDispatch({
            type: 'AddView',
            plugin,
            label: plugin.label,
            area: ''
        })
    }, [openViewsDispatch])

    const handleViewClosed = useCallback((v: MWView) => {
        openViewsDispatch({
            type: 'CloseView',
            view: v
        })
    }, [openViewsDispatch])

    const handleSetViewArea = useCallback((view: MWView, area: 'north' | 'south') => {
        openViewsDispatch({
            type: 'SetViewArea',
            viewId: view.viewId,
            area
        })
    }, [openViewsDispatch])

    return (
        <Splitter
            width={width}
            height={height}
            initialPosition={initialLeftPanelWidth}
        >
            <div>
                {/* Launch */}
                <Expandable icon={launchIcon} label="" defaultExpanded={true} unmountOnExit={false}>
                    <MWViewLauncher
                        onLaunchView={handleLaunchView}
                        plugins={viewPlugins}
                    />
                </Expandable>
            </div>
            <MWViewContainer
                onViewClosed={handleViewClosed}
                onSetViewArea={handleSetViewArea}
                views={openViews}
                width={0} // will be replaced by splitter
                height={0} // will be replaced by splitter
            >
                {
                    openViews.map(v => (
                        <MWViewWidget
                            key={v.viewId}
                            view={v}
                            viewProps={viewProps}
                        />
                    ))
                }
            </MWViewContainer>
        </Splitter>
    )
}

export default MountainWorkspace