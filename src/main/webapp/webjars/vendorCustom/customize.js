/**
 * for vendor customize
 * @module vendorCustom/customize
 */
define([
    'stache!vendorCustom/keyfoundry/mustache/embedStatementZUNIEFI_4207Template',
    'stache!vendorCustom/keyfoundry/mustache/embedStatementZUNIEFI_6732_Keyfoundry_domesticTemplate',
    'stache!vendorCustom/keyfoundry/mustache/embedStatementZUNIEFI_6732_Keyfoundry_overseeTemplate',
    'uni-e-fi/$efi',
    'uni-e-approval/$ewf'
], function (
    embedStatementZUNIEFI_4207Template,
    embedStatementZUNIEFI_6732_Keyfoundry_domesticTemplate,
    embedStatementZUNIEFI_6732_Keyfoundry_overseeTemplate
    ) {
    return function () {
        var _renderUIComponents = $u.renderUIComponents;
        $u.renderUIComponents = function ($scope, subGroup, customParam) {
            _renderUIComponents($scope, subGroup, customParam);
            $efi.currencyEventAfterRender($scope);
        };

        $ewf.mustache.embedStatementZUNIEFI_4207Template = embedStatementZUNIEFI_4207Template;
        $ewf.mustache.embedStatementZUNIEFI_6732_Keyfoundry_domesticTemplate = embedStatementZUNIEFI_6732_Keyfoundry_domesticTemplate;
        $ewf.mustache.embedStatementZUNIEFI_6732_Keyfoundry_overseeTemplate = embedStatementZUNIEFI_6732_Keyfoundry_overseeTemplate;

        $efi.createStatement.bindEvent.triggerZTERM_BUDATChange = function () {
            if ($u.get('ZTERM')) $efi.createStatement.bindEvent.triggerChange('ZTERM');
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

            if($u.page.getPROGRAM_ID() === 'UD_0201_011') {
                if($u.get('CHARGETOTAL') && $u.page.getPageParams()['MWSKZ'] === '') {
                    gridObj.$V('WRBTR', 0, $u.get('CHARGETOTAL').getValue());
                }
            }

            $efi.createStatementCommon.changeWRBTRExpenseInitial();
            if (!$u.get('WMWST') && !$u.get('MWSKZ')) $efi.createStatementCommon.changeWRBTRExpense();

            if (!$efi.createStatementCommon.hasFormVAT() && $u.page.getVIEW_NAME() === 'uni-e-fi/view/UD_0201_001') {
                $u.get('WMWST').setValue('0');
                $efi.createStatementCommon.changeWRBTRExpense('WRBTR');
            }
        };

        /**
         * o_url : 한글 인코딩이 안되어서 리턴됨
         */
        $efi.UD_0302_000EventHandler.openApprovalPopup = function (o_url) {
            try {
                var url = $keyfoundry.encodingUTF8(o_url);
                var popup = $ewf.popup.openApprovalDetail(url);
                $efi.UD_0302_000EventHandler.handleApprovalPopupClose(popup);
            } catch (e) {
                if (/액세스가 거부되었습니다/.test(e.message)) throw $mls.getByCode('M_UD_0302_000_approvalPopupAccessError');
                else throw e;
            }
        };

        /**
         * 그룹번호 취소 버튼 : 선택된 내역 그룹번호 검증 로직 추가
         */
        $efi.UD_0302_000EventHandler.cancelGroup = function () {
            var gridObj = $u.gridWrapper.getGrid();
            gridObj.asserts.rowSelected();
            if (gridObj.getSELECTEDJSONData()[0]['GRONO'] === '') throw $mls.getByCode('M_UD_0302_000_cancelGroupGRONOEmpty');
            if (checkAllGRONO()) throw '동일한 그룹번호만 선택 가능합니다.';
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

            function checkAllGRONO() {
                var checkData = gridObj.getSELECTEDJSONData()[0];
                return gridObj.getSELECTEDJSONData().some(function(rowData) {
                    return checkData['GRONO'] !== rowData['GRONO'];
                });
            }
        };

        $ewf.handleChangeLine = function(){
            var template = '';
            template += '<table>';
            template += '    <tr>';
            template += '        <td id="unidocu-td-changeLine-wrapper"></td>';
            template += '        <td id="change-line-item-wrapper" style="min-width: 60px; max-width: 60px; width: 60px;;"></td>';
            template += '    </tr>';
            template += '</table>';

            $u.programSetting.appendTemplate('hideChangeLineModifyButton', {
                description: '결재라인 변경 수정 버튼 숨김',
                defaultValue: 'false'
            });
            $u.programSetting.appendTemplate('hideChangeLine', {
                description: '결재라인 숨김여부',
                defaultValue: 'false'
            });
            var $uniFormTable1 = $('#uni-form-table1');
            if($u.programSetting.getValue('hideChangeLine') === 'true') {
                $uniFormTable1.hide();
                return;
            }
            var $deferred = $.Deferred();
            var $template = $(template);
            var $changeLineItem = $('<button class="unidocu-button" id="change-line-item"></button>').text($mls.getByCode('M_change'));
            $template.find('#unidocu-td-changeLine-wrapper').append($u.get('uni-form-table1', 'changeLine').$el);
            $template.find('#change-line-item-wrapper').append($changeLineItem);
            $uniFormTable1.find('#unidocu-td-changeLine').append($template);
            $uniFormTable1.show();

            if($u.programSetting.getValue('hideChangeLineModifyButton') === 'true') $changeLineItem.hide();

            $changeLineItem.click(function(){
                $ewf.dialog.modifyApprovalDialog.open({
                    "mode": 'directChange',
                    "tableReturns": $ewf.changeLine.getTableReturns(),
                    "directChangeConfirmCallback": function(wf_secur, tableReturns){
                        $ewf.changeLine.setWF_SECUR(wf_secur);
                        $ewf.changeLine.setTableReturns(tableReturns);
                        $('#approval-line-wrapper').empty().append($ewf.getApprovalLineEl({WF_SECUR: wf_secur}, staticProperties.user, tableReturns));
                    }
                });
                $('.jstree-default').css('max-height','370px')
            });
            var zuniewfParams = $.extend({}, $u.page.getPageParams());
            if(!zuniewfParams['WF_GB']) $.extend(zuniewfParams, {WF_GB: $ewf.draftUtil.getWF_GB() });
            if(staticProperties.user) zuniewfParams['BUKRS'] = staticProperties.user['IS_KEY_BUKRS'];

            $nst.is_data_nsReturn('ZUNIEWF_4100', zuniewfParams, function(nsReturn){
                var ot_data = nsReturn.getTableReturn('OT_DATA');
                var changeFlag = nsReturn.getStringReturn('O_CHANGE_FLAG');
                if(changeFlag === 'X') {
                    $u.get('uni-form-table1', 'changeLine').setReadOnly(true);
                    $('#change-line-item').hide();
                }
                $ewf.changeLine.initialize(ot_data);
                function onChange() {
                    if($u.page.getPROGRAM_ID() === 'DRAFT_0011') return; // 회계전표 결재 문서 조회.
                    var selectedOTDATA = $ewf.changeLine.getSelectedOT_DATA();
                    if(selectedOTDATA === null) selectedOTDATA = zuniewfParams;
                    $nst.is_data_tableReturns('ZUNIEWF_4101', selectedOTDATA, function(tableReturns) {
                        $ewf.changeLine.setTableReturns(tableReturns);
                        $('#approval-line-wrapper').empty().append($ewf.getApprovalLineEl({}, staticProperties.user, tableReturns));
                        $deferred.resolve();
                    }, function() {
                        $('#approval-line-wrapper').empty();
                        $ewf.changeLine.setTableReturns(null);
                        $deferred.resolve();
                    });
                }
                $u.get('uni-form-table1', 'changeLine').$el.change(onChange).change();
            }, function(){
                $ewf.changeLine.initialize([]);
                $deferred.resolve();
            });
            return $deferred;
        };

        $ewf.getApprovalLineEl = function (header, requester, tableReturns, zuniewf_4323_ot_data) {
            function handleRequester(requester) {
                if (!requester['WF_LINE_LEV']) requester['WF_LINE_LEV'] = 0;
                if (requester['ID']) requester['WF_ID'] = requester['ID'];
                if (requester['SNAME']) requester['WF_ID_TXT'] = requester['SNAME'];
                if (!requester['NODE_KEY_TXT']) requester['NODE_KEY_TXT'] = requester['DEPT_TXT'];
            }

            function getDisplayTextList(list) {
                var displayTextList = [];
                $.each(list, function (index, item) {
                    displayTextList.push($u.util.formatString(' {NODE_KEY_TXT} {JOB_KEY_TXT} {WF_ID_TXT}', item));
                });
                return displayTextList;
            }

            function handleDisplayText(item) {
                item['WF_LINE_LEV'] = Number(item['WF_LINE_LEV']);
                if (item['WF_ID'] === '') {
                    item['WF_ID_TXT'] = $mls.getByCode('M_variableUser');
                    item['JOB_KEY_TXT'] = item['WF_USER_TXT'];
                }
            }

            function listHideFunction() {
                var $apprSpan = $approvalLineTable.find('#approverListSpan');
                var $apprTable = $approvalLineTable.find('#approverListTable');
                var $assentSpan = $approvalLineTable.find('#assentientListSpan');
                var $assentTable = $approvalLineTable.find('#assentientListTable');

                if(approverList.length === 0) {
                    $apprSpan.hide();
                    $apprTable.hide();
                } else {
                    $apprSpan.click(function() {
                        if(this.dataset.num === '1') {
                            $apprTable.hide();
                            $apprSpan.empty().append('+ 결재');
                            this.dataset.num = '0';
                        } else {
                            $apprTable.show();
                            $apprSpan.empty().append('- 결재');
                            this.dataset.num = '1';
                        }
                    });
                }

                if(assentientList.length === 0) {
                    $assentSpan.hide();
                    $assentTable.hide();
                } else {
                    $assentSpan.click(function() {
                        if(this.dataset.num === '1') {
                            $assentTable.hide();
                            $assentSpan.empty().append('+ 회계');
                            this.dataset.num = '0';
                        } else {
                            $assentTable.show();
                            $assentSpan.empty().append('- 회계');
                            this.dataset.num = '1';
                        }
                    });
                }
            }

            header['WF_GB_TXT'] = $ewf.draftUtil.getWF_GB_TXT(header['WF_GB']);

            handleRequester(requester);
            var approverList = [], assentientList = [];
            requester.type = 'requester';
            handleDisplayText(requester);

            $.each(tableReturns['OT_DATA1'], function (index, item) {
                handleDisplayText(item);
            });

            $.each(tableReturns['OT_DATA1'], function (index, item) {
                if(item['APPR_STAT'] === '') {
                    item['APPR_DATE'] = '';
                    item['APPR_TIME'] = '';
                }

                if (item['WF_AGRET'] === '1' || item['WF_FINAN'] === 'X' || item['WF_FINAN'] === '1') {
                    assentientList.unshift(item);
                } else {
                    if (approverList.length === 0) {
                        item['POS_KEY_TXT'] = '기안';
                    }
                    approverList.unshift(item);
                }
            });

            $.each([].concat(approverList, assentientList), function (index, item) {
                if (!item['APPR_STAT_TXT']) {
                    item['APPR_DATE'] = '';
                }
            });

            if (header.WF_SECUR === 'X') header.WF_SECUR_TXT = $mls.getByCode('M_emergencyRequestApproval');

            var isApprovalStatus = $u.page.getPROGRAM_ID() === 'DRAFT_0011';
            var $approvalLineTable = $($ewf.mustache.approvalLineTemplate({
                isApprovalStatus: isApprovalStatus,
                header: header,
                requester: requester,
                approverList: approverList,
                assentientList: assentientList,
                referrerList: getDisplayTextList(tableReturns['OT_DATA2']).join(';'), // 참조자
                readerList: getDisplayTextList(tableReturns['OT_DATA3']).join(';'), // 열람권자
                supporterList: getDisplayTextList(tableReturns['OT_DATA4']).join(';'), // 협조자
                zuniewf_4323_ot_data: zuniewf_4323_ot_data
            }));
            var os_data = $nst.is_data_os_data('ZUNIEWF_1200', {});
            if (os_data['WF_LINE2_FLAG'] !== 'X') $approvalLineTable.find('#wf-line-2').hide();
            if (os_data['WF_LINE3_FLAG'] !== 'X') $approvalLineTable.find('#wf-line-3').hide();
            if (os_data['WF_LINE4_FLAG'] !== 'X') $approvalLineTable.find('#wf-line-4').hide();

            listHideFunction();
            if (!zuniewf_4323_ot_data) $approvalLineTable.find('.approval-comments').hide();
            return $approvalLineTable;
        };

        // $keyfoundry
        window.$keyfoundry = {};
        $keyfoundry.mustache = {};

        $keyfoundry.encodingUTF8 = function (decodedStr) {
            return encodeURI(decodedStr);
        };

        $keyfoundry.decodingUTF8 = function (encodedStr) {
            return decodeURIComponent(encodedStr);
        };

        $keyfoundry.setWFTitle = function (grono) {
            $u.page.getPageParams()['GRONO'] = grono;
            $nst.is_data_nsReturn('ZUNIEFI_4207', $u.page.getPageParams(), function (nsReturn) {
                if($u.page.getPROGRAM_ID() === 'DRAFT_0010') {
                    var WF_TITLE = nsReturn.getExportMaps()['OS_HEAD'].WF_TITLE;
                    $('input[name="WF_TITLE"]').val(WF_TITLE);
                }

                for (var i = 0; i < nsReturn.getTableReturn('OT_DATA1').length; i++) {
                    var id = nsReturn.getTableReturn('OT_DATA1')[i].BELNR;
                    if ($('#' + id + "").text() === "X") {
                        var bldat = $('#' + id).prev()
                        bldat.css('color', 'red');
                    }
                }
            });
        };

        $keyfoundry.resizeToDRAFT_0011 = function ($contents, tolerance) {
            var width = $contents.innerWidth() + window.outerWidth - window.innerWidth;
            var height = $contents.innerHeight() + window.outerHeight - window.innerHeight;

            if(tolerance) {
                width += tolerance;
                height += tolerance;
            }

            if($u.util.isIE11()){
                height = window.outerHeight;
                window.resizeTo(width + 10, height);
                return;
            }

            window.resizeTo(width, height);
        };

        // 추가데이터 팝업
        $keyfoundry.addDataDialog = function (add_data, programID) {
            var fieldName = [];
            var param = $u.page.getPageParams()
            param.SUB_ID = 'GRIDHEADER';
            param.I_PROGRAM_ID = programID;

            $nst.is_data_tableReturns('ZUNIEFI_4005', param, function (tableReturns) {
                var ot_data = tableReturns.OT_DATA;
                var addData = add_data.split('@_@');
                var template = '';

                for (var i=0; i<ot_data.length; i++) {
                    fieldName[i] = ot_data[i].FNAME_TXT;
                    template += '<tr><th class="unidocu-th" style="width:200px; height: 29px">' + fieldName[i] + '</th>';
                    template += '<td class=\"unidocu-td Uni_InputText\"><div class=\"input-box\" style="text-align: center" >' +
                        '<input style="width: 100%; height: 29px" type="text" readonly value="' + addData[i] + '"></div></td></tr>';
                }
                var addDataPopup = '' + '<div><table class="unidocu-table  unidocu-form-table">' + template + '</table></div>';

                var dialogId = 'add_data_pop';
                var $dialog = $($u.util.formatString(addDataPopup, {dialogId: dialogId}));
                $u.renderUIComponents($dialog);
                $u.baseDialog.openModalDialog($dialog, {
                    title: '추가데이터 - ' + $u.page.getPageParams()['HKONT'],
                    draggable: true,
                    width: 'auto',
                    height: 400,
                    resizable: true,
                    close: function () {
                        $dialog.dialog('destroy');
                    }
                });
            });
        };

        $keyfoundry.statementPop = function () {
            var $belnr = $('.BELNR');

            $belnr.click(function () {
                var belnrIndex = $belnr.index(this);
                var pageParams = $u.page.getPageParams();
                var GRONO = pageParams['GRONO'];

                if((GRONO === '') || (GRONO === undefined)) {
                    GRONO = $('#GRONO').text();
                }

                if(GRONO.charAt(0) === 'T') {
                    pageParams.GRONO = GRONO;

                    var doc_type = $('#DOC_TYPE');
                    if(doc_type.text()==='T21') pageParams.DOC_KINDS ='A'
                    if(doc_type.text()==='T23') pageParams.DOC_KINDS ='B'

                    $nst.is_data_nsReturn('ZUNIEWF_6732', pageParams, function (nsReturn) {
                        var stateData = nsReturn.getTableReturns().OT_DATA1;
                        stateData[belnrIndex].SUB_ID = 'GRIDHEADER';
                        $efi.popup.openStatementViewWithParamMap(stateData[belnrIndex]);
                    });
                } else {
                    $nst.is_data_nsReturn('ZUNIEFI_4207', {GRONO: GRONO}, function (nsReturn) {
                        var stateData = nsReturn.getTableReturns().OT_DATA1;
                        stateData[belnrIndex].SUB_ID = 'GRIDHEADER';
                        $efi.popup.openStatementViewWithParamMap(stateData[belnrIndex]);
                    });
                }
            });
        };

        $u.customizeView(window.viewCustomize, [
            'unidocu-ui/view/main2018',
            'uni-e-fi/view/popup/StatementPreview',
        ]);
        $u.customizeView(window.baseCustomize, [
            'uni-e-fi/view/UniDocu001/UD_0601_030',
            'uni-e-fi/view/UniDocu001/UD_0302_000',
        ]);
    }
});