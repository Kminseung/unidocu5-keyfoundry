/**
 * UD_0205_000    전표기준-전표생성
 * UD_0205_001    복리후생비-제조
 * UD_0205_002    복리후생비-판매
 * UD_0205_003    여비교통비-제조
 * UD_0205_004    여비교통비-판매
 * UD_0205_005    지급수수료-제조
 * UD_0205_006    영업외 비용
 *
 * @module uni-e-fi/view/UD_0205_000
 */
define(function () {
    return function () {
        $('#searchForm').append($efi.mustache.amountDisplayWrapper());
        $u.unidocuUI();
        $efi.createStatementCommon.init();

        var gridObj = $u.gridWrapper.getGrid();
        $efi.bindZUNIEFI_5003Handler();
        $efi.evidenceHandler();
        $efi.createStatement.bindGridEvent();
        $efi.createStatement.bindEvent.bindCommonFormEvent();
        $efi.createStatementCommon.bindFormButton();
        $u.buttons.addHandler({
            createStatement: function () {
                function createStatementFnZUNIEFI_5004(params) {
                    var paramMap = params['paramMap'];
                    var gridData = params['gridData'];

                    var tableParams = {IT_DATA: gridData, IT_VEND: [paramMap]};
                    tableParams['IT_ATTACH'] = $u.fileUI.getFineUploader().getCopiedFileInfos();
                    $nst.is_data_tableParams_os_docno('ZUNIEFI_5004', paramMap, tableParams, function (os_docNo) {
                        $efi.dialog.afterCreateStatementDialog.open(os_docNo, function () {
                            $u.pageReload();
                        });
                    });
                }

                function createStatementFnZUNIEFI_5000(params) {
                    var paramMap = params['paramMap'];
                    var gridData = params['gridData'];

                    var tableParams = {IT_DATA: gridData};
                    tableParams['IT_ATTACH'] = $u.fileUI.getFineUploader().getCopiedFileInfos();
                    $nst.is_data_tableParams_os_docno('ZUNIEFI_5000', paramMap, tableParams, function (os_docNo) {
                        $efi.dialog.afterCreateStatementDialog.open(os_docNo, function () {
                            $u.pageReload();
                        });
                    });
                }

                if ($u.get('AMT') && $u.get('AMT').getValue() < $u.get('WRBTR').getValue()) throw $mls.getByCode('M_UD_0205_000_wrbtrBiggerThanAMT');

                $efi.createStatement.validateCreateStatement();

                var params = $efi.createStatement.getCreateStatementCommonParams();
                params.useReload = true;
                var selected_evidence_is_key = $u.page.getCustomParam('selected_evidence_is_key');
                if (selected_evidence_is_key) params.paramMap = $.extend({}, JSON.parse(selected_evidence_is_key), params.paramMap);

                params.paramMap['PROGRAM_ID'] = $u.page.getPROGRAM_ID();
                params['funcname'] = 'ZUNIEFI_5100';

                var evikb = ($u.get('EVIKB')) ? $u.get('EVIKB').getValue() : '';
                if (evikb === 'A') params.paramMap['PROGRAM_ID'] = 'UD_0201_001';
                if (evikb === 'B') params.paramMap['PROGRAM_ID'] = 'UD_0201_011';

                if (evikb === 'A') params['funcname'] = 'ZUNIEFI_1009';
                if (evikb === 'B') params['funcname'] = 'ZUNIEFI_2003';

                if (!/^[ABC]$/.test(evikb) && !/^UD_0205_003$/g.test($u.page.getPROGRAM_ID())) {
                    return $efi.createStatement.callCreateStatementFn(params);
                }

                if (/^UD_0205_005|UD_0205_007$/.test($u.page.getPROGRAM_ID())) createStatementFnZUNIEFI_5004(params);
                else if (/^UD_0205_003$/g.test($u.page.getPROGRAM_ID())) createStatementFnZUNIEFI_5000(params);
                else $efi.createStatement.callCreateStatementFn(params);
            }
        });

        return function () {
            if ($u.get('EVIKB') && $u.get('EVIKB').$el.filter('input').length === 1) {
                $('h3.statement-title').hide();
                $('#statement-wrapper').hide();
            }
            $efi.createStatementCommon.addRow();
            if ($u.get('EVIKB')) $efi.createStatement.UD_0205_000_EvikbChangeHandler();
            else $u.showSubContent();
            $efi.createStatement.bindEvent.triggerZTERM_BUDATChange();
            $efi.createStatement.bindEvent.triggerSGTXTChange();
            gridObj.fitToWindowSize();
        }
    }
});