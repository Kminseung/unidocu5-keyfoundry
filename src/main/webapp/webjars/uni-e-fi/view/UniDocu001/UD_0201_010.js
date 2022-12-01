/**
 * UD_0201_010    정매입 세금계산서 전표등록 - 내역조회
 * UD_0201_015    정매입 세금계산서 전표등록 - 내역조회
 * UD_0201_016    매출 세금계산서 전표등록 - 내역조회
 * @module uni-e-fi/view/UniDocu001/UD_0201_010
 */
define(function () {
    return function () {
        $u.programSetting.appendTemplate('deleteStatementFuncName', {
            defaultValue: 'ZUNIEFI_2004',
            description: 'deleteStatement의 FuncName #20465'
        });
        $u.programSetting.appendTemplate('assignPersonFuncName', {
            defaultValue: 'ZUNIEFI_2002',
            description: 'assignPerson의 FuncName #20465'
        });
        $u.programSetting.appendTemplate('deleteHistoryRecoveryFuncName', {
            defaultValue: 'ZUNIEFI_2004',
            description: 'deleteHistoryRecovery의 FuncName #20465'
        });
        var gridObj = $u.gridWrapper.getGrid();
        var $u_FLAG = $u.get('search-condition', 'FLAG');
        var $u_R001 = $u.get('search-condition', 'R001');
        gridObj.onCellClick(function (columnKey, rowIndex) {
            if (columnKey !== 'ISSUE_ID') return;
            $efi.popup.openTaxInvoice(gridObj.$V('INV_SEQ', rowIndex));
        });
        $efi.UD_0201ButtonHandler.handleCreateStatement();

        var assignPersonFuncName = $u.programSetting.getValue('assignPersonFuncName');
        var deleteStatementFuncName = $u.programSetting.getValue('deleteStatementFuncName');
        var deleteHistoryRecoveryFuncName = $u.programSetting.getValue('deleteHistoryRecoveryFuncName');

        $u.buttons.addHandler({
            "createStatement": function () {
                $u.buttons.runCustomHandler('createStatement', 'createStatement');
            },
            "createStatement2": function () {
                $u.buttons.runCustomHandler('createStatement', 'createStatement2');
            },
            "createStatement3": function () {
                $u.buttons.runCustomHandler('createStatement', 'createStatement3');
            },
            "assignPerson": function () {
                gridObj.asserts.selectedExactOneRow();
                $u.buttons.runCustomHandler('openPersonSelectDialogWithCommentDialog', function(pernr, xmemo){
                    var jsonData = $.extend({}, gridObj.getSELECTEDJSONData()[0], {PERNR: pernr, XMEMO: xmemo});
                    $nst.is_data_returnMessage(assignPersonFuncName, jsonData, function (message) {
                        unidocuAlert(message, function () {
                            $u.buttons.triggerFormTableButtonClick();
                        });
                    });
                });
            },
            "assignPersonMulti": function () {
                gridObj.asserts.rowSelected();
                $u.buttons.runCustomHandler('openPersonSelectDialogWithCommentDialog', function(pernr, xmemo){
                    $nst.is_data_it_data_returnMessage(assignPersonFuncName, {PERNR: pernr, XMEMO: xmemo}, gridObj.getSELECTEDJSONData(), function (message) {
                        unidocuAlert(message, function () {
                            $u.buttons.triggerFormTableButtonClick();
                        });
                    });
                });
            },
            "createInvoiceStatement": function () {
                gridObj.asserts.selectedExactOneRow();
                var evidencePROGRAM_ID = 'UD_0201_010';
                if ($u.page.getPROGRAM_ID() === 'UD_0201_016') evidencePROGRAM_ID = 'UD_0201_016';
                $efi.vendorInfoAddedDataHandler.handleByProgramId(evidencePROGRAM_ID, gridObj.getSELECTEDJSONData()[0], function (vendorInfo) {
                    $u.navigateByProgramId('UD_0201_013', $.extend({}, gridObj.getSELECTEDJSONData()[0], vendorInfo));
                });
            },
            "deleteStatement": function () {
                gridObj.asserts.selectedExactOneRow();
                $u.dialog.singleTextInputDialog.open($mls.getByCode('M_UD_0201_010_deleteStatementDialog'), function (xmemo) {
                    var jsonData = $.extend({}, gridObj.getSELECTEDJSONData()[0], {}, {XMEMO: xmemo, I_FLAG:'X'});
                    $nst.is_data_returnMessage(deleteStatementFuncName, jsonData, function (message) {
                        unidocuAlert(message, function () {
                            $u.buttons.triggerFormTableButtonClick();
                        });
                    });
                });
            },
            "deleteStatementMulti": function () {
                gridObj.asserts.rowSelected();
                $u.dialog.singleTextInputDialog.open($mls.getByCode('M_UD_0201_010_deleteStatementDialog'), function (xmemo) {
                    $nst.is_data_it_data_returnMessage(deleteStatementFuncName, {XMEMO: xmemo, I_FLAG: 'X'}, gridObj.getSELECTEDJSONData(), function (message) {
                        unidocuAlert(message, function () {
                            $u.buttons.triggerFormTableButtonClick();
                        });
                    });
                });
            },
            "unCheckAll": function () {
                var gridObj = $u.gridWrapper.getGrid();
                var rowLen = gridObj.getRowCount();
                for (var i = 0; i < rowLen; i++) gridObj.$V('SELECTED', i, '0');
            },
            "checkAll": function () {
                var gridObj = $u.gridWrapper.getGrid();
                var rowLen = gridObj.getRowCount();
                if (rowLen === 0) throw  $mls.getByCode('M_noDataForSelect');

                $.each(gridObj.getJSONData(), function (index, data) {
                    if (data['LIFNR'] !== '') gridObj.$V('SELECTED', index, '1');
                });
            },
            "deleteHistoryRecovery": function () {
                gridObj.asserts.selectedExactOneRow();
                var jsonData = $.extend({}, gridObj.getSELECTEDJSONData()[0], {I_FLAG: ''});
                $nst.is_data_returnMessage(deleteHistoryRecoveryFuncName, jsonData, function (message) {
                    unidocuAlert(message, function () {
                        $u.buttons.triggerFormTableButtonClick();
                    });
                });
            },
            "deleteHistoryRecoveryMulti": function () {
                gridObj.asserts.rowSelected();
                $nst.is_data_it_data_returnMessage(deleteHistoryRecoveryFuncName, {I_FLAG: ''}, gridObj.getSELECTEDJSONData(), function (message) {
                    unidocuAlert(message, function () {
                        $u.buttons.triggerFormTableButtonClick();
                    });
                });
            },
            "pick-files": function(){

            }
        });

        $u.buttons.addCustomHandler({
            createStatement: function (buttonId) {
                gridObj.asserts.selectedExactOneRow();
                if (gridObj.$V('USE_DOC', gridObj.$F('1', 'SELECTED')[0]) === 'X') throw $mls.getByCode('M_cannotCreateStatmentWithFinishedDoc');
                var subId = '';
                if(buttonId === 'createStatement') {
                    subId = $u.programSetting.getValue('createButtonSubId');
                }
                if(buttonId === 'createStatement2') {
                    subId = $u.programSetting.getValue('create2ButtonSubId');
                }
                if(buttonId === 'createStatement3') {
                    subId = $u.programSetting.getValue('create3ButtonSubId');
                }
                var firstGridRow = gridObj.getSELECTEDJSONData()[0];
                if (subId === 'UD_0201_011A' && /^0104|0204$/.test(firstGridRow['TYPE_CODE'])) throw $mls.getByCode('M_UD_0201_010_canNotCreateStatementOfImportTaxInvoice');
                firstGridRow['BUTTON_ID'] = subId; // ZUNIEFI_4001, ZUNIEFI_4004 입력 값으로 button subId 전달.
                var evidencePROGRAM_ID = 'UD_0201_010';
                if ($u.page.getPROGRAM_ID() === 'UD_0201_016') evidencePROGRAM_ID = 'UD_0201_016';
                $efi.vendorInfoAddedDataHandler.handleByProgramId(evidencePROGRAM_ID, firstGridRow, function (vendorInfo) {
                    var nextPROGRAM_ID;
                    nextPROGRAM_ID = 'UD_0201_011';
                    if ($u.page.getPROGRAM_ID() === 'UD_0201_016') nextPROGRAM_ID = 'UD_0201_012';
                    if (subId) nextPROGRAM_ID = subId;
                    if (firstGridRow['PROGRAM_ID']) nextPROGRAM_ID = firstGridRow['PROGRAM_ID'];
                    $u.navigateByProgramId(nextPROGRAM_ID, $.extend({}, firstGridRow, vendorInfo));
                });
            },
            openPersonSelectDialogWithCommentDialog: function(callback){
                $u.dialog.f4CodeDialog.open({
                    popupKey: 'PERNR',
                    codePopupCallBack: function (pernr) {
                        $u.dialog.singleTextInputDialog.open($mls.getByCode('M_UD_0201_010_assignPersonDialog'), function confirmCallBack(xmemo) {
                            callback(pernr, xmemo);
                        });
                    }
                });
            }
        });

        return function () {
            $u.customizeTemplateStyle(['div.moxie-shim.moxie-shim-html5 {display: none;}']);
            var $pickFiles = $('<button id="pick-files" class="unidocu-button" style="display: none;">xml upload</button>');
            $('#uni-buttons').prepend($pickFiles);
            if (staticProperties.zuniecm_0000['AP_XML'] === 'X' && !$u.isPopupView()) $pickFiles.show();

            var $deferred;

            $u.util.singleFileUploader({
                url: $u.getUrlFromRoot('/SingleFileUpload/asString.do'),
                buttonEl: $pickFiles.get(0),
                filters: {max_file_size: '10mb', mime_types: [{title: "xml", extensions: "xml"}]},
                FileUploaded: function (up, file, info) {
                    var response = JSON.parse(info['response']);
                    var importParam = {XML: response['contents'], BUKRS: staticProperties.user['BUKRS']};
                    $deferred = $.Deferred();
                    $nst.is_data_nsReturn('ZDTV3INF_AP_XML_UPLOAD', importParam,$deferred.resolve);
                },
                UploadComplete: function () {
                    $deferred.done(function (nsReturn) {
                        var os_msgv1 = nsReturn.getExportMap('OS_RETURN')['MSGV1'];
                        staticProperties.user['ROLE'].indexOf('FI_2120') === -1 ? $u.get('FLAG').setValue('P') : $u.get('FLAG').setValue('S');
                        $u.get('ISSUE_ID').setValue(os_msgv1);
                        $u.buttons.triggerFormTableButtonClick();
                    });
                }
            });

            if ($u_FLAG) {
                $u_FLAG.$el.change(function () {
                    var flag = $u.get('FLAG').getValue();
                    var $ipEmail = $u.get('IP_EMAIL');
                    if (!$ipEmail) return $u.buttons.triggerFormTableButtonClick();
                    if(/^[PKN]$/.test(flag)) {
                        $u.get('IP_EMAIL').setReadOnly(true);
                        $u.get('IP_EMAIL').setEmptyValue();
                    } else if(/^[SU]$/.test(flag))
                        $u.get('IP_EMAIL').setReadOnly(false);
                }).change();
            }

            var $deleteHistoryRecoveryGroup = $('#deleteHistoryRecovery,#deleteHistoryRecoveryMulti');
            var $createStatementGroup = $('#createStatement, #createStatement2, #createStatement3, #assignPerson, #assignPersonMulti, #deleteStatement, #deleteStatementMulti');

            $deleteHistoryRecoveryGroup.hide();
            if ($u_R001) {
                $u_R001.$el.change(function () {
                    if ($u_R001.getValue() === 'A') { // 상태: 정상 A, 삭제 B
                        $deleteHistoryRecoveryGroup.hide();
                        $createStatementGroup.show();
                        if (staticProperties.user['ROLE'].indexOf('FI_2120') === -1) {
                            $('#unidocu-td-FLAG label:nth-child(2)').hide();
                            $('#deleteStatementMulti').hide();
                        }
                        if (staticProperties.zuniecm_0000['AP_XML'] === 'X' && !$u.isPopupView()) $pickFiles.show();
                    }
                    if ($u_R001.getValue() === 'B') {
                        $deleteHistoryRecoveryGroup.show();
                        $createStatementGroup.hide();
                        $pickFiles.hide();
                    }
                    $u.buttons.triggerFormTableButtonClick();
                }).change();
            }
        }
    }
});