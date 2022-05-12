/**
 * #2096 134 코스트센터 범주에 따른 계정(판,제) 조회
 * @module uni-e-fi/$efi/$efiKOSTL_HKONT_Relation
 */
define(function () {
    return function () {
        var hkont_kosarMap = {}, kostl_kosarMap = {};

        function getKOSTL_HKONT_Relation(rowIndex) {
            if (staticProperties.zuniecm_0000['CCTR_CHECK'] !== 'X') return;
            var gridObj = $u.gridWrapper.getGrid();
            var programId = $u.page.getPROGRAM_ID();
            if (!hkont_kosarMap[programId] || !kostl_kosarMap[programId]) {
                hkont_kosarMap[programId] = $u.f4Data.getCodeMapWithParams('HKONT', 'KOSAR');
                kostl_kosarMap[programId] = $u.f4Data.getCodeMapWithParams('KOSTL', 'KOSAR');
            }
            var jsonData = gridObj.getJSONDataByRowIndex(rowIndex);
            if (gridObj.getGridHeader('KOSTL') === null) return;
            if (jsonData['KOSTL'] === '' || jsonData['HKONT'] === '') return;
            var kostlKosar = kostl_kosarMap[programId][jsonData['KOSTL']];
            var hkontKosar = hkont_kosarMap[programId][jsonData['HKONT']];
            if (!hkontKosar || !kostlKosar || kostlKosar === hkontKosar) return;
            if (kostlKosar === 'P') return $mls.getByCode('M_KOSTL_HKONT_Relation_kostlKosarP');
            if (kostlKosar === 'J') return $mls.getByCode('M_KOSTL_HKONT_Relation_kostlKosarJ');
        }

        $efi.KOSTL_HKONT_Relation = {};
        $efi.KOSTL_HKONT_Relation.validateKOSTL_HKONT_Relation = function validateKOSTL_HKONT_Relation() {
            if (staticProperties.zuniecm_0000['CCTR_CHECK'] !== 'X') return;
            var gridObj = $u.gridWrapper.getGrid();
            var jsonData = gridObj.getJSONData();
            var kostlhkontRelationMessage = null;
            $.each(jsonData, function (index) {
                kostlhkontRelationMessage = getKOSTL_HKONT_Relation(index);
                if (kostlhkontRelationMessage != null) throw (index + 1) + ' row ' + kostlhkontRelationMessage;
            });
        };
        $efi.KOSTL_HKONT_Relation.alertKOSTL_HKONT_Relation = function alertKOSTL_HKONT_Relation(rowIndex) { //
            var kostlhkontRelationMessage = getKOSTL_HKONT_Relation(rowIndex);
            if (kostlhkontRelationMessage != null) unidocuAlert(kostlhkontRelationMessage)
        };
    }
});