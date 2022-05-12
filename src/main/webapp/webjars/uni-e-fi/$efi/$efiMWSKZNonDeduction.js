/**
 * @module uni-e-fi/$efi/$efiMWSKZNonDeduction
 * 20150819 계정코드가 다른지는 비교하지 않는다
 * TAX_CHECK는 불공제 체크 여부 코드 'X' 일 경우 체크(하드코딩)
 */
define(function () {
    return function () {
        var hkont_mwskzMap = {}, hkont_hkontTxtMap = {}, mwskz_tax_typeMap = {};

        $efi.mwskzNonDeduction = {};
        $efi.mwskzNonDeduction.alertChangeFormCombo = function () {
            var message = $efi.mwskzNonDeduction.getMessageChangeFormCombo();
            if (message) unidocuAlert(message);
        };
        $efi.mwskzNonDeduction.validationChangeFormCombo = function () {
            var message = $efi.mwskzNonDeduction.getMessageChangeFormCombo();
            if (message) throw message;
        };
        $efi.mwskzNonDeduction.alertGridChange = function (columnKey, rowIndex) {
            var message = $efi.mwskzNonDeduction.getMessageGridChange(columnKey, rowIndex);
            if (message) unidocuAlert(message);
        };
        $efi.mwskzNonDeduction.get_hkont_mwskzMap = function () {
            var programId = $u.page.getPROGRAM_ID();
            if (!hkont_mwskzMap[programId]) hkont_mwskzMap[programId] = $efi.getCachedHKONTCodeMap('MWSKZ');
            return hkont_mwskzMap[programId];
        };
        $efi.mwskzNonDeduction.get_mwskz_tax_typeMap = function () {
            var programId = $u.page.getPROGRAM_ID();
            if (!mwskz_tax_typeMap[programId]) mwskz_tax_typeMap[programId] = $u.f4Data.getCodeMapWithParams('MWSKZ', 'TAX_TYPE');
            return mwskz_tax_typeMap[programId];
        };
        /* 세금코드가 불공제인지 체크
         * P:과세, I:면세, N:불공제 (고정값이므로 하드코딩)
         */
        $efi.mwskzNonDeduction.isNonDeduction = function (code) {
            return $efi.mwskzNonDeduction.get_mwskz_tax_typeMap()[code] === 'N';
        };
        $efi.mwskzNonDeduction.getMessageChangeFormCombo = function () {
            if (staticProperties.zuniecm_0000['TAX_CHECK'] !== 'X') return;
            /* 세금코드가 변경되었을 경우 체크
             * 1. 세금코드가 공백인지 체크
             * 2. 비용항목의 세금코드와 불공제 여부 체크
             * 3. 계정의 세금코드와 불공제 여부 체크
             */
            var formMWSKZ = $u.get('MWSKZ').getValue();
            if (formMWSKZ === '') return;
            var message = '';
            var gridObj = $u.gridWrapper.getGrid();
            gridObj.loopRowIndex(function (rowIndex) {
                var rowData = gridObj.getJSONDataByRowIndex(rowIndex);
                var gridHKONT = rowData['HKONT'];
                var gridMWSKZ = rowData['MWSKZ'];
                var validHKONT = true;
                var validMWSKZ = true;
                if (!gridHKONT || gridHKONT === '') validHKONT = false;
                if (!gridMWSKZ || gridMWSKZ === '') validMWSKZ = false;

                var messageCode = '';

                if ($efi.mwskzNonDeduction.isNonDeduction(formMWSKZ) && validHKONT && $efi.mwskzNonDeduction.get_hkont_mwskzMap()[gridHKONT] === '') messageCode = 'M_mwskzNonDeduction_changeFormCombo_1';
                if ($efi.mwskzNonDeduction.isNonDeduction(formMWSKZ) && validMWSKZ && !$efi.mwskzNonDeduction.isNonDeduction(gridMWSKZ)) messageCode = 'M_mwskzNonDeduction_changeFormCombo_2';
                if ($efi.mwskzNonDeduction.isNonDeduction(formMWSKZ) && validHKONT && $efi.mwskzNonDeduction.get_hkont_mwskzMap()[gridHKONT] !== '' && (formMWSKZ !== $efi.mwskzNonDeduction.get_hkont_mwskzMap()[gridHKONT])) messageCode = 'M_mwskzNonDeduction_changeFormCombo_3';
                if ($efi.mwskzNonDeduction.isNonDeduction(formMWSKZ) && validMWSKZ && $efi.mwskzNonDeduction.isNonDeduction(gridMWSKZ) && (formMWSKZ !== gridMWSKZ)) messageCode = 'M_mwskzNonDeduction_changeFormCombo_4';
                if (!$efi.mwskzNonDeduction.isNonDeduction(formMWSKZ) && validHKONT && $efi.mwskzNonDeduction.get_hkont_mwskzMap()[gridHKONT] !== '') messageCode = 'M_mwskzNonDeduction_changeFormCombo_5';
                if (!$efi.mwskzNonDeduction.isNonDeduction(formMWSKZ) && validMWSKZ && $efi.mwskzNonDeduction.isNonDeduction(gridMWSKZ)) messageCode = 'M_mwskzNonDeduction_changeFormCombo_6';

                if (messageCode) {
                    message = $mls.getByCode(messageCode);
                    return false;
                }
            });
            if (message) return message;
            return '';
        };
        /**
         * ZUNIECMT0010-TAX_CHECK = 'X' 불공제 체크 하면 계정및 세금코드 체크 활성화
         * MWSKZ[TAX_TYPE] = P:과세, I:면세, N:불공제 (고정값이므로 하드코딩)
         *
         * 계정의 불공제 여부와 세금코드는 해당 행의 세금코드와 동일해야 한다.
         * 비용항목의 값이 변경되었을 경우에는 해당 행과 헤더의 세금코드만 비교한다.
         * 헤더의 세금코드가 변경되었을 경우 비용항목의 오류 행은 관계없이 오류만 보여준다. (행 번호 노출 X)
         * 비용항목의 세금코드는 헤더의 세금코드와 동일하거나 공백만 입력 가능하다.
         */

        $efi.mwskzNonDeduction.getMessageGridChange = function (columnKey, rowIndex) {
            var gridObj = $u.gridWrapper.getGrid();
            if (!$u.get('MWSKZ')) return;
            if (!gridObj.getGridHeader('HKONT')) return;
            if (staticProperties.zuniecm_0000['TAX_CHECK'] !== 'X') return;

            var hkontHeader = gridObj.getGridHeader('HKONT');
            if (hkontHeader && hkontHeader.serverType === 'popup') {
                var hkont_txt = gridObj.$V('HKONT_TXT', rowIndex);
                if ($efi.getCachedHKONTCodeMap(columnKey + '_TXT')[gridObj.$V('HKONT', rowIndex)] !== hkont_txt) return;
            }

            var programId = $u.page.getPROGRAM_ID();
            var formMWSKZ = $u.get('MWSKZ').getValue();
            var gridHKONT = gridObj.$V('HKONT', rowIndex);
            var gridMWSKZ = gridObj.$V('MWSKZ', rowIndex);
            var messageCode;
            /* 계정코드가 변경되었을 경우 체크
             * 1. 계정코드가 공백인지 체크
             * 2. 헤더의 세금코드와 불공제 여부 체크
             * 3. 그리드 세금코드와 불공제 여부 체크
             * 4. 헤더의 세금코드가 불공제일 때 세금코드가 동일한 지 체크
             * 5. 그리드 세금코드가 불공제일 때 세금코드가 동일한 지 체크
             */
            if (columnKey === 'HKONT') {
                if (!gridHKONT || gridHKONT === '') return;
                if (!hkont_hkontTxtMap[programId]) hkont_hkontTxtMap[programId] = $efi.getCachedHKONTCodeMap(columnKey + '_TXT');
                if (!hkont_hkontTxtMap[programId][gridHKONT]) return;

                messageCode = '';

                if ($efi.mwskzNonDeduction.get_hkont_mwskzMap()[gridHKONT] === '' && $efi.mwskzNonDeduction.isNonDeduction(formMWSKZ)) messageCode = 'M_mwskzNonDeduction_gridChange_1';
                if ($efi.mwskzNonDeduction.get_hkont_mwskzMap()[gridHKONT] !== '' && !$efi.mwskzNonDeduction.isNonDeduction(formMWSKZ)) messageCode = 'M_mwskzNonDeduction_gridChange_2';
                if ($efi.mwskzNonDeduction.get_hkont_mwskzMap()[gridHKONT] === '' && $efi.mwskzNonDeduction.isNonDeduction(gridMWSKZ)) messageCode = 'M_mwskzNonDeduction_gridChange_3';
                if ($efi.mwskzNonDeduction.get_hkont_mwskzMap()[gridHKONT] !== '' && !$efi.mwskzNonDeduction.isNonDeduction(gridMWSKZ)) messageCode = 'M_mwskzNonDeduction_gridChange_4';
                if ($efi.mwskzNonDeduction.get_hkont_mwskzMap()[gridHKONT] !== '' && $efi.mwskzNonDeduction.isNonDeduction(formMWSKZ) && ($efi.mwskzNonDeduction.get_hkont_mwskzMap()[gridHKONT] !== formMWSKZ)) messageCode = 'M_mwskzNonDeduction_gridChange_5';
                if ($efi.mwskzNonDeduction.get_hkont_mwskzMap()[gridHKONT] !== '' && $efi.mwskzNonDeduction.isNonDeduction(gridMWSKZ) && ($efi.mwskzNonDeduction.get_hkont_mwskzMap()[gridHKONT] !== gridMWSKZ)) messageCode = 'M_mwskzNonDeduction_gridChange_6';

                if (messageCode) return $mls.getByCode(messageCode);
            }
            /* 비용항목 세금코드가 변경되었을 경우 체크
             * 1. 비용항목 세금코드가 공백인지 체크
             * 2. 헤더의 세금코드와 불공제 여부 체크
             * 3. 계정코드가 공백인지 체크, 계정코드 세금코드와 불공제 여부 체크
             * 4. 헤더의 세금코드가 불공제일 때 세금코드가 동일한 지 체크
             * 5. 그리드 세금코드가 불공제일 때 세금코드가 동일한 지 체크
             */
            if (columnKey === 'MWSKZ') {
                if (!gridMWSKZ || gridMWSKZ === '') return;
                messageCode = '';

                if (!$efi.mwskzNonDeduction.isNonDeduction(gridMWSKZ) && $efi.mwskzNonDeduction.isNonDeduction(formMWSKZ)) messageCode = 'M_mwskzNonDeduction_gridChange2_1';
                if ($efi.mwskzNonDeduction.isNonDeduction(gridMWSKZ) && !$efi.mwskzNonDeduction.isNonDeduction(formMWSKZ)) messageCode = 'M_mwskzNonDeduction_gridChange2_2';
                if (!$efi.mwskzNonDeduction.isNonDeduction(gridMWSKZ) && gridHKONT !== '' && $efi.mwskzNonDeduction.get_hkont_mwskzMap()[gridHKONT] !== '') messageCode = 'M_mwskzNonDeduction_gridChange2_3';
                if ($efi.mwskzNonDeduction.isNonDeduction(gridMWSKZ) && gridHKONT !== '' && $efi.mwskzNonDeduction.get_hkont_mwskzMap()[gridHKONT] === '') messageCode = 'M_mwskzNonDeduction_gridChange2_4';
                if ($efi.mwskzNonDeduction.isNonDeduction(gridMWSKZ) && $efi.mwskzNonDeduction.isNonDeduction(formMWSKZ) && (gridMWSKZ !== formMWSKZ)) messageCode = 'M_mwskzNonDeduction_gridChange2_5';
                if ($efi.mwskzNonDeduction.isNonDeduction(gridMWSKZ) && gridHKONT !== '' && $efi.mwskzNonDeduction.get_hkont_mwskzMap()[gridHKONT] !== '' && (gridMWSKZ !== $efi.mwskzNonDeduction.get_hkont_mwskzMap()[gridHKONT])) messageCode = 'M_mwskzNonDeduction_gridChange2_6';

                if (messageCode) return $mls.getByCode(messageCode);
            }
            return $efi.mwskzNonDeduction.getMessageChangeFormCombo();
        }
    }
});
