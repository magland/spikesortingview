# 6/27/22
# https://figurl.org/f?v=gs://figurl/spikesortingview-6&d=sha1://a50e1bab5a1242417a36c5d471c0b491a4b8d7a4&label=Alessio%20test%20data

import numpy as np
from typing import Any
import kachery_cloud as kcl
import figurl as fig


def main():
    # Load the data prepared by Alessio
    a: dict = kcl.load_pkl('sha1://c476a90959354c452e84b4973f39edc19a5fd79d?label=test-data-sorting-viz')

    # Convert int64 and float64 arrays to int32 and float32 (ab will fix this during prep)
    a = fix_64bit_arrays(a)
    print(a.keys())

    # fix typo (autogorrelograms -> autocorrelograms)
    a['AutocorrelogramsViewData']['autocorrelograms'] = a['AutocorrelogramsViewData']['autogorrelograms']
    del a['AutocorrelogramsViewData']['autogorrelograms']

    # The average waveforms view data is wrong
    print('AverageWaveforms keys:', a['AverageWaveformsViewData'].keys())

    data = {
        'type': 'SortingLayout',
        'layout': {
            'type': 'Box',
            'direction': 'horizontal',
            'items': [
                {'type': 'View', 'viewId': 'ut'},
                {
                    'type': 'Box',
                    'direction': 'vertical',
                    'items': [
                        {'type': 'View', 'viewId': 'sa'},
                        {'type': 'View', 'viewId': 'ac'}
                    ],
                    'itemProperties': [
                        {},
                        {}
                    ]
                }
            ],
            'itemProperties': [
                {'maxSize': 150},
                {}
            ]
        },
        'views': [
            {
                'viewId': 'ut',
                'type': 'UnitsTable',
                'dataUri': _upload_data_and_return_uri(a['UnitsTableViewDats'])
            },
            {
                'viewId': 'aw',
                'type': 'AverageWaveforms',
                'dataUri': _upload_data_and_return_uri(a['AverageWaveformsViewData'])
            },
            {
                'viewId': 'sa',
                'type': 'SpikeAmplitudes',
                'dataUri': _upload_data_and_return_uri(a['SpikeAmplitudesViewData'])
            },
            {
                'viewId': 'ac',
                'type': 'Autocorrelograms',
                'dataUri': _upload_data_and_return_uri(a['AutocorrelogramsViewData'])
            }
        ]
    }

    F = fig.Figure(view_url='gs://figurl/spikesortingview-7', data=data)
    url = F.url(label='Alessio test data')
    print(url)

def fix_64bit_arrays(x: Any, label: str=''):
    if isinstance(x, dict):
        y = {}
        for k, v in x.items():
            y[k] = fix_64bit_arrays(v, label=f'{label}.{k}')
        return y
    elif isinstance(x, list):
        return [fix_64bit_arrays(a, label=f'{label}[.]') for a in x]
    elif isinstance(x, np.ndarray):
        if x.dtype == np.int64:
            print(f'WARNING: converting int64 array to int32 array: {label}')
            return x.astype(np.int32)
        elif x.dtype == np.float64:
            print(f'WARNING: converting float64 array to float32 array: {label}')
            return x.astype(np.int32)
    return x

def _upload_data_and_return_uri(data):
    return kcl.store_json(fig.serialize_data(data))

if __name__ == '__main__':
    main()
