/**
 * @module uni-e-fi/$efi/$efiAddDataHandler
 */
define(function () {
    return function () {
        $efi.addDataHandler = {};

        $efi.addDataHandler.getGrid = function(){
            return $u.gridWrapper.getGrid();
        };

        $efi.addDataHandler.hasADD_DATA = function (rowIndex) {
            var addDataKeyList = $efi.statementInitialData.getAddDataKeyList();
            var addDataKey = $efi.addDataHandler.getGrid().$V('HKONT', rowIndex);
            if (addDataKey === '') return false;
            return $.inArray(addDataKey, addDataKeyList) !== -1;
        };

        $efi.addDataHandler.checkOptional = function (rowIndex) {
            var optionalList = $efi.statementInitialData.getAddDataOptionalList();
            var addDataKey = $efi.addDataHandler.getGrid().$V('HKONT', rowIndex);
            return $.inArray(addDataKey, optionalList) === -1;
        };

        $efi.addDataHandler.jsonADD_DATAStringToSapFormat = function (addDataKey, addDataJSONString) {
            var delimiter = '@_@';
            if (!addDataJSONString) return '';
            var addDataJSON = JSON.parse(addDataJSONString);
            var addData = '';
            $.each($efi.addDataHandler.getFNAMEList(addDataKey), function (index, fname) {
                var value = addDataJSON[fname];
                if (!value) value = '';
                addData += value + delimiter;
            });
            return addData;
        };

        $efi.addDataHandler.getFNAMEListMap = {};

        $efi.addDataHandler.getFNAMEList = function (addDataKey) {
            var programId = $u.page.getPROGRAM_ID();

            if($efi.addDataHandler.getFNAMEListMap[programId + '_' + addDataKey]) return $efi.addDataHandler.getFNAMEListMap[programId + '_' + addDataKey];

            var _fnameList = [];
            var ot_data = $nst.is_data_ot_data('ZUNIEFI_4005', {
                PROGRAM_ID: programId,
                SUB_ID: 'GRIDHEADER',
                HKONT: addDataKey
            });
            $.each(ot_data, function (index, rowData) {
                _fnameList.push(rowData['FNAME']);
            });
            $efi.addDataHandler.getFNAMEListMap[programId + '_' + addDataKey] = _fnameList;
            return _fnameList;
        };

        $efi.addDataHandler.useADD_DATA = function () {
            return $efi.addDataHandler.getGrid().getGridHeader('HKONT') != null && $efi.addDataHandler.getGrid().getGridHeader('ADD_DATA') != null;
        };
        $efi.addDataHandler.hasDataAll = function () {
            if ($efi.addDataHandler.useADD_DATA() === false) return false;
            var returnValue = false;
            $efi.addDataHandler.getGrid().loopRowIndex(function (rowIndex) {
                if ($efi.addDataHandler.hasADD_DATA(rowIndex) && $efi.addDataHandler.getGrid().$H('ADD_DATA', rowIndex) === '') {
                    returnValue = true;
                    return false;
                }
            });
            return returnValue
        };
        $efi.addDataHandler.handleADD_DATAKeyChange = function (rowIndex) {
            if (!$efi.addDataHandler.useADD_DATA()) return;
            if ($efi.addDataHandler.hasADD_DATA(rowIndex)) $efi.addDataHandler.getGrid().$V('ADD_DATA', rowIndex, $mls.getByCode('M_ADD_DATA_INPUT_NULL'));
            else $efi.addDataHandler.getGrid().$V('ADD_DATA', rowIndex, '');
            $efi.addDataHandler.getGrid().$H('ADD_DATA', rowIndex, '');
        };
        $efi.addDataHandler.handleClickADD_DATA = function (rowIndex) {
            if (!$efi.addDataHandler.hasADD_DATA(rowIndex)) return;
            var programId = $u.page.getPROGRAM_ID();
            var addDataKey = $efi.addDataHandler.getGrid().$V('HKONT', rowIndex);
            var hkont_txt;
            if ($efi.addDataHandler.getGrid().getGridHeader('HKONT')['serverType'] === 'combo') hkont_txt = $efi.addDataHandler.getGrid().getCachedCodeMap('HKONT')[addDataKey]['HKONT_TXT'];
            else hkont_txt = $efi.addDataHandler.getGrid().$V('HKONT_TXT', rowIndex);
            $efi.dialog.addDataDialog.open(programId, addDataKey, rowIndex, $efi.addDataHandler.getGrid().$H('ADD_DATA', rowIndex), hkont_txt);
        };
        $efi.addDataHandler.validateAddData = function () {
            if ($efi.addDataHandler.useADD_DATA() === false) return;
            $efi.addDataHandler.getGrid().loopRowIndex(function (rowIndex) {
                $efi.addDataHandler.validateAddDataByRowIndex(rowIndex);
            })
        };
        $efi.addDataHandler.validateAddDataByRowIndex = function (rowIndex) {
            if ($efi.addDataHandler.hasADD_DATA(rowIndex) && ($efi.addDataHandler.getGrid().$H('ADD_DATA', rowIndex) === '' && $efi.addDataHandler.checkOptional(rowIndex))) throw $mls.getByCode('M_shouldInputAddData');
        };
        $efi.addDataHandler.setADD_DATA = function (gridData) {
            $.each(gridData, function (index, item) {
                if (item['ADD_DATA__HIDDEN']) item['ADD_DATA'] = $efi.addDataHandler.jsonADD_DATAStringToSapFormat(item['HKONT'], item['ADD_DATA__HIDDEN']);
                else item['ADD_DATA'] = '';
            });
        };
        $efi.addDataHandler.sapStringAddDataToJson = function (addDataKey, sapStringAddData) {
            var splited = sapStringAddData.split('@_@');
            var json = {};
            $.each($efi.addDataHandler.getFNAMEList(addDataKey), function(index, item){
                json[item] = splited[index];
            });
            return json;
        };
        $efi.addDataHandler.validateFNAME_FormField = function (addDataKey, inputNameList) {
            var fnameList = $efi.addDataHandler.getFNAMEList(addDataKey);
            if ($.extend(true, [], fnameList).sort().join() !== $.extend(true, [], inputNameList).sort().join()) {
                unidocuAlert('ZUNIEFI_4005 OT_DATA-FNAME and formSetting input names does not match.\n' +
                    'fnames: ' + fnameList.sort().join() + '\n' +
                    'inputNames' + inputNameList.sort().join())
            }
        };
    }
});