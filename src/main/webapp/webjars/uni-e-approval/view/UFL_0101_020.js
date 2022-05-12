/**
 * UFL_0101_020    설정구분에 대한 문서구분
 * @module uni-e-approval/view/UFL_0101_020
 */
define(function () {
    return function () {
        $u.unidocuUI();
        $u.programSetting.appendTemplate('ot_dataForGridObj1FuncName',{
            defaultValue: 'ZUNIEWF_0023',
            description: 'ot_dataForGridObj1의 FuncName #20465'
        });
        $u.programSetting.appendTemplate('ot_dataForGridObj3FuncName',{
            defaultValue: 'ZUNIEWF_0083',
            description: 'ot_dataForGridObj3의 FuncName #20465'
        });
        $u.programSetting.appendTemplate('ot_dataForGridObj2FuncName',{
            defaultValue: 'ZUNIEWF_0043',
            description: 'ot_dataForGridObj2의 FuncName #20465'
        });
        $u.programSetting.appendTemplate('it_dataGridObj1SelectedRowsFuncName',{
            defaultValue: 'ZUNIEWF_0041',
            description: 'it_dataGridObj1SelectedRows의 FuncName #20465'
        });
        $u.programSetting.appendTemplate('it_dataGridObj1SelectedRows2FuncName',{
            defaultValue: 'ZUNIEWF_0024',
            description: 'it_dataGridObj1SelectedRows2의 FuncName #20465'
        });

        $u.programSetting.appendTemplate('it_dataGridObj2SelectedRowsFuncName',{
            defaultValue: 'ZUNIEWF_0021',
            description: 'it_dataGridObj2SelectedRows의 FuncName #20465'
        });
        $u.programSetting.appendTemplate('it_dataGridObj2SelectedRows2FuncName',{
            defaultValue: 'ZUNIEWF_0024',
            description: 'it_dataGridObj2SelectedRows2의 FuncName #20465'
        });

        var gridObj = $u.gridWrapper.getGrid();
        var gridObj2 = $u.gridWrapper.getGrid('unidocu-grid2');
        var gridObj3 = $u.gridWrapper.getGrid('unidocu-grid3');
        var $grid2Wrapper = $('#grid2Wrapper');
        var $grid3Wrapper = $('#grid3Wrapper');
        var $grid3DetailWrapper = $('#grid3DetailWrapper');
        gridObj.onChangeCell(function () {
            hideAllWrapper();
        });
        gridObj3.setCheckBarAsRadio('SELECTED');
        $u.buttons.addHandler({
            ot_dataForGridObj1: function () {
                $nst.is_data_ot_data($u.programSetting.getValue('ot_dataForGridObj1FuncName'), null, function (ot_data) {
                    gridObj.setJSONData(ot_data);
                    hideAllWrapper();
                    gridObj.setActiveRowIndex(-1);
                });
            },
            ot_dataForGridObj2: function () {
                gridObj.asserts.selectedExactOneRow();
                hideAllWrapper();
                if (!hasSelectedERDAT()) return;
                $nst.is_data_ot_data($u.programSetting.getValue('ot_dataForGridObj2FuncName'), gridObj.getSELECTEDJSONData()[0], function (ot_data) {
                    $grid2Wrapper.show();
                    gridObj2.fitToWindowSize();
                    gridObj2.setJSONData(ot_data);
                });
            },
            ot_dataForGridObj3: function () {
                gridObj.asserts.selectedExactOneRow();
                hideAllWrapper();
                if (!hasSelectedERDAT()) return;
                $nst.is_data_ot_data($u.programSetting.getValue('ot_dataForGridObj3FuncName'), gridObj.getSELECTEDJSONData()[0], function (ot_data) {
                    $grid3Wrapper.show();
                    gridObj3.fitToWindowSize();
                    gridObj3.setJSONData(ot_data);
                    $('#deleteGridObj3').show();
                });
            },
            addRowGridObj1: function () {
                gridObj.addRowWithGridPopupIcon();
                var activeRowIndex = gridObj.getActiveRowIndex();
                gridObj.$V('SELECTED', activeRowIndex, '1');
                $.each(gridObj.getGridHeaders(), function (index, header) {
                    if (!header.edit) gridObj.makeCellEditable(header.key, activeRowIndex);
                });
                hideAllWrapper()
            },
            addRowGridObj2: function () {
                var selectedGridObj1KeyMap = getSelectedGridObj1KeyMap();
                gridObj2.addRowWithGridPopupIcon();
                var activeRowIndex = gridObj2.getActiveRowIndex();
                gridObj2.$V('SELECTED', activeRowIndex, '1');
                $.each(gridObj2.getGridHeaders(), function (index, header) {
                    if (!header.edit) gridObj2.makeCellEditable(header.key, activeRowIndex);
                });
                $.each(selectedGridObj1KeyMap, function (key, value) {
                    gridObj2.makeCellReadOnly(key, activeRowIndex);
                    gridObj2.$V(key, activeRowIndex, value);
                });
            },
            gridObj3Detail: function () {
                gridObj3.asserts.selectedExactOneRow();
                hideAllWrapper();
                $grid3DetailWrapper.show();
                $u.get('WF_COND').setReadOnly(true);
                $u.setValues('uni-form-table', gridObj3.getSELECTEDJSONData()[0]);
            },
            gridObj3Add: function () {
                hideAllWrapper();
                $grid3DetailWrapper.show();
                $u.get('WF_COND').setReadOnly(false);
                var emptyJSON = {};
                $.each($u.getNames(), function (index, value) {
                    emptyJSON[value] = '';
                });
                $u.setValues('uni-form-table', $.extend(emptyJSON, getSelectedGridObj1KeyMap()));
            },
            it_dataGridObj1SelectedRows: itDataGridObj1SelectedRowsTemplate(gridObj, 'it_dataGridObj1SelectedRows', 'ot_dataForGridObj1'),
            it_dataGridObj1SelectedRows2: itDataGridObj1SelectedRowsTemplate(gridObj, 'it_dataGridObj1SelectedRows2', 'ot_dataForGridObj1'),
            it_dataGridObj2SelectedRows: itDataGridObj1SelectedRowsTemplate(gridObj2, 'it_dataGridObj2SelectedRows', 'ot_dataForGridObj2'),
            it_dataGridObj2SelectedRows2: itDataGridObj1SelectedRowsTemplate(gridObj2, 'it_dataGridObj2SelectedRows2', 'ot_dataForGridObj2'),
            deleteGridObj3: function () {
                gridObj3.asserts.selectedExactOneRow();
                $nst.is_data_it_data_nsReturn($u.buttons.getButtonFUNCNAME('deleteGridObj3'), {}, gridObj3.getSELECTEDJSONData(), function () {
                    $u.buttons.runHandler('ot_dataForGridObj3');
                });
            },
            saveGridObj3Form: function () {
                var params = $u.getValues('uni-form-table');
                $nst.is_data_it_data_nsReturn($u.buttons.getButtonFUNCNAME('saveGridObj3Form'), {}, [params], function () {
                    $u.buttons.runHandler('ot_dataForGridObj3');
                });
            }
        });

        function saveCallback(wf_line, wf_item_gb) {
            $u.get('WF_LIN' + wf_item_gb).setValue(wf_line);
            $u.buttons.runHandler('saveGridObj3Form');
        }

        function wf_lin_Click() {
            var ZUNIEWF_2001Params = $u.getValues('uni-form-table');
            var wf_item_gb = $(this).data('wfItemGb');
            ZUNIEWF_2001Params['WF_ITEM_GB'] = wf_item_gb;
            ZUNIEWF_2001Params['WF_LINE'] = $u.get('WF_LIN' + wf_item_gb).getValue();

            $ewf.dialog.modifyApprovalDialog.open({
                saveCallback: saveCallback,
                ZUNIEWF_2001Params: ZUNIEWF_2001Params
            });
        }

        function hideAllWrapper() {
            $grid2Wrapper.hide();
            $grid3Wrapper.hide();
            $grid3DetailWrapper.hide();
        }

        function itDataGridObj1SelectedRowsTemplate(_gridObj, buttonName, queryButtonName) {
            return function () {
                var funcname = '';
                if(buttonName === 'it_dataGridObj1SelectedRows') funcname = $u.programSetting.getValue('it_dataGridObj1SelectedRowsFuncName');
                if(buttonName === 'it_dataGridObj1SelectedRows2') funcname = $u.programSetting.getValue('it_dataGridObj1SelectedRows2FuncName');
                if(buttonName === 'it_dataGridObj2SelectedRows') funcname = $u.programSetting.getValue('it_dataGridObj2SelectedRowsFuncName');
                if(buttonName === 'it_dataGridObj2SelectedRows2') funcname = $u.programSetting.getValue('it_dataGridObj2SelectedRows2FuncName');
                _gridObj.asserts.rowSelected();
                $nst.is_data_it_data_nsReturn(funcname, {}, _gridObj.getSELECTEDJSONData(), function () {
                    $u.buttons.runHandler(queryButtonName);
                });
            }
        }

        function getSelectedGridObj1KeyMap() {
            gridObj.asserts.selectedExactOneRow();
            var selectedJSONData = gridObj.getSELECTEDJSONData()[0];
            return {
                WF_TYPE: selectedJSONData['WF_TYPE'],
                WF_GB: selectedJSONData['WF_GB']
            };
        }

        function hasSelectedERDAT() {
            return gridObj.$V('ERDAT', gridObj.getActiveRowIndex()) !== '';
        }

        return function () {
            $u.buttons.runHandler('ot_dataForGridObj1');
            $(gridObj).height(200);
            var os_data = $nst.is_data_os_data('ZUNIEWF_1200', {});
            if (os_data['WF_LINE2_FLAG'] !== 'X') $('#WF_LIN2').parent().parent().hide();
            if (os_data['WF_LINE3_FLAG'] !== 'X') $('#WF_LIN3').parent().parent().hide();
            if (os_data['WF_LINE4_FLAG'] !== 'X') $('#WF_LIN4').parent().parent().hide();
            var assignApprovalLineText = $mls.getByCode('M_assignApprovalLine');

            $('#unidocu-td-WF_LIN1').after($('<button class="unidocu-button" style="margin-left: 10px;" data-wf-item-gb="1"></button>').click(wf_lin_Click).text(assignApprovalLineText));
            $('#unidocu-td-WF_LIN2').after($('<button class="unidocu-button" style="margin-left: 10px;" data-wf-item-gb="2"></button>').click(wf_lin_Click).text(assignApprovalLineText));
            $('#unidocu-td-WF_LIN3').after($('<button class="unidocu-button" style="margin-left: 10px;" data-wf-item-gb="3"></button>').click(wf_lin_Click).text(assignApprovalLineText));
            $('#unidocu-td-WF_LIN4').after($('<button class="unidocu-button" style="margin-left: 10px;" data-wf-item-gb="4"></button>').click(wf_lin_Click).text(assignApprovalLineText));
        }
    }
});
