/**
 * @module vendorCustom/magnachip/view/customizeUD_0202_011
 */

define([
],function() {
    return function(initFn) {
        initFn();
        $u.gridWrapper.getGrid().setRowDataByJSONObj(0,$u.page.getPageParams());
        $u.buttons.addHandler({
            createStatement: function () {
                function createStatementFnUD_0201_012(params) {
                    var paramMap = params['paramMap'];
                    var gridData = params['gridData'];
                    var tableParams = {IT_DATA: gridData};
                    tableParams['IT_ATTACH'] = $u.fileUI.getFineUploader().getCopiedFileInfos();
                    $nst.is_data_tableParams_os_docno($u.programSetting.getValue('setCreateStatementFunction'), paramMap, tableParams, function (os_docNo) {
                        $efi.dialog.afterCreateStatementDialog.open(os_docNo);
                    });
                }

                $efi.createStatement.validateCreateStatement();
                var params = $efi.createStatement.getCreateStatementCommonParams();

                if (/UD_0201_012/.test($u.page.getPROGRAM_ID())) createStatementFnUD_0201_012(params);
                else $efi.createStatement.callCreateStatementFn(params);
            },
            getDbData: function () {
                $magnachip.getGwDbDialog()
            }
        });
    }

});