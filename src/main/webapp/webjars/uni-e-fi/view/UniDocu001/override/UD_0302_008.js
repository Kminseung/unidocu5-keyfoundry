/**
 * @module uni-e-fi/view/UniDocu001/override/UD_0302_008
 */
define(['uni-e-fi/view/UniDocu001/UD_0302_000'], function (UD_0302_000) {
    return function () {
        var initFn = UD_0302_000();
        var gridObj = $u.gridWrapper.getGrid();

        function validateInputId() {
            $.each(gridObj.getSELECTEDJSONData(), function (index, item) {
                if (item['INPUT'] !== 'X') throw '처리자 지정은 필수입니다.';
            });
        }

        var gridObjOnCellClick = gridObj.__onCellClick;
        gridObj.onCellClick(function (columnKey, rowIndex) {
            gridObjOnCellClick(columnKey, rowIndex);
            if (columnKey === 'ID') {
                var jsonData = gridObj.getJSONDataByRowIndex(rowIndex);
                var popup = $u.popup.openByProgramId('UD_0210_001_01', 1280, 1000, jsonData);
                var interval = setInterval(function () {
                    if (popup.closed) {
                        clearInterval(interval);
                        $u.buttons.triggerFormTableButtonClick('search-condition');
                    } else {
                        if (document.hasFocus() && $('.ui-dialog').length === 0) {
                            unidocuAlert($mls.getByCode('입금 반제처리 화면 종료 후 진행할 수 있습니다.'), function () {
                                if (popup.focus) popup.focus();
                            });
                        }
                    }
                }, 100);
            }
        });

        $u.buttons.addHandler({
            "makeGroup": function () {
                gridObj.asserts.rowSelected();
                if (gridObj.getSELECTEDJSONData()[0]['GRONO'] !== '') throw $mls.getByCode('M_UD_0302_000_makeGroupGRONOExists');
                validateInputId();
                unidocuConfirm($mls.getByCode('M_UD_0302_000_makeGroupConfirm'), function () {
                    $nst.it_data_nsReturn($u.programSetting.getValue('makeGroupFuncName'), gridObj.getSELECTEDJSONData(), function () {
                        $u.buttons.triggerFormTableButtonClick();
                    })
                })
            },
            "cancelGroup": function () {
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
            "requestApproval": function () {
                gridObj.asserts.rowSelected();
                validateInputId();
                $nst.it_data_nsReturn('ZUNIEFI_4203', gridObj.getSELECTEDJSONData(), function (nsReturn) {
                    $efi.UD_0302_000EventHandler.openApprovalPopup(nsReturn.getStringReturn("O_URL"))
                });
            }
        });

        return function () {
            initFn();
        }
    }
});