/**
 * UD_0601_030 매입세금계산서 현황
 * UD_0601_080    실물증빙-리포트
 * UD_0601_090    현금증빙-리포트
 * @module uni-e-fi/view/UniDocu001/UD_0601_030
 */
define(function () {
    return function () {
        var gridObj = $u.gridWrapper.getGrid();
        gridObj.onCellClick(function (columnKey, rowIndex) {
            if (columnKey === 'BELNR') $efi.popup.openStatementViewWithParamMap(gridObj.getJSONDataByRowIndex(rowIndex));
            if (columnKey === 'ISSUE_ID') $efi.popup.openTaxInvoice(gridObj.$V('INV_SEQ', rowIndex));
            if (columnKey === 'EVI_SEQ') $efi.popup.showEvidence(gridObj.$V('EVI_SEQ', rowIndex));
        });

        return function () {

        }
    }
});