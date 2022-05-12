/**
 * UD_0220_008    법인카드 전표등록 - 내역조회(출장비용)
 * @module uni-e-fi/view/UniDocu001/UD_0220_008
 */
define(['uni-e-fi/view/UniDocu001/UD_0201_000'], function (initFn) {
    return function () {
        initFn();
        var $gubun = $u.get('GUBUN');
        var gridObj = $u.gridWrapper.getGrid();

        $u.get('GUBUN').$el.on('change', (function() {
            var $button = $('#createStatement');
            var gubunTable = {
                'A' : '전표작성',
                'B' : '국내출장 전표작성',
                'C' : '해외출장 전표작성'
            };

            return function() {
                $button.text(gubunTable[$gubun.getValue()]);
            }
        })()).change();

        $u.buttons.addCustomHandler({
            'createStatement': function (buttonId) {
                gridObj.asserts.selectedExactOneRow();

                var selectedData = gridObj.getSELECTEDJSONData()[0];

                if (selectedData['USE_DOC'] === 'X') throw $mls.getByCode('M_cannotCreateStatmentWithFinishedDoc');
                if (selectedData['LIFNR'] === '') throw $mls.getByCode('M_UD_0201_000_LIFNR_EMPTY');

                selectedData['WRBTR'] = selectedData['TOTAL'];
                selectedData['APPR_DATE_APPR_TIME'] = $u.util.date.getDateAsUserDateFormat(selectedData['APPR_DATE']) + ' ' + selectedData['APPR_TIME'];

                var nextProgramIdBySubId = '';
                if(buttonId === 'createStatement') nextProgramIdBySubId = $u.programSetting.getValue('createButtonSubId');
                if(buttonId === 'createStatement' && $gubun.getValue() === 'B') nextProgramIdBySubId = 'UD_0220_009';
                if(buttonId === 'createStatement' && $gubun.getValue() === 'C') nextProgramIdBySubId = 'UD_0220_010';
                if(buttonId === 'createStatement2') nextProgramIdBySubId = $u.programSetting.getValue('create2ButtonSubId');
                if(buttonId === 'createStatement3') nextProgramIdBySubId = $u.programSetting.getValue('create3ButtonSubId');

                var nextPROGRAM_ID = 'UD_0201_001';
                if (nextProgramIdBySubId) nextPROGRAM_ID = nextProgramIdBySubId;
                if (selectedData['PROGRAM_ID']) nextPROGRAM_ID = selectedData['PROGRAM_ID'];

                selectedData['BUTTON_ID'] = nextProgramIdBySubId;
                $efi.vendorInfoAddedDataHandler.handleByProgramId('UD_0201_000', selectedData, function (vendorAddedData) {
                    $u.navigateByProgramId(nextPROGRAM_ID, vendorAddedData, true);
                });
            }
        });

        return function () {
            $u.buttons.runCustomHandler('handleButtonFieldVisibleByMODEChange');
        }
    }
});
