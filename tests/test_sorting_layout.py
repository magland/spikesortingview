# 7/1/22
# https://figurl.org/f?v=gs://figurl/spikesortingview-6&d=sha1://97ca5e3021cef722846a2dbc9c86680089a70b07&label=test%20sorting%20layout

import kachery_cloud as kcl
import sortingview as sv
import spikeinterface.extractors as se
import figurl as fig
from test_autocorrelograms import test_autocorrelograms
from test_cross_correlograms import test_cross_correlograms
from test_raster_plot import test_raster_plot
from test_average_waveforms import test_average_waveforms
from test_units_table import test_units_table
from test_unit_similarity_matrix import test_unit_unit_similarity_matrix

def main():
    recording, sorting = se.toy_example(num_units=12, duration=300, seed=0)

    R = sv.copy_recording_extractor(recording, serialize_dtype='float32')
    S = sv.copy_sorting_extractor(sorting)

    data0 = test_units_table(recording=R, sorting=S)
    data1 = test_raster_plot(recording=R, sorting=S)
    data2 = test_autocorrelograms(recording=R, sorting=S)
    data3 = test_average_waveforms(recording=R, sorting=S)
    data4 = test_cross_correlograms(recording=R, sorting=S)
    data5 = test_unit_unit_similarity_matrix(recording=R, sorting=S)

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
                        {
                            'type': 'Splitter',
                            'direction': 'horizontal',
                            'items': [
                                {'type': 'View', 'viewId': '1'},
                                {'type': 'View', 'viewId': '5'}
                            ]
                        },
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
                        {'type': 'View', 'viewId': '2'},
                        {'type': 'View', 'viewId': '4'},
                        {'type': 'View', 'viewId': '3'}
                    ],
                    'itemProperties': [
                        {'stretch': 1},
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
            for i, data0 in enumerate([data0, data1, data2, data3, data4, data5])
        ]
    }

    F = fig.Figure(view_url='gs://figurl/spikesortingview-6', data=data)
    url = F.url(label='test sorting layout')
    print(url)

def _upload_data_and_return_uri(data):
    return kcl.store_json(fig.serialize_data(data))

if __name__ == '__main__':
    main()