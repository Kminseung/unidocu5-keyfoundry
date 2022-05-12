/**
 * UD_0203_001    업무상전도금 전표생성
 * UD_0203_011    선급금 전표생성
 * UD_0203_021    사업상 전도금 전표생성
 * UD_0203_031    보증금 수탁
 *
 * @module uni-e-fi/view/UD_0203_001
 */
define(function () {
    return function () {
        $u.unidocuUI();
        $efi.createStatementCommon.init();

        $efi.createStatement.bindEvent.bindEMPFBChange();
        $efi.createStatement.bindEvent.bindVendorCodeChange();
        $efi.createStatement.bindEvent.bindZTERM_BUDATChange();
        $efi.bindZUNIEFI_5003Handler();
        $u.unidocuCurrency.bind_setKRUSF_onWAERS_BUDAT_change();
        $u.buttons.addHandler({
            createStatement: function () {
                $u.validateRequired();
                if ($u.programSetting.getValue('isAttachmentRequired') === 'true' && $('.file-count').html() === '0') throw '[증빙]을 첨부해 주세요';
                var jsonData = $u.getValues('header-invoicer-content');
                $u.fileUI.setFileAttachKeyParam(jsonData);
                var tableParams = {};
                tableParams['IT_ATTACH'] = $u.fileUI.getFineUploader().getCopiedFileInfos();
                $efi.createStatement.confirmBeforeCreateStatement(jsonData, tableParams, function () {
                    $nst.is_data_tableParams_os_docno($u.programSetting.getValue('setCreateStatementFunction'), jsonData, tableParams, function (os_docNo) {
                        $efi.dialog.afterCreateStatementDialog.open(os_docNo, function () {
                            $u.navigateByProgramId($u.page.getPROGRAM_ID());
                        });
                    });
                });
            },
            initPage: $efi.createStatementCommon.initPage
        });

        return function () {
            $efi.createStatement.bindEvent.triggerZTERM_BUDATChange();
            $efi.createStatement.bindEvent.triggerSGTXTChange();
            var lifnr = $u.get('LIFNR');
            if (lifnr && lifnr.getValue() !== '') lifnr.$el.change();
        }
    }
});