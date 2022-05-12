/**
 * @module vendorCustom/magnachip/view/customizeUD_0302_000
 */

define([], function () {
    return function (initFn) {
        initFn();
        var message = "그룹결재는 31건까지 선택이 가능합니다. 다시 확인하고 선택해 주세요."
        var gridObj = $u.gridWrapper.getGrid();

        $('#unidocu-td-PERNR').change(function () {
            $magnachip.magnaPernrComboOption('IPERNR');
        })

        $u.buttons.addHandler({
            "makeGroup": function () {
                var selectrow = gridObj.getSelectedRowIndexes()
                if (selectrow.length >= 32) {
                    unidocuAlert(message);
                    return;
                }
                gridObj.asserts.rowSelected();
                if (gridObj.getSELECTEDJSONData()[0]['GRONO'] !== '') throw $mls.getByCode('M_UD_0302_000_makeGroupGRONOExists');
                unidocuConfirm($mls.getByCode('M_UD_0302_000_makeGroupConfirm'), function () {
                    $nst.it_data_nsReturn($u.programSetting.getValue('makeGroupFuncName'), gridObj.getSELECTEDJSONData(), function () {
                        $u.buttons.triggerFormTableButtonClick();
                    })
                })
            },
            "requestApproval": function () {
                var chkArray = ["FI_02", "FI_04"]
                for (var i = 0; i < gridObj.getSELECTEDJSONData().length; i++) {
                    if (chkArray.indexOf(gridObj.getSELECTEDJSONData()[i].EVIKB) !== -1) {
                        gridObj.asserts.selectedExactOneRow();
                    }
                }
                var kostlChkArray = ["FI_03"]
                for (var z = 0;z < gridObj.getSELECTEDJSONData().length; z++) {
                    if (kostlChkArray.indexOf(gridObj.getSELECTEDJSONData()[z].EVIKB) !== -1) {
                        for (var j = 0; j < gridObj.getSELECTEDJSONData().length; j++) {
                            if (gridObj.getSELECTEDJSONData()[z].KOSTL !== gridObj.getSELECTEDJSONData()[j].KOSTL) {
                                unidocuAlert("코스트센터가 다른 경우 그룹결재 불가")
                                return;
                            }
                        }
                    }
                }
                var selectrow = gridObj.getSelectedRowIndexes()
                if (selectrow.length >= 32) {
                    unidocuAlert(message);
                    return;
                }
                gridObj.asserts.rowSelected();
                $nst.it_data_nsReturn($u.programSetting.getValue('requestApprovalFuncName'), gridObj.getSELECTEDJSONData(), function (nsReturn) {
                    $efi.UD_0302_000EventHandler.openApprovalPopup(nsReturn.getStringReturn("O_URL"))
                });
            }
        });
    }
});