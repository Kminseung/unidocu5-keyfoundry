/**
 * for vendor customize
 * @module vendorCustom/customize
 */
define([
    'stache!vendorCustom/magnachip/mustache/embedStatementZUNIEFI_4207Template',
    'stache!vendorCustom/magnachip/mustache/amountDisplayWrapper',
    'stache!vendorCustom/magnachip/mustache/approvalDbdata',
    'stache!vendorCustom/magnachip/mustache/embedStatementZUNIEFI_6732_Magna_domesticTemplate',
    'stache!vendorCustom/magnachip/mustache/embedStatementZUNIEFI_6732_Magna_overseeTemplate',
    'uni-e-fi/$efi',
    'uni-e-approval/$ewf'
], function (
    embedStatementZUNIEFI_4207Template,
    amountDisplayWrapper,
    approvalDbdata,
    embedStatementZUNIEFI_6732_Magna_domesticTemplate,
    embedStatementZUNIEFI_6732_Magna_overseeTemplate
) {
    return function () {
        $ewf.mustache.embedStatementZUNIEFI_4207Template = embedStatementZUNIEFI_4207Template;
        $efi.mustache.amountDisplayWrapper = amountDisplayWrapper;
        $efi.mustache.approvalDbdata = approvalDbdata;
        $ewf.mustache.embedStatementZUNIEFI_6732_Magna_domesticTemplate = embedStatementZUNIEFI_6732_Magna_domesticTemplate;
        $ewf.mustache.embedStatementZUNIEFI_6732_Magna_overseeTemplate = embedStatementZUNIEFI_6732_Magna_overseeTemplate;

        $efi.createStatement.bindEvent.triggerZTERM_BUDATChange = function () {
            if ($u.get('ZTERM')) $efi.createStatement.bindEvent.triggerChange('ZTERM');
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
        //휴일 표시
        $ewf.getStatementElZUNIEFI_4207 = function(grono){
            var nsReturn = $nst.is_data_nsReturn('ZUNIEFI_4207', {GRONO: grono});
            var $el = $($ewf.mustache.embedStatementZUNIEFI_4207Template($ewf.getStacheView_ZUNIEFI_4207(nsReturn)));
            $el.on('click','.statement-evidence-link',function () {
                var data = $(this).data();
                $.each(data, function(key, value){
                    data[key.toUpperCase()] = value;
                });
                $efi.evikbClickHandler(data);
            });
            $magnachip.setWFtitle(grono)
            return $el;
        };
        //증빙조회 크기조절
        $efi.popup.openUD_0398_000 = function (jsonData) {
            return $u.popup.openByProgramId('UD_0398_000', 1000, 400, jsonData);
        };

        //js tree 조직관리
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
                    for (var i = 0; i < treeData.length; i++) {
                        if (treeData[i].JOB_KEY !== undefined) {
                            treeData[i].text = treeData[i].text + "&emsp;&emsp;" + treeData[i].JOB_KEY
                        }
                    }

                    orgTree._setTreeData(treeData);
                });
            };

            return orgTree;
        };

        $efi.createStatementCommon.addRow = function () {
            var gridObj = $u.gridWrapper.getGrid();
	        var pageParam = $u.page.getPageParams();
            gridObj.addRowWithGridPopupIcon();
            var activeRowIndex = gridObj.getActiveRowIndex();
            if ($efi.createStatementCommon.isEvidenceAmountNegative()) gridObj.$V('SHKZG', activeRowIndex, 'H');
            else gridObj.$V('SHKZG', activeRowIndex, 'S');

            if ($u.get('MWSKZ') && gridObj.getGridHeader('MWSKZ')) gridObj.$V('MWSKZ', activeRowIndex, $u.get('MWSKZ').getValue());
            if ($u.get('SGTXT') && gridObj.getGridHeader('SGTXT')) gridObj.$V('SGTXT', activeRowIndex, $u.get('SGTXT').getValue());
            $efi.createStatementCommon.setDefaultGridValues(activeRowIndex);
            if($u.page.getPROGRAM_ID()==='UD_0201_011' && gridObj.getGridHeader('KOSTL')){
                gridObj.$V('KOSTL', activeRowIndex, pageParam.KOSTL);
                gridObj.$V('KOSTL_TXT', activeRowIndex, pageParam.KOSTL_TXT)
                gridObj.$V('AUFNR', activeRowIndex, pageParam['AUFNR']);
                gridObj.$V('AUFNR_TXT', activeRowIndex, pageParam['AUFNR_TXT'])
            }
            // #2106 선급비용 그리드에 사업영역 default 값지정 ( 사용자요구 )
            if (gridObj.getGridHeader('GSBER') && staticProperties.user['GSBER']) gridObj.$V('GSBER', activeRowIndex, staticProperties.user['GSBER']);
            if (gridObj.getGridHeader('GSBER_TXT') && staticProperties.user['GSBER_TXT']) gridObj.$V('GSBER_TXT', activeRowIndex, staticProperties.user['GSBER_TXT']);
            $efi.createStatementCommon.changeWRBTRExpense('addRow');
            $efi.addDataHandler.handleADD_DATAKeyChange(activeRowIndex);
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
                        os_data.BLART = os_docNo.BLART
                        os_data.MWSKZ = os_docNo.MWSKZ
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
        $efi.createStatement.getCreateStatementCommonParams = function () {
            var gridObj = $u.gridWrapper.getGrid();
            var gridData = gridObj.getJSONData();
            $efi.addDataHandler.setADD_DATA(gridData);
            var paramMap = $.extend(true, {}, $u.page.getPageParams(), $u.getValues());
            $u.fileUI.setFileAttachKeyParam(paramMap);
            paramMap['INV_SEQ'] = $u.page.getPageParams()['INV_SEQ'];
            paramMap['CRD_SEQ'] = $u.page.getPageParams()['CRD_SEQ'];
            var IT_USR1 = $u.gridWrapper.getGrid('approvalDbData').getJSONData();

            return {
                paramMap: paramMap,
                gridData: gridData,
                IT_USR1: IT_USR1
            };
        };

        $efi.createStatement.callCreateStatementFn = function (params) {
            function callFunction() {
                var paramMap = params['paramMap'];
                var gridData = params['gridData'];
                var IT_USR1 = params['IT_USR1'];
                var useReload = params['useReload'];

                $efi.createStatement.koart_newko.handleGridData(gridData);

                var tableParams = {IT_DATA: gridData, IT_USR1: IT_USR1};
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

        $efi.UD_0302_000EventHandler.gridCellClick = function (columnKey, rowIndex) {
            var gridObj = $u.gridWrapper.getGrid();
            var gridJSONDataByRowIndex = gridObj.getJSONDataByRowIndex(rowIndex);
            if(gridObj._rg.getOrgFieldNames().indexOf('HKONT')!==-1){
                var hkontval = gridObj.$V('HKONT', rowIndex)
                if (hkontval === "500820010" || hkontval === "500820020") {
                    if (columnKey === 'BELNR') {
                        $efi.evikbClickHandler(gridJSONDataByRowIndex);
                        $efi.popup.openStatementViewWithParamMap(gridJSONDataByRowIndex);

                    }
                }
            }
            if (columnKey === 'BELNR') {
                $efi.popup.openStatementViewWithParamMap(gridJSONDataByRowIndex);
            }
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

        $ewf.renderEmbedStatementArea = function (wf_gb, grono) {
            var getStatementElFn = $ewf.statementElFnMap[wf_gb];
            var reqno = $u.page.getPageParams()['REQNO']
            if($u.util.contains(wf_gb, ['DEMO1', 'DEMO2'])) { // MM DEMO
                getStatementElFn = function(){ // MM Demo
                    var $el = $('<div><div id="statement-5000-grid" class="unidocu-grid" data-sub-id="GRIDHEADER" style="height: 300px;margin-top:10px;"></div></div>');
                    $u.renderUIComponents($el, $u.page.getPageParams()['gridSubGroup']);
                    $u.gridWrapper.getGrid('statement-5000-grid').setJSONData(JSON.parse($u.page.getPageParams()['selectedGridDataString']));
                    return $el;
                }
            }

            if (!getStatementElFn) throw $u.util.formatString('undefined WF_GB. can not render statement WF_GB: ' + wf_gb);
            var $statementEl = getStatementElFn(grono,reqno);

            $('#embed-statement-area').append($statementEl);
            $(window).resize();
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

            var wfGB = header['WF_GB'];
            header['WF_GB_TXT'] = $ewf.draftUtil.getWF_GB_TXT(wfGB);

            handleRequester(requester);
            var approverList = [], assentientList = [];
            requester.type = 'requester';
            handleDisplayText(requester);

            $.each(tableReturns['OT_DATA1'], function (index, item) {
                handleDisplayText(item);
            });

            $.each(tableReturns['OT_DATA1'], function (index, item) {
                if (item['WF_AGRET'] === '1' || item['WF_FINAN'] === 'X' || item['WF_FINAN'] === '1') {
                    assentientList.push(item);
                } else {
                    if (approverList.length === 0) {
                        item['POS_KEY_TXT'] = '기안';
                    }
                    approverList.push(item);
                }
            });

            var approverListMaxLength = 5;
            var assentientListMaxLength = 5;

            var i;
            for (i = approverList.length; i < approverListMaxLength; i++) approverList.push({});
            for (i = assentientList.length; i < assentientListMaxLength; i++) assentientList.push({});

            $.each([].concat(approverList, assentientList), function (index, item) {
                if (!item['APPR_STAT_TXT']) {
                    item['APPR_DATE'] = '';
                    item['APPR_TIME'] = '';
                }
                if (item['WF_ID_TXT']) {
                    item['WF_LINE_LEV'] = '[' + item['WF_LINE_LEV'] + ']';
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

            if (!zuniewf_4323_ot_data) $approvalLineTable.find('.approval-comments').hide();
            return $approvalLineTable;
        };

        $efi.handleEVIKBIconVisible = function(){
                var gridObj = $u.gridWrapper.getGrid();
                if (gridObj.getGridHeader('EVIKB_@')) {
                    gridObj.loopRowIndex(function(index){
                        var item = gridObj.getJSONDataByRowIndex(index);
                        if (!item['CRD_SEQ'] && !item['INV_SEQ'] && !item['EVI_SEQ']) gridObj.hideImage('EVIKB_@', index);
                    });
                }
                if (gridObj.getGridHeader('EVIKB_ADD')) {
                    gridObj.loopRowIndex(function(index){
                        var item = gridObj.getJSONDataByRowIndex(index);
                        if (staticProperties.user["ROLE"].indexOf('EA_0000') === -1) return gridObj.hideImage('EVIKB_ADD', index);
                        if (item['STATS'] !== '4') return gridObj.hideImage('EVIKB_ADD', index);
                    });
                }
        };

        $efi.createStatementCommon.getDefaultGridValues = function (){
            var importParam = $u.getValues('statement-information-content,header-invoicer-content,vendor-info,statement-kind-wrapper');
            if(!importParam['CRD_SEQ']) importParam['CRD_SEQ'] = $u.page.getPageParams()['CRD_SEQ'];
            if(!importParam['INV_SEQ']) importParam['INV_SEQ'] = $u.page.getPageParams()['INV_SEQ'];
            var cacheKey = $u.page.getPROGRAM_ID() + importParam['CRD_SEQ'] + importParam['INV_SEQ'];
            var os_data;
            var programArray = ['UD_0202_021','UD_0202_001']
            if(programArray.indexOf($u.page.getPROGRAM_ID()) !== -1){
                return
            }else{
                os_data = $efi.createStatementCommon._efi_4300_os_dataMap[cacheKey];
                getOsData()
            }
            function getOsData() {
                if(!os_data) {
                    os_data = $nst.is_data_os_data('ZUNIEFI_4300', importParam);
                    $efi.createStatementCommon._efi_4300_os_dataMap[cacheKey] = os_data;
                }
            }
            return os_data;
        };
          $ewf.UD_0220_122.onCellClick = function (columnKey, rowIndex) {
            var gridObj = $u.gridWrapper.getGrid();
            var evi_gb = gridObj.$V('EVI_GB', rowIndex);
            if (columnKey === 'BELNR' && gridObj.$V(columnKey, rowIndex)) $efi.popup.openStatementViewWithParamMap(gridObj.getJSONDataByRowIndex(rowIndex));
            else if (columnKey === 'EVKEY_') {
                var evkey = gridObj.$V('EVKEY', rowIndex);
                if (evi_gb === 'C') {
                    if (!evkey) gridObj.triggerChangeCell('EVI_GB', rowIndex);
                    else $efi.popup.openCardBill(evkey);
                }
                if (evi_gb === 'E') {
                    var $dialog = $u.dialog.fineUploaderDialog.open(evkey,!$ewf.UD_0220_002.fileAttachableInGrid);
                    if ($u.programSetting.getValue('useFileSearchDialog') === 'true')
                        $dialog.data('fineUploader').useSearchButton();
                    $dialog.find('#file-attach-content').on('fileCountChange', function (event, fileCount) {
                        $ewf.UD_0220_002.setEvidenceImageByFileCount(rowIndex, fileCount);
                        gridObj.$V('EVKEY', rowIndex, $dialog.data('fineUploader').getFileGroupId());
                    });
                }
            } else if (columnKey === 'EXP_DIVIDE' && gridObj.isCellEditable('EXP_DIVIDE', rowIndex)
                && gridObj.$V('EXP_DIVIDE', rowIndex) !== '1' && $u.page.getPROGRAM_ID() !== 'DRAFT_0010') {
                var doc = $u.buttons.runCustomHandler('getDocument');
                $u.validateRequired('header-invoicer-content');
                if (gridObj.$V('EXP_GB', rowIndex) === '') throw '비용구분을 선택해 주세요.';
                var divideMessage;
                if($u.page.getPROGRAM_ID()==='UD_0220_122')
                    divideMessage ='비용분할 전표작성 화면에서는 출장관련 정보를 입력할 수 없습니다. \n' +
                    '출장관련 정보가 입력되었는지 확인하고 진행해 주세요.\n' +
                    '(교통비 관련 정보 등)\n' +
                    '비용분할 전표를 작성하시겠습니까? '
                else divideMessage='비용분할 전표작성 화면에서는 출장관련 정보를 입력할 수 없습니다. \n' +
                    '출장관련 정보가 입력되었는지 확인하고 진행해 주세요.\n' +
                    '(교통비 관련 정보, 사용통화/금액,환율 등)\n' +
                    '비용분할 전표를 작성하시겠습니까?'

                unidocuConfirm(divideMessage,
                    function (){
                    expDivideFunc(evi_gb)
                    },
                    function () {
                    return false;
                })
                function expDivideFunc(evi_gb) {
                    if (evi_gb === 'C') {
                        $nst.is_data_tableParams_nsReturn($u.programSetting.getValue('setSaveFunction'), doc['formData'], {IT_HEAD: doc['gridData']['OT_HEAD'], IT_DATA: doc['gridData']['OT_DATA']}, function (nsReturn) {
                            var reqno = nsReturn.getExportMap('OS_DATA')['REQNO'];
                            var paramMap = $.extend({}, doc['formData'], {REQNO: reqno});
                            if($u.get('REQNO')) $u.get('REQNO').setValue(reqno);
                            $u.buttons.runCustomHandler('fetchDocument2', paramMap)
                                .then($u.buttons.getCustomHandler('convertNSReturnToDocument'))
                                .then(function (document) {
                                    doc = document;
                                    gridObj.loopRowIndex(function () {
                                        gridObj.$V('SEQ', rowIndex, doc['gridData']['OT_DATA'][rowIndex]['SEQ']);
                                    });
                                    $nst.is_data_os_data($u.programSetting.getValue('businessCreditSearchFunction'),
                                        {
                                            'CRD_SEQ': gridObj.$V('EVKEY', rowIndex),
                                            'SEQ': gridObj.$V('SEQ', rowIndex)
                                        }, function (os_data) {
                                            os_data['APPR_DATE_APPR_TIME'] = $u.util.date.getDateAsUserDateFormat(os_data['APPR_DATE']) + ' ' + os_data['APPR_TIME'];
                                            $efi.vendorInfoAddedDataHandler.handleByProgramId($u.page.getPROGRAM_ID(), os_data, function (vendorAddedData) {
                                                var popup = $u.popup.openByProgramId('UD_0201_001', 1250, 950,
                                                    $.extend({'SEQ': gridObj.$V('SEQ', rowIndex), 'rowIndex': rowIndex, 'hideFileUI': !gridObj.$V('EVI_GB', rowIndex)}, vendorAddedData, gridObj.getJSONDataByRowIndex(rowIndex)));
                                                $ewf.UD_0220_002.handleDivideExpPopupClose(popup);
                                            });
                                        });
                                });
                        })
                    } else {
                        $nst.is_data_tableParams_nsReturn($u.programSetting.getValue('setSaveFunction'), doc['formData'], {IT_HEAD: doc['gridData']['OT_HEAD'], IT_DATA: doc['gridData']['OT_DATA']}, function (nsReturn) {
                            var reqno = nsReturn.getExportMap('OS_DATA')['REQNO'];
                            var paramMap = $.extend({}, doc['formData'], {REQNO: reqno});
                            if ($u.get('REQNO')) $u.get('REQNO').setValue(reqno);
                            $u.buttons.runCustomHandler('fetchDocument2', paramMap)
                                .then($u.buttons.getCustomHandler('convertNSReturnToDocument'))
                                .then(function (document) {
                                    doc = document;
                                    gridObj.loopRowIndex(function (rowIndex) {
                                        gridObj.$V('SEQ', rowIndex, doc['gridData']['OT_DATA'][rowIndex]['SEQ']);
                                    });
                                });
                            var popup = $u.popup.openByProgramId('UD_0202_001T', 1250, 700,
                                $.extend({'SEQ': gridObj.$V('SEQ', rowIndex), 'rowIndex': rowIndex, 'hideFileUI': !gridObj.$V('EVI_GB', rowIndex)}, gridObj.getJSONDataByRowIndex(rowIndex)));
                            $ewf.UD_0220_002.handleDivideExpPopupClose(popup);
                        });
                    }
                }
            }
        };
        //$magnachip
        window.$magnachip = {};
        $magnachip.mustache = {};
        $magnachip.setPrecision = function (gridObj){
            $('#unidocu-td-WAERS').change(function (){
                var precision =  $u.unidocuCurrency.getPrecision($u.getValues()['WAERS']);
                gridObj.setGridNumberPrecision(precision)
                $u.get('WRBTR').setPrecision(precision)
                $u.get('WMWST').setPrecision(precision)
                $efi.createStatementCommon.changeWRBTRExpense('WRBTR');
            })

        }
        $magnachip.setWFtitle= function  (grono) {
            $u.page.getPageParams().GRONO=grono
            $nst.is_data_nsReturn('ZUNIEFI_4207', $u.page.getPageParams(), function (nsReturn) {
                if($u.page.getPROGRAM_ID()==='DRAFT_0010'){
                    var WF_TITLE = nsReturn.getExportMaps().OS_HEAD.WF_TITLE;
                    $('input[name="WF_TITLE"]').val(WF_TITLE)
                }
                for (var i = 0; i < nsReturn.getTableReturn('OT_DATA1').length; i++) {
                    var id = nsReturn.getTableReturn('OT_DATA1')[i].BELNR;
                    if ($('#' + id + "").text() === "X") {
                        var bldat = $('#' + id).prev()
                        bldat.css('color', 'red');
                    }
                }
            })
        }
        $magnachip.setGridHeaderDescription = function  (gridObj, text) {
            $(gridObj).find('h2').after().append($u.util.formatString('<span style="padding-left: 21px; font-size: 11px;">{text}</span>', {text: text}));
        }
        $magnachip.tranCalculate = function (gridObj,rowIndex,totalField) {
            var km = gridObj.$V('KM', rowIndex);
            var gas_exp = gridObj.$V('GAS_EXP', rowIndex);
            var gas_mil = gridObj.$V('GAS_MIL', rowIndex);
            var total = (km * gas_exp)/gas_mil
            if(total === Infinity)total=''
            gridObj.$V(totalField, rowIndex,total);
        }
        $magnachip.validateDestinaion = function (gridObj,gridObj2,destination,rowIndex) {
            if(gridObj.getRowCountByValue(gridObj2.$V('INDEX',rowIndex),'INDEX')>0){
                gridObj.loopRowIndex(function (index) {
                    var gridobjData = gridObj.$V('INDEX',index)
                    if(gridobjData===gridObj2.$V('INDEX',rowIndex)){
                        gridObj.$V(destination,index,gridObj2.$V(destination,rowIndex))
                    }
                })

            }
        }
        $magnachip.validateFdate = function (gridObj2) {
            var jsonindex;
            if (gridObj2.getRowCount() > 1) {
                var myArray = gridObj2.getJSONData()
                myArray.map(function (val) {
                    var destination = val['CITY']
                    if($u.page.getPROGRAM_ID()==='UD_0220_132') destination = val['LAND1']
                    val['FDATE']=val['FDATE']+destination
                    return val['FDATE'];
                }).filter(function (val, index, arr) {
                    if(index >0 && val.length >0){
                        var count = arr.filter(function (element) {
                            return val === element;
                        }).length;
                        if(count>1){
                            jsonindex = index
                        }
                    }
                });
                if(jsonindex>0){
                    unidocuAlert("동일한 시작일이 존재합니다.")
                    var jsondata = gridObj2.getJSONData()
                    jsondata[jsonindex].FDATE =''
                    jsondata[jsonindex].TDATE =''
                    gridObj2.setJSONData(jsondata);}
            }
        }
        $magnachip.getText4 = function () {
            var textarea=$('#unidocu-td-TEXT4 textarea')
            textarea.val(textarea.val().replaceAll('@_@','\n'))
            textarea.css('min-height','100px')
        }
        $magnachip.businessTripText4 = function () {
            if($u.page.getPROGRAM_ID()==="UD_0220_132"||$u.page.getPROGRAM_ID()==="UD_0220_122"){
                if(!$u.page.getPageParams().DOC_TYPE){
                $nst.is_data_nsReturn('ZUNIEWF_U670',null,function (nsReturn){
                    var text4 = nsReturn.getStringReturns()['O_TEXT4'];
                    text4 = text4.replaceAll('@_@','\n')
                    var textarea=$('#unidocu-td-TEXT4 textarea')
                    textarea.val(text4)
                    textarea.css('min-height','100px')
                })
                }else{
                    $magnachip.getText4()
                }
            }
        };
        $magnachip.generateZUNIEWF_6732StatementFn = function(doc_kinds) {
            return function(grono,reqno) {
                var template;
                if(doc_kinds === 'A') template = $ewf.mustache.embedStatementZUNIEFI_6732_Magna_domesticTemplate;
                else if(doc_kinds === 'B') template = $ewf.mustache.embedStatementZUNIEFI_6732_Magna_overseeTemplate;
                var approvalContents = $('.unidocu-approval-contents')
                approvalContents.remove();
                var zuniefi_6732_nsReturn = $nst.is_data_nsReturn('ZUNIEWF_6732', {GRONO: grono, DOC_KINDS: doc_kinds,REQNO:reqno});
                var $el = $(template($magnachip.getStacheView_ZUNIEFI_6732(zuniefi_6732_nsReturn)));
                $el.appendTo('#uni-form-table5');
                $el.on('click','.statement-evidence-link',function () {
                    var data = $(this).data();
                    $.each(data, function(key, value){
                        data[key.toUpperCase()] = value;
                    });
                    $efi.evikbClickHandler(data);
                });
                $magnachip.setWFtitle(grono);
            }
        }
        $magnachip.getStacheView_ZUNIEFI_6732 = function(zuniefi_6732_nsReturn){
            var os_data = zuniefi_6732_nsReturn.getExportMap('OS_DATA');
            var ot_data = zuniefi_6732_nsReturn.getTableReturn('OT_DATA');
            var ot_head = zuniefi_6732_nsReturn.getTableReturn('OT_HEAD');
            var os_text = zuniefi_6732_nsReturn.getExportMap('OS_TEXT');
            var ot_data1 = zuniefi_6732_nsReturn.getTableReturn('OT_DATA1');
            var ot_data2 = zuniefi_6732_nsReturn.getTableReturn('OT_DATA2');
            var os_head = zuniefi_6732_nsReturn.getExportMap('OS_HEAD');
            var belnrOT_DATA1Map = {};
            if(os_text.TEXT4.indexOf('@_@') !== -1){
                os_text.TEXT4 = os_text.TEXT4.replaceAll('@_@','\n')
            }
            $.each(ot_data1, function(index, item){
                belnrOT_DATA1Map[item['BELNR']] = item;
            });
            $.each(ot_data2, function(index, item){
                var ot_data1_single = belnrOT_DATA1Map[item['BELNR']];
                if(!ot_data1_single.ot_data2) ot_data1_single.ot_data2 = [];

                if(item['KOART'] === 'K' || item['KOART'] === 'D' ) item['is_KOART_K_or_D'] = true;
                item['DMBTR_TXT_' + item['SHKZG']] = item['DMBTR_TXT'];

                ot_data1_single.ot_data2.push(item);
            });
            $.each(ot_data, function(index, item){
                var ot_data1_single = belnrOT_DATA1Map[item['BELNR']];
                if(!ot_data1_single.ot_data) ot_data1_single.ot_data = [];
                ot_data1_single.ot_data.push(item);
            });
            return {
                os_head: os_head,
                ot_data1: ot_data1,
                os_text : os_text,
                os_data : os_data,
                ot_head : ot_head,
            };
        };
        $ewf.statementElFnMap = {
            "10": $ewf.getStatementElZUNIEFI_4207,
            "65": $ewf.generateZUNIEFI_4208StatementFn('UD_0220_101', true),
            "80": $ewf.generateZUNIEFI_4208StatementFn('UD_0220_112', false),
            "85": $ewf.generateZUNIEFI_4208StatementFn('UD_0220_001', true),
            "90": $ewf.generateZUNIEFI_4208StatementFn('UD_0220_002', false),
            "95": $ewf.getStatementElZUNIEFI_3707,
            "94": $ewf.getStatementElZUNIEFI_3607,
            "CR": $ewf.getStatementElZUNIEFI_6500,
            "72": $magnachip.generateZUNIEWF_6732StatementFn('A'), // 국내출장비 정산
            "74": $magnachip.generateZUNIEWF_6732StatementFn('B'), // 해외출장비 정산
        };

        $magnachip.handleEVIKBIconVisible = function () {
            var gridObj = $u.gridWrapper.getGrid();
            if (gridObj.getGridHeader('EVIKB_@')) {
                gridObj.loopRowIndex(function (index) {
                    var item = gridObj.getJSONDataByRowIndex(index);
                    if (!item['EVI_SEQ']) gridObj.hideImage('EVIKB_@', index);
                });
            }
        };

        $magnachip.UD_0201_100EventHandler = {};
        $magnachip.UD_0201_100EventHandler.gridCellClick = function (columnKey, rowIndex) {
            var gridObj = $u.gridWrapper.getGrid();
            var gridJSONDataByRowIndex = gridObj.getJSONDataByRowIndex(rowIndex);
            if (columnKey === 'EVIKB_@'&& gridJSONDataByRowIndex['EVI_SEQ']) $u.dialog.fineUploaderDialog.open(gridJSONDataByRowIndex['EVI_SEQ'],true)
            if (columnKey === 'EVIKB_ADD') {
                if (gridObj._rg.getValue(rowIndex, 'EVIKB_ADD__IMAGE') !== '0') {
                    var $dialog = $u.dialog.fineUploaderDialog.open(gridJSONDataByRowIndex['EVI_SEQ'], false, function () {
                        var originEVI_SEQ = gridObj.$V('EVI_SEQ', rowIndex);
                        var fileCount = $dialog.data('fineUploader').getFileCount();
                        var curEVI_SEQ = fileCount === 0 ? '' : $dialog.data('fineUploader').getFileGroupId();

                        if (originEVI_SEQ !== curEVI_SEQ) $nst.is_data_returnMessage('ZUNIECM_5030', $.extend({}, gridJSONDataByRowIndex, {'EVI_SEQ': curEVI_SEQ}),
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

        $magnachip.urlOpen = function () {
            var $urllink;
            var hasReqno = $u.page.getPageParams().hasOwnProperty("REQNO")
            var $reqno = $u.page.getPageParams().REQNO
            if(hasReqno && $reqno.length > 1 )$urllink = $('.statement-reqno-link')
            else $urllink = $('.statement-url-link')
            var nameserviced;
            var urldata;
             function _loop(i,$urllink) {
                if(hasReqno && $reqno.length > 1 ){
                    nameserviced = 'ZUNIEFI_U002'
                    urldata = $urllink.data();
                    var $evilink =$('.statement-eviseq-link')
                    $.each(urldata, function (key, value) {
                        urldata[key.toUpperCase()] = value;
                    });
                    $nst.is_data_ot_data(nameserviced, urldata, function (ot_data) {
                        if (!ot_data.length) $('.reqno-url').css('display', 'none');
                    });
                    urlclick($urllink)
                    var eviseqData = $nst.is_data_ot_data('ZUNIECM_5000', {EVI_SEQ:$evilink.data().evi_seq})
                    if(!eviseqData.length) $('.eviseq-url').css('display', 'none');
                    eviurlclick($evilink)
                }else{
                    nameserviced = 'ZUNIEFI_U001'
                    urldata = $urllink[i].dataset;
                    $.each(urldata, function (key, value) {
                        urldata[key.toUpperCase()] = value;
                    });
                    $nst.is_data_ot_data(nameserviced, urldata, function (ot_data) {
                        if (ot_data.length === 0) $('.statement-url').eq(i).css('display', 'none');
                    });
                    urlclick($urllink)
                }
            }
            for (var i = 0; i < $urllink.length; i++) {
                _loop(i,$urllink);
            }
            function urlclick($urllink) {
                $urllink.on('click', function () {
                    var data = $(this).data();
                    $.each(data, function (key, value) {
                        data[key.toUpperCase()] = value;
                    });
                    $magnachip.urlClickHandler(data);
                });
            }
            function eviurlclick($evilink) {
                $evilink.on('click', function () {
                    var data = $(this).data();
                    $.each(data, function (key, value) {
                        data[key.toUpperCase()] = value;
                    });
                    $u.dialog.fineUploaderDialog.open(data.EVI_SEQ,true)
                });
            }
        }

        $magnachip.urlClickHandler = function (paramMap) {
            var hasReqno = $u.page.getPageParams().hasOwnProperty("REQNO")
            var $reqno = $u.page.getPageParams().REQNO
            if(hasReqno && $reqno.length > 1 ){
                $nst.is_data_ot_data('ZUNIEFI_U002', paramMap, function (ot_data) {
                    var url = ot_data[0].DOC_URL;
                    if (ot_data.length === 0) unidocuAlert('첨부된 품의가 없습니다.');
                    else if (ot_data.length === 1) window.open(url,'PopupWin', 'width=1200,height=800');
                    else $magnachip.openUrlDialog(ot_data);
                });
            }else {
            $nst.is_data_ot_data('ZUNIEFI_U001', paramMap, function (ot_data) {
                var url = ot_data[0].DOC_URL;
                if (ot_data.length === 0) unidocuAlert('첨부된 품의가 없습니다.');
                else if (ot_data.length === 1) window.open(url,'PopupWin', 'width=1200,height=800');
                else $magnachip.openUrlDialog(ot_data);
            });
            }
        };

        $magnachip.openUrlDialog = function (ot_data) {
            var dialogId = 'openUrlDialog';
            var openUrlDialog = '' +
                '<div>' +
                '    <div id="{dialogId}" class="unidocu-grid" data-sub-id="urlDataContentGrid" style="height: 200px; margin-top: 10px;"></div>' +
                '</div>';
            var $dialog = $($u.util.formatString(openUrlDialog, {dialogId: dialogId}));
            $u.renderUIComponents($dialog);
            $u.baseDialog.openModalDialog($dialog, {
                title: '품의조회',
                draggable: true,
                width: 800,
                close: function () {
                    $dialog.dialog('destroy');
                }
            });
            var gridObj = $u.gridWrapper.getGrid('openUrlDialog')
            gridObj.setJSONData(ot_data);
            $magnachip.openApproval(gridObj);
        }

        function formatDate(str) {
            str = str.replace(/(\d{4})(\d{2})(\d{2})/g, '$1-$2-$3')
            return str;
        }

        $magnachip.openApproval = function (gridObj) {
            gridObj.onCellClick(function (columnKey, rowIndex) {
                if (columnKey === "VIEW") {
                    var url = gridObj._rg.getValue(rowIndex, 'DOC_URL');
                 window.open(url,'PopupWin', 'width=1300,height=800');
                }
            });
        }

        function changeKeysToUpper(obj) {
            var key, upKey;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    upKey = key.toUpperCase();
                    if (upKey !== key) {
                        obj[upKey] = obj[key];
                        delete(obj[key]);
                    }
                    // recurse
                    if (typeof obj[upKey] === "object") {
                        changeKeysToUpper(obj[upKey]);
                    }
                }
            }
            return obj;
        }

        function gwApprovalresult(result) {
            var dbDataContentGrid = $u.gridWrapper.getGrid("dbDataContent")
            if(/UD_0220_122|UD_0220_132/.test($u.page.getPROGRAM_ID())){
                var jsonresult = JSON.parse(result)
                jsonresult = changeKeysToUpper(jsonresult);
                dbDataContentGrid.setJSONData(jsonresult);
            }else {
            dbDataContentGrid.setJSONData(JSON.parse(result));
            }
            $magnachip.openApproval(dbDataContentGrid);
        }

        function setapprovalDbData(data) {
            var approvalDbDataGrid = $u.gridWrapper.getGrid("approvalDbData")
            approvalDbDataGrid.setJSONData(data);
            approvalDbDataGrid.unCheckAll();
            $magnachip.openApproval(approvalDbDataGrid);
        }

        $magnachip.getGwDbDialog = function () {
            $u.buttons.addHandler(
                {
                    deleteRowDB: function () {
                        $u.gridWrapper.getGrid("approvalDbData").deleteSelectedRows();
                    },
                    getDbdatalist: function () {
                        var pernr = $u.getValues('getApprovalDbData')['PERNR'];
                        var fromdate = $u.getValues('getApprovalDbData')['FromDate'];
                        var todate = $u.getValues('getApprovalDbData')['ToDate'];
                        var formid = $u.getValues('getApprovalDbData')['FORMID'];
                        fromdate = formatDate(fromdate);
                        todate = formatDate(todate);
                        if (pernr.charAt(0) === "9") {
                            pernr = pernr.replace("9", "U")
                        }
                        $.ajax({
                            type: "POST",
                            url: "/magnachip/getDBList",
                            data: {
                                "pernr": pernr,
                                "fromdate": fromdate,
                                "todate": todate,
                                "formid": formid
                            },
                            success: function (result) {
                                if (result === "[]") {
                                    unidocuAlert("검색 결과가 존재하지 않습니다.");
                                    return false;
                                }
                                console.log(result);
                                gwApprovalresult(result);
                            },
                            error: function (e) {
                                console.log("실패", e.responseText);
                                unidocuAlert("품의연동 실패.")

                            },
                        });
                    }
                }
            )
            var dialogId = 'getApprovalDbData';
            var assignPersonDialog = '' +
                '<div>' +
                '<div class="unidocu-form-table-wrapper" data-sub-group="uiDialog" id="getApprovalDbData"></div>' +
                '<table id="dbDataContent-panel-toolbar">' +
                '<tr>' +
                '<td class="middle-td">' +
                '<div class="btn_area uni-form-table-button-area" id="dbDataContent_top_buttons"></div>' +
                '</td>' +
                '</tr>' +
                '</table>' +
                '<div id="dbDataContent" class="unidocu-grid" data-sub-id="dbDataContentGrid" style="height: 230px; margin-top: 10px;"></div>' +
                '</div>';
            var $dialog = $($u.util.formatString(assignPersonDialog, {dialogId: dialogId}));
            $u.renderUIComponents($dialog);
            $u.baseDialog.openModalDialog($dialog, {
                title: '품의서',
                draggable: true,
                width: 1300,
                height: 450,
                resizable: true,
                position:{my: 'top', at: 'top'},
                buttons: [
                    $u.baseDialog.getButton('확인', function () {
                        var newdata = $u.gridWrapper.getGrid("dbDataContent").getSELECTEDJSONData()
                        var olddata = $u.gridWrapper.getGrid("approvalDbData").getJSONData()
                        if(olddata.length !==0){
                            newdata = newdata.concat(olddata)
                            newdata = newdata.filter(function (character, idx, arr) {
                                return arr.findIndex(function (item) {
                                    if(/^UD_0220_122|UD_0220_132$/.test($u.page.getPROGRAM_ID())){
                                        return item.DOCNO === character.DOCNO
                                    }else{
                                    return item.DocNO === character.DocNO
                                    }
                                }) === idx;
                            });
                            console.log(newdata);
                        }
                        setapprovalDbData(newdata);
                        $dialog.dialog("close");
                    })
                ],
                close: function () {
                    $dialog.dialog('destroy');
                }
            });
        }
        $efi.createStatement.handleChangeCell = function (columnKey, rowIndex, oldValue, newValue, jsonObj) {
            var gridObj = $u.gridWrapper.getGrid();
            if (columnKey === 'WRBTR' || columnKey === 'SHKZG' || columnKey === 'MWSKZ') $efi.createStatementCommon.changeWRBTRExpense(columnKey);
            if (columnKey === 'KURSF' || columnKey === 'WRBTR2' || columnKey === 'WAERS') {
                var wrbtr = $efi.createStatementCommon.calculateWRBTRbyKURSF(rowIndex);
                gridObj.$V('WRBTR', rowIndex, wrbtr);
                gridObj.triggerChangeCell('WRBTR', rowIndex, gridObj.$V('WRBTR', rowIndex), wrbtr);
            }
            var getComExp;
            if (columnKey === 'COM_EXP') {
                getComExp = $u.gridWrapper.getGrid()._rg.getValue(rowIndex, 'COM_EXP')
                if (getComExp) {
                    unidocuAlert("공통비는 반드시 SAP 등록 화면에서 추가 등록바랍니다.")
                }
            }
            if (columnKey === 'KOSTL') {
                var progrmaid = $u.page.getPROGRAM_ID();
                var programIdArray = ['UD_0201_011', 'UD_0202_001', 'UD_0201_001', 'UD_0202_021', 'UD_0202_001T']
                if (programIdArray.indexOf(progrmaid) !== -1) {
                    var kostl = gridObj.$V(columnKey, rowIndex);
                    if (kostl) {
                        if (jsonObj && jsonObj['AUFNR']) gridObj.$V('AUFNR', rowIndex, jsonObj['AUFNR']);
                        if (jsonObj && jsonObj['AUFNR_TXT']) gridObj.$V('AUFNR_TXT', rowIndex, jsonObj['AUFNR_TXT']);
                    }
                }
            }
            if (columnKey === 'HKONT') {
                $efi.addDataHandler.handleADD_DATAKeyChange(rowIndex);
                if (/UD_0201_001|UD_0201_011|UD_0202_001|UD_0202_001T/.test($u.page.getPROGRAM_ID())) $magnachip.setMWSKZ_By_HKONT_F4(columnKey, rowIndex, jsonObj);
            }
            $efi.createStatement.setGridBudget(columnKey, rowIndex);
            $efi.createStatement.changeGridAlert(columnKey, rowIndex, jsonObj);
            $efi.createStatement.koart_newko.onKOARTChange(columnKey, rowIndex);
        };
        $efi.addDataHandler.handleClickADD_DATA = function (rowIndex) {
            if (!$efi.addDataHandler.hasADD_DATA(rowIndex)) return;
            var programId = $u.page.getPROGRAM_ID();
            var addDataKey = $efi.addDataHandler.getGrid().$V('HKONT', rowIndex);
            var hkont_txt;
            if ($efi.addDataHandler.getGrid().getGridHeader('HKONT')['serverType'] === 'combo') hkont_txt = $efi.addDataHandler.getGrid().getCachedCodeMap('HKONT')[addDataKey]['HKONT_TXT'];
            else hkont_txt = $efi.addDataHandler.getGrid().$V('HKONT_TXT', rowIndex);
            $efi.dialog.addDataDialog.open(programId, addDataKey, rowIndex, $efi.addDataHandler.getGrid().$H('ADD_DATA', rowIndex), hkont_txt);
            function setCoCardReadonly() {
                var nameArray = ['NAME1','STCD2','SUPTP','NOCRD']
                for(var i=0; i<nameArray.length; i++){
                    $u.get('dialog-search-form',nameArray[i]).setReadOnly(true);
                }
            }
            if (/UD_0201_001/.test(programId) && $efi.addDataHandler.hasADD_DATA(rowIndex)) {
                setCoCardReadonly()
            }
        };
        $magnachip.SGTXTChange = function (gridObj) {
            function sgtxtvalchange() {
                var sgtxtTable = $u.getValues().TITLE;
                if(/^UD_0202_001T|UD_0202_001$/.test($u.page.getPROGRAM_ID()))sgtxtTable = $u.getValues().SGTXT;
                gridObj.loopRowIndex(function (rowIndex) {
                    gridObj.$V('SGTXT',rowIndex,sgtxtTable)
                })
            }
            $('#unidocu-td-TITLE').change(function (){
                sgtxtvalchange()
            })
            sgtxtvalchange()
        }
        $magnachip.setMWSKZ_By_HKONT_F4 = function (columnKey, rowIndex, jsonObj) {
            var gridObj = $u.gridWrapper.getGrid();
            var $u_MWSKZ = $u.get('MWSKZ');

            function callFunction() {
                if (jsonObj['MWSKZ']) {
                    gridObj.$V('MWSKZ', rowIndex, jsonObj['MWSKZ']);
                    $u_MWSKZ.setValue(jsonObj['MWSKZ']);
                } else if($u.page.getPageParams()['MWSKZ']) {
                    if ($u.page.getPROGRAM_ID() !== 'UD_0201_011'){
                        gridObj.$V('MWSKZ', rowIndex, $u.page.getPageParams()['MWSKZ']);
                        $u_MWSKZ.setValue($u.page.getPageParams()['MWSKZ']);
                    }
                }

                var mwskzData = gridObj.getJSONData().filter(function (value) {
                    return $efi.f4.getFLAG_by_MWSKZ(value['MWSKZ']) === 'X' && $efi.mwskzNonDeduction.isNonDeduction(value['MWSKZ']);
                });

                if (mwskzData.length !== 0) $u.get('MWSKZ').setValue(mwskzData[0]['MWSKZ']);
                $u_MWSKZ.$el.change();
            }
            if ($u_MWSKZ && jsonObj) callFunction();
        };

        $magnachip.openDialog = function (mode, message, confirmCallback, cancelCallback) {
            var templateString = '<div style="text-align:center;" class="unidocu-alert"></div>';
            var $dialog = $(templateString);
            if($.type(message) !== 'object' && !/<br/i.test(message)) message = $('<pre></pre>').text(message);
            $dialog.append(message);

            var buttons = [];

            buttons.push($u.baseDialog.getButton($mls.getByCode('DLB_confirm'), function () {
                $dialog.data('isConfirmButton', true);
                $dialog.dialog('close');
            }, 'unidocu-button  blue'));

            if(mode === 'confirm') {
                buttons.push($u.baseDialog.getButton($mls.getByCode('DLB_cancel'), function () {
                    $dialog.dialog('close');
                }));
            }

            $u.baseDialog.openModalDialog($dialog, {
                title: $mls.getByCode('DLT_unidocuAlert'),
                width: 800,
                "class": mode,
                resizable: true,
                draggable: true,
                buttons: buttons,
                close: function () {
                    $dialog.dialog('destroy');
                    if(mode === 'alert') {
                        if(confirmCallback) confirmCallback();
                        return;
                    }
                    if ($dialog.data('isConfirmButton')) {
                        if(confirmCallback) confirmCallback();
                    } else if(cancelCallback){
                        cancelCallback();
                    }
                }
            });
            $('#unipost-unidocu').find('.ui-widget-overlay').last().css('z-index', 100000);
            $dialog.closest('.ui-dialog').css('z-index', 100001);
            var $unidocuAlert = $(document).find(".unidocu-alert");
            var alertCnt = $unidocuAlert.length;
            if(alertCnt){
                var top = $($unidocuAlert[alertCnt-1]).parent().css("top").split("px")[0] * 1 + (30 * alertCnt);
                var left = $($unidocuAlert[alertCnt-1]).parent().css("left").split("px")[0] * 1 + (30 * alertCnt);
                $dialog.parent().css("top",top);
                $dialog.parent().css("left",left);
            }
            return $dialog;
        }
        $magnachip.unidocuConfirm = function (message, confirmCallback, cancelCallback) {
            return $magnachip.openDialog('confirm', message, confirmCallback, cancelCallback);
        };

        //현금영수증 , 종이증빙 접대비 로직
        $magnachip.validateEntertainment = function () {
            function CreateStatementFn() {
                $efi.createStatement.validateCreateStatement();
                var params = $efi.createStatement.getCreateStatementCommonParams();
                params['useReload'] = true;
                $efi.createStatement.callCreateStatementFn(params);
            }
            var gridDataArray = $efi.createStatement.getCreateStatementCommonParams().gridData;
            var validate = true;
            $.each(gridDataArray, function (index, item) {
                var hkont = item['HKONT']
                if (hkont === "500820010" || hkont === "500820020") {
                    var wrbtr = Number(item['WRBTR']);
                    var mwskz = item['MWSKZ'];
                    if ((wrbtr <= 30000 && mwskz !== "X5") || (wrbtr > 30000 && mwskz !== "X8")) {
                        validate=false
                    }
                }
            })
            if(validate){
                CreateStatementFn();
            }else {
                $magnachip.unidocuConfirm("접대비의 경우 3만원 이하는 X5, 초과는 X8 세금코드를 선택하셔야 합니다.그대로 전표 작성하시겠습니까?"
                    , function () {
                        CreateStatementFn();
                    }
                    , function () {
                        return false
                    }
                )
            }

        }

        //추가데이터 팝업 관련
        $magnachip.addDataDialog = function (add_data, hkontval) {
            if (/500820010|500820020|500820030/.test(hkontval)) {
                // 필드명 가져오기
                var add_name = [];
                var param = $u.page.getPageParams()
                param.SUB_ID = "GRIDHEADER";
                $nst.is_data_tableReturns('ZUNIEFI_4005', $u.page.getPageParams(), function (tableReturns) {
                    var ot_data;
                    var template = "";
                    ot_data = tableReturns.OT_DATA;
                    var add_dat = add_data.split('@_@')
                    for (var i = 0; i < ot_data.length; i++) {
                        add_name[i] = ot_data[i].FNAME_TXT;
                        template += "<tr><th class='unidocu-th' style='width:200px; height: 29px'>" + add_name[i] + "</th>"
                        template += "<td class=\"unidocu-td Uni_InputText\"><div class=\"input-box\" style='text-align: center' >" +
                            "<input style='width: 100%; height: 29px' type='text' readonly value='" + add_dat[i] + "'></div></td></tr>"
                    }
                    // add_data져오기
                    //다이얼로그 생성

                    var add_data_popDialog = '' +
                        '<div><table class="unidocu-table  unidocu-form-table">' + template + '</table></div>';

                    var dialogId = 'add_data_pop';

                    var $dialog = $($u.util.formatString(add_data_popDialog, {dialogId: dialogId}));
                    $u.renderUIComponents($dialog);
                    $u.baseDialog.openModalDialog($dialog, {
                        title: '추가데이터 - ' + $u.page.getPageParams()['HKONT'],
                        draggable: true,
                        width: "auto",
                        height: 400,
                        resizable: true,
                        close: function () {
                            $dialog.dialog('destroy');
                        }
                    });
                });

            }
        }

        $magnachip.magnaPernrComboOption = function (codekey) {
            var $pernr = $u.getValues('search-condition')["PERNR"];
            var $value = $u.f4Data.getCodeComboOption(codekey, {'PERNR': $pernr})
            $u.get('search-condition', codekey).setOptions($value);
        }


        $magnachip.statementPop = function () {
            var $belnr = $('.BELNR')
            // var belnrIndex = $belnr.index(this)
            for (var i = 0; i < $belnr.length; i++) {
                if ($('.FLAG').eq(i).text() === "X") {
                    $belnr.eq(i).css("color", "red");
                } else {
                    $belnr.eq(i).css("color", "blue");
                }
            }
            $magnachip.urlOpen()

            $belnr.click(function () {
                var belnrIndex = $belnr.index(this)
                var pageparma = $u.page.getPageParams()
                var GRONO = pageparma["GRONO"]
                if (GRONO === "" || GRONO === undefined) {
                    GRONO = $('#GRONO').text();
                }
                if(GRONO.charAt(0)==="T"){
                    pageparma.GRONO=GRONO
                    var doc_type = $('#DOC_TYPE')
                    if(doc_type.text()==='T21')pageparma.DOC_KINDS ='A'
                    if(doc_type.text()==='T23')pageparma.DOC_KINDS ='B'
                    $nst.is_data_nsReturn('ZUNIEWF_6732', pageparma, function (nsReturn) {
                        var stateData = nsReturn.getTableReturns().OT_DATA1;
                        stateData[belnrIndex].SUB_ID = "GRIDHEADER";
                        $efi.popup.openStatementViewWithParamMap(stateData[belnrIndex]);
                    });
                }else{
                    $nst.is_data_nsReturn('ZUNIEFI_4207', {GRONO: GRONO}, function (nsReturn) {
                        var stateData = nsReturn.getTableReturns().OT_DATA1;
                        stateData[belnrIndex].SUB_ID = "GRIDHEADER";
                        $efi.popup.openStatementViewWithParamMap(stateData[belnrIndex]);
                    });
                }

            })
        }

        $u.fileUI.setFileAttachKeyParam = function (importParams) {
            importParams['EVI_SEQ'] = $u.page.getPROGRAM_ID() === 'DRAFT_0010' ? $u.page.getCustomParam('fileUIFineUploader').getFileGroupId() : $u.fileUI.getFineUploader().getFileGroupId();
        };

        $u.customizeView(window.viewCustomize, [
            'unidocu-ui/view/main2018',
            'uni-e-fi/view/popup/StatementPreview',
            'uni-e-fi/view/UD_0201_001',
            'uni-e-approval/view/DRAFT_0010',
            'uni-e-approval/view/DRAFT_0011',
            'uni-e-fi/view/UD_0202_001',
            'uni-e-fi/view/UD_0201_011',
            'uni-e-fi/view/UD_0220_122',
            'uni-e-fi/view/UD_0220_132'
        ]);
        $u.customizeView(window.baseCustomize, [
            'uni-e-fi/view/UniDocu001/UD_0201_000',
            'uni-e-approval/view/UniDocu001/UFL_0101_070',
            'uni-e-fi/view/UniDocu001/UD_0302_000',
            'uni-e-fi/view/UniDocu001/UD_0302_010',
            'uni-e-fi/view/UniDocu001/UD_0201_100',
            'uni-e-fi/view/UniDocu001/UD_0201_010',
            'uni-e-fi/view/UniDocu001/UD_0220_004'
        ]);
    }
});