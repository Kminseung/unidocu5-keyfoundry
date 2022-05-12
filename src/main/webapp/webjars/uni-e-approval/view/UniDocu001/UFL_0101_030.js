/**
 * UFL_0101_030    결재문서구분
 * UFL_0101_050    전자결재-번호채번
 * @module uni-e-approval/view/UniDocu001/UFL_0101_030
 */
define(function () {
    return function () {
        $u.programSetting.appendTemplate('ot_dataForGridObj1FuncName',{
            defaultValue: 'ZUNIEWF_0033',
            description: 'ot_dataForGridObj1의 FuncName #20465'
        });
        $u.programSetting.appendTemplate('it_dataGridObj1SelectedRowsFuncName',{
            defaultValue: 'ZUNIEWF_0031',
            description: 'it_dataGridObj1SelectedRows의 FuncName #20465'
        });
        $u.programSetting.appendTemplate('it_dataGridObj1SelectedRows2FuncName',{
            defaultValue: 'ZUNIEWF_0034',
            description: 'it_dataGridObj1SelectedRows2의 FuncName #20465'
        });
        var gridObj = $u.gridWrapper.getGrid();
        $u.buttons.addHandler({
            ot_dataForGridObj1: function () {
                $nst.is_data_ot_data($u.programSetting.getValue('ot_dataForGridObj1FuncName'), null,function (ot_data) {
                    gridObj.setJSONData(ot_data);
                });
            },
            addRowGridObj1: function () {
                gridObj.addRowWithGridPopupIcon();
                var activeRowIndex = gridObj.getActiveRowIndex();
                gridObj.$V('SELECTED', activeRowIndex, '1');
                $.each(gridObj.getGridHeaders(), function (index, header) {
                    if (!header.edit) gridObj.makeCellEditable(header.key, activeRowIndex);
                });
            },
            it_dataGridObj1SelectedRows: function () {
                gridObj.asserts.rowSelected();
                $nst.is_data_it_data_nsReturn($u.programSetting.getValue('it_dataGridObj1SelectedRowsFuncName'), {}, gridObj.getSELECTEDJSONData(), function () {
                    $u.buttons.runHandler('ot_dataForGridObj1');
                });
            },
            it_dataGridObj1SelectedRows2: function () {
                gridObj.asserts.rowSelected();
                $nst.is_data_it_data_nsReturn($u.programSetting.getValue('it_dataGridObj1SelectedRows2FuncName'), {}, gridObj.getSELECTEDJSONData(), function () {
                    $u.buttons.runHandler('ot_dataForGridObj1');
                });
            }
        });

        return function () {
            $u.buttons.runHandler('ot_dataForGridObj1');
        }
    }
});
