/**
 * UD_0201_011    정매입 세금계산서 전표등록 - 전표생성
 * UD_0201_012    매출 세금계산서 전표등록 - 전표생성
 * @module uni-e-fi/view/UD_0201_011
 */
define(function () {
    return function () {
        $('#searchForm').append($efi.mustache.amountDisplayWrapper());
        $u.unidocuUI();
        $efi.createStatementCommon.init();

        var gridObj = $u.gridWrapper.getGrid();
        $efi.createStatement.bindGridEvent();
        $efi.createStatementCommon.bindFormButton();
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
            }
        });

        return function () {
            $efi.createStatement.bindEvent.bindCommonFormEvent();
            $u.get('ISSUE_ID').$el.append($efi.get$evidenceIcon($u.page.getPageParams()));
            gridObj.setNumberNegative('WRBTR', 'false');
            $efi.createStatementCommon.handleEditMode();
            $efi.createStatement.bindEvent.triggerZTERM_BUDATChange();
            $efi.createStatement.bindEvent.triggerSGTXTChange();
            gridObj.fitToWindowSize();

            $efi.handleTYPE_CODE_0104_0204($u.page.getPageParams()['TYPE_CODE']); // #7593

            if ($u.page.getPageParams()['callByFI_0002']) $efi.createStatement.handleCallByFI_0002();
            if ($u.page.getPageParams()['GL_ALIAS']) {
                gridObj.checkAll();
                $efi.createStatement.bindEvent.triggerGL_ALIAS_Change();
            }
        }
    }
});