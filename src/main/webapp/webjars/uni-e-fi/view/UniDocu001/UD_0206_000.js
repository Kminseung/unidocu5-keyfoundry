/**
 * UD_0206_000    대량업로드 전표처리<br />
 * UD_0206_001    원천세<br />
 * UD_0206_002    매입세금계산서(전자)<br />
 * UD_0206_003    영수증<br />
 * UD_0206_004    대체분개<br />
 * UD_0206_005    내부오더<br />
 * UD_0206_006    세미나<br />
 * UD_0206_007    복리비<br />
 * UD_0206_008    시상금<br />
 * UD_0206_009    매입세금계산서(전자) - 자료다운로드<br />
 * UD_0206_010    매입세금계산서(종이)<br />
 * TODO UD_0206_002, UD_0206_009 화면만 사용.<br />
 *  layout<br />
 * <a href="../../../unidocu-ui/site/layout/UniDocu001.html">unidocu-ui/layout/UniDocu001</a>
 * @module uni-e-fi/view/UniDocu001/UD_0206_000
 */
define(function () {
    return function () {
        $u.programSetting.appendTemplate('saveFuncName', {
            defaultValue: 'ZUNIEFI_2209',
            description: 'save의 FuncName #20465'
        });
        $u.programSetting.appendTemplate('createStatementFuncName', {
            defaultValue: 'ZUNIDU_0109',
            description: 'createStatement의 FuncName #20465'
        });
        $u.programSetting.appendTemplate('deleteStatementFuncName', {
            defaultValue: 'ZUNIDU_0104',
            description: 'deleteStatement의 FuncName #20465'
        });
        $u.programSetting.appendTemplate('deleteFuncName', {
            defaultValue: 'ZUNIDU_0102',
            description: 'delete의 FuncName #20465'
        });

        var gridObj = $u.gridWrapper.getGrid();
        gridObj.onCellClick(function (columnKey, rowIndex) {
            if (columnKey === 'BELNR') $efi.popup.openStatementViewWithParamMap(gridObj.getJSONDataByRowIndex(rowIndex));
        });

        $u.buttons.addHandler({
            "templateDownload": function () {
                $u.excel.templateDownload(gridObj);
            },
            "save": function () {
                gridObj.asserts.rowSelected();
                var gridData = gridObj.getSELECTEDJSONData();
                $nst.is_data_it_data_nsReturn($u.programSetting.getValue('saveFuncName'), $u.getValues('search-condition'), gridData, function (nsReturn) {
                    var ot_return = nsReturn.getTableReturn('OT_RETURN');
                    var ot_data = nsReturn.getTableReturn('OT_DATA');

                    gridObj.setJSONData(ot_data);
                    if (ot_return.length > 0) {
                        var message = '';
                        $.each(ot_return, function (index, rowData) {
                            message += rowData['MESSAGE'] + '\n';
                        });
                        unidocuAlert(message);
                    }
                });
            },
            "createStatement": function () {
                gridObj.asserts.rowSelected();
                $nst.is_data_it_data_returnMessage($u.programSetting.getValue('createStatementFuncName'), $u.getValues('search-condition'), gridObj.getSELECTEDJSONData(), function (message) {
                    unidocuAlert(message, function () {
                        $u.buttons.triggerFormTableButtonClick();
                    });
                });
            },
            "deleteStatement": function () {
                gridObj.asserts.rowSelected();
                $nst.is_data_it_data_returnMessage($u.programSetting.getValue('deleteStatementFuncName'), $u.getValues('search-condition'), gridObj.getSELECTEDJSONData(), function (message) {
                    unidocuAlert(message, function () {
                        $u.buttons.triggerFormTableButtonClick();
                    });
                });
            },
            "delete": function () {
                gridObj.asserts.rowSelected();
                $nst.is_data_it_data_returnMessage($u.programSetting.getValue('deleteFuncName'), $u.getValues('search-condition'), gridObj.getSELECTEDJSONData(), function (message) {
                    unidocuAlert(message, function () {
                        $u.buttons.triggerFormTableButtonClick();
                    });
                });
            }
        });
        $u.excel.bindExcelUploadHandler(gridObj);

        return function () {
            gridObj.setBlockPasteMode('clipboardareabase');
            if ($u.page.getPROGRAM_ID() === 'UD_0206_009') gridObj.setColumnHide('SELECTED', true);
            else gridObj.setHeaderCheckBox('SELECTED', true);
        }
    }
});
