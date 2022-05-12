/**
 * @module uni-e-mm/view/UniDocu001/UD_MM_0100
 */
define(function () {
    return function () {
        var gridObj = $u.gridWrapper.getGrid();
        gridObj.onCellClick(function (columnKey, rowIndex) {
            var rowData = gridObj.getJSONDataByRowIndex(rowIndex);
            if (/FILE_LINK/.test(columnKey)) {
                var fileGroupId = rowData['EBELN'] + rowData['EBELP'];
                var $dialog = $u.dialog.fineUploaderDialog.open(fileGroupId, false);
                $dialog.on('fileCountChange', function (event, fileCount) {
                    gridObj.$V('FILE_LINK', rowIndex, fileCount);
                });
            }
        });
        $u.buttons.addHandler({
            initPage: $efi.createStatementCommon.initPage,
            createStatement: function () {
                $u.validateRequired();
                gridObj.validateGridRequired();
                var paramMap = $u.getValues('search-condition');
                $nst.is_data_it_data_nsReturn('ZUNIEFI_2011', paramMap, gridObj.getSELECTEDJSONData(), function (nsReturn) {
                    $efi.dialog.afterCreateStatementDialog.open(nsReturn.getExportMap('OS_DOCNO'));
                });
            }
        });

        return function () {
            gridObj.setJSONData($u.page.getPageParams()['selectedJSONData']);
        }
    }
});
