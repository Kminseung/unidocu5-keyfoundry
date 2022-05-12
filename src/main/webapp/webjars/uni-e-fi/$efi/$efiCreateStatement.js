/**
 * @module uni-e-fi/$efi/$efiCreateStatement
 */
define([
    'uni-e-fi/$efi/$efiBindEvent',
    'uni-e-fi/$efi/$efiValidateCreateStatement'
], function ($efiBindEvent,
             $efiValidateCreateStatement) {
    return function () {
        $efi.createStatement = {};
        $efiValidateCreateStatement(); // $efi.createStatement.validateCreateStatement
        $efiBindEvent(); // $efi.createStatement.bindEvent

        $efi.createStatement.getCreateStatementCommonParams = function () {
            var gridObj = $u.gridWrapper.getGrid();
            var gridData = gridObj.getJSONData();
            $efi.addDataHandler.setADD_DATA(gridData);
            var paramMap = $.extend(true, {}, $u.page.getPageParams(), $u.getValues());
            $u.fileUI.setFileAttachKeyParam(paramMap);
            paramMap['INV_SEQ'] = $u.page.getPageParams()['INV_SEQ'];
            paramMap['CRD_SEQ'] = $u.page.getPageParams()['CRD_SEQ'];

            return {
                paramMap: paramMap,
                gridData: gridData
            };
        };
        $efi.createStatement.callCreateStatementFn = function (params) {
            function callFunction() {
                var paramMap = params['paramMap'];
                var gridData = params['gridData'];
                var useReload = params['useReload'];

                $efi.createStatement.koart_newko.handleGridData(gridData);

                var tableParams = {IT_DATA: gridData};
                tableParams['IT_ATTACH'] = $u.fileUI.getFineUploader().getCopiedFileInfos();
                $efi.createStatement.confirmBeforeCreateStatement(paramMap, tableParams, function () {
                    $nst.is_data_tableParams_os_docno($u.programSetting.getValue('setCreateStatementFunction'), paramMap, tableParams, function (os_docNo) {
                        var callbackFn = null;
                        if (useReload) callbackFn = $u.pageReload;
                        if (params['afterWhenCreateStatement']) params['afterWhenCreateStatement'](os_docNo);
                        else $efi.dialog.afterCreateStatementDialog.open(os_docNo, callbackFn);
                    });
                });
            }

            if ($efi.addDataHandler.hasDataAll()) {
                unidocuConfirm("추가데이터 없이 계속 진행하시겠습니까?", function () {
                    callFunction();
                })
            } else {
                callFunction();
            }
        };
        $efi.createStatement.callCreateStatementFn_UD_0220_122 = function (params) {
            function callFunction() {
                var paramMap = params['paramMap'];
                var gridData = params['gridData'];
                var useReload = params['useReload'];

                $efi.createStatement.koart_newko.handleGridData(gridData);

                var tableParams = {IT_DATA: gridData};
                tableParams['IT_ATTACH'] = $u.fileUI.getFineUploader().getCopiedFileInfos();
                $efi.createStatement.confirmBeforeCreateStatement(paramMap, tableParams, function () {
                    if ($u.programSetting.getValue('기준 금액 체크 사용여부') === 'true') {
                        paramMap = $.extend(paramMap, {CHECK_EXP : 'X'});
                    }
                    $nst.is_data_tableParams_nsReturn($u.programSetting.getValue('setCreateStatementFunction'), paramMap, tableParams, function (nsReturn) {
                        var callbackFn = null;
                        if (useReload) callbackFn = $u.pageReload;
                        var os_data = nsReturn.getExportMap('OS_DATA');
                        var os_docNo = nsReturn.getExportMap('OS_DOCNO')
                        if (params['afterWhenCreateStatement']) params['afterWhenCreateStatement'](os_data, os_docNo);
                        else $efi.dialog.afterCreateStatementDialog.open(os_docNo, callbackFn);
                    });
                });
            }

            if ($efi.addDataHandler.hasDataAll()) {
                unidocuConfirm("추가데이터 없이 계속 진행하시겠습니까?", function () {
                    callFunction();
                })
            } else {
                callFunction();
            }
        };
        $efi.createStatement.afterMultiCellChange = function (startColumnKey, startRowIndex, endColumnKey, endRowIndex) {
            $efi.createStatement.koart_newko.fillNEWKO_TXT();
            var i, len;
            for (i = 0, len = $u.gridWrapper.getGrid().getJSONData().length; i < len; i++) $efi.addDataHandler.handleADD_DATAKeyChange(i);
            if ($u.get('WRBTR')) $u.get('WRBTR').$el.change();
            $u.gridWrapper.getGrid().triggerChangeCell('WRBTR', 0, '', '');
            if (/UD_0201_001|UD_0201_011/.test($u.page.getPROGRAM_ID())) {
                var gridObj = $u.gridWrapper.getGrid();
                var columnKey = gridObj.getActiveColumnKey();
                for (i = startRowIndex, len = endRowIndex; i <= len; i++) {
                    if (columnKey === 'HKONT' && gridObj.$V(columnKey,i)) {
                        gridObj.$V('MWSKZ',i, gridObj.getCachedCodeMap('HKONT')[gridObj.$V(columnKey,i)]['MWSKZ']);
                        if(startRowIndex === 0 && $u.get('MWSKZ')) {
                            $u.get('MWSKZ').setValue(gridObj.getCachedCodeMap('HKONT')[gridObj.$V(columnKey,i)]['MWSKZ']);
                        }
                    }
                }
            }
            if ($u.buttons.getCustomHandler('customAfterMultiCellChange')) $u.buttons.runCustomHandler('customAfterMultiCellChange', startColumnKey, startRowIndex, endColumnKey, endRowIndex);
        };
        $efi.createStatement.koart_newko = {};
        $efi.createStatement.koart_newko.f4CodeKeyMap = {A: 'ANLN1', D: 'KUNNR', K: 'LIFNR', S: 'HKONT'};
        $efi.createStatement.koart_newko.useNEWKO = function () {
            return $u.gridWrapper.getGrid().getGridHeader('NEWKO') && $u.gridWrapper.getGrid().getGridHeader('KOART');
        };
        $efi.createStatement.F4QueryParamsOutput = function (type, columnKey, params) {
            var gridObj = $u.gridWrapper.getGrid();
            var f4QueryParams = {};

            $.each(params, function (targetColumn, targetItem) {
                if (targetColumn !== columnKey) return true;
                $.each(targetItem, function (settingKey, paramColumns) {
                    $.each(paramColumns.split(','), function (i, target) {
                        target = target.trim();
                        if (settingKey === 'form' && $u.get(target)) f4QueryParams[target] = $u.get(target).getValue();
                        if (settingKey === 'grid' && type === 'gridSetting' && gridObj.getGridHeader(target)) f4QueryParams[target] = gridObj.$V(target, gridObj.getActiveRowIndex());
                    });
                });
            });
            return f4QueryParams;
        };
        $efi.createStatement.handleBeforeOpenF4Dialog = function (columnKey, rowIndex) {
            var gridObj = $u.gridWrapper.getGrid();
            var onGridBeforeOpenF4DialogParams = $u.programSetting.getValue('onGridBeforeOpenF4DialogParams');
            if (columnKey === 'NEWKO') {
                if ($efi.createStatement.koart_newko.useNEWKO() && !gridObj.getGridHeader('KOART')) throw 'need KOART column Header.';
                $.each($efi.createStatement.koart_newko.f4CodeKeyMap, function (key, columnKey) {
                    if ($u.gridWrapper.getGrid().getGridHeader(columnKey)) throw columnKey + ' can not use with NEWKO column.';
                });
                var koart = gridObj.$V('KOART', rowIndex);
                var f4CodeKey = $efi.createStatement.koart_newko.f4CodeKeyMap[koart];
                var noMappingMessageTemplate = 'no mapping data koart-newko.\nkoart: {koart}\nmapping: {mapping}';
                if (!f4CodeKey) throw $u.util.formatString(noMappingMessageTemplate, {
                    koart: koart,
                    mapping: JSON.stringify($efi.createStatement.koart_newko.f4CodeKeyMap)
                });
                gridObj.setF4CodeKey('NEWKO', f4CodeKey);
            }
            if (columnKey === 'PROJK') {
                if(gridObj.getGridHeader("HKONT")){
                    var hkont = gridObj.$V('HKONT', rowIndex);
                    gridObj.setQueryParams(columnKey, {HKONT: hkont});
                }
            }

            if (columnKey === 'KOSTL' || columnKey === 'PRCTR') {
                if ($u.get('BUDAT')) {
                    gridObj.setQueryParams(columnKey, {BUDAT: $u.get('BUDAT').getValue()});
                }
            }
            if (!$.isEmptyObject(onGridBeforeOpenF4DialogParams)) {
                var f4QueryParams = $efi.createStatement.F4QueryParamsOutput('gridSetting', columnKey, onGridBeforeOpenF4DialogParams);
                gridObj.setQueryParams(columnKey, f4QueryParams);
            }
        };
        $efi.createStatement.koart_newko.handleGridData = function (gridData) {
            if (!$efi.createStatement.koart_newko.useNEWKO()) return;
            $.each(gridData, function (index, item) {
                var koart = item['KOART'];
                item[$efi.createStatement.koart_newko.f4CodeKeyMap[koart]] = item['NEWKO'];
            });
        };
        $efi.createStatement.koart_newko.onKOARTChange = function (columnKey, rowIndex) {
            if (columnKey !== 'KOART') return;
            if (!$efi.createStatement.koart_newko.useNEWKO()) return;
            $u.gridWrapper.getGrid().makePopupCellEmpty('NEWKO', rowIndex);
        };
        $efi.createStatement.koart_newko.fillNEWKO_TXT = function () {
            if (!$efi.createStatement.koart_newko.useNEWKO()) return;
            var gridObj = $u.gridWrapper.getGrid();

            function getCachedCodeTextMap(koart) {
                if (!gridObj.__newkoCodeTextMap) gridObj.__newkoCodeTextMap = {};
                var f4CodeKey = $efi.createStatement.koart_newko.f4CodeKeyMap[koart];
                var f4CodeTextKey = f4CodeKey + '_TXT';
                if (!gridObj.__newkoCodeTextMap[f4CodeKey]) {
                    var codeTextMap = {};
                    $.each($u.f4Data.getCodeDataWithParams(f4CodeKey, {SUB_ID: gridObj.getSubId()}), function (index, map) {
                        codeTextMap[map[f4CodeKey]] = map[f4CodeTextKey];
                    });
                    gridObj.__newkoCodeTextMap[f4CodeKey] = codeTextMap;
                }
                return gridObj.__newkoCodeTextMap[f4CodeKey];
            }

            gridObj.loopRowIndex(function (rowIndex) {
                var koart = gridObj.$V('KOART', rowIndex);
                var newko = gridObj.$V('NEWKO', rowIndex);
                if (koart && newko) {
                    var text = getCachedCodeTextMap(koart)[newko];
                    if (text) gridObj.$V('NEWKO_TXT', rowIndex, text);
                    else gridObj.makePopupCellEmpty('NEWKO', rowIndex);
                }
            });
        };
        /**
         * #6117 refactoring [20170109]
         * origin from
         * uni-e-fi/module/createStatement/bindEvent/bindGridEvent
         *
         * 전표 생성 화면 비용항목 공통 그리드 이벤트 bind
         * @since 20170109
         */
        $efi.createStatement.bindGridEvent = function () {
            $u.programSetting.appendTemplate('onGridBeforeOpenF4DialogParams', {
                defaultValue: {},
                type: 'json',
                description: 'grid codePopup F4 조회시 추가 파라미터 설정'
            });

            var gridObj = $u.gridWrapper.getGrid();
            gridObj.onCellClick($efi.createStatement.handleClickCell);
            gridObj.onChangeCell($efi.createStatement.handleChangeCell);
            gridObj.onBeforeOpenF4Dialog($efi.createStatement.handleBeforeOpenF4Dialog);
            gridObj.onBlockPaste($efi.createStatement.afterMultiCellChange);
        };
        /**
         * #6117 refactoring [20170109]
         * uni-e-fi/module/createStatement/handleClickCell
         *
         * 전표 생성 화면 비용항목 grid event handler cell click
         */
        $efi.createStatement.handleClickCell = function (columnKey, rowIndex) {
            if (columnKey === 'ADD_DATA') $efi.addDataHandler.handleClickADD_DATA(rowIndex);
        };
        /**
         * #6117 refactoring [20170109]
         * uni-e-fi/module/createStatement/handleChangeCell
         *
         * 전표 생성 화면 비용항목 grid event handler cell change
         */
        $efi.createStatement.handleChangeCell = function (columnKey, rowIndex, oldValue, newValue, jsonObj) {
            var gridObj = $u.gridWrapper.getGrid();
            if (columnKey === 'WRBTR' || columnKey === 'SHKZG' || columnKey === 'MWSKZ') $efi.createStatementCommon.changeWRBTRExpense(columnKey);
            if (columnKey === 'KURSF' || columnKey === 'WRBTR2' || columnKey === 'WAERS'){
                var wrbtr = $efi.createStatementCommon.calculateWRBTRbyKURSF(rowIndex);
                gridObj.$V('WRBTR', rowIndex, wrbtr);
                gridObj.triggerChangeCell('WRBTR', rowIndex, gridObj.$V('WRBTR', rowIndex), wrbtr);
            }
            if (columnKey === 'KOSTL') {
                var kostl = gridObj.$V(columnKey, rowIndex);
                if (kostl) {
                    if (jsonObj && jsonObj['AUFNR']) gridObj.$V('AUFNR', rowIndex, jsonObj['AUFNR']);
                    if (jsonObj && jsonObj['AUFNR_TXT']) gridObj.$V('AUFNR_TXT', rowIndex, jsonObj['AUFNR_TXT']);
                }
            }
            if (columnKey === 'HKONT') {
                $efi.addDataHandler.handleADD_DATAKeyChange(rowIndex);
                if (/UD_0201_001|UD_0201_011/.test($u.page.getPROGRAM_ID())) $efi.setMWSKZ_By_HKONT_F4(columnKey, rowIndex, jsonObj);
            }

            $efi.createStatement.setGridBudget(columnKey, rowIndex);
            $efi.createStatement.changeGridAlert(columnKey, rowIndex, jsonObj);
            $efi.createStatement.koart_newko.onKOARTChange(columnKey, rowIndex);
        };
        /**
         * #6117 refactoring [20170109]
         * uni-e-fi/module/createStatement/setGridBudget
         *
         * 전표 생성 화면 비용항목 grid event handler cell change
         */
        $efi.createStatement.setGridBudget = function (columnKey, rowIndex) {
            if (!/HKONT|KOSTL|AUFNR|PROJK/.test(columnKey)) return;
            var gridObj = $u.gridWrapper.getGrid();

            if (!$u.util.isSubArray(['BUD_AMT', 'USD_AMT', 'JAN_AMT'], gridObj.getColumnKeys())) return;
            if (gridObj.isPopupCodeColumn(columnKey) && !gridObj.isValidF4Value(columnKey, rowIndex)) return;

            var is_data = gridObj.getJSONDataByRowIndex(rowIndex);
            var formValues = $u.getValues('statement-information-content,header-invoicer-content,vendor-info,statement-kind-wrapper');
            if (formValues['BUDAT']) is_data['BUDAT'] = formValues['BUDAT'];
            if (formValues['GSBER']) is_data['GSBER'] = formValues['GSBER'];

            $nst.is_data_os_data('ZUNIEFI_8001', is_data, function (os_data) {
                delete os_data['HKONT'];
                delete os_data['KOSTL'];
                gridObj.setRowDataByJSONObj(rowIndex, os_data);
            });
        };
        /**
         * #6117 refactoring [20170109]
         * uni-e-fi/module/createStatement/changeGridAlert
         *
         * 전표 생성 화면 비용항목 값 변경시 알림
         */
        $efi.createStatement.changeGridAlert = function (columnKey, rowIndex, jsonObj) {
            if ((columnKey === 'HKONT' && jsonObj) || columnKey === 'MWSKZ') $efi.mwskzNonDeduction.alertGridChange(columnKey, rowIndex);
            if (columnKey === 'HKONT' || columnKey === 'KOSTL') $efi.KOSTL_HKONT_Relation.alertKOSTL_HKONT_Relation(rowIndex);
        };

        /**
         * #6322 전표생성 rfc 호출 전 ZUNIEFI_4006 호출 W 인경우 confirm 후 처리
         * @since 20171130
         */
        $efi.createStatement.confirmBeforeCreateStatement = function (paramMap, tableParams, createStatementFn) {
            $nst.is_data_tableParams_nsReturn('ZUNIEFI_4006', paramMap, tableParams, function (nsReturn) {
                var type = nsReturn.getReturnType();
                var message = nsReturn.getReturnMessage();
                if (type === 'W') unidocuConfirm(message, createStatementFn);
                else createStatementFn();
            });
        };

        /**
         * 증빙선택으로 dialog 에서 선택된 데이터 화면에 출력 하기 위한 mapping
         * #6291 refactoring [20171128]
         * uni-e-fi/module/evikbChangeHandler/reMapSelectedPopupData
         */
        $efi.createStatement.reMapSelectedPopupData = function (selectedJSONData) {
            if ($u.get('CHARGETOTAL_Slash')) $u.get('CHARGETOTAL_Slash').$el.hide();
            if ($u.get('TIPS')) $u.get('TIPS').$el.hide();
            var $issue_dateTH = $('#unidocu-th-ISSUE_DATE').text($mls.getByCode('M_reMapSelectedPopupData_ISSUE_DATE_Common'));
            var $issue_idTH = $('#unidocu-th-ISSUE_ID').text($mls.getByCode('M_reMapSelectedPopupData_ISSUE_ID_Common'));
            var $var_field_1TH = $('#unidocu-th-VAR_FIELD_1').text('');
            var $su_nameTH = $('#unidocu-th-SU_NAME').text($mls.getByCode('M_reMapSelectedPopupData_SU_NAME_Common'));
            var $type_code_txtTH = $('#unidocu-th-TYPE_CODE_TXT').text('');
            var chargetotalTH = $('#unidocu-th-CHARGETOTAL').text($mls.getByCode('M_reMapSelectedPopupData_CHARGETOTAL_Common'));

            var evikb = $u.get('EVIKB').getValue();
            var mappingKey;
            // A: 법인카드, B: 세금 계산서, C: 실물증빙
            if (evikb === 'A') {
                $su_nameTH.text($mls.getByCode('M_reMapSelectedPopupData_SU_NAME_EVIKB_A'));
                $issue_dateTH.text($mls.getByCode('M_reMapSelectedPopupData_ISSUE_DATE_EVIKB_A'));
                $issue_idTH.text($mls.getByCode('M_reMapSelectedPopupData_ISSUE_ID_EVIKB_A'));
                $var_field_1TH.text($mls.getByCode('M_reMapSelectedPopupData_VAR_FIELD_1_EVIKB_A'));
                $type_code_txtTH.text($mls.getByCode('M_reMapSelectedPopupData_TYPE_CODE_TXT_EVIKB_A'));
                chargetotalTH.text($mls.getByCode('M_reMapSelectedPopupData_CHARGETOTAL_EVIKB_A'));
                selectedJSONData['EMPTY_VALUE'] = '';

                if ($u.get('CHARGETOTAL_Slash')) $u.get('CHARGETOTAL_Slash').$el.show();
                if ($u.get('TIPS')) $u.get('TIPS').$el.show();

                mappingKey = {
                    ISSUE_ID: 'CRD_SEQ',
                    VAR_FIELD_1: 'MCC_TAXKB_TXT',
                    IP_ID: 'MERCH_BIZ_NO',
                    SU_NAME: 'MERCH_NAME',
                    TYPE_CODE_TXT: 'MCC_NAME',
                    BLDAT: 'APPR_DATE',
                    BUDAT: 'APPR_DATE',
                    WRBTR_READ_ONLY: 'TOTAL',
                    CHARGETOTAL: 'AMOUNT',
                    WMWST_READ_ONLY: 'TAX',
                    WMWST: 'TAX'
                };
            } else if (evikb === 'B') {
                $type_code_txtTH.text($mls.getByCode('M_reMapSelectedPopupData_TYPE_CODE_TXT_EVIKB_B'));
                mappingKey = {
                    ISSUE_ID: 'ISSUE_ID',
                    VAR_FIELD_1: 'EMPTY_VALUE',
                    IP_ID: 'IP_ID',
                    SU_NAME: 'SU_NAME',
                    TYPE_CODE_TXT: 'TYPE_CODE_TXT',
                    BLDAT: 'ISSUE_DATE',
                    BUDAT: 'ISSUE_DATE',
                    WRBTR_READ_ONLY: 'GRANDTOTAL',
                    CHARGETOTAL: 'CHARGETOTAL',
                    WMWST_READ_ONLY: 'TAXTOTAL',
                    WMWST: 'TAXTOTAL'
                };
            } else if (evikb === 'C') {
                mappingKey = {
                    ISSUE_ID: 'EVI_SEQ',
                    VAR_FIELD_1: 'EMPTY_VALUE',
                    IP_ID: 'LIFNR',
                    SU_NAME: 'LIFNR_TXT',
                    TYPE_CODE_TXT: 'EMPTY_VALUE',
                    BLDAT: 'EVI_DATE',
                    BUDAT: 'EVI_DATE',
                    WRBTR_READ_ONLY: 'WRBTR',
                    CHARGETOTAL: 'FWBAS',
                    WMWST_READ_ONLY: 'FWSTE',
                    WMWST: 'FWSTE'

                };
            }
            $.each(mappingKey, function (key, value) {
                selectedJSONData[key] = selectedJSONData[value];
            });
            if (evikb === 'A') selectedJSONData['ISSUE_DATE'] = $u.util.date.getDateAsUserDateFormat(selectedJSONData['APPR_DATE']) + ' ' + selectedJSONData['APPR_TIME'];
            else if (evikb === 'B') selectedJSONData['ISSUE_DATE'] = $u.util.date.getDateAsUserDateFormat(selectedJSONData['ISSUE_DATE']);
            else if (evikb === 'C') selectedJSONData['ISSUE_DATE'] = $u.util.date.getDateAsUserDateFormat(selectedJSONData['EVI_DATE']);
            return selectedJSONData;
        };

        /**
         * 증빙정보 radio 선택시 호출 로직. 사용자 입력이 아닌 로직상 호출을 위해
         * $efi.createStatement.UD_0205_000_EvikbChangeHandler 에서 분리.
         */
        $efi.createStatement.onEVIKBChange = function () {
            var gridObj = $u.gridWrapper.getGrid();

            function initializeValues() {
                var fieldNames = ['WRBTR_READ_ONLY', 'CHARGETOTAL', 'WMWST_READ_ONLY', 'WMWST', 'SGTXT'];
                var fieldNames2 = ['ISSUE_DATE', 'ISSUE_ID', 'IP_ID', 'SU_NAME', 'TYPE_CODE_TXT',
                    'WRBTR', 'CHARGETOTAL', 'WMWST', 'difference_amount', 'debitSum', 'creditSum', 'AKONT'];
                $.each(fieldNames, function (index, value) {
                    if ($u.get(value)) $u.get(value).setValue('')
                });
                $.each(fieldNames2, function (index, value) {
                    if ($u.get(value)) $u.get(value).setValue('')
                });
                $u.get('BLDAT').setValue($u.util.date.getCurrentDateAsDataFormat()); // #2141 180 증빙정보에서 영수증과 종이세금계산서 선택시 나오는 증빙일과 전기일은 오늘 일자를 기준으로…
                $u.get('BUDAT').setValue($u.util.date.getCurrentDateAsDataFormat());

                gridObj.clearGridData();
                $efi.createStatementCommon.addRow();
                $('#statement-information-content').hide();
                $u.page.setCustomParam('selected_evidence_is_key', null);
                $(window).resize();
            }

            /**
             * 증빙없음으로 사용하는 코드: Z 또는 빈값
             * Z 일경우 전표생성 기본값: 현재 프로그램 아이디
             * 빈값일경우 UD_0201_031
             */
            function setEVIKBToNoEvidence() {
                $u.get('EVIKB').setValue('Z');
                if ($u.get('EVIKB').getValue() !== 'Z') $u.get('EVIKB').setValue('');
                $u.get('EVIKB').$el.first().change();
            }

            var vendorCodeInput = $efi.statementInitialData.getVendorCodeInput();

            if (vendorCodeInput) $u.buttons.runCustomHandler('setVendorCodeInputByVendorCodeInput2');
            if ($u.get('ZLSCH')) $u.get('ZLSCH').setEmptyValue();
            if ($u.get('ZFBDT')) $u.get('ZFBDT').setEmptyValue();
            if ($u.get('EMPFB')) $u.get('EMPFB').setEmptyValue();
            if ($u.get('ZLSCH')) $u.get('ZLSCH').triggerChange();

            var evikb = $u.get('EVIKB').getValue();
            var programId = 'UD_0201_031';
            if (evikb === 'A') programId = 'UD_0201_001';
            else if (evikb === 'B') programId = 'UD_0201_011';
            else if (evikb === 'Z') programId = $u.page.getPROGRAM_ID();
            else programId = $u.page.getPROGRAM_ID() + (evikb ? evikb : '');

            if ($u.get('WMWST')) { // #2360 214 [공통] 전표입력 공통, 전자세금계산서일 경우 지급금액, 세금금액 처리
                if (/^B?$/.test(evikb)) $u.get('WMWST').$el.css('background-color', '#ddd'); // #2362, #2371
                else $u.get('WMWST').$el.css('background-color', '#fff');
            }

            var comboQueryParams = {GIVEN_IS_KEY_PROGRAM_ID: programId};

            $.each(['LIFNR', 'ZTERM', 'MWSKZ'], function (index, key) {
                var gridHeader = gridObj.getGridHeader(key);

                if ($u.get(key) && $u.get(key).getType() === 'Uni_CodeCombo' || gridHeader && gridHeader.type === 't_combo') {
                    var combo = $u.f4Data.getCodeComboOption(key, comboQueryParams);
                    if ($u.get(key) && $u.get(key).getType() === 'Uni_CodeCombo') $u.get(key).setOptions(combo);
                    if (gridHeader && gridHeader.type === 't_combo') gridObj.setComboOptions(key, combo);
                }

                if ($u.get(key) && $u.get(key).getType() === 'Uni_CodePopup') $u.get(key).setQueryParams($.extend({}, $u.get(key).getQueryParams(), {PROGRAM_ID: programId}));
                if (gridHeader && gridObj.isPopupCodeColumn(key)) gridObj.setQueryParams(key, {PROGRAM_ID: programId});
            });

            $efi.statementInitialData.setStatementInitialData(programId, function () {
                initializeValues();
                var evidencePROGRAM_ID = null;

                if (evikb === 'A') evidencePROGRAM_ID = 'UD_0201_000';
                if (evikb === 'B') evidencePROGRAM_ID = 'UD_0201_010';

                if (!evidencePROGRAM_ID) {
                    $efi.createStatement.bindEvent.triggerVendorCodeChange();
                    return;
                }

                $efi.dialog.evidenceSelectDialog.open({
                    "evidencePROGRAM_ID": evidencePROGRAM_ID,
                    "selectCallback": function (selectedData) {
                        $('#statement-information-content').show();
                        $(window).resize();
                        var selectedPopupData = $efi.createStatement.reMapSelectedPopupData($.extend({}, selectedData));
                        delete selectedPopupData['BLART'];
                        delete selectedPopupData['EVIKB'];
                        gridObj.clearGridData();
                        $efi.createStatementCommon.addRow();
                        $u.page.setCustomParam('selected_evidence_is_key', selectedPopupData);
                        selectedPopupData['ID'] = selectedPopupData['SU_ID'];

                        if (selectedPopupData['STCD2'] !== '') selectedPopupData['IP_ID'] = selectedPopupData['STCD2'];
                        $u.setValues('statement-information-content', selectedPopupData);
                        if ($u.hasTable('header-invoicer-content')) $u.setValues('header-invoicer-content', selectedPopupData);
                        if ($u.hasTable('vendor-info')) $u.setValues('vendor-info', selectedPopupData);
                        var chargeTotal = Number(selectedPopupData['CHARGETOTAL']);
                        if ((chargeTotal) < 0) gridObj.$V('SHKZG', 0, 'H');
                        gridObj.$V('WRBTR', 0, chargeTotal);
                        gridObj.$V('MWSKZ', 0, $u.get('MWSKZ').getValue());
                        $efi.createStatementCommon.changeWRBTRExpenseInitial();

                        // 초과전표일 경우 초과예정금액 계산
                        if ($u.get('PAYGB') && $u.get('PAYGB').getValue() === 'C') {
                            var gridObj3 = $u.gridWrapper.getGrid('unidocu-grid3');
                            if (gridObj3) {
                                var grid3WRBTRSum = 0;
                                var headerWRBTRAmount = $u.get('WRBTR').getValue();
                                gridObj3.loopRowIndex(function (rowIndex) {
                                    grid3WRBTRSum += Number(gridObj3.$V('WRBTR', rowIndex));
                                });
                                if (headerWRBTRAmount > grid3WRBTRSum) gridObj3.$V('AMOUNT', 0, headerWRBTRAmount - grid3WRBTRSum);
                                else gridObj3.$V('AMOUNT', 0, '');
                            }
                        }

                        var f4QueryParams = {LIFNR: selectedPopupData['LIFNR']};
                        if ($u.get('BVTYP')) $u.get('BVTYP').setOptions($u.f4Data.getCodeComboOption($u.get('BVTYP').params['codeKey'], f4QueryParams), selectedPopupData['BVTYP']);
                        if ($u.get('AKONT')) $u.get('AKONT').setOptions($u.f4Data.getCodeComboOption($u.get('AKONT').params['codeKey'], f4QueryParams), selectedPopupData['AKONT']);
                        if ($u.get('EMPFB')) {
                            if ($u.get('EMPFB').setOptions) $u.get('EMPFB').setOptions($u.f4Data.getCodeComboOption($u.get('EMPFB').params['codeKey'], f4QueryParams));
                            else if ($u.get('EMPFB').setQueryParams) $u.get('EMPFB').setQueryParams(f4QueryParams)
                        }
                        if ($u.get('ZLSCH')) $u.get('ZLSCH').setOptions($u.f4Data.getCodeComboOption($u.get('ZLSCH').params['codeKey'], f4QueryParams), selectedPopupData['ZLSCH']);
                        $efi.createStatement.bindEvent.triggerZTERM_BUDATChange();
                        if($u.buttons.getCustomHandler('onEVIKB_EvidenceSelected')) $u.buttons.runCustomHandler('onEVIKB_EvidenceSelected')
                    },
                    closeWithoutSelectCallback: function () {
                        setEVIKBToNoEvidence();
                    }
                });
            });
            $u.showSubContent();
            $u.gridWrapper.getGrid().fitToWindowSize();
        };
        /**
         * 증빙정보 radio 선택시 event binding
         * #6291 refactoring [20171128]
         * uni-e-fi/module/UD_0205_000_EvikbChangeHandler
         */
        $efi.createStatement.UD_0205_000_EvikbChangeHandler = function (evikbChangeValidation) {
            $u.get('EVIKB').$el.data('oldValue', $u.get('EVIKB').getValue());
            $u.get('EVIKB').$el.change(function () {
                $efi.createStatement.onEVIKBChange(evikbChangeValidation)
            }).first().change();
        };
        $efi.createStatement.collapseForms = function () {
            $('.unidocu-form-table-wrapper .unidocu-panel-ctrls .fa-minus').click();
        }
        $efi.createStatement.handleCallByFI_0002 = function () {
            var $deferred = $.Deferred();
            var gridObj = $u.gridWrapper.getGrid();
            $nst.is_data_nsReturn('ZUNIEFI_3621', $u.page.getPageParams(), function (nsReturn) {
                var os_crd = nsReturn.getExportMap('OS_CRD');
                var os_inv = nsReturn.getExportMap('OS_INV');
                var os_data = nsReturn.getExportMap('OS_DATA');
                var values = $.extend({}, $u.page.getPageParams());
                if($u.page.getPROGRAM_ID() === 'UD_0201_001') $.extend(values, os_crd, os_data);
                if($u.page.getPROGRAM_ID() === 'UD_0201_011') $.extend(values, os_inv, os_data);
                $.extend(values, os_data);

                values['debitSum'] = values['DEBITSUM'];
                values['creditSum'] = values['CREDITSUM'];
                $u.setValues(values);
                gridObj.setJSONData(nsReturn.getTableReturn('OT_DATA'));

                $('#unidocu-td-APPR_NO img').remove();
                $('#unidocu-td-ISSUE_ID img').remove();

                if($u.get('ISSUE_ID')) $u.get('ISSUE_ID').$el.append($efi.get$evidenceIcon(values));
                if($u.get('APPR_NO')) $u.get('APPR_NO').$el.append($efi.get$evidenceIcon(values));

                // todo 입력 제어 공통 적용 화면별 분기 할지도
                $.each(gridObj.getGridHeaders(), function(index, header){
                    gridObj.makeColumnReadOnly(header.key);
                });

                var pay_gb = $u.page.getPageParams()['PAY_GB'];

                var $u_WRBTR = $u.get('WRBTR');
                var $u_WMWST = $u.get('WMWST');
                var isReadOnlyWRBTR = $u_WRBTR.isReadOnly();
                var isReadOnlyWMWST = $u_WMWST.isReadOnly();

                $.each($u.getNames('header-invoicer-content'), function(index, item){
                    $u.get(item).setReadOnly(true);
                });

                $u.get('BUDAT').setReadOnly(false);

                if (pay_gb === 'B') {
                    gridObj.makeColumnRequired('WRBTR');
                    $u_WRBTR.setReadOnly(isReadOnlyWRBTR);
                    $u_WMWST.setReadOnly(isReadOnlyWMWST);
                }
                $deferred.resolve(nsReturn);
            });
            return $deferred;
        }
        $efi.createStatement.calculateWithcdTax = function () {
            var $u_WT_WITHCD = $u.get('WT_WITHCD');
            if ($u_WT_WITHCD && $u_WT_WITHCD.getValue() !== '') {
                $nst.is_data_nsReturn('ZUNIEFI_4520',$u.getValues('header-invoicer-content'), function(nsReturn){
                    var os_data = nsReturn.getExportMaps()['OS_DATA'];
                    $u.setValues(os_data);
                });
            }
        }
    }
});
