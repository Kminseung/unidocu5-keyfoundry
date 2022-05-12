/**
 * @module vendorCustom/spigen/view/SPIGEN_000
 */

define(function () {
    return function(){
        $u.page.setCustomParam('useCancelGroupOnApprovalPopupClose', true);
        var gridObj = $u.gridWrapper.getGrid();

        gridObj.onCellClick(function (columnKey, rowIndex) {
            $efi.UD_0302_000EventHandler.gridCellClick(columnKey, rowIndex);
            if (columnKey === 'REQNO') {
                var rowData = gridObj.getJSONDataByRowIndex(rowIndex);
                var nextProgramId = "DRAFT_"+ rowData.ZBTYP;
                $u.navigateByProgramId(nextProgramId,rowData);
            }
        });
        $u.buttons.addHandler({
            "cancelDraft":function () {
                gridObj.asserts.rowSelected();
                $nst.is_data_returnMessage("ZUNIEFI_3805",{I_REQNO:gridObj.getSELECTEDJSONData()[0].REQNO},function () {
                    $u.buttons.triggerFormTableButtonClick();
                })
            },
            "requestApproval":function () {
                gridObj.asserts.rowSelected();
                $nst.it_data_nsReturn('ZUNIEFI_4203', gridObj.getSELECTEDJSONData(), function (nsReturn) {
                    if(nsReturn.getStringReturn("O_URL") !== '') $efi.UD_0302_000EventHandler.openApprovalPopup(nsReturn.getStringReturn("O_URL"))
                });
            },
            "cancelGroup":$efi.UD_0302_000EventHandler.cancelGroup
        });
    }
});