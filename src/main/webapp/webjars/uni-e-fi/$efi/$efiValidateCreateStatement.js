/**
 * @module uni-e-fi/$efi/$efiValidateCreateStatement
 */
define(function () {
    return function () {
        var HKONTCObjectMap = {}, HKONT_XBILKMap = {};

        $efi.createStatement.validateHKONT_LIFNR = function () {
            var gridObj = $u.gridWrapper.getGrid();
            if (!gridObj.getGridHeader('LIFNR')) return;
            var hkontHeaderText = gridObj.getColumnHeaderText('HKONT');
            var lifnrHeaderText = gridObj.getColumnHeaderText('LIFNR');
            var gridData = gridObj.getJSONData();
            var prefix = $u.util.formatString('[{hkontHeaderText}, {lifnrHeaderText}]', {
                hkontHeaderText: hkontHeaderText,
                lifnrHeaderText: lifnrHeaderText
            });
            $.each(gridData, function (item, rowData) {
                if (rowData['HKONT'] !== '' && rowData['LIFNR'] !== '') throw $u.util.formatString($mls.getByCode('M_shouldInputOnlyOne'), {namesString: prefix});
                if (rowData['HKONT'] === '' && rowData['LIFNR'] === '') throw $u.util.formatString($mls.getByCode('M_shouldInput'), {elementNameString: prefix});
            });
        };

        /**
         * KOSTL, AUFNR, PROJK 컬럼이 그리드에 있는 경우 validation 수행
         * 체크 컬럼: KOSTL, AUFNR, PROJK, PRZNR
         * XBILK - X 무시 (optional)
         * XBILK - ''
         *   COOBJECT - '' 입력불가
         *   COOBJECT - 'X' 필수입력
         */
        $efi.createStatement.useCOObject = function(params) {
            var programId = $u.page.getPROGRAM_ID();
            var f4CodeKey = $u.gridWrapper.getGrid().getF4CodeKey('HKONT');
            if (!HKONTCObjectMap[programId]) HKONTCObjectMap[programId] = {};
            if (!HKONTCObjectMap[programId][params["HKONT"]]) HKONTCObjectMap[programId][params["HKONT"]] = $u.f4Data.getCodeMapWithParams('HKONT', 'COOBJECT', params, f4CodeKey)[params["HKONT"]];
            return HKONTCObjectMap[programId][params["HKONT"]] === 'X';
        };
        $efi.createStatement.ignoreCOObject = function(params) {
            var programId = $u.page.getPROGRAM_ID();
            var f4CodeKey = $u.gridWrapper.getGrid().getF4CodeKey('HKONT');
            if (!HKONT_XBILKMap[programId]) HKONT_XBILKMap[programId] = {};
            if (!HKONT_XBILKMap[programId][params["HKONT"]]) HKONT_XBILKMap[programId][params["HKONT"]] = $u.f4Data.getCodeMapWithParams('HKONT', 'XBILK', params, f4CodeKey)[params["HKONT"]];
            return HKONT_XBILKMap[programId][params["HKONT"]] === 'X';
        };
        $efi.createStatement.validateHKONTCOObject = function(){
            var gridObj = $u.gridWrapper.getGrid();

            if (!gridObj.getGridHeader('HKONT') || !gridObj.getGridHeader('KOSTL') || !gridObj.getGridHeader('AUFNR') || !gridObj.getGridHeader('PROJK')) return;
            var kostlHeaderText = gridObj.getColumnHeaderText('KOSTL');
            var aufnrHeaderText = gridObj.getColumnHeaderText('AUFNR');
            var projkHeaderText = gridObj.getColumnHeaderText('PROJK');
            var prznrHeaderText;
            if (gridObj.getGridHeader('PRZNR')) prznrHeaderText = gridObj.getColumnHeaderText('PRZNR');

            var gridData = gridObj.getJSONData();
            for (var i = 0, len = gridData.length; i < len; i++) {
                var rowData = gridData[i];
                var hkont = rowData['HKONT'];
                var json = {
                    hkont: rowData['HKONT'],
                    hkontTxt: gridObj.getCachedCodeText('HKONT', rowData['HKONT']),
                    kostlHeaderText: kostlHeaderText,
                    aufnrHeaderText: aufnrHeaderText,
                    projkHeaderText: projkHeaderText
                };
                if (prznrHeaderText) json.prznrHeaderText = prznrHeaderText;

                var prefix = 'code: {hkont}, text: {hkontTxt}, [{kostlHeaderText}, {aufnrHeaderText}, {projkHeaderText}]';
                if (prznrHeaderText) prefix = 'code: {hkont}, text: {hkontTxt}, [{kostlHeaderText}, {aufnrHeaderText}, {projkHeaderText}, {prznrHeaderText}]';

                prefix = $u.util.formatString(prefix, json);

                if ($u.page.getPROGRAM_ID() === 'UD_0202_021_C' && rowData['KOART'] === 'S') continue;
                if ($efi.createStatement.ignoreCOObject({HKONT:hkont})) continue;
                if ($efi.createStatement.useCOObject({HKONT:hkont})) {
                    var isEmpty = rowData['KOSTL'] === '' && rowData['AUFNR'] === '' && rowData['PROJK'] === '';
                    if (isEmpty) {
                        var shouldInputMoreThanOneString = $u.util.formatString($mls.getByCode('M_shouldInputMoreThanOne'), {namesString: prefix});

                        if (prznrHeaderText) {
                            if (rowData['PRZNR'] === '') throw $u.util.formatString(shouldInputMoreThanOneString, json);
                            else isEmpty = false;
                        }
                        if (isEmpty) throw $u.util.formatString(shouldInputMoreThanOneString, json);
                    }
                } else {
                    var givenFieldsCannotInputString = $u.util.formatString($mls.getByCode('M_givenFieldsCannotInput'), {namesString: prefix});
                    var hasValue = rowData['KOSTL'] !== '' || rowData['AUFNR'] !== '' || rowData['PROJK'] !== '';
                    if (hasValue) throw $u.util.formatString(givenFieldsCannotInputString, json);
                    if (prznrHeaderText && rowData['PRZNR'] !== '') throw $u.util.formatString(givenFieldsCannotInputString, json);
                }
            }
        };

        $efi.createStatement.validateCreateStatement = function () {
            if ($u.get('MWSKZ')) $efi.mwskzNonDeduction.validationChangeFormCombo();
            var gridObj = $u.gridWrapper.getGrid();
            $u.validateRequired('header-invoicer-content');
            $u.validateRequired('vendor-info');
            gridObj.validateGridRequired();
            $efi.KOSTL_HKONT_Relation.validateKOSTL_HKONT_Relation();
            $efi.addDataHandler.validateAddData();
            if (gridObj.getGridHeader('HKONT')) $efi.createStatement.validateHKONT_LIFNR();
            if (gridObj.getGridHeader('HKONT')) $efi.createStatement.validateHKONTCOObject();
            if ($u.get('difference_amount') && $u.get('difference_amount').getValue() !== 0) throw $mls.getByCode('M_debitCreditAmountsAreNotEquals');
            if ($u.programSetting.getValue('isAttachmentRequired') === 'true' && $('.file-count').html() === '0') throw '[증빙]을 첨부해 주세요';
        };
    }
});