/**
 * UD_0209_001  반복전표 - 마스터관리
 * @module uni-e-fi/view/UD_0209_001
 */
define(function () {
    return function () {
        $u.unidocuUI();
        $efi.createStatementCommon.init();

        if ($u.get('FWBAS')) $u.get('FWBAS').$el.change(setWRBTR);
        if ($u.get('FWSTE')) $u.get('FWSTE').$el.change(setWRBTR);
        if ($u.get('MWSKZ')) $u.get('MWSKZ').$el.change(function () { // 세금코드
            var wrbtr = $u.get('WRBTR').getValue();
            var fwbas = $u.get('FWBAS').getValue();
            var fwste = $u.get('FWSTE').getValue();
            if ($efi.createStatementCommon.hasFormVAT()) {
                if (Number(wrbtr) > 0) {
                    fwbas = Number(wrbtr) / 1.1;
                    fwste = Number(wrbtr) - Number(fwbas);
                } else if (Number(fwbas) > 0) {
                    wrbtr = Number(fwbas) * 1.1;
                    fwste = Number(wrbtr) - Number(fwbas);
                }
            } else {
                fwste = 0;
                if (Number(wrbtr) > 0) fwbas = wrbtr;
                else if (Number(fwbas) > 0) wrbtr = fwbas;
            }
            $u.get('WRBTR').setValue(wrbtr);
            $u.get('FWBAS').setValue(fwbas);
            $u.get('FWSTE').setValue(fwste);
        });

        $u.buttons.addHandler({
            "doSave": function () {
                var jsonData = $u.getValues();
                jsonData['PERNR'] = jsonData['PERNR2'];
                jsonData['BUKRS'] = jsonData['BUKRS2'];

                validateBeforeInsert(jsonData);

                $nst.is_data_returnMessage('ZUNIEFI_3500', jsonData, function (message) {
                    unidocuAlert(message, function () {
                        $u.navigateByProgramId('UD_0209_002');
                    });
                });
            }
        });

        function validateBeforeInsert(jsonData) {
            $u.validateRequired('header-info'); // 반복전표 마스터관리
            $u.validateRequired('evidence-selection-condition'); // 증빙선택 조건
            $u.validateRequired('debit-pre-conditions'); // 차변 전기정보
            if (jsonData['KOSTL'] === '' && jsonData['AUFNR'] === '' && jsonData['PROJK'] === '') {
                throw $u.util.formatString($mls.getByCode('M_UD_0209_001_validateBeforeInsert'), {
                    kostlThTxt: $u.get('KOSTL2').params.thText,
                    aufnrThTxt: $u.get('AUFNR').params.thText,
                    projkThTxt: $u.get('PROJK').params.thText
                });
            }
            $u.validateRequired('credit-pre-conditions'); // 대변 전기정보
        }

        function setWRBTR() {
            var fwbas = $u.get('FWBAS').getValue();
            var fwste = $u.get('FWSTE').getValue();
            $u.get('WRBTR').setValue(Number(fwbas) + Number(fwste));
        }

        return function () {
            var mode = $u.page.getPageParams()['MODE'];
            if ($u.get('WDAYB') && $u.get('WDAYE') && $u.get('WDAY_DIV')) {
                $u.get('WDAYB').$el.css({'display': 'inline-block', 'min-width': '50px'});
                $u.get('WDAYE').$el.css({'display': 'inline-block', 'min-width': '50px'});
                $u.get('WDAY_DIV').$el.css({'padding-left': '5px', 'padding-right': '5px'});
            }
            if ($u.get('EDAYB') && $u.get('EDAYE') && $u.get('EDAY_DIV')) {
                $u.get('EDAYB').$el.css({'display': 'inline-block', 'min-width': '50px'});
                $u.get('EDAYE').$el.css({'display': 'inline-block', 'min-width': '50px'});
                $u.get('EDAY_DIV').$el.css({'padding-left': '5px', 'padding-right': '5px'});
            }

            if (mode === 'readOnly') {
                var repSeq = $u.page.getPageParams()['REP_SEQ'];
                if (!repSeq || repSeq === '') return;
                $u.setValues('header-info', $u.page.getPageParams());
                $u.setValues('evidence-selection-condition', $u.page.getPageParams());
                $u.setValues('debit-pre-conditions', $u.page.getPageParams());
                $u.setValues('credit-pre-conditions', $u.page.getPageParams());
            }
        }
    }
});