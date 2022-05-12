/**
 * UD_0201_053    지로/인출 마스터 생성 팝업
 * UD_0201_054    지로/인출 마스터 변경 팝업
 * @module uni-e-fi/view/UniDocu001/UD_0201_051
 */
define(function () {
    return function () {
        $u.programSetting.appendTemplate('doSaveFuncName',{
            defaultValue: 'ZUNIEFI_6001',
            description: 'doSave의 FuncName #20465'
        });
        $u.programSetting.appendTemplate('deleteRowFuncName',{
            defaultValue: 'ZUNIEFI_6006',
            description: 'deleteRow의 FuncName #20465'
        });
        var gridObj;
        gridObj = $u.gridWrapper.getGrid();
        $u.buttons.addHandler({
            doSave: function () {
                $u.validateRequired();
                gridObj.validateGridRequired();

                var paramMap = $u.getValues('search-condition');
                paramMap['ZSEQ'] = $u.page.getPageParams()['ZSEQ'];
                $nst.is_data_it_data_returnMessage($u.programSetting.getDefaultValue('doSaveFuncName'), paramMap, gridObj.getJSONData(), function (message) {
                    unidocuAlert(message, function () {
                        if (opener) window.close();
                    });
                });
            },
            addRow: function () {
                gridObj.addRowWithGridPopupIcon();
            },
            deleteRow: function () {
                gridObj.asserts.rowSelected();
                unidocuConfirm($mls.getByCode('M_deleteConfirm'), function () {
                    var selectedRowIndexes = gridObj.getSelectedRowIndexes('SELECTED');
                    selectedRowIndexes.reverse();
                    $.each(selectedRowIndexes, function (arrayIndex, rowIndex) {
                        if (gridObj.$V('BUZEI', rowIndex) === '') gridObj.deleteRow(rowIndex);
                    });

                    var paramMap = $u.getValues('search-condition');
                    paramMap = $.extend({}, $u.page.getPageParams(), paramMap);
                    var selectedjsonData = gridObj.getSELECTEDJSONData();
                    paramMap.tableParamString = JSON.stringify(selectedjsonData);

                    if (selectedjsonData.length === 0) return;
                    $nst.is_data_it_data_returnMessage($u.programSetting.getValue('deleteRowFuncName'), paramMap, selectedjsonData, function (message) {
                        unidocuAlert(message, function () {
                            gridObj.deleteSelectedRows();
                        });
                    });
                });

            }
        });

        return function () {
            if ($u.page.getPageParams()['BUKRS'] != null) {
                $nst.is_data_nsReturn('ZUNIEFI_6002', $u.page.getPageParams(), function (nsReturn) {
                    var formData = nsReturn.getExportMap('OS_DATA');
                    var gridData = nsReturn.getTableReturn('OT_DATA');
                    formData['BEMON'] = formData['BEMON'].substr(0, 4) + '-' + formData['BEMON'].substr(4, 2);
                    formData['ENMON'] = formData['ENMON'].substr(0, 4) + '-' + formData['ENMON'].substr(4, 2);
                    formData['ZKOSTL'] = {code: formData['ZKOSTL'], text: formData['ZKOSTL_TXT']};
                    formData['LIFNR'] = {code: formData['LIFNR'], text: formData['LIFNR_TXT']};
                    formData['PERNR'] = {code: formData['PERNR'], text: formData['PERNR_TXT']};
                    $u.setValues('search-condition', formData);
                    gridObj.setJSONData(gridData);
                    gridObj.showAllPopupIcon();
                });
            }
            $u.get('ZZAVFLG').$el.find('option:first').remove();
            $u.get('ZZAVFLG').$el.change(function () {
                if ($u.get('ZZAVFLG').getValue() === '') {
                    $u.get('MWSKZ').setValue('');
                    $u.get('MWSKZ').setReadOnly(true);
                } else {
                    $u.get('MWSKZ').setReadOnly(false);
                }
            }).change();
            $u.get('MONGB').$el.find('option:first').remove();
            $u.get('ZLSCH').$el.find('option:first').remove();
            $u.get('PDAY').$el.focus(function () {
                $u.get('PDAY').customOldValue = $u.get('PDAY').getValue();
            });
            $u.get('PDAY').$el.change(function () {
                var val = $(this).val();
                var assertTwoDigit = /^\d{1,2}$/.test(val);

                var assertBetween1to31 = 1 <= Number(val) && Number(val) <= 31;
                if (!(assertTwoDigit && assertBetween1to31)) {
                    unidocuAlert($mls.getByCode('M_UD_0201_053_shouldInput1to31'), function () {
                        $u.get('PDAY').setValue($u.get('PDAY').customOldValue);
                    });
                }
            });

            var $hbkid = $u.get('HBKID').$el; // 거래은행
            $hbkid.change(function () {
                if ($hbkid.val() === '') {
                    $u.get('HKTID').setReadOnly(true);
                    $u.get('HKTID').setOptions([]);
                    return;
                }
                $u.get('HKTID').setReadOnly(false);
                $u.get('HKTID').setOptions($u.f4Data.getCodeComboOption($u.get('HKTID').params['codeKey'],{BUKRS2: $u.get('BUKRS').getValue(), HBKID: $hbkid.val()}));
            });
            $u.get('LIFNR').$el.change(function () {
                var params = $u.getValues('search-condition');
                if (params['LIFNR'] === '') return;
                $nst.is_data_ot_data('ZUNIEFI_4001', params, function (ot_data) {
                    $u.get('ZLSCH').setValue(ot_data[0].ZLSCH);
                });
            });
        }
    }
});
