/**
 * UD_0201_001    법인카드 전표등록 - 전표생성
 * @module uni-e-fi/view/UD_0201_001
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
                $efi.createStatement.validateCreateStatement();
                var params = $efi.createStatement.getCreateStatementCommonParams();
                if($u.util.contains($u.page.getPROGRAM_ID(),['UD_0201_001_JHK','UD_0201_001_JHK2'])){
                    var is_data = params['paramMap'];
                    var it_data = params['gridData'];
                    $nst.is_data_it_data_returnMessage('YJHK_001',is_data, it_data, function(message) {
                        unidocuAlert(message);
                    });
                }else{
                    $efi.createStatement.callCreateStatementFn(params);
                }
            }
        });

        return function () {
            $efi.createStatement.bindEvent.bindCommonFormEvent();
            $u.get('APPR_NO').$el.append($efi.get$evidenceIcon($u.page.getPageParams()));
            gridObj.setNumberNegative('WRBTR', 'false');
            $efi.createStatementCommon.handleEditMode();
            $efi.createStatement.bindEvent.triggerZTERM_BUDATChange();
            $efi.createStatement.bindEvent.triggerSGTXTChange();
            gridObj.fitToWindowSize();


            if ($u.page.getPageParams()['callByFI_0002']) $efi.createStatement.handleCallByFI_0002();
            if ($u.page.getPageParams()['showAsPopup']){
                $ewf.UD_0220_002.closeWhenOpenerIsClosed();
                $ewf.UD_0220_002.addHandlerCreateStatementInPopup();
            }
            if ($u.page.getPageParams()['GL_ALIAS']) {
                gridObj.checkAll();
                $efi.createStatement.bindEvent.triggerGL_ALIAS_Change();
            }
        }
    }
});