/**
 * UFL_0101_000    전자결재 설정구분
 * UFL_0101_060    결재선결정기준정의
 *
 * @module uni-e-approval/view/UFL_0101_000
 */
define(function () {
    return function () {
        $u.unidocuUI();
        $u.programSetting.appendTemplate('ot_dataForGridObj1FuncName',{
            defaultValue: 'ZUNIEWF_0003',
            description: 'ot_dataForGridObj1의 FuncName #20465'
        });
        $u.programSetting.appendTemplate('ot_dataForGridObj2FuncName',{
            defaultValue: 'ZUNIEWF_0013',
            description: 'ot_dataForGridObj2의 FuncName #20465'
        });
        $u.programSetting.appendTemplate('it_dataGridObj1SelectedRowsFuncName',{
            defaultValue: 'ZUNIEWF_0001',
            description: 'it_dataGridObj1SelectedRows의 FuncName #20465'
        });
        $u.programSetting.appendTemplate('it_dataGridObj1SelectedRows2FuncName',{
            defaultValue: 'ZUNIEWF_0004',
            description: 'it_dataGridObj1SelectedRows2의 FuncName #20465'
        });
        $u.programSetting.appendTemplate('it_dataGridObj2SelectedRowsFuncName',{
            defaultValue: 'ZUNIEWF_0011',
            description: 'it_dataGridObj2SelectedRows의 FuncName #20465'
        });
        $u.programSetting.appendTemplate('it_dataGridObj2SelectedRows2FuncName',{
            defaultValue: 'ZUNIEWF_0014',
            description: 'it_dataGridObj2SelectedRows2의 FuncName #20465'
        });
        var gridObj = $u.gridWrapper.getGrid();
        var gridObj2 = $u.gridWrapper.getGrid('unidocu-grid2');
        var $grid2Wrapper = $('#grid2Wrapper');
        $u.buttons.addHandler({
            ot_dataForGridObj1: function () {
                $nst.is_data_ot_data($u.programSetting.getValue('ot_dataForGridObj1FuncName'), null, function (ot_data) {
                    gridObj.setJSONData(ot_data);
                    hideAllWrapper();
                    gridObj.setActiveRowIndex(-1);
                });
            },
            ot_dataForGridObj2: function () {
                hideAllWrapper();
                if (!hasSelectedERDAT()) return;
                $nst.is_data_ot_data($u.programSetting.getValue('ot_dataForGridObj2FuncName'), selectedGridObj1KeyMap(), function (ot_data) {
                    $grid2Wrapper.show();
                    gridObj2.fitToWindowSize();
                    gridObj2.setJSONData(ot_data);
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
                gridObj2.addRowWithGridPopupIcon();
                var activeRowIndex = gridObj2.getActiveRowIndex();
                gridObj2.$V('SELECTED', activeRowIndex, '1');
                $.each(gridObj2.getGridHeaders(), function (index, header) {
                    if (!header.edit) gridObj2.makeCellEditable(header.key, activeRowIndex);
                });

                $.each(selectedGridObj1KeyMap(), function (key, value) {
                    gridObj2.makeCellReadOnly(key, activeRowIndex);
                    gridObj2.$V(key, activeRowIndex, value);
                });
            },
            it_dataGridObj1SelectedRows: itDataGridObj1SelectedRowsTemplate(gridObj, 'it_dataGridObj1SelectedRows', 'ot_dataForGridObj1'),
            it_dataGridObj1SelectedRows2: itDataGridObj1SelectedRowsTemplate(gridObj, 'it_dataGridObj1SelectedRows2', 'ot_dataForGridObj1'),
            it_dataGridObj2SelectedRows: itDataGridObj1SelectedRowsTemplate(gridObj2, 'it_dataGridObj2SelectedRows', 'ot_dataForGridObj2'),
            it_dataGridObj2SelectedRows2: itDataGridObj1SelectedRowsTemplate(gridObj2, 'it_dataGridObj2SelectedRows2', 'ot_dataForGridObj2'),
            saveGridObj1Form: function () {
                var params = $u.getValues('uni-form-table');
                $nst.is_data_it_data_nsReturn($u.buttons.getButtonFUNCNAME('saveGridObj1Form'), {}, [params], function () {
                    $u.buttons.runHandler('ot_dataForGridObj1');
                });
            }
        });
        gridObj.onRowActivate(function () {
            $u.buttons.runHandler('ot_dataForGridObj2');
        });

        function hideAllWrapper() {
            $grid2Wrapper.hide();
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

        function getGridObj1KeyFieldName() {
            var keyFieldNames = [];
            $.each(['WF_TYPE', 'WF_GB', 'WF_COND'], function (index, item) {
                if (gridObj.getGridHeader(item)) keyFieldNames.push(item);
            });
            return keyFieldNames;
        }

        function selectedGridObj1KeyMap() {
            var activeRowIndex = gridObj.getActiveRowIndex();
            var keyMap = {};
            $.each(getGridObj1KeyFieldName(), function (index, item) {
                keyMap[item] = gridObj.$V(item, activeRowIndex);
            });
            return keyMap;
        }

        function hasSelectedERDAT() {
            return gridObj.$V('ERDAT', gridObj.getActiveRowIndex()) !== '';
        }

        return function () {
            $(gridObj).height(200);
            $u.buttons.runHandler('ot_dataForGridObj1');
        }
    }
});