# 6/29/22
# https://figurl.org/f?v=gs://figurl/spikesortingview-6&d=sha1://84f25294106eab70538358e9021166379abda4df&label=test%20sorting%20layout%20scrollbar

import kachery_cloud as kcl
import sortingview as sv
import spikeinterface.extractors as se
import figurl as fig
from test_autocorrelograms import test_autocorrelograms
from test_raster_plot import test_raster_plot
from test_average_waveforms import test_average_waveforms
from test_units_table import test_units_table

def main():
    recording, sorting = se.toy_example(num_units=12, duration=300, seed=0)

    R = sv.copy_recording_extractor(recording, serialize_dtype='float32')
    S = sv.copy_sorting_extractor(sorting)

    data1 = test_units_table(recording=R, sorting=S)
    data2 = test_raster_plot(recording=R, sorting=S)
    data3 = test_autocorrelograms(recording=R, sorting=S)
    data4 = test_average_waveforms(recording=R, sorting=S)

    data = {
        'type': 'SortingLayout',
        'layout': {
            'type': 'Box',
            'direction': 'vertical',
            'items': [
                {
                    'type': 'Splitter',
                    'direction': 'horizontal',
                    'items': [
                        {'type': 'View', 'viewId': '0'},
                        {'type': 'View', 'viewId': '1'}
                    ],
                    'itemProperties': [
                        {'minSize': 100, 'stretch': 1},
                        {'minSize': 200, 'stretch': 3}
                    ]
                },
                {
                    'type': 'Box',
                    'direction': 'horizontal',
                    'items': [
                        {
                            'type': 'Box',
                            'direction': 'horizontal',
                            'scrollbar': True,
                            'items': [
                                {'type': 'View', 'viewId': '2'},
                                {'type': 'View', 'viewId': '2'},
                                {'type': 'View', 'viewId': '2'},
                                {'type': 'View', 'viewId': '2'},
                                {'type': 'View', 'viewId': '2'}
                            ],
                            'itemProperties': [
                                {'minSize': 400},
                                {'minSize': 400},
                                {'minSize': 400},
                                {'minSize': 400},
                                {'minSize': 400}
                            ]
                        },
                        {
                            'type': 'Box',
                            'direction': 'vertical',
                            'scrollbar': True,
                            'items': [
                                {'type': 'View', 'viewId': '3'},
                                {'type': 'View', 'viewId': '3'},
                                {'type': 'View', 'viewId': '3'},
                                {'type': 'View', 'viewId': '3'},
                                {'type': 'View', 'viewId': '3'}
                            ],
                            'itemProperties': [
                                {'minSize': 400},
                                {'minSize': 400},
                                {'minSize': 400},
                                {'minSize': 400},
                                {'minSize': 400}
                            ]
                        }
                        
                    ],
                    'itemProperties': [
                        {'stretch': 1},
                        {'stretch': 1}
                    ]
                }
            ]
        },
        'views': [
            {
                'viewId': f'{i}',
                'type': data0['type'],
                'dataUri': _upload_data_and_return_uri(data0)
            }
            for i, data0 in enumerate([data1, data2, data3, data4])
        ]
    }

    F = fig.Figure(view_url='gs://figurl/spikesortingview-6', data=data)
    url = F.url(label='test sorting layout scrollbar')
    print(url)

def _upload_data_and_return_uri(data):
    return kcl.store_json(fig.serialize_data(data))

if __name__ == '__main__':
    main()