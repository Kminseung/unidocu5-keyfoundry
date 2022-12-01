/**
 * @module uni-e-fi/$efi
 */
define([
    'uni-e-fi/mustache/$efiMustache',
    'uni-e-fi/$efi/$efiAddDataHandler',
    'uni-e-fi/$efi/$efiCreateStatement',
    'uni-e-fi/$efi/$efiCreateStatementCommon',
    'uni-e-fi/$efi/$efiDialog',
    'uni-e-fi/$efi/$efiF4',
    'uni-e-fi/$efi/$efiKOSTL_HKONT_Relation',
    'uni-e-fi/$efi/$efiMWSKZNonDeduction',
    'uni-e-fi/$efi/$efiStatementInitialData'
], function (
    $efiMustache,
    $efiAddDataHandler,
    $efiCreateStatement,
    $efiCreateStatementCommon,
    $efiDialog,
    $efiF4,
    $efiKOSTL_HKONT_Relation,
    $efiMWSKZNonDeduction,
    $efiStatementInitialData) {
    window.$efi = {};

    $efiMustache(); // $efi.mustache
    $efiAddDataHandler(); // $efi.addDataHandler
    $efiCreateStatement(); // $efi.createStatement
    $efiCreateStatementCommon(); // $efi.createStatementCommon
    $efiDialog(); // $efi.dialog
    $efiF4(); // $efi.f4
    $efiKOSTL_HKONT_Relation(); // $efi.KOSTL_HKONT_Relation
    $efiMWSKZNonDeduction(); //$efi.mwskzNonDeduction
    $efiStatementInitialData(); // $efi.statementInitialData

    $efi.get$evidenceIcon = function (evidenceData) {
        // noinspection RequiredAttributes
        var $evidenceIcon = $('<img alt="evidence link" style = "cursor: pointer; margin-left: 5px; vertical-align: middle">').attr('src', $u.getUrlFromRoot('/images/btn/btn_view.gif'));
        $evidenceIcon.click(function () {
            if (evidenceData['CRD_SEQ']) $efi.popup.openCardBill(evidenceData['CRD_SEQ']);
            if (evidenceData['INV_SEQ']) $efi.popup.openTaxInvoice(evidenceData['INV_SEQ']);
            if (evidenceData['EVI_SEQ']) $efi.popup.showEvidence(evidenceData['EVI_SEQ']);
        });
        return $evidenceIcon;
    };
    $efi.evidenceHandler = function () {
        if ($u.get('ISSUE_ID')) {
            var $evidenceIcon = $efi.get$evidenceIcon({});
            $u.get('ISSUE_ID').$el.append($evidenceIcon);
            $evidenceIcon.click(function () {
                $efi.get$evidenceIcon($u.page.getCustomParam('selected_evidence_is_key')).click();
            });
        }
    };
    $efi.evikbClickHandler = function (paramMap) {
        $nst.is_data_ot_data('ZUNIECM_5013', paramMap, function (ot_data) {
            if (ot_data.length === 0) unidocuAlert($mls.getByCode('M_evidenceDoesNotExist'));
            else if (ot_data.length === 1) $efi.handleEvidenceByZUNIECM_5013_RowData(ot_data[0]);
            else $efi.popup.openUD_0398_000(paramMap);
        });
    };
    $efi.handleEvidenceByZUNIECM_5013_RowData = function (rowData) {
        var evikb = rowData['EVI_KB'];
        var url = rowData['EVI_URL'];
        if (evikb === 'AT') $u.dialog.fineUploaderDialog.open(rowData['EVI_SEQ'], true);
        else $efi.popup.openEVIKB(url);
    };
    $efi.showExGateClosedVendorStatus = function (bizNo) {
        $nst.is_data_stringReturns('ExGate', {mode: 'getClosedVendor', bizNo: bizNo}, function(stringReturns){
            var res = stringReturns['res'];
            var status = '';
            var taxSt = res.out['taxSt'];
            if (taxSt === '00') status = '정상';
            if (taxSt === '01') status = '폐업';
            if (taxSt === '02') status = '휴업';
            if (taxSt === '90') status = '미등록사업자';
            res.out['status'] = status;

            var template = '';
            template += '<p style="text-align: left;">사업자 등록번호: {bizNo}</p>';
            template += '<p style="text-align: left;">사업자 등록상태: {status}</p>';
            template += '<p style="text-align: left;">폐업일: {closeDt}</p>';
            template += '<p style="text-align: left;">과세유형: {taxTypeNm}</p>';
            template += '<p style="text-align: left;">과세유형 전환일: {changeDt}</p>';
            unidocuAlert($($u.util.formatString(template, res.out)));

        });
    };
    $efi.currencyEventAfterRender = function ($scope) {
        function handlerCurrency(precision) {
            $.each($u.getUni_InputAmountObjs(), function (index, item) {
                if (item.getName() === 'KURSF') return true;
                item.setPrecision(precision);
            });

            $.each($('.unidocu-grid'), function (index, gridObj) {
                gridObj.setGridNumberPrecision(precision);
            });
        }

        if (!$scope) $scope = $('body');

        if(!$u.exists(['WAERS'])) return;

        var hasWAERS_in_$scope = false;
        $scope.find('.unidocu-form-table-wrapper').each(function () {
            if($u.get($(this).attr('id'), 'WAERS') && $u.get($(this).attr('id'), 'WAERS').getType() !== 'dummy') hasWAERS_in_$scope = true;
        });

        if(!hasWAERS_in_$scope) return;

        var $u_WAERS = $u.get('WAERS');
        $u_WAERS.setValue($u.unidocuCurrency.getWAERS());

        $u_WAERS.$el.change(function () {
            handlerCurrency($u.unidocuCurrency.getPrecision($u_WAERS.getValue()))
        });

        handlerCurrency($u.unidocuCurrency.getSystemPrecision());
    };

    $efi.UD_0302_000EventHandler = {};

    $efi.UD_0302_000EventHandler.editStatement = function () {
        var gridObj = $u.gridWrapper.getGrid();
        gridObj.asserts.selectedExactOneRow();
        if (gridObj.getSELECTEDJSONData()[0].BSTAT !== 'V') throw $mls.getByCode('M_UD_0302_000_modifyStatementOnlyTempStatement');

        $nst.is_data_nsReturn('ZUNIEFI_4105', gridObj.getSELECTEDJSONData()[0], function () {
            $u.navigateByProgramId('UD_0302_011', gridObj.getSELECTEDJSONData()[0]);
        });
    };

    $efi.UD_0302_000EventHandler.cancelGroup = function () {
        var gridObj = $u.gridWrapper.getGrid();
        gridObj.asserts.rowSelected();
        if (gridObj.getSELECTEDJSONData()[0]['GRONO'] === '') throw $mls.getByCode('M_UD_0302_000_cancelGroupGRONOEmpty');
        unidocuConfirm($mls.getByCode('M_UD_0302_000_cancelGroupConfirm'), function () {
            var funcname = $u.programSetting.getValue('cancelGroupFuncName');
            if(!funcname) funcname = 'ZUNIEFI_4202';
            $nst.is_data_nsReturn(funcname, gridObj.getSELECTEDJSONData()[0], function () {
                $.each(gridObj.getSelectedRowIndexes(), function (index, rowIndex) {
                    gridObj.$V('GRONO', rowIndex, '');
                });
                $u.buttons.triggerFormTableButtonClick();
            });
        });
    };

    $efi.UD_0302_000EventHandler.regularStatementPosting = function () {
        var gridObj = $u.gridWrapper.getGrid();
        gridObj.asserts.rowSelected();
        var funcname = $u.programSetting.getValue('regularStatementPostingFuncName');
        if (!funcname) funcname = 'ZUNIEFI_9010';
        $nst.it_data_nsReturn(funcname, gridObj.getSELECTEDJSONData(), function (nsReturn) {
            unidocuAlert(nsReturn.getReturnMessage(), function () {
                $u.buttons.triggerFormTableButtonClick();
            });
        });
    };

    $efi.UD_0302_000EventHandler.gridCellClick = function (columnKey, rowIndex) {
        var gridObj = $u.gridWrapper.getGrid();
        var gridJSONDataByRowIndex = gridObj.getJSONDataByRowIndex(rowIndex);

        if (columnKey === 'BELNR') $efi.popup.openStatementViewWithParamMap(gridJSONDataByRowIndex);

        if (columnKey === 'GRONO') {
            if (gridObj.$V(columnKey, rowIndex) === '') return;
            gridObj.$V('SELECTED', rowIndex, 1);
            gridObj.handleGroupCheck('SELECTED', 'GRONO', rowIndex, 1);
            $nst.is_data_nsReturn('ZUNIECM_4510', gridJSONDataByRowIndex, function (nsReturn) {
                $efi.UD_0302_000EventHandler.openApprovalPopup(nsReturn.getStringReturn("O_URL"));
            });
        }

        if (columnKey === 'EVIKB_@') $efi.evikbClickHandler(gridJSONDataByRowIndex);

        if (columnKey === 'EVIKB_ADD') {
            if (gridObj._rg.getValue(rowIndex, 'EVIKB_ADD__IMAGE') !== '0') {
                var $dialog = $u.dialog.fineUploaderDialog.open(gridJSONDataByRowIndex['EVI_SEQ'], false, function () {
                    var originEVI_SEQ = gridObj.$V('EVI_SEQ', rowIndex);
                    var fileCount = $dialog.data('fineUploader').getFileCount();
                    var curEVI_SEQ = fileCount === 0 ? '' : $dialog.data('fineUploader').getFileGroupId();

                    if (originEVI_SEQ !== curEVI_SEQ) $nst.is_data_returnMessage('ZUNIEFI_4230',
                        $.extend({}, gridJSONDataByRowIndex, {'EVI_SEQ': curEVI_SEQ}),
                        function () {
                            gridObj.$V('EVI_SEQ', rowIndex, curEVI_SEQ);
                            if (fileCount > 0) gridObj.showImage('EVIKB_@', rowIndex);
                            else $nst.is_data_ot_data('ZUNIECM_5013', gridJSONDataByRowIndex, function (ot_data) {
                                if (ot_data.length === 0) gridObj.hideImage('EVIKB_@', rowIndex);
                                else gridObj.showImage('EVIKB_@', rowIndex);
                            });
                        });
                });
            }
        }
    };
    $efi.UD_0302_000EventHandler.openApprovalPopup = function (o_url) {
        try {
            var popup = $ewf.popup.openApprovalDetail(o_url);
            $efi.UD_0302_000EventHandler.handleApprovalPopupClose(popup);
        } catch (e) {
            if (/액세스가 거부되었습니다/.test(e.message)) throw $mls.getByCode('M_UD_0302_000_approvalPopupAccessError');
            else throw e;
        }
    };
    $efi.UD_0302_000EventHandler.handleApprovalPopupClose = function (popup) {
        if (!$u.page.getCustomParam('useCancelGroupOnApprovalPopupClose')) return;
        var gridObj = $u.gridWrapper.getGrid();
        var interval = setInterval(function () {
            if (popup.closed) {
                clearInterval(interval);
                $('.ui-dialog').remove();

                var selectedJSONData = gridObj.getSELECTEDJSONData();
                var belnr;
                if (selectedJSONData.length > 0) belnr = selectedJSONData[0]['BELNR'];

                $u.buttons.triggerFormTableButtonClick('search-condition', function () {
                    if (belnr) {
                        var rowIndex = gridObj.$F(belnr, 'BELNR')[0];
                        if (rowIndex === undefined) return;
                        if (gridObj.$V('STATS', rowIndex) === '1') {
                            gridObj.$V('SELECTED', rowIndex, 1);
                            gridObj.handleGroupCheck('SELECTED', 'GRONO', rowIndex, 1);
                        }
                    }
                });
            } else {
                if (document.hasFocus() && $('.ui-dialog').length === 0) {
                    unidocuAlert($mls.getByCode('M_UD_0302_000_cannotControlApprovalScreenExist'), function () {
                        if (popup.focus) popup.focus();
                    });
                }
            }
        }, 100);
    };

    /**
     * UD_0302_000 그리드 항목 선택시 validation
     * ZUNIECM_4500 출력 값에 해당 되지 않는 EVIKB 를 함께 선택 할 수 없음.
     */
    $efi.UD_0302_000selectionValidator = {};
    $efi.UD_0302_000selectionValidator._groupMap = null;
    $efi.UD_0302_000selectionValidator._evikb_txtMap = null;
    $efi.UD_0302_000selectionValidator.getEVIKB_TXTMap = function () {
        if ($efi.UD_0302_000selectionValidator._evikb_txtMap) return $efi.UD_0302_000selectionValidator._evikb_txtMap;
        $efi.UD_0302_000selectionValidator._evikb_txtMap = $u.f4Data.getCodeMapWithParams('EVIKB', 'EVIKB_TXT')
        return $efi.UD_0302_000selectionValidator._evikb_txtMap;
    };
    $efi.UD_0302_000selectionValidator.getGroupMap = function () {
        if($efi.UD_0302_000selectionValidator._groupMap) return $efi.UD_0302_000selectionValidator._groupMap;
        var ot_data = $nst.is_data_ot_data('ZUNIECM_4500');
        $efi.UD_0302_000selectionValidator._groupMap = {};
        $.each(ot_data, function(index, item) {
            $efi.UD_0302_000selectionValidator._groupMap[item['GRONO_EB']] = item['VALUE'].split(',');
        });
        return $efi.UD_0302_000selectionValidator._groupMap;
    };
    $efi.UD_0302_000selectionValidator.getGRONO_EB = function (requestData) {
        var gridObj = $u.gridWrapper.getGrid();
        var selectedJSONData = gridObj.getSELECTEDJSONData();
        if(requestData) selectedJSONData = requestData;
        var selectedEVIKBList = $u.util.uniqueFieldDataList(selectedJSONData, 'EVIKB');
        if(selectedEVIKBList.length === 0) return '';
        var groupMap = $efi.UD_0302_000selectionValidator.getGroupMap();
        for(var x in groupMap) {
            if(!groupMap.hasOwnProperty(x)) continue;
            if($u.util.isSubArray(selectedEVIKBList, groupMap[x])) return x;
        }
    };
    $efi.UD_0302_000selectionValidator.validate = function (requestData) {
        if($efi.UD_0302_000selectionValidator.getGRONO_EB(requestData) != null) return;
        var groupListString = '\n';
        var evikb_txtMap = $efi.UD_0302_000selectionValidator.getEVIKB_TXTMap();
        $.each($efi.UD_0302_000selectionValidator.getGroupMap(), function(key, item) {
            var groupList = [];
            $.each(item, function(index, item2){
                groupList.push(evikb_txtMap[item2]);
            })
            groupListString += groupList.join(', ') + '\n';
        });
        throw $mls.getByCode('M_UD_0302_000_groupSelectValidation') + groupListString;
    };
    $efi.UD_0302_000selectionValidator.validateFI_01_UNIQUE_LIFNR = function () {
        var gridObj = $u.gridWrapper.getGrid();
        var selectedJSONData = gridObj.getSELECTEDJSONData();
        var selectedEVIKBList = $u.util.uniqueFieldDataList(selectedJSONData, 'EVIKB');
        if(selectedEVIKBList.length !== 1 || selectedEVIKBList[0] !== 'FI_01') return;

        var selectedLIFNRList = $u.util.uniqueFieldDataList(selectedJSONData, 'LIFNR');
        if(selectedLIFNRList.length > 1) throw $mls.getByCode('M_UD_0302_000_validateFI_01_UNIQUE_LIFNR');
    };

    $efi.UD_0302EventHandler = {};
    $efi.UD_0302EventHandler.handleDeleteStatement = function(){
        $u.programSetting.appendTemplate('deleteStatementRFC', {defaultValue: 'ZUNIEFI_4104'});
        $u.programSetting.appendTemplate('deleteStatementMultiRFC', {defaultValue: 'ZUNIEFI_4103'});

        var gridObj = $u.gridWrapper.getGrid();

        $u.buttons.addHandler({
            "deleteStatement": function () {
                gridObj.asserts.selectedExactOneRow();
                unidocuConfirm($mls.getByCode('M_deleteConfirm'), function () {
                    var namedServiceId = $u.programSetting.getValue('deleteStatementRFC');
                    var is_data = gridObj.getSELECTEDJSONData()[0];
                    $nst.is_data_nsReturn(namedServiceId, is_data, function () {
                        $u.buttons.triggerFormTableButtonClick();
                    });
                });
            },
            "multiDeleteStatement": function () {
                gridObj.asserts.rowSelected();
                unidocuConfirm($mls.getByCode('M_deleteConfirm'), function () {
                    var namedServiceId = $u.programSetting.getValue('deleteStatementMultiRFC');
                    var it_data = gridObj.getSELECTEDJSONData();
                    $nst.it_data_nsReturn(namedServiceId, it_data, function () {
                        $u.buttons.triggerFormTableButtonClick();
                    });
                });
            }
        });
    };

    $efi.UD_0201ButtonHandler = {};
    $efi.UD_0201ButtonHandler.createGetProgramId = function () {
        var basePrg = $u.page.getBASE_PRG();
        var programId = '';
        if (basePrg === 'uni-e-fi/view/UniDocu001/UD_0201_000') programId = 'UD_0201_001';
        if (basePrg === 'uni-e-fi/view/UniDocu001/UD_0201_010') programId = 'UD_0201_011';
        return programId;
    };
    $efi.UD_0201ButtonHandler.create2GetProgramId = function () {
        var basePrg = $u.page.getBASE_PRG();
        var programId = '';
        if (basePrg === 'uni-e-fi/view/UniDocu001/UD_0201_000') programId = 'UD_0201_001A';
        if (basePrg === 'uni-e-fi/view/UniDocu001/UD_0201_010') programId = 'UD_0201_011A';
        return programId;
    };
    $efi.UD_0201ButtonHandler.create3GetProgramId = function () {
        var basePrg = $u.page.getBASE_PRG();
        var programId = '';
        if (basePrg === 'uni-e-fi/view/UniDocu001/UD_0201_000') programId = 'UD_0201_001B';
        // if (basePrg === 'uni-e-fi/view/UniDocu001/UD_0201_000') programId = 'UD_0201_002';
        if (basePrg === 'uni-e-fi/view/UniDocu001/UD_0201_010') programId = 'UD_0201_011B';
        return programId;
    };

    $efi.UD_0201ButtonHandler.handleCreateStatement = function(){
        $u.programSetting.appendTemplate('createButtonSubId', {
            defaultValue: $efi.UD_0201ButtonHandler.createGetProgramId(),
            description: 'createStatement 버튼 전표 생성 시 이동할 화면 ID #20465'
        });
        $u.programSetting.appendTemplate('create2ButtonSubId', {
            defaultValue: $efi.UD_0201ButtonHandler.create2GetProgramId(),
            description: 'createStatement2 버튼 전표 생성 시 이동할 화면 ID #20465'
        });
        $u.programSetting.appendTemplate('create3ButtonSubId', {
            defaultValue: $efi.UD_0201ButtonHandler.create3GetProgramId(),
            description: 'createStatement3 버튼 전표 생성 시 이동할 화면 ID #20465'
        });
    };

    $efi.popup = {};
    $efi.popup.openCardBillUD_0398_000 = function (url) {
        return $u.popup.openPopup(url, '_cardBill', 400, 450);
    };
    $efi.popup.openTaxInvoiceUD_0398_000 = function (url) {
        return $u.popup.openPopup(url, '_taxInvoice', 800, 500);
    };
    $efi.popup.openStatementViewWithParamMap = function (paramMap) {
        return $u.popup.openPopup('/biz/popup/StatementPreview/view.do?' + $.param(paramMap), 'statementAfterView', 1200, 400);
    };
    $efi.popup.openUD_0398_000 = function (jsonData) {
        return $u.popup.openByProgramId('UD_0398_000', 1000, 400, jsonData);
    };
    $efi.popup.openUD_0201_052 = function (data) {
        return $u.popup.openByProgramId('UD_0201_052', 900, 400, data);
    };
    $efi.popup.openUD_0201_053 = function () {
        return $u.popup.openByProgramId('UD_0201_053', 1100, 700);
    };
    $efi.popup.openUD_0201_054 = function (data) {
        return $u.popup.openByProgramId('UD_0201_054', 1100, 700, data);
    };
    $efi.popup.openUD_0601_070 = function () {
        return $u.popup.openByProgramId('UD_0601_070', 1280, 800);
    };
    $efi.popup.showEvidence = function (eviSeq) {
        return $u.popup.postOpen('/biz/popup/ShowEvidence/view.do', '_showEvidence', 700, 700, {EVI_SEQ: Base64.encode(eviSeq)});
    };
    $efi.popup.openCardBill = function (crdSeq) {
        return $u.popup.openPopup('/biz/popup/CardBill/view.do?CRD_SEQ=' + Base64.encode(crdSeq), '_cardBill', 400, 450);
    };
    $efi.popup.openTaxInvoice = function (invSeq) {
        return $u.popup.openPopup('/biz/popup/TaxInvoice/view.do?INV_SEQ=' + Base64.encode(invSeq), '_taxInvoice', 800, 500);
    };
    $efi.popup.openEVIKB = function (url) {
        return $u.popup.openPopup(url, 'evikb', 600, 700)
    };
    $efi.precisionRoundByWAERS = function (number, waers) {
        var precision = $u.unidocuCurrency.getPrecision(waers);
        var factor = Math.pow(10, precision);
        return Math.round(number * factor) / factor;
    };
    $efi.reMapCardBillData = function (data) {
        var cardNo = data['CARDNO'];
        data['CARDNO_TXT'] = $u.util.formatString('{0} - {1} - **** - {2}', [cardNo.substr(0, 4), cardNo.substr(4, 4), cardNo.substr(12, 4)]);
        data['APPR_TYPE_TXT'] = data['APPR_TYPE'] === '0' ? $mls.getByCode('M_cardBillCancel') : $mls.getByCode('M_cardBillApprove');
        data['TOTAL'] = $.number(data['TOTAL']);
        data['AMOUNT'] = $.number(data['AMOUNT']);
        data['TAX'] = $.number(data['TAX']);
        data['TIPS'] = $.number(data['TIPS']);
        data['APPR_TYPE_CLASS'] = data['APPR_TYPE'] !== 'A' ? 'column' : '';
    };
    $efi.toMustacheViewZUNIEFI_2001 = function (tableReturns) {
        var ot_data = tableReturns['OT_DATA'];
        var ot_data2 = tableReturns['OT_DATA2'];
        if (ot_data.length === 0) throw 'evidence data does not exists [ZUNIEFI_2001]';
        var first_ot_data = ot_data[0];

        var params = {};
        params['STATUS_SUBSTR_0_1_IS_' + first_ot_data['STATUS'].substr(0, 1)] = true;
        params['TYPE_CODE_SUBSTR_2_2_IS_' + first_ot_data['TYPE_CODE'].substr(2, 2)] = true;
        params['TYPE_CODE_SUBSTR_0_2_IS_03_OR_04'] = /03|04/.test(first_ot_data['TYPE_CODE'].substr(0, 2));
        params['TYPE_CODE_IS_' + first_ot_data['TYPE_CODE']] = true;
        params['FORMATTED_ISSUE_ID'] = first_ot_data['ISSUE_ID'].substr(0, 8) + '-' + first_ot_data['ISSUE_ID'].substr(8, 8) + '-' + first_ot_data['ISSUE_ID'].substr(16, 8);

        if (first_ot_data['ISSUE_ID_OLD']) { // todo OLD_ISSUEID 없음
            params['FORMATTED_ISSUE_ID_OLD'] = first_ot_data['ISSUE_ID_OLD'].substr(0, 8) + '-' + first_ot_data['ISSUE_ID_OLD'].substr(8, 8) + '-' + first_ot_data['ISSUE_ID_OLD'].substr(16, 8);
        }
        params['FORMATTED_ISSUE_DATE'] = $u.util.date.getDateAsUserDateFormat(first_ot_data['ISSUE_DATE'].replace(/-/g, ''));

        params['AMEND_CODE_IS_' + first_ot_data['AMEND_CODE']] = true;
        params['PURP_CODE_IS_' + first_ot_data['PURP_CODE']] = true;
        params['FORMATTED_SU_ID'] = first_ot_data['SU_ID'].substr(0, 3) + '-' + first_ot_data['SU_ID'].substr(3, 2) + '-' + first_ot_data['SU_ID'].substr(5, 5);
        params['FORMATTED_BP_ID'] = first_ot_data['BP_ID'].substr(0, 3) + '-' + first_ot_data['BP_ID'].substr(3, 2) + '-' + first_ot_data['BP_ID'].substr(5, 5);
        params['FORMATTED_IP_ID'] = first_ot_data['IP_ID'].substr(0, 3) + '-' + first_ot_data['IP_ID'].substr(3, 2) + '-' + first_ot_data['IP_ID'].substr(5, 5);
        params['FORMATTED_CHARGETOTAL'] = $.number(first_ot_data['CHARGETOTAL']);
        params['FORMATTED_GRANDTOTAL'] = $.number(first_ot_data['GRANDTOTAL']);
        params['FORMATTED_TAXTOTAL'] = $.number(first_ot_data['TAXTOTAL']);

        $.each(ot_data2, function () {
            this['GOOD_DATE'] = this['GOOD_DATE'].replace(/-/g, '');
            this['GOOD_DATE_SUBSTR_4_2'] = this['GOOD_DATE'].substr(4, 2);
            this['GOOD_DATE_SUBSTR_6_2'] = this['GOOD_DATE'].substr(6, 2);
            this['FORMATTED_GOOD_TAXAMOUNT'] = $.number(this['GOOD_TAXAMOUNT']);
            this['FORMATTED_GOOD_INVAMOUNT'] = $.number(this['GOOD_INVAMOUNT']);
            this['FORMATTED_GOOD_QUAN'] = $.number(this['GOOD_QUAN'], 2);
            this['FORMATTED_GOOD_UNIAMOUNT'] = $.number(this['GOOD_UNIAMOUNT'], 2);

            if (/00$/.test(this['FORMATTED_GOOD_QUAN'])) this['FORMATTED_GOOD_QUAN'] = $.number(this['GOOD_QUAN']);
            if (this['FORMATTED_GOOD_QUAN'] === '0') this['FORMATTED_GOOD_QUAN'] = '';
            if (/00$/.test(this['FORMATTED_GOOD_UNIAMOUNT'])) this['FORMATTED_GOOD_UNIAMOUNT'] = $.number(this['GOOD_UNIAMOUNT']);
            if (this['FORMATTED_GOOD_UNIAMOUNT'] === '0') this['FORMATTED_GOOD_UNIAMOUNT'] = '';
        });

        // 2byte 문자열 공백 제거
        $.each(first_ot_data, function(key, value){
            if(/　/.test(value)) first_ot_data[key] = value.replace(/　+/g, ' ');
        });

        $.each(ot_data2, function(index, item){
            $.each(item, function(key, value){
                if(/　/.test(value)) item[key] = value.replace(/　+/g, ' ');
            });
        });

        return $.extend({}, params, {
            first_ot_data: first_ot_data,
            ot_data2: ot_data2
        });
    };

    $efi.OrgTree = function ($el, events) {
        var treeData = [];

        var orgTree = $u.UniJsTree($el, {
            load_node: events.load_node,
            select_node: events.select_node
        });
        orgTree._setTreeData = orgTree.setTreeData;
        orgTree.isDeptNode = function () {
            return orgTree.hasSelectedNode() && orgTree.getSelectedData()['ID'] == null;
        };
        orgTree.hasSelectedNode = function () {
            return orgTree.getSelectedData() != null;
        };
        orgTree.isUserNode = function () {
            return orgTree.hasSelectedNode() && orgTree.getSelectedData()['ID'] != null;
        };
        orgTree.initOrgData = function () {
            $nst.is_data_tableReturns('ZUNIEWF_1032', null, function (tableReturns) {
                var ot_data = tableReturns['OT_DATA'];
                var ot_user = tableReturns['OT_USER'];

                // 사용자 ID 와 부서코드가 같은 경우 처리
                // 부서코드 post fix 로 _dept 를 붙여 사용자 아이디와 동일한 데이터가 없도록 적용
                $.each(ot_data, function (index, item) {
                    if (item['HEAD_KEY'] === '') item['parent'] = '#';
                    else item['parent'] = item['HEAD_KEY'] + '_dept';

                    item['id'] = item['NODE_KEY'] + '_dept';
                    item['text'] = item['NODE_KEY_TXT'];
                });
                $.each(ot_user, function (index, item) {
                    item['parent'] = item['NODE_KEY'] + '_dept';
                    item['id'] = item['ID'];
                    item['text'] = item['SNAME'];
                });
                treeData = ot_user.concat(ot_data);
                orgTree._setTreeData(treeData);
            });
        };

        return orgTree;
    };
    $efi.setTreeModeBELNR_ZUONR = function (_gridObj, gridData) {
        _gridObj.clearGridData();
        gridData = gridData ? gridData : _gridObj.getJSONData();
        _gridObj.setTreeData('BELNR', gridData, 'GROUP_KEY', 'ZUONR', '*');
        _gridObj.setSortEnable(false);
        _gridObj.enableTreeClickEvent(false);
        _gridObj.expandAll();
    };
    $efi.bindZUNIEFI_5003Handler = function () {
        if ($u.get('AMT') && $u.get('HKONT_S')) {
            $u.get('HKONT_S').$el.change(function () {
                var importParam = {PROGRAM_ID: $u.page.getPROGRAM_ID(), HKONT: $u.get('HKONT_S').getValue()};
                $nst.is_data_os_data('ZUNIEFI_5003', importParam, function (os_data) {
                    $u.get('AMT').setValue(os_data['AMOUNT']);
                });
            });
        }
    };
    $efi.bindCARDNO_Handler = function (tableId){
        if(!tableId) tableId = 'search-condition';
        $u.util.handleF4QueryParamsOnTargetChange(tableId, 'CARDNO', ['PERNR']); // , 'DATE'
    };

    $efi.pdf = {};
    $efi.pdf.downloadMultiStatementZUNIDU_6202 = function (paramMap) {
        $u.navigate('/unidocu/efi/pdf/downloadMultiStatementZUNIDU_6202', paramMap);
    };
    $efi.pdf.downloadSingleStatementZUNIDU_6203 = function (paramMap) {
        $u.navigate('/unidocu/efi/pdf/downloadSingleStatementZUNIDU_6203', paramMap);
    };
    $efi.pdf.downloadFromZUNIEFI_4108 = function (paramMap) {
        $u.navigate('/unidocu/efi/pdf/downloadFromZUNIEFI_4108', paramMap);
    };

    $efi.vendorInfoAddedDataHandler = {};
    $efi.vendorInfoAddedDataHandler.handleByProgramId = function (evidencePROGRAM_ID, selectedData, callback) {
        if (!/^UD_(0201_010|0201_016)$/.test(evidencePROGRAM_ID)) return $efi.vendorInfoAddedDataHandler.handleGeneralCase(selectedData, callback);
        return $efi.vendorInfoAddedDataHandler.handleUD_0201_010(selectedData, evidencePROGRAM_ID, callback);
    };
    $efi.vendorInfoAddedDataHandler.handleGeneralCase = function (selectedData, callback) {
        $nst.is_data_nsReturn('ZUNIEFI_4001', selectedData, function (nsReturn) {
            var ot_data = nsReturn.getTableReturn('OT_DATA');
            if (ot_data.length === 0) throw 'vendor info does not exists. [ZUNIEFI_4001]';
            if (ot_data.length !== 1) throw $u.util.formatString('more than two vendor info exists. vendor info: {0} [ZUNIEFI_4001]', [ot_data.length]);
            callback($.extend({}, selectedData, ot_data[0]));
        });
    };
    $efi.vendorInfoAddedDataHandler.handleUD_0201_010 = function (selectedData, evidencePROGRAM_ID, callback) {
        var namedServiceId = 'ZUNIEFI_4001';
        selectedData['ID'] = selectedData['SU_ID'];

        if (evidencePROGRAM_ID === 'UD_0201_016') {
            namedServiceId = 'ZUNIEFI_4004';
            selectedData['ID'] = selectedData['IP_ID'];
        }
        $nst.is_data_nsReturn(namedServiceId, selectedData, function (nsReturn) {
            var ot_data = nsReturn.getTableReturn('OT_DATA');
            if (ot_data.length === 0) throw $u.util.formatString('vendor info does not exists. [{0}]', [namedServiceId]);
            if(ot_data[0]['BUPLA'] === '') ot_data[0]['BUPLA'] = selectedData['BUPLA'];
            if (ot_data.length === 1) return callback($.extend({}, selectedData, ot_data[0]));

            var popupKey = 'LIFNRM';
            var detailSearchKey = 'STCD2';
            var detailSearchValue = selectedData['SU_ID'];

            if (evidencePROGRAM_ID === 'UD_0201_016') {
                popupKey = 'KUNNR';
                detailSearchValue = selectedData['IP_ID'];
            }
            $u.dialog.f4CodeDialog.open({
                popupKey: popupKey,
                readonlyInfo: {
                    key: detailSearchKey,
                    value: detailSearchValue
                },
                codePopupCallBack: function (code, text, jsonObj) {
                    var selectedVendorInfo;
                    for (var i = 0, len = ot_data.length; i < len; i++) if (ot_data[i].LIFNR === jsonObj['LIFNR']) selectedVendorInfo = ot_data[i];
                    if (!selectedVendorInfo) throw 'Can not find vendor info with selected code. code: ' + code;
                    callback($.extend({}, selectedData, selectedVendorInfo));
                }
            });
        });
    };

    $efi.cachedHKONTDataMap = {};
    $efi.getCachedHKONTData = function () {
        var programId = $u.page.getPROGRAM_ID();
        if ($efi.cachedHKONTDataMap[programId]) return $efi.cachedHKONTDataMap[programId];
        $efi.cachedHKONTDataMap[programId] = $u.f4Data.getCodeDataWithParams('HKONT', {});
        return $efi.cachedHKONTDataMap[programId];
    };
    $efi.getCachedHKONTCodeMap = function (targetColumn) {
        var map = {};
        $.each($efi.getCachedHKONTData(), function (index, item) {
            map[item['HKONT']] = item[targetColumn];
        });
        return map;
    };

    $efi.handleEVIKBIconVisible = function(){
        var gridObj = $u.gridWrapper.getGrid();
        var loggedInUser = staticProperties['user']['PERNR'];
        if (gridObj.getGridHeader('EVIKB_@')) {
            gridObj.loopRowIndex(function(index){
                var item = gridObj.getJSONDataByRowIndex(index);
                if (!item['CRD_SEQ'] && !item['INV_SEQ'] && !item['EVI_SEQ']) gridObj.hideImage('EVIKB_@', index);
            });
        }
        if (gridObj.getGridHeader('EVIKB_ADD')) {
            gridObj.loopRowIndex(function(index){
                var item = gridObj.getJSONDataByRowIndex(index);
                if (item['PERNR'] !== loggedInUser) return gridObj.hideImage('EVIKB_ADD', index);
                if (!item['GRONO']) return;
                if (item['STATS'] !== '1') return gridObj.hideImage('EVIKB_ADD', index);
            });
        }
    };

    $efi.handleTYPE_CODE_0104_0204 = function(type_code){
        var gridObj = $u.gridWrapper.getGrid();

        if (/^0104|0204$/.test(type_code)) {
            var wmwst_read_only = Math.abs($u.get('WMWST_READ_ONLY').getValue());
            var chargetotal = Math.abs($u.get('CHARGETOTAL').getValue());

            $u.get('WRBTR').setValue(wmwst_read_only);
            $u.get('WMWST').setValue(0);

            gridObj.$V('WRBTR', 0, wmwst_read_only);
            gridObj.$V('FWBAS', 0, chargetotal);

            $u.get('difference_amount').setValue(0);
            $u.get('debitSum').setValue(wmwst_read_only);
            $u.get('creditSum').setValue(wmwst_read_only);

            $.each(['WRBTR', 'WMWST', 'MWSKZ'], function(index, item){
                $u.get(item).setReadOnly(true);
            });

            $.each(['SHKZG', 'WRBTR', 'MWSKZ', 'FWBAS'], function(index, item){
                gridObj.makeColumnReadOnly(item);
            });

            $('#uni-grid_top_buttons button').hide();
        }
    };

    $efi.setMWSKZ_By_HKONT_F4 = function (columnKey, rowIndex, jsonObj) {
        var gridObj = $u.gridWrapper.getGrid();
        var $u_MWSKZ = $u.get('MWSKZ');

        function callFunction() {
            if (jsonObj['MWSKZ']) {
                gridObj.$V('MWSKZ', rowIndex, jsonObj['MWSKZ']);
                $u_MWSKZ.setValue(jsonObj['MWSKZ']);
            } else {
                gridObj.$V('MWSKZ', rowIndex, $u.page.getPageParams()['MWSKZ']);
                $u_MWSKZ.setValue($u.page.getPageParams()['MWSKZ']);
            }

            var mwskzData = gridObj.getJSONData().filter(function (value) {
                return $efi.f4.getFLAG_by_MWSKZ(value['MWSKZ']) === 'X' && $efi.mwskzNonDeduction.isNonDeduction(value['MWSKZ']);
            });

            if (mwskzData.length !== 0) $u.get('MWSKZ').setValue(mwskzData[0]['MWSKZ']);
            $u_MWSKZ.$el.change();
        }
        if ($u_MWSKZ && jsonObj) callFunction();
    };
});