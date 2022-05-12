/**
 * UD_0209_002    반복전표 - 처리현황
 * @module uni-e-fi/view/UniDocu001/UD_0209_002
 */
define(function () {
    return function () {
        $u.programSetting.appendTemplate('createStatementFuncName',{
            defaultValue: 'ZUNIEFI_3511',
            description: 'createStatement의 FuncName #20465'
        });
        var gridObj = $u.gridWrapper.getGrid();
        gridObj.onCellClick(function (columnKey, rowIndex) {
            if (columnKey === 'REP_SEQ') {
                $nst.is_data_os_data('ZUNIEFI_3501', {I_REP_SEQ: gridObj.$V(columnKey, rowIndex)}, function (os_data) {
                    $u.navigateByProgramId('UD_0209_001', $.extend({}, os_data, {MODE: 'readOnly'}));
                });
            }
        });
        $u.buttons.addHandler({
            evidenceSelect: function () {
                unidocuAlert('준비중입니다.');
            },
            createStatement: function () {
                gridObj.asserts.rowSelected();
                var selectedJSONData = gridObj.getSELECTEDJSONData();

                $nst.it_data_nsReturn($u.programSetting.getValue('createStatementFuncName'), selectedJSONData, function (nsReturn) {
                    var ot_data = nsReturn.getTableReturn('OT_DATA');
                    gridObj.setJSONData(ot_data);
                });
            },
            queryForGridObj1: function () {
                var searchCondition = $u.getValues('search-condition');
                searchCondition['BUKRS'] = searchCondition['BUKRS2'];
                $nst.is_data_ot_data($(this).data('funcname'), searchCondition, function (ot_data) {
                    gridObj.setJSONData(ot_data);
                    $.each(ot_data, function (index, item) {
                        if (item['AMTGB'] === 'B' && (/FI_(03|1([56]))/.test(item['EVIKB']))) {
                            gridObj.makeCellEditable('WRBTR', index, true);
                            gridObj.makeCellEditable('FWBAS', index, true);
                            gridObj.makeCellEditable('FWSTE', index, true);
                        }
                    });
                });
            }
        });


        function onModeChange() {
            if ($u.get('MODE') && $u.get('MODE').getValue() === 'B') {
                $('#cancelAssignPerson').show();
                $('#assignPerson').hide();
            }
            else {
                $('#cancelAssignPerson').hide();
                $('#assignPerson').show();
            }
        }

        return function () {
            $u.buttons.triggerFormTableButtonClick('search-condition');
            $('#restoreStatement').hide();
            if ($u.get('MODE')) $u.get('MODE').$el.change(onModeChange).change();
        }
    }
});