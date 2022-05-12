/**
 * ZUNIEFI_4000-OS_DATA-KOART [계정유형]</br>
 * - 업체코드</br>
 * -- D 이면 KUNNR 사용</br>
 * -- else LIFNR 사용</br>
 * @module uni-e-fi/$efi/$efiStatementInitialData
 */
define(function () {
    return function () {
        $efi.statementInitialData = {};
        var currentStatementInitialData = null;


        $efi.statementInitialData.setStatementInitialData = function (programId, callBack) {
            var nsReturn = $nst.is_data_nsReturn('ZUNIEFI_4000', {PROGRAM_ID: programId});
            var ot_add = nsReturn.getTableReturn('OT_ADD');
            if ($u.programSetting.getValue('setADD_DATAOnTheWeb') === "true") ot_add = $nst.is_data_ot_data('ZUNIEFI_4015', {});
            currentStatementInitialData = {
                OS_DATA: nsReturn.getExportMap('OS_DATA'),
                OT_ADD: ot_add
            };
            var os_data = currentStatementInitialData['OS_DATA'];
            if ($u.get('BLART')) {
                if ($u.get('BLART').params.scope === 'param' && $u.page.getPageParams()['BLART']) $u.get('BLART').setValue($u.page.getPageParams()['BLART']);
                else $u.get('BLART').setValue(os_data['BLART']);
            }
            if ($u.get('EVIKB')) $u.get('EVIKB').setValue(os_data['EVIKB']);

            if (os_data['LIFNR_FLAG'] !== '') $efi.statementInitialData.getVendorCodeInput().setValue({
                code: '',
                value: ''
            });
            if (callBack) callBack();
        };
        $efi.statementInitialData.getVendorCodeInput = function () {
            var koart = currentStatementInitialData['OS_DATA']['KOART'];

            if (koart === 'D' && !$u.exists(['KUNNR'])) throw 'KUNNR field does not exists. statement initial data KOART: D';
            if ($u.exists(['LIFNR', 'KUNNR'])) throw 'KUNNR with LIFNR only one field can set ';

            if ($u.exists(['LIFNR'])) return $u.get('LIFNR');
            return $u.get('KUNNR');
        };
        $efi.statementInitialData.getAddDataInitialDataList = function () {
            var addDataList = [];
            var existHKONTList = [];
            var ot_add = currentStatementInitialData['OT_ADD'];
            $.each(ot_add, function (index, os_add) {
                if (os_add['PROGRAM_ID'] === $u.page.getPROGRAM_ID()) {
                    addDataList.push(os_add);
                    existHKONTList.push(os_add['HKONT']);
                }
            });

            $.each(ot_add, function (index, os_add) {
                if (os_add['PROGRAM_ID'] === '' && !$u.util.contains(os_add['HKONT'], existHKONTList)) addDataList.push(os_add);
            });
            return addDataList;
        };
        $efi.statementInitialData.getAddDataKeyList = function () {
            var addDataHKONTList = [];
            var ot_add = currentStatementInitialData['OT_ADD'];
            if ($u.programSetting.getValue('setADD_DATAOnTheWeb') === "true") ot_add = $efi.statementInitialData.getAddDataInitialDataList();
            $.each(ot_add, function (index, os_add) {
                addDataHKONTList.push(os_add['HKONT']);
            });
            return addDataHKONTList;
        };
        $efi.statementInitialData.getAddDataOptionalList = function () {
            var addDataOptionalList = [];
            var ot_add = currentStatementInitialData['OT_ADD'];
            if ($u.programSetting.getValue('setADD_DATAOnTheWeb') === "true") ot_add = $efi.statementInitialData.getAddDataInitialDataList();
            $.each(ot_add, function (index, os_add) {
                if ($u.programSetting.getValue('setADD_DATAOnTheWeb') === "true" && os_add['OPTIONAL'] !== '1') addDataOptionalList.push(os_add['HKONT']);   // 1 이면 필수
                if ($u.programSetting.getValue('setADD_DATAOnTheWeb') === "false" && os_add['OPTIONAL'] === 'X') addDataOptionalList.push(os_add['HKONT']);
            });
            return addDataOptionalList;
        };
    }
});
