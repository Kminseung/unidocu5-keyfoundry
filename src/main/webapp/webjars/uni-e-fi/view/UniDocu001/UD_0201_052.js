/**
 * UD_0201_052    지로/인출 마스터 생성&변경 팝업
 * @module uni-e-fi/view/UniDocu001/UD_0201_052
 */
define(function () {
    return function () {
        $u.programSetting.appendTemplate('doSaveFuncName',{
            defaultValue: 'ZUNIEFI_6005',
            description: 'doSave의 FuncName #20465'
        });
        var gridObj = $u.gridWrapper.getGrid();
        $u.buttons.addHandler({
            doSave: function () {
                if (Number($u.get('SUB_TOTAL').getValue()) > 0) throw $mls.getByCode('M_UD_0201_052_DoSave_SubTotalGreaterThanZero');
                var paramMap = $u.page.getPageParams();
                var tableParam = gridObj.getJSONData();
                tableParam.push({DMBTR: $u.get('SUB_TOTAL').getValue(), TOT: 'X'});
                paramMap.tableParamString = JSON.stringify(tableParam);
                $nst.is_data_it_data_returnMessage($u.programSetting.getValue('doSaveFuncName'), paramMap, tableParam, function (message) {
                    unidocuAlert(message, function () {
                        if (opener) {
                            opener.$u.buttons.triggerFormTableButtonClick();
                            window.close();
                        }
                    });
                });
            }
        });
        return function () {
            gridObj.setColumnHide('SELECTED', true);
            if ($u.page.getPageParams()['BUDAT']) $u.get('BUDAT').setValue($u.page.getPageParams()['BUDAT']);
            $nst.is_data_ot_data('ZUNIEFI_6004', $u.page.getPageParams(), function (gridData) {
                gridObj.setJSONData(gridData);
                gridObj.loopRowIndex(function (rowIndex) {
                    if (gridObj.$V('BSCHL', rowIndex) === '31') {
                        gridObj.setCellEditable('TAX', rowIndex, true);
                        gridObj.setCellBgColor('TAX', rowIndex, '214|228|255');
                    }
                })
            });
        }
    }
});
