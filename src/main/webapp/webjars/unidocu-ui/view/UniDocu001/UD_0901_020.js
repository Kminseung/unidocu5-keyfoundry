/**
 * @module unidocu-ui/view/UniDocu001/UD_0901_020
 */
define(function () {
    return function () {
        var gridObj = $u.gridWrapper.getGrid();

        $u.buttons.addHandler({
            "is_data_ot_data": function () {
                var values = $u.getValues('search-condition');
                $nst.is_data_ot_data('ZUNIECM_2030', values, function (ot_data) {
                    $u.gridWrapper.getGrid().setJSONData(ot_data);
                    delete values['DETAILED'];
                    $nst.is_data_ot_data('ZUNIECM_2030', values, function (ot_data) {
                        $u.get('search-condition', 'STEXT').setValue(ot_data[0]['STEXT']);
                    });
                });
            }
        });

        return function () {
            gridObj.setSortEnable(false);
            gridObj._rg.gridView.setRowGroup({expandedAdornments: 'none'});
            gridObj.setGroupMerge('PARAMETER,PARAMTYPE,STEXT,STRUCTURE');
        }
    }
});