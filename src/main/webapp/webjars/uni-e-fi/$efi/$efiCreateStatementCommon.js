/**
 * @module uni-e-fi/$efi/$efiCreateStatementCommon
 */
define(function () {
    return function () {
        $efi.createStatementCommon = {};
        $efi.createStatementCommon._efi_4300_os_dataMap = {};
        $efi.createStatementCommon.getDefaultGridValues = function (){
            var importParam = $u.getValues('statement-information-content,header-invoicer-content,vendor-info,statement-kind-wrapper');
            if(!importParam['CRD_SEQ']) importParam['CRD_SEQ'] = $u.page.getPageParams()['CRD_SEQ'];
            if(!importParam['INV_SEQ']) importParam['INV_SEQ'] = $u.page.getPageParams()['INV_SEQ'];
            var cacheKey = $u.page.getPROGRAM_ID() + importParam['CRD_SEQ'] + importParam['INV_SEQ'];
            var os_data = $efi.createStatementCommon._efi_4300_os_dataMap[cacheKey];
            if(!os_data) {
                os_data = $nst.is_data_os_data('ZUNIEFI_4300', importParam);
                $efi.createStatementCommon._efi_4300_os_dataMap[cacheKey] = os_data;
            }
            return os_data;
        };
        $efi.createStatementCommon.setDefaultGridValues = function (activeRowIndex){
            var gridObj = $u.gridWrapper.getGrid();
            $.each($efi.createStatementCommon.getDefaultGridValues(), function(key, value){
                if(gridObj.getGridHeader(key)) gridObj.$V(key, activeRowIndex, value);
            });
        };
        $efi.createStatementCommon.isEvidenceAmountNegative = function() {
            if ($u.programSetting.getValue('evidenceAmountNegative') === 'true') return true;
            if (!$u.get('WRBTR_READ_ONLY')) return false;
            if (/UD_0201_012|UD_0201_031|UD_0201_032/.test($u.page.getPROGRAM_ID())) return $u.get('WRBTR_READ_ONLY') && $u.get('WRBTR_READ_ONLY').getValue() > 0;
            return $u.get('WRBTR_READ_ONLY') && $u.get('WRBTR_READ_ONLY').getValue() < 0;
        };
        $efi.createStatementCommon.setAmountDisplay = function (displayAmount) {
            setAmountDisplayByArguments(displayAmount.creditSum, displayAmount.debitSum)
        };
        function setAmountDisplayByArguments(creditSum, debitSum) {
            if ($u.get('difference_amount')) $u.get('difference_amount').setValue(Math.abs(creditSum - debitSum));
            if ($u.get('debitSum')) $u.get('debitSum').setValue(debitSum);
            if ($u.get('creditSum')) $u.get('creditSum').setValue(creditSum);
        }
        $efi.createStatementCommon.getCalculatedDisplayAmount_multiAP = function () {
            var gridObj = $u.gridWrapper.getGrid();
            var debitSum = 0, creditSum = 0;
            gridObj.loopRowIndex(function (rowIndex) {
                if (gridObj.$V('SHKZG', rowIndex) === 'S') debitSum += Number(gridObj.$V('WRBTR', rowIndex));
                else creditSum += Number(gridObj.$V('WRBTR', rowIndex));
            });
            return {debitSum: debitSum + $u.get('WMWST').getValue(), creditSum: creditSum}
        };
        $efi.createStatementCommon.getCalculatedDisplayAmount = function () {
            if ($u.page.getPROGRAM_ID() === 'UD_0202_021_C') return $efi.createStatementCommon.getCalculatedDisplayAmount_multiAP();
            var gridObj = $u.gridWrapper.getGrid();
            var debitSum = 0, creditSum = 0;
            gridObj.loopRowIndex(function (rowIndex) {
                if (gridObj.$V('SHKZG', rowIndex) === 'S') debitSum += Number(gridObj.$V('WRBTR', rowIndex));
                else creditSum += Number(gridObj.$V('WRBTR', rowIndex));
            });
            var wmwst = 0;
            if ($u.get('WMWST')) wmwst = $u.get('WMWST').getValue();

            if ($efi.createStatementCommon.isEvidenceAmountNegative() || $u.page.getPROGRAM_ID() === 'UD_0207_030') {
                debitSum += $u.get('WRBTR').getValue();
                creditSum += wmwst;
            } else {
                debitSum += wmwst;
                creditSum += $u.get('WRBTR').getValue();
            }
            return {debitSum: debitSum, creditSum: creditSum}
        };
        $efi.createStatementCommon.getExpenseCalculatedDisplayAmountInitial = function () {
            var WRBTR, creditSum, debitSum;
            WRBTR = $u.get('WRBTR').getValue();
            var wmwstValue = $u.get('WMWST') ? $u.get('WMWST').getValue() : 0;
            var chargeTotalValue = $u.get('CHARGETOTAL') ? $u.get('CHARGETOTAL').getValue() : 0;
            if ($efi.createStatementCommon.isEvidenceAmountNegative()) {
                creditSum = Math.abs(chargeTotalValue) + wmwstValue;
                debitSum = WRBTR;
            } else {
                creditSum = WRBTR;
                debitSum = wmwstValue + chargeTotalValue;
            }
            return {debitSum: debitSum, creditSum: creditSum, WRBTR: WRBTR}
        };
        $efi.createStatementCommon.getExpenseCalculatedWRBTR = function () {
            if($efi.createStatementCommon.useAutoCalcEviAmount('wrbtrReadOnly')()) return Math.abs($u.get('WRBTR_READ_ONLY').getValue());

            var gridDebitSum = 0;
            var gridCreditSum = 0;
            $.each($u.gridWrapper.getGrid().getJSONData(), function (index, item) {
                var shkzg = item['SHKZG'];
                var gridWRBTR = Number(item['WRBTR']);
                if (shkzg === 'S') gridDebitSum += gridWRBTR;
                else gridCreditSum += gridWRBTR;
            });
            var calculatedWRBTR = gridDebitSum - gridCreditSum;
            if (!$u.get('WMWST')) return Math.abs(calculatedWRBTR);
            var wmwstValue = $u.get('WMWST').getValue();
            if ($efi.createStatementCommon.isEvidenceAmountNegative()) calculatedWRBTR -= Math.abs(wmwstValue);
            else calculatedWRBTR += wmwstValue;

            return Math.abs(calculatedWRBTR);
        };
        function hasVAT(mwskz) {
            return $efi.f4.getFLAG_by_MWSKZ(mwskz) === 'X';
        }

        $efi.createStatementCommon.getGridWMWSTSum = function () {
            if($u.get('WMWST') && $efi.createStatementCommon.useAutoCalcEviAmount('wmwstReadOnly')()) return Math.abs($u.get('WMWST_READ_ONLY').getValue());
            var gridObj = $u.gridWrapper.getGrid();
            var precision = $u.unidocuCurrency.getPrecision($u.getValues()['WAERS']);
            var gridDebitWMWSTSum = 0, gridCreditWMWSTSum = 0;
            $.each(gridObj.getJSONData(), function (index, rowData) {
                var taxRate = $efi.createStatementCommon.getTaxRateByMWSKZ(rowData['MWSKZ']);

                var poweredWRBTR = Math.round(Number(rowData['WRBTR']) * Math.pow(10, precision));
                var singleWMWST = Math.round(poweredWRBTR * taxRate);

                if (rowData['SHKZG'] === 'S') gridDebitWMWSTSum += singleWMWST;
                else gridCreditWMWSTSum += singleWMWST;
            });
            gridDebitWMWSTSum /= Math.pow(10, precision);
            gridCreditWMWSTSum /= Math.pow(10, precision);
            var WMWSTSum = gridDebitWMWSTSum - gridCreditWMWSTSum;
            if ($efi.createStatementCommon.isEvidenceAmountNegative()) WMWSTSum = -WMWSTSum;
            return WMWSTSum;
        };
        $efi.createStatementCommon.init = function () {
            $u.programSetting.appendTemplate('isAttachmentRequired', {
                defaultValue: 'false',
                description: '증빙파일 필수체크 여부'
            });
            $u.programSetting.appendTemplate('setBlockPaste', {
                defaultValue: 'false',
                description: '그리드 복사 기능 ({true|false} default:false)'
            });
            $u.programSetting.appendTemplate('useFileSearchDialog', {
                defaultValue: 'false',
                description: '모바일 첨부파일 추가 기능'
            });
            $u.programSetting.appendTemplate('cloneButtonsSetting', {
                defaultValue: 'false',
                description: '상단 버튼을 하단에 복제 ({true|false} default:false)'
            });
            $u.programSetting.appendTemplate('setHeaderCheckBox', {
                defaultValue: 'false',
                description: 'unidocu-grid 헤더 체크박스 설정 ({true|false} default:false)'
            });
            $u.programSetting.appendTemplate('setCreateStatementFunction', {
                defaultValue: $efi.createStatementCommon.getNamedServiceId(),
                description: '전표생성 RFC 정의'
            });
            $u.programSetting.appendTemplate('setADD_DATAOnTheWeb', {
                defaultValue: 'false',
                description: '추가데이터 웹에서 설정'
            });
            if ($u.util.contains($u.page.getVIEW_NAME(), ['uni-e-fi/view/UD_0201_011', 'uni-e-fi/view/UD_0201_001'])) {
                $u.programSetting.appendTemplate('한 건인 경우 증빙 금액 사용', {
                    defaultValue: 'false',
                    description: '세금코드 존재시 WMWST -> 증빙세액, gridWRBTR -> 증빙 공급가액 사용'
                });
                $u.programSetting.appendTemplate('증빙정보 승인금액 자동 계산사용', {
                    defaultValue: 'false',
                    description: '[Form] 지급금액 - 증빙금액(승인금액) 사용 (redmine refs #18602)'
                });
                $u.programSetting.appendTemplate('증빙정보 세액 자동 계산사용', {
                    defaultValue: 'false',
                    description: '[Form] 세금금액 - 증빙금액(세액) 사용 (redmine refs #18602)'
                });
            }

            var gridObj = $u.gridWrapper.getGrid();
            if (gridObj) gridObj.setSortEnable(false);
            if ($u.programSetting.getValue('setBlockPaste') === 'true' && gridObj) gridObj.setBlockPasteMode('clipboardareabase');
            if ($u.programSetting.getValue('useFileSearchDialog') === 'true') $u.fileUI.getFineUploader().useSearchButton();
            if ($u.programSetting.getValue("cloneButtonsSetting") === 'true') {
                var $uniButtons = $('#uni-buttons');
                // noinspection JSJQueryEfficiency
                if($('#cloned-buttons').length === 0) $uniButtons.parent().append($('<div class="btn_area" id="cloned-buttons"></div>'));
                // noinspection JSJQueryEfficiency
                $('#cloned-buttons').append($uniButtons.find('button').clone());
            }
            if ($u.programSetting.getValue("setHeaderCheckBox") === 'true') $u.gridWrapper.getGrid().setHeaderCheckBox('SELECTED', true);
            $efi.statementInitialData.setStatementInitialData($u.page.getPROGRAM_ID());
        };
        $efi.createStatementCommon.getNamedServiceId = function () {
            var viewName = $u.page.getVIEW_NAME();
            var basePrg = $u.page.getBASE_PRG();
            var programId = $u.page.getPROGRAM_ID();
            var namedServiceId = "";
            if (viewName === 'uni-e-fi/view/UD_0201_001') namedServiceId = 'ZUNIEFI_1009';
            if (viewName === 'uni-e-fi/view/UD_0201_031') namedServiceId = 'ZUNIEFI_5100';
            if (viewName === 'uni-e-fi/view/UD_0202_001') namedServiceId = 'ZUNIEFI_5000';
            if (viewName === 'uni-e-fi/view/UD_0201_011') {
                namedServiceId = 'ZUNIEFI_2003';
                if (/UD_0201_012/.test(programId)) namedServiceId = 'ZUNIEFI_2103';
            }
            if (viewName === 'uni-e-fi/view/UD_0207_020') {
                namedServiceId = 'ZUNIDU_6101';
                if ($u.page.getPROGRAM_ID() === 'UD_0207_030') namedServiceId = 'ZUNIDU_6102';
            }
            if (viewName === 'uni-e-fi/view/UD_0302_011') namedServiceId = 'ZUNIEFI_4106';
            if (viewName === 'uni-e-fi/view/KD_0202_001') namedServiceId = 'ZUNIEFI_5000';
            if (viewName === 'uni-e-fi/view/UD_0204_001') namedServiceId = 'ZUNIEFI_5004';
            if (viewName === 'uni-e-fi/view/UD_0204_100') namedServiceId = 'ZUNIEFI_5004';
            if (viewName === 'uni-e-fi/view/FI_0204_001') namedServiceId = 'ZUNIEFI_5004';
            if (viewName === 'uni-e-fi/view/UD_0203_001') namedServiceId = 'ZUNIEFI_5001';
            if (viewName === 'uni-e-fi/view/UD_0220_001') namedServiceId = 'ZUNIEWF_6601';
            if (viewName === 'uni-e-fi/view/UD_0220_002') namedServiceId = 'ZUNIEWF_6611';
            if (viewName === 'uni-e-fi/view/UD_0220_122') namedServiceId = 'ZUNIEWF_6712';
            if (viewName === 'uni-e-fi/view/UD_0220_132') namedServiceId = 'ZUNIEWF_6722';
            if (viewName === 'uni-e-fi/view/UD_0201_111') {
                namedServiceId = 'ZUNIEFI_1009';
                if (/UD_0201_011/.test(programId)) namedServiceId = 'ZUNIEFI_2003';
                if (/UD_0201_012/.test(programId)) namedServiceId = 'ZUNIEFI_2103';
            }
            if (viewName === 'unidocu-ui/layout/UniDocu001' && basePrg === 'uni-e-fi/view/UniDocu001/UD_0201_100') namedServiceId = 'ZUNIEFI_1010';

            return namedServiceId;
        };
        $efi.createStatementCommon.initForFI_0204_001 = function (_programId) {
            $efi.statementInitialData.setStatementInitialData(_programId);
        };
        $efi.createStatementCommon.addRow = function () {
            var gridObj = $u.gridWrapper.getGrid();
            gridObj.addRowWithGridPopupIcon();
            var activeRowIndex = gridObj.getActiveRowIndex();
            if ($efi.createStatementCommon.isEvidenceAmountNegative()) gridObj.$V('SHKZG', activeRowIndex, 'H');
            else gridObj.$V('SHKZG', activeRowIndex, 'S');

            if ($u.get('MWSKZ') && gridObj.getGridHeader('MWSKZ')) gridObj.$V('MWSKZ', activeRowIndex, $u.get('MWSKZ').getValue());
            if ($u.get('SGTXT') && gridObj.getGridHeader('SGTXT')) gridObj.$V('SGTXT', activeRowIndex, $u.get('SGTXT').getValue());
            $efi.createStatementCommon.setDefaultGridValues(activeRowIndex);

            // #2106 선급비용 그리드에 사업영역 default 값지정 ( 사용자요구 )
            if (gridObj.getGridHeader('GSBER') && staticProperties.user['GSBER']) gridObj.$V('GSBER', activeRowIndex, staticProperties.user['GSBER']);
            if (gridObj.getGridHeader('GSBER_TXT') && staticProperties.user['GSBER_TXT']) gridObj.$V('GSBER_TXT', activeRowIndex, staticProperties.user['GSBER_TXT']);
            $efi.createStatementCommon.changeWRBTRExpense('addRow');
            $efi.addDataHandler.handleADD_DATAKeyChange(activeRowIndex);
        };
        /**
         * 임시전표 수정 데이터 설정
         * 또는 전표 생성시 공급 가액 그리드 첫번째 데이터로 설정.
         * 법인카드/매입세금계산서/실물증빙
         */
        $efi.createStatementCommon.handleEditMode = function () {
            var gridObj = $u.gridWrapper.getGrid();
            $efi.createStatementCommon.addRow();

            if (!$efi.createStatementCommon.hasFormVAT() && $u.get('WRBTR_READ_ONLY')) gridObj.$V('WRBTR', 0, $u.get('WRBTR_READ_ONLY').getValue());
            else if ($u.get('CHARGETOTAL')) gridObj.$V('WRBTR', 0, $u.get('CHARGETOTAL').getValue());
            else gridObj.$V('WRBTR', 0, 0);

            $efi.createStatementCommon.changeWRBTRExpenseInitial();
            if (!$u.get('WMWST') && !$u.get('MWSKZ')) $efi.createStatementCommon.changeWRBTRExpense();

            if (!$efi.createStatementCommon.hasFormVAT() && $u.page.getVIEW_NAME() === 'uni-e-fi/view/UD_0201_001') {
                $u.get('WMWST').setValue('0');
                $efi.createStatementCommon.changeWRBTRExpense('WRBTR');
            }
        };
        $efi.createStatementCommon.initPage = function () {
            unidocuConfirm($mls.getByCode('M_dataInitConfirm'), function () {
                $u.pageReload();
            });
        };
        $efi.createStatementCommon.bindFormButton = function () {
            var gridObj = $u.gridWrapper.getGrid();
            $u.buttons.addHandler({
                addRow: $efi.createStatementCommon.addRow,
                deleteRow: function () {
                    gridObj.deleteSelectedRows();
                    $efi.createStatementCommon.changeWRBTRExpense('delete');
                    if ($u.buttons.getCustomHandler('changeWRBTR_AMOUNT')) $u.buttons.runCustomHandler('changeWRBTR_AMOUNT');
                },
                initPage: $efi.createStatementCommon.initPage,
                templateDownload: function () {
                    $u.excel.templateDownload(gridObj, $efi.createStatementCommon.addRow);
                },
                "adjustWMWST": function () {
                    var $u_WMWST_READ_ONLY = $u.get('WMWST_READ_ONLY');
                    var $u_WMWST = $u.get('WMWST');

                    if (!$u_WMWST_READ_ONLY) throw 'WMWST_READ_ONLY form field required';
                    if (!$u_WMWST) throw 'WMWST form field required';

                    var wmwst_read_only = $u_WMWST_READ_ONLY.getValue();
                    var wmwst = $u_WMWST.getValue();
                    if (Math.abs(wmwst_read_only - wmwst) === 0) throw '계산된 세액과 증빙 세액이 동일합니다.';
                    if (Math.abs(wmwst_read_only - wmwst) >= 10) throw '계산된 세액과 증빙 세액의 차이가 10원 미만인 경우만 수행 가능 합니다.';

                    $u_WMWST.setValue(wmwst_read_only);
                    $u_WMWST.$el.change();
                }
            });

            $u.excel.bindExcelUploadHandler(gridObj, function(gridData){
                var startColumnKey = gridObj.getGridHeaders()[0].key;
                var endColumnKey = gridObj.getGridHeaders()[gridObj.getGridHeaders().length - 1].key;
                var startRowIndex = 0;
                var endRowIndex = gridData.length - 1;
                $efi.createStatement.afterMultiCellChange(startColumnKey, startRowIndex, endColumnKey, endRowIndex);
            });
        };
        $efi.createStatementCommon.hasFormVAT = function () {
            if (!$u.get('MWSKZ')) return false;
            return hasVAT($u.get('MWSKZ').getValue());
        };
        $efi.createStatementCommon.getFormTaxRate = function () {
            if ($u.get('MWSKZ')) return $efi.createStatementCommon.getTaxRateByMWSKZ($u.get('MWSKZ').getValue());
            return 0;
        };
        $efi.createStatementCommon.getTaxRateByMWSKZ = function(mwskz){
            return Number($efi.f4.getKBETR_by_MWSKZ(mwskz)) / 100;
        };
        $efi.createStatementCommon.useAutoCalcEviAmount = function (key) {
            return {
                'wrbtrReadOnly': function() {
                    if ($u.get('WRBTR_READ_ONLY')) {
                        return callFunction('증빙정보 승인금액 자동 계산사용','선급금 증빙정보 승인금액 자동 계산');
                    }
                },
                'wmwstReadOnly': function() {
                    if ($u.get('WMWST_READ_ONLY')) {
                        return callFunction('증빙정보 세액 자동 계산사용','선급금 증빙정보 세액 자동 계산');
                    }
                },
                'oneCaseUseCalcEviAmount': function() {
                    if ($u.get('WMWST_READ_ONLY') && $u.get('WMWST_READ_ONLY').getValue() !== 0) {
                        return callFunction('한 건인 경우 증빙 금액 사용','선급금 한 건인 경우 증빙 금액 사용');
                    }
                }
            }[key];

            function callFunction(programSettingKey,programSettingKey2) {
                var $u_EVIKB = $u.get('EVIKB');
                if ($u_EVIKB) {     // 선급금정산 증빙구분
                    var evikb = $u_EVIKB.getValue();
                    if (evikb === 'A' && $u.programSetting.getValue(programSettingKey) === 'true') return true;
                    if (evikb === 'B' && $u.programSetting.getValue(programSettingKey2) === 'true') return true;
                } else {
                    if ($u.programSetting.getValue(programSettingKey) === 'true') return true;
                }
                return false;
            }
        };

        $efi.createStatementCommon.changeWRBTRGL = function () {
            var gridObj = $u.gridWrapper.getGrid();
            var debitSum = 0, creditSum = 0;
            var shkzg, gridWRBTR;
            gridObj.loopRowIndex(function (rowIndex) {
                shkzg = gridObj.$V('SHKZG', rowIndex);
                gridWRBTR = Number(gridObj.$V('WRBTR', rowIndex));
                if (shkzg === 'S') debitSum += gridWRBTR;
                else creditSum += gridWRBTR;
            });
            setAmountDisplayByArguments(creditSum, debitSum);
        };
        /**
         * 경비 정산 전표에 적용.
         * [WRBTR: 지급금액] = [grid debit sum: 그리드 차변 합계] - [grid credit sum: 그리드 대변 합계]
         * if [WRBTR] < 0 then
         *   [debitSum] = [grid debit sum] - [WRBTR]
         *   [creditSum] = [grid credit sum]
         *   [WRBTR] = -[WRBTR]
         * else
         *   [debitSum] = [grid debit sum]
         *   [creditSum] = [grid credit sum] + [WRBTR]
         * end if
         * 0 === diff = creditSum - debitSum
         * =>
         * gridCreditSum 이크면 차변합계 대변합계는 grid credit sum
         * gridDebitSum 이크면 차변합계 대변합계는 grid debit sum
         * 지급금액은 [gridDebitSum - gridCreditSum]
         */
        $efi.createStatementCommon.changeMWSKZ = function () {
            var gridObj = $u.gridWrapper.getGrid();
            var oldValue = $u.get('MWSKZ').getOldValue();
            var currentValue = $u.get('MWSKZ').getValue();
            $u.get('MWSKZ').setOldValue(currentValue);

            var optionText = $u.get('MWSKZ').getOptionsText(currentValue);
            var filtered = gridObj.$F(oldValue, 'MWSKZ').concat(gridObj.$F('', 'MWSKZ'));
            $.each(filtered, function (index, rowIndex) {
                gridObj.$V('MWSKZ', rowIndex, currentValue);
                if (gridObj.getGridHeader('MWSKZ_TXT')) gridObj.$V('MWSKZ_TXT', rowIndex, optionText);
            });
            $efi.createStatementCommon.changeWRBTRExpense();
            $efi.mwskzNonDeduction.alertChangeFormCombo();
        }
        $efi.createStatementCommon.changeWRBTRExpense = function (columnKey) {
            var gridObj = $u.gridWrapper.getGrid();
            if (!gridObj.getGridHeader('WRBTR')) return;
            var $u_wrbtr = $u.get('WRBTR');
            var gridWRBTR;

            if (columnKey === 'MWSKZ') {
                if (gridObj.getRowCount() === 1) {
                    $u.get('MWSKZ').setValue(gridObj.$V('MWSKZ',0));
                    $u.get('MWSKZ').setOldValue($u.get('MWSKZ').getValue());
                }
            }
            gridObj.setNumberNegative('WRBTR', 'false');

            if ($u.util.contains(columnKey,['addRow','MWSKZ','SHKZG']) && gridObj.$V('WRBTR',gridObj.getActiveRowIndex()) === '' && gridObj.getRowCount() !== 1) return;
            if ($u.get('WMWST')) $u.get('WMWST').setValue($efi.createStatementCommon.getGridWMWSTSum());
            var calculatedWRBTR = $efi.createStatementCommon.getExpenseCalculatedWRBTR();
            $u_wrbtr.setValue(calculatedWRBTR);
            if (columnKey === 'WRBTR') $efi.createStatement.calculateWithcdTax();

            var form_wmwst = null;
            var formWRBTR = $u_wrbtr.getValue();

            if (gridObj.getRowCount() === 1 && $u.programSetting.getValue('증빙정보 승인금액 자동 계산사용') === 'true' && columnKey !== 'WRBTR') {
                gridWRBTR = formWRBTR / (1 + $efi.createStatementCommon.getTaxRateByMWSKZ(gridObj.$V('MWSKZ', 0)));

                if ($efi.createStatementCommon.hasFormVAT()) gridObj.$V('WRBTR', 0, $efi.precisionRoundByWAERS(gridWRBTR, $u.getValues()['WAERS']));
                else gridObj.$V('WRBTR', 0, calculatedWRBTR);
            }

            if ($u.get('WMWST')) {
                if ($efi.createStatementCommon.useAutoCalcEviAmount('wmwstReadOnly')()) {
                    form_wmwst = Math.abs($u.get('WMWST_READ_ONLY').getValue());
                } else if (gridObj.getRowCount() === 1) {
                    gridWRBTR = formWRBTR / (1 + $efi.createStatementCommon.getTaxRateByMWSKZ(gridObj.$V('MWSKZ', 0)));
                    if($efi.createStatementCommon.hasFormVAT()) form_wmwst = formWRBTR - $efi.precisionRoundByWAERS(gridWRBTR, $u.getValues()['WAERS']);
                    else form_wmwst = 0;
                } else {
                    form_wmwst = $efi.createStatementCommon.getGridWMWSTSum();
                }
            }

            if ($efi.createStatementCommon.useAutoCalcEviAmount('oneCaseUseCalcEviAmount')()) {
                if (gridObj.getRowCount() === 1) {
                    var chargetotal = Math.abs($u.get('CHARGETOTAL').getValue());
                    if ($efi.createStatementCommon.hasFormVAT()) gridObj.$V('WRBTR', 0, chargetotal);
                    else gridObj.$V('WRBTR', 0, calculatedWRBTR);

                    if ($u.get('WMWST')) {
                        if ($efi.createStatementCommon.hasFormVAT()) form_wmwst = Math.abs($u.get('WMWST_READ_ONLY').getValue());
                        else form_wmwst = 0;
                    }
                }
            }
            if ($u.get('WMWST')) $u.get('WMWST').setValue(Math.abs(form_wmwst));

            $efi.createStatementCommon.setAmountDisplay($efi.createStatementCommon.getCalculatedDisplayAmount());
        };

        $efi.createStatementCommon.calculateWRBTRbyKURSF= function (rowIndex) {
            var gridObj = $u.gridWrapper.getGrid();
            var rowData = gridObj.getJSONDataByRowIndex(rowIndex);
            var kursf = rowData['KURSF'] ? parseFloat(rowData['KURSF']) : 0;
            var wrbtr2 = rowData['WRBTR2'] ? parseFloat(rowData['WRBTR2']) : 0;
            var isWAERSJPY = rowData['WAERS'] === 'JPY';
            if (kursf && wrbtr2) return isWAERSJPY ? (kursf * wrbtr2) / 100 : kursf * wrbtr2;
            return 0;
        }

        /**
         * 최초 화면 로딩.
         */
        $efi.createStatementCommon.changeWRBTRExpenseInitial = function () {
            var gridObj = $u.gridWrapper.getGrid();
            gridObj.setNumberNegative('WRBTR', 'false');
            if ($u.get('WMWST')) $u.get('WMWST').setValue(Math.abs($u.get('WMWST_READ_ONLY')  ? $u.get('WMWST_READ_ONLY').getValue() : 0));
            if ($u.get('WRBTR')) $u.get('WRBTR').setValue(Math.abs($u.get('WRBTR_READ_ONLY')  ? $u.get('WRBTR_READ_ONLY').getValue() : 0));
            var displayAmount = $efi.createStatementCommon.getExpenseCalculatedDisplayAmountInitial();
            $efi.createStatementCommon.setAmountDisplay(displayAmount);
        };
        $efi.createStatementCommon.changeWMWSTExpense = function () {
            $u.get('WRBTR').setValue($efi.createStatementCommon.getExpenseCalculatedWRBTR());
            $efi.createStatementCommon.setAmountDisplay($efi.createStatementCommon.getCalculatedDisplayAmount());
        };
    };
});