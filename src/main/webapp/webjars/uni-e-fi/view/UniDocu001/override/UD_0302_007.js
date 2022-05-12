/**
 * @module uni-e-fi/view/UniDocu001/override/UD_0302_007
 */
define(['uni-e-fi/view/UniDocu001/UD_0302_000'], function (UD_0302_000) {
    return function () {
        var initFn = UD_0302_000();
        $u.programSetting.appendTemplate('makeGroupFuncName',{
            defaultValue: 'ZUNIEFI_4211',
            description: 'makeGroup의 FuncName #20465'
        });
        $u.programSetting.appendTemplate('cancelGroupFuncName',{
            defaultValue: 'ZUNIEFI_4212',
            description: 'cancelGroup의 FuncName #20465'
        });
        var gridObj = $u.gridWrapper.getGrid();

        $u.buttons.addHandler({
            "cancelGroup": function () {
                var gridObj = $u.gridWrapper.getGrid();
                gridObj.asserts.rowSelected();
                if (gridObj.getSELECTEDJSONData()[0]['GRONO'] === '') throw $mls.getByCode('M_UD_0302_000_cancelGroupGRONOEmpty');
                unidocuConfirm($mls.getByCode('M_UD_0302_000_cancelGroupConfirm'), function () {
                    $nst.is_data_nsReturn($u.programSetting.getValue('cancelGroupFuncName'), gridObj.getSELECTEDJSONData()[0], function () {
                        $.each(gridObj.getSelectedRowIndexes(), function (index, rowIndex) {
                            gridObj.$V('GRONO', rowIndex, '');
                        });
                        $u.buttons.triggerFormTableButtonClick();
                    });
                });
            },
            "makeGroup": function () {
                gridObj.asserts.rowSelected();
                if (gridObj.getSELECTEDJSONData()[0]['GRONO'] !== '') throw $mls.getByCode('M_UD_0302_000_makeGroupGRONOExists');
                unidocuConfirm($mls.getByCode('M_UD_0302_000_makeGroupConfirm'), function () {
                    $nst.it_data_nsReturn($u.programSetting.getValue('makeGroupFuncName'), gridObj.getSELECTEDJSONData(), function () {
                        $u.buttons.triggerFormTableButtonClick();
                    })
                })
            }
        });

        return function () {
            initFn();
        }
    }
});