/**
 * @module vendorCustomkeyfoundry/view/customizeUD_0601_030
 */
define(function () {
    return function (initFn) {
        initFn();

        var gridObj = $u.gridWrapper.getGrid();

        var roleArr = staticProperties.user['ROLE'].split(',');
        var existRole = roleArr.some(function(role) { return role === 'ALL' || role === 'FI_MA'; });
        var deleteAllBtn = $('#deleteAll');

        // 그룹번호가 달라도 체크 가능
        $u.programSetting.appendTemplate('use handle group check - Duplicate possible', {defaultValue: 'true'});

        gridObj.onChangeCell(function (columnKey, rowIndex, oldValue, newValue) {
            if($u.page.getPROGRAM_ID() === 'UD_0302_000_D62') return;
            $u.util.tryCatchCall(function () {
                if (columnKey === 'SELECTED' ) {
                    if ($u.programSetting.getValue('use handle group check - Duplicate possible') === 'true')
                        handleDuplicateGroupCheck('SELECTED', 'GRONO', rowIndex, newValue);
                    if ($u.programSetting.getValue('use GRONO_EB select validation') === 'true')
                        $efi.UD_0302_000selectionValidator.validate();
                }
            }, function () {
                gridObj.$V('SELECTED', rowIndex, oldValue);
            });
        });

        var $EVIKB = $u.get('EVIKB');
        $EVIKB.$el.change(function() {
            $u.buttons.triggerFormTableButtonClick();
            $EVIKB.getValue() === 'FI_01' && existRole ? deleteAllBtn.show() : deleteAllBtn.hide();
        });
        $efi.createStatement.bindEvent.triggerChange('EVIKB');

        $u.buttons.addHandler({
            "deleteAll": function() {
                gridObj.asserts.rowSelected();
                if(checkSTATS_EVIKB()) throw '법인카드 결재문서 생성, 상신건만 가능합니다.';

                $nst.it_data_nsReturn('ZUNIEFI_U400', getGRONOValues(gridObj.getSELECTEDJSONData(), 'GRONO'), function(nsReturn) {
                    unidocuAlert(nsReturn.getReturnMessage(), function() { $u.buttons.triggerFormTableButtonClick(); });
                });
            }
        });

        /**
         * grid 체크박스 체크 시 같은 그룹번호 동시 체크 및 그룹번호가 달라도 체크 가능
         */
        function handleDuplicateGroupCheck(checkColumnKey, targetColumnKey, rowIndex, selectValue) {
            var selectedGRONO = gridObj.$V(targetColumnKey, rowIndex);
            var hasValue = gridObj.isSelectedRowsHaveValue(checkColumnKey, targetColumnKey);
            if (selectedGRONO === '' && !hasValue) return;
            if (selectedGRONO === '' && hasValue) {
                gridObj.$V(checkColumnKey, rowIndex, selectValue);
                return;
            }
            gridObj.$V(checkColumnKey, rowIndex, selectValue);
            var groupIndexs = gridObj.$F(selectedGRONO, targetColumnKey);
            for (var i = 0, len = groupIndexs.length; i < len; i++) gridObj.$V('SELECTED', groupIndexs[i], selectValue);
        }

        /**
         * deleteAll : 일괄반려 버튼 클릭 시 전표 상태 체크
         */
        function checkSTATS_EVIKB() {
            return gridObj.getSELECTEDJSONData().some(function(rowData) {
                return (rowData['STATS'] !== '1' && rowData['STATS'] !== '2') || rowData['EVIKB'] !== 'FI_01';
            });
        }

        /**
         * deleteAll : 일괄반려 버튼 그룹번호 그룹핑
         */
        function getGRONOValues(gridData, columnKey) {
            var fieldValues = [];
            gridData.some(function(rowData) {
                fieldValues.push({GRONO : rowData[columnKey]});
            });
            return fieldValues;
        }
    }
});