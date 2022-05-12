/**
 * @module uni-e-fi/$efi/$efiF4
 */
define(function(){
    return function () {
        $efi.f4 = {};
        $efi.f4.getFLAG_by_MWSKZ = function (mwskz) { // 세액 유무 'X' = 세액 있음
            if (!$efi.f4._MWSKZ_FLAG_Map) $efi.f4._MWSKZ_FLAG_Map = {};
            var mapKey = $u.page.getPROGRAM_ID();
            if ($u.get('EVIKB')) mapKey += $u.get('EVIKB').getValue();
            if (!$efi.f4._MWSKZ_FLAG_Map[mapKey]) $efi.f4._MWSKZ_FLAG_Map[mapKey] = $u.f4Data.getCodeMapWithParams('MWSKZ', 'FLAG', $efi.f4.getParameter());
            return $efi.f4._MWSKZ_FLAG_Map[mapKey][mwskz];
        };
        $efi.f4.getKBETR_by_MWSKZ = function (mwskz) { // 세율 0,3,6,10,17 으로 출력
            if(!mwskz) return '';
            if (!$efi.f4._MWSKZ_KBETR_Map) $efi.f4._MWSKZ_KBETR_Map = {};
            var mapKey = $u.page.getPROGRAM_ID();
            if ($u.get('EVIKB')) mapKey += $u.get('EVIKB').getValue();
            if (!$efi.f4._MWSKZ_KBETR_Map[mapKey]) $efi.f4._MWSKZ_KBETR_Map[mapKey] = $u.f4Data.getCodeMapWithParams('MWSKZ', 'KBETR', $efi.f4.getParameter());
            return $efi.f4._MWSKZ_KBETR_Map[mapKey][mwskz];
        };
        $efi.f4.getParameter = function () {
            var params = {};
            if ($u.get('EVIKB')) {
                if ($u.get('EVIKB').getValue() === 'B') {
                    params = {GIVEN_IS_KEY_PROGRAM_ID: 'UD_0201_011'}; // 선급금정산 세금계산서 세금코드
                } else if ($u.get('EVIKB').getValue() === 'A') {
                    params = {GIVEN_IS_KEY_PROGRAM_ID: 'UD_0201_001'}; // 법인카드
                }
            }
            return params;
        };
    }
});