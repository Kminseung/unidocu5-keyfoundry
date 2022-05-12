/**
 * uni-e-fi/layout/UniEFI001 layout 사용
 * UD_0202_001 시내교통비 전표등록<br />
 * UD_0202_011 출장비 - 생성<br />
 * UD_0220_012 해외출장비
 * UD_0202_021  전표작성 전자증빙외 - 원천세<br />
 * UD_0202_031 경조사비 - 생성<br />
 * UD_0202_041 잔업식대 - 생성<br />
 * @module uni-e-fi/view/UD_0202_001
 */
define(function () {
    return function () {
        $('#searchForm').append($efi.mustache.amountDisplayWrapper());
        $u.unidocuUI();
        $efi.createStatementCommon.init();

        $u.programSetting.appendTemplate('evidenceAmountNegative', {
            defaultValue: 'false',
            description: '입력 금액 -로 처리. 차대변 지시자 반대로 적용 H, S'
        });

        var gridObj = $u.gridWrapper.getGrid();
        var pageParams = $u.page.getPageParams();
        $efi.createStatement.bindGridEvent();
        $efi.createStatementCommon.bindFormButton();
        $u.unidocuCurrency.bind_setKRUSF_onWAERS_BUDAT_change();
        $u.buttons.addHandler({
            createStatement: function () {
                $efi.createStatement.validateCreateStatement();
                var params = $efi.createStatement.getCreateStatementCommonParams();
                params['useReload'] = true;
                $efi.createStatement.callCreateStatementFn(params);
            }
        });

        return function () {
            $efi.createStatement.bindEvent.bindCommonFormEvent();
            gridObj.setNumberNegative('WRBTR', 'false');
            $efi.createStatementCommon.addRow();
            $efi.createStatement.bindEvent.triggerZTERM_BUDATChange();
            $efi.createStatement.bindEvent.triggerSGTXTChange();
            gridObj.fitToWindowSize();

            var lifnr = $u.get('LIFNR');
            if (lifnr && lifnr.getValue() !== '') lifnr.$el.change();

            var $u_WT_WITHCD = $u.get('WT_WITHCD');
            if ($u_WT_WITHCD) $u_WT_WITHCD.$el.change(function() {
                $efi.createStatement.calculateWithcdTax();
            })

            if (pageParams['callByFI_0002']) $efi.createStatement.handleCallByFI_0002();
            if (pageParams['showAsPopup']) {
                if (pageParams['hideFileUI'] === 'true') $u.fileUI.hide();
                if (pageParams['EVKEY']) $u.fileUI.getFineUploader().setFileGroupId(pageParams['EVKEY']);
                if (pageParams['WRBTR']) gridObj.$V('WRBTR', 0, pageParams['WRBTR']);
                $ewf.UD_0220_002.closeWhenOpenerIsClosed();
                $ewf.UD_0220_002.addHandlerCreateStatementInPopup();
            }
        }
    }
});