/**
 * @module uni-e-approval/$ewf
 */
define([
    'uni-e-approval/mustache/$ewfMustache',
    'uni-e-approval/$ewf/$ewfDialog'

], function ($ewfMustache, $ewfDialog) {
    window.$ewf = {};
    $ewfMustache();
    $ewfDialog(); // $ewf.dialog

    $ewf.draftUtil = {};
    $ewf.draftUtil.getMode = function () {
        return $u.page.getPageParams()['mode'];
    };
    $ewf.draftUtil.isReadOnly = function () {
        return $ewf.draftUtil.getMode() === 'readOnly';
    };
    $ewf.draftUtil.hasSavedData = function () {
        var mode = $ewf.draftUtil.getMode();
        return mode === 'readOnly' || mode === 'edit';
    };
    $ewf.draftUtil.getWF_GB = function () {
        var wf_gb = $u.page.getPageParams()['WF_GB'];
        if (!wf_gb) wf_gb = $u.programSetting.getValue('WF_GB');
        return wf_gb;
    };
    $ewf.draftUtil.getWF_GB_TXT = function (wf_gb) {
        return $u.f4Data.getCodeMapWithParams('WF_GB', 'WF_GB_TXT')[wf_gb];
    };
    $ewf.draftUtil.initializeDraftPage = function () {
        $u.programSetting.appendTemplate('WF_GB', {
            description: 'WF_GB 기본값 설정',
            defaultValue: ''
        });

        if (!$ewf.draftUtil.getWF_GB()) throw 'WF_GB is empty. set default WF_GB using program setting.';
        if(!$u.exists(['changeLine'])) throw 'uni-form-table1 changeLine required set form setting';
    };
    $ewf.draftUtil.setREQNO = function (reqno) {
        var pageParamREQNO = $u.page.getPageParams()['REQNO'];
        if (pageParamREQNO && pageParamREQNO !== reqno) throw new Error('RFC REQNO and pageParams REQNO does not match');
        $u.page.setCustomParam('REQNO', reqno)
    };
    $ewf.draftUtil.getREQNO = function () {
        if ($u.page.getPageParams()['REQNO']) return $u.page.getPageParams()['REQNO'];
        if ($u.page.getCustomParam('REQNO')) return $u.page.getCustomParam('REQNO');
        return '';
    };

    $ewf.renderDocumentReferenceWF_ORG = function (readonly, referenceDocumentList) {
        if ($nst.is_data_os_data('ZUNIEWF_1200', {})['WF_ORG_FLAG'] === '') $('#document-reference-wf-org').hide();
        var documentReference = $u.documentReference.render('#document-reference-wf-org', {
            "title": $mls.getByCode('DLT_changeWF_ORGPalenTitle'),
            "readOnly": readonly,
            "itemTextField": 'WF_KEY_TEXT',
            "keyField": 'WF_KEY'
        });
        documentReference.setTitleClickHandler(function (data) {
            $ewf.popup.openDRAFT_0011(data)
        });
        documentReference.setSearchButtonClickHandler(function () {
            $ewf.dialog.changeWF_ORGDialog.open(function (selectedJSONData) {
                documentReference.appendDocumentReference(selectedJSONData);
            });
        });
        documentReference.appendDocumentReference(referenceDocumentList);
        return documentReference;
    };
    $ewf.getDocumentReferenceListWF_ORG = function(){
        return $u.getDocumentReference('#document-reference-wf-org').getList();
    };

    $ewf.changeLine = {};
    $ewf.changeLine.options = [];
    $ewf.changeLine.initialize = function (ot_data) {
        $ewf.changeLine.options = [];
        $.each(ot_data, function (index, item) {
            $ewf.changeLine.options.push({value: item['SEQ'], text: item['SEQ_TXT'], item: item})
        });
        $u.get('uni-form-table1', 'changeLine').setOptions($ewf.changeLine.options);
    };
    $ewf.changeLine.getSelectedOT_DATA = function () {
        var params = null;
        var seq = $u.get('uni-form-table1', 'changeLine').getValue();
        $.each($ewf.changeLine.options, function (index, item) {
            if (item['value'] === seq) {
                params = item['item'];
                return false;
            }
        });
        return params;
    };
    $ewf.changeLine.getTableReturns = function () {
        if ($u.programSetting.getValue('hideChangeLine') === 'true') return {};
        return $u.get('uni-form-table1', 'changeLine').$el.data('tableReturns');
    };
    $ewf.changeLine.setTableReturns = function (tableReturns) {
        $u.get('uni-form-table1', 'changeLine').$el.data('tableReturns', tableReturns);
    };
    $ewf.changeLine.setWF_SECUR = function (wf_secur) {
        $u.get('uni-form-table1', 'changeLine').$el.data('wf_secur', wf_secur);
    };
    $ewf.changeLine.getWF_SECUR = function () {
        var wf_secur = $u.get('uni-form-table1', 'changeLine').$el.data('wf_secur');
        if (!wf_secur) return '';
        return wf_secur;
    };
    $ewf.changeLine.validateApprovalLineSelected = function () {
        if ($u.programSetting.getValue('hideChangeLine') === 'true') return;
        if (!$ewf.changeLine.getTableReturns()) throw $mls.getByCode('M_chooseApprovalLine');
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

        function handleLastApproverLocation(list, maxLength) {
            if (list.length === 0) return;
            var lastApproverIndex = (list.length - 1);
            var lastApprover = list[lastApproverIndex];
            list[lastApproverIndex] = {};
            for (var i = list.length; i < maxLength; i++) list[i] = {};
            list[maxLength - 1] = lastApprover;
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
            if (item['WF_AGRET'] === '1' || item['WF_FINAN'] === 'X' || item['WF_FINAN'] === '1') assentientList.push(item);
            else approverList.push(item);
        });

        var approverListMaxLength = 5;
        var assentientListMaxLength = 5;

        handleLastApproverLocation(approverList, approverListMaxLength);
        handleLastApproverLocation(assentientList, assentientListMaxLength);

        var i;
        for (i = approverList.length; i < approverListMaxLength; i++) approverList.push({});
        for (i = assentientList.length; i < assentientListMaxLength; i++) assentientList.push({});

        $.each([].concat(approverList, assentientList), function (index, item) {
            if (!item['APPR_STAT_TXT']) {
                item['APPR_DATE'] = '';
                item['APPR_TIME'] = '';
            }
        });

        if (header.WF_SECUR === 'X') header.WF_SECUR_TXT = $mls.getByCode('M_emergencyRequestApproval');

        var $approvalLineTable = $($ewf.mustache.approvalLineTemplate({
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
        return $el;
    };
    $ewf.getStacheView_ZUNIEFI_4207 = function(nsReturn){
        var os_head = nsReturn.getExportMap('OS_HEAD');
        var ot_data1 = nsReturn.getTableReturn('OT_DATA1');
        var ot_data2 = nsReturn.getTableReturn('OT_DATA2');

        var belnrOT_DATA1Map = {};

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
        return {os_head: os_head, ot_data1: ot_data1};
    };

    $ewf.generateZUNIEWF_6732StatementFn = function(doc_kinds) {
        return function(grono) {
            var zuniefi_6732_nsReturn = $nst.is_data_nsReturn('ZUNIEWF_6732', {GRONO: grono, DOC_KINDS: doc_kinds});
            var os_data = zuniefi_6732_nsReturn.getExportMap('OS_DATA');
            var ot_data = zuniefi_6732_nsReturn.getTableReturn('OT_DATA');
            var ot_head = zuniefi_6732_nsReturn.getTableReturn('OT_HEAD');
            var template;
            if(doc_kinds === 'A' || doc_kinds === 'C') template = $ewf.mustache.embedStatementZUNIEFI_6732_apply_Template;
            else if(doc_kinds === 'B') template = $ewf.mustache.embedStatementZUNIEFI_6732_calculate_Template;
            else if(doc_kinds === 'D') template = $ewf.mustache.embedStatementZUNIEFI_6732_domesticTemplate;
            else if(doc_kinds === 'E') template = $ewf.mustache.embedStatementZUNIEFI_6732_apply_overseasTemplate;
            else if(doc_kinds === 'F') template = $ewf.mustache.embedStatementZUNIEFI_6732_calculate_overseasTemplate;
            var $el = $(template({
                os_data : os_data,
                ot_head : ot_head,
                ot_data : ot_data
            }));
            $el.appendTo('body');
            $el.on('click','.statement-evidence-link',function () {
                var data = $(this).data();
                $.each(data, function(key, value){
                    data[key.toUpperCase()] = value;
                });
                $efi.evikbClickHandler(data);
            });
        }
    }

    $ewf.generateZUNIEFI_4208StatementFn = function(programID, isRequest) {
        return function(grono) {
            var zuniefi_4208_nsReturn = $nst.is_data_nsReturn('ZUNIEFI_4208', {GRONO: grono});
            var os_head = zuniefi_4208_nsReturn.getExportMap('OS_HEAD');
            var os_data = zuniefi_4208_nsReturn.getExportMap('OS_DATA');
            var os_text = zuniefi_4208_nsReturn.getExportMap('OS_TEXT');
            var ot_data = zuniefi_4208_nsReturn.getTableReturn('OT_DATA');
            var template = isRequest ? $ewf.mustache.embedStatementZUNIEFI_4208_RequestTemplate : $ewf.mustache.embedStatementZUNIEFI_4208Template;

            var $el = $(template({os_head: os_head}));
            $el.appendTo('body');
            $u.renderUIComponents($el, programID);

            $u.setValues($.extend(true, {}, os_head, os_data, os_text));
            $u.makeReadOnlyForm('header-invoicer-content');
            $u.makeReadOnlyForm('expenses_summary');

            var gridObj = $u.gridWrapper.getGrid();
            if (isRequest) {
                gridObj.setJSONData(ot_data);
                gridObj.makeReadOnlyGrid();
                $u.fileUI.load(os_data['EVI_SEQ'], false);
            } else {
                $ewf.UD_0220_002.setTargetGridObj(gridObj);
                gridObj.setJSONData(ot_data);
                gridObj.makeReadOnlyGrid();

                $ewf.UD_0220_002.fileAttachableInGrid = false
                $u.fileUI.load(os_data['EVI_SEQ'], !$ewf.UD_0220_002.fileAttachableInGrid);

                $ewf.UD_0220_002.alignSummaryTableVertical();
                $ewf.UD_0220_002.getExpensesSummaries();
                $ewf.UD_0220_002.setGridEvidenceImage();
                gridObj.onCellClick($ewf.UD_0220_002.onCellClick);
            }
            return $el;
        }

    }

    $ewf.getStatementElZUNIEFI_3707 = function (grono) {
        var zuniefi_3707_nsReturn = $nst.is_data_nsReturn('ZUNIEFI_3707', {GRONO: grono});
        var ot_data = zuniefi_3707_nsReturn.getTableReturn('OT_DATA');

        var $el = $('<div><div id="clear-draft-grid" class="unidocu-grid" data-sub-id="GRIDHEADER" style="height: 300px;margin-top:10px;"></div></div>');
        $u.renderUIComponents($el, 'clear-draft-grid');
        var gridObj = $u.gridWrapper.getGrid('clear-draft-grid');
        var precisionMap = {};
        $.each($u.f4Data.getCodeMapWithParams('WAERS', 'CURRDEC'), function(waers, currdec){
            precisionMap[waers] = Number(currdec);
        });
        gridObj.setNumberFormatByCurrencyColumn({"WAERS":"WRBTR"}, precisionMap);
        gridObj.setJSONData(ot_data);
        gridObj.setSortEnable(false);
        gridObj._rg.gridView.setRowGroup({expandedAdornments: 'none'});
        gridObj.setGroupMerge('BUKRS,BELNR,GJAHR,BLART,BUDAT,BANKN,BANKS,BANKL,WRBTR,WAERS,ID,PERNR');
        gridObj.fitToWindowSize();
        return $el;
    };

    $ewf.getStatementElZUNIEFI_3607 = function (grono) {
        var nsReturn = $nst.is_data_nsReturn('ZUNIEFI_3607', {GRONO: grono});

        var $el = $('<div>' +
            '<div id="form1" class="unidocu-form-table-wrapper" style="margin-top:10px;"></div>' +
            '<div id="form2" class="unidocu-form-table-wrapper"  style="margin-top:10px;"></div>' +
            '<div id="unidocu-grid-FI_0001" class="unidocu-grid" data-sub-id="GRIDHEADER" style="margin-top: 10px; height: 185px;"></div>' +
            '<div id="unidocu-grid2-FI_0001" class="unidocu-grid" data-sub-id="GRIDHEADER2" style="margin-top: 10px; height: 275px;"></div>' +
            '</div>');

        $u.renderUIComponents($el, 'FI_0001');

        var os_data_ZUNIEFI_3607 = nsReturn.getExportMap('OS_DATA');
        $u.setValues('form1', os_data_ZUNIEFI_3607);
        $u.setValues('form2', os_data_ZUNIEFI_3607);
        var gridObj = $u.gridWrapper.getGrid('unidocu-grid-FI_0001');
        var gridObj2 = $u.gridWrapper.getGrid('unidocu-grid2-FI_0001');
        gridObj.setJSONData(nsReturn.getTableReturn('OT_GL'));
        gridObj2.setJSONData(nsReturn.getTableReturn('OT_ITEM'));
        if($u.page.getPROGRAM_ID('DRAFT_0010') ) $u.fileUI.load(os_data_ZUNIEFI_3607['EVI_SEQ']);

        $u.makeReadOnlyForm('form1');
        $u.makeReadOnlyForm('form2');
        gridObj.makeReadOnlyGrid();
        gridObj2.makeReadOnlyGrid();
        return $el;
    };

    $ewf.getStatementElZUNIEFI_6500 = function (grono) {
        var gridObj = $(opener.document).find('#unidocu-grid')[0];
        var seletedGridData = gridObj.getSELECTEDJSONData()[0];

        var params = {
            GRONO: grono,
            MODE: 'S',
            CAR_NUM:seletedGridData['CAR_NUM'],
            REQNO:seletedGridData['REQNO']
        };

        var zuniefi_6500_nsReturn = $nst.is_data_nsReturn('ZUNIEFI_6500', params);
        var ot_data = zuniefi_6500_nsReturn.getTableReturn('OT_DATA');

        $.each(ot_data, function(index, item){
            item['BF_KM'] = Number(item['BF_KM']);
            item['AF_KM'] = Number(item['AF_KM']);
            item['MILEAGE'] = item['AF_KM'] - item['BF_KM'];
            item['USEKM1'] = Number(item['USEKM1']);
            item['USEKM2'] = Number(item['USEKM2']);
            item['USEKM3'] = Number(item['USEKM3']);

            if(item['WONOFF'] === 'A') item['WONOFF_TXT'] = '출/퇴근';
            if(item['WONOFF'] === 'B') item['WONOFF_TXT'] = '출근';
            if(item['WONOFF'] === 'C') item['WONOFF_TXT'] = '퇴근';
            if(item['WONOFF'] === 'D') item['WONOFF_TXT'] = '무';
        });

        return $($ewf.mustache.embedStatementZUNIEFI_6500Template({OT_DATA: ot_data}));
    };

    $ewf.statementElFnMap = {
        "10": $ewf.getStatementElZUNIEFI_4207,
        "20": $ewf.getStatementElZUNIEFI_4207,
        "30": $ewf.getStatementElZUNIEFI_4207,
        "40": $ewf.getStatementElZUNIEFI_4207,
        "50": $ewf.getStatementElZUNIEFI_4207,
        "60": $ewf.getStatementElZUNIEFI_4207,
        "65": $ewf.generateZUNIEFI_4208StatementFn('UD_0220_101', true),
        // "70": $ewf.generateZUNIEFI_4208StatementFn('UD_0220_102', false),
        // "75": $ewf.generateZUNIEFI_4208StatementFn('UD_0220_111', true),
        "80": $ewf.generateZUNIEFI_4208StatementFn('UD_0220_112', false),
        "85": $ewf.generateZUNIEFI_4208StatementFn('UD_0220_001', true),
        "90": $ewf.generateZUNIEFI_4208StatementFn('UD_0220_002', false),
        "95": $ewf.getStatementElZUNIEFI_3707,
        "94": $ewf.getStatementElZUNIEFI_3607,
        "CR": $ewf.getStatementElZUNIEFI_6500,
        "70": $ewf.generateZUNIEWF_6732StatementFn('A'), // 출장비 신청
        "71": $ewf.generateZUNIEWF_6732StatementFn('B'), // 출장비 정산
        "72": $ewf.generateZUNIEWF_6732StatementFn('C'), // 국내출장비 신청
        "73": $ewf.generateZUNIEWF_6732StatementFn('D'), // 국내출장비 정산
        "74": $ewf.generateZUNIEWF_6732StatementFn('E'), // 해외출장비 신청
        "75": $ewf.generateZUNIEWF_6732StatementFn('F') // 해와출장비 정산
    };

    $ewf.renderEmbedStatementArea = function (wf_gb, grono) {
        var getStatementElFn = $ewf.statementElFnMap[wf_gb];

        if($u.util.contains(wf_gb, ['DEMO1', 'DEMO2'])) { // MM DEMO
            getStatementElFn = function(){ // MM Demo
                var $el = $('<div><div id="statement-5000-grid" class="unidocu-grid" data-sub-id="GRIDHEADER" style="height: 300px;margin-top:10px;"></div></div>');
                $u.renderUIComponents($el, $u.page.getPageParams()['gridSubGroup']);
                $u.gridWrapper.getGrid('statement-5000-grid').setJSONData(JSON.parse($u.page.getPageParams()['selectedGridDataString']));
                return $el;
            }
        }

        if (!getStatementElFn) throw $u.util.formatString('undefined WF_GB. can not render statement WF_GB: ' + wf_gb);
        var $statementEl = getStatementElFn(grono);

        $('#embed-statement-area').append($statementEl);
        $(window).resize();
    };
    $ewf.getApprovalContentsAsStringForGWInterface = function(grono, useAnchor){
        var $deferred = $.Deferred();
        $nst.is_data_nsReturn('ZUNIEFI_4207', {GRONO: grono}, function(nsReturn){
            var $el = $($ewf.mustache.embedStatementZUNIEFI_4207Template($ewf.getStacheView_ZUNIEFI_4207(nsReturn)));
            $el.find('.statement-evidence-link').each(function(){
                var data = $(this).data();
                $.each(data, function(key, value){
                    data[key.toUpperCase()] = value;
                });
                var url = staticProperties.zuniecm_0000.WAS_IP + '/unidocu/view.do?' + $.param({
                    programId: 'UD_0398_000',
                    BUKRS: data['BUKRS'],
                    GJAHR: data['GJAHR'],
                    DOKNR: data['BELNR'],
                    showAsPopup: true
                });
                if (useAnchor) {
                    $(this).hide();
                    // noinspection HtmlUnknownTarget
                    $(this).after($u.util.formatString('<a class="statement-evidence-link" href="{url}" target="statement-evidence-link"></a>', {url: url}));
                } else {
                    var spec = $u.popup.getSpecString('', 800, 600);
                    $(this).attr('onclick', $u.util.formatString('window.open("{url}", "statement-evidence-link", "{spec}")', {
                        url: url,
                        spec: spec
                    }));
                }
            });
            $deferred.resolve($el.wrapAll('<div></div>').parent().html());
        });
        return $deferred;
    };

    $ewf.popup = {};
    $ewf.popup.openApprovalDetail = function (url, params) {
        return $u.popup.postOpen(url, 'approvalDetail', 1200, 1200, params);
    };
    $ewf.popup.openDRAFT_0011 = function (params) {
        return $u.popup.openByProgramId('DRAFT_0011', 1200, 1200, params);
    };

    $ewf.DRAFT_0061 = {};
    $ewf.DRAFT_0061.__gridObj = null;
    $ewf.DRAFT_0061.__gridObj3 = null;
    $ewf.DRAFT_0061.gridObj3_FileAttacheReadOnly = true;
    $ewf.DRAFT_0061.setTargetGridObj = function(gridObj, gridObj3){
        $ewf.DRAFT_0061.__gridObj = gridObj;
        $ewf.DRAFT_0061.__gridObj3 = gridObj3;
    };
    $ewf.DRAFT_0061.summaryGrid3ToGrid = function(){
        var grid3Data = $ewf.DRAFT_0061.__gridObj3.getJSONData();
        var summaryMap = {};

        function appendSummary(pernr) {
            summaryMap[pernr] = {ROOM_EXP: 0, TRANS_EXP: 0, DAILY_EXP: 0, SUM_TOTAL: 0}
        }

        var exp_gb_columnKey_map = {"A": 'ROOM_EXP', "B": 'TRANS_EXP', "C": 'DAILY_EXP'};

        $.each(grid3Data, function (index, item) {
            var pernr = item['PERNR'];
            var summary = summaryMap[pernr];
            if (!summary) {
                appendSummary(pernr);
                summary = summaryMap[pernr];
            }
            var columnKey = exp_gb_columnKey_map[item['EXP_GB']];
            var wrbtr = Number(item['WRBTR']);

            summary[columnKey] += wrbtr;
            summary['SUM_TOTAL'] += wrbtr;
        });
        var jsonData = $ewf.DRAFT_0061.__gridObj.getJSONData();
        $.each(jsonData, function (rowIndex, item) {
            var pernr = item['PERNR'];
            var summary = summaryMap[pernr];
            $.each('ROOM_EXP,TRANS_EXP,DAILY_EXP,SUM_TOTAL'.split(','), function (index, columnKey) {
                if (summary) $ewf.DRAFT_0061.__gridObj.$V(columnKey, rowIndex, summary[columnKey]);
                else $ewf.DRAFT_0061.__gridObj.$V(columnKey, rowIndex, '0');
            });
        });
    };
    $ewf.DRAFT_0061.setGrid3EvidenceImage = function(){
        $.each($ewf.DRAFT_0061.__gridObj3.getJSONData(), function (rowIndex, item) {
            var evi_gb = item['EVI_GB'];
            if (evi_gb === 'E') $ewf.DRAFT_0061.setEvidenceImageByFileCount(rowIndex, $nst.is_data_ot_data('ZUNIECM_5000', {EVI_SEQ: item['EVKEY']}).length);
            if (evi_gb === 'C') $ewf.DRAFT_0061.setHasEvidenceImage(rowIndex);
        });
    };
    $ewf.DRAFT_0061.setEvidenceImageByFileCount = function (rowIndex, fileCount) {
        if (fileCount > 0) $ewf.DRAFT_0061.setHasEvidenceImage(rowIndex);
        else $ewf.DRAFT_0061.setAttachableImage(rowIndex);
    };
    $ewf.DRAFT_0061.setHasEvidenceImage = function (rowIndex) {
        $ewf.DRAFT_0061.setEVKEY_Image(rowIndex, 'hasEvidence');
    };
    $ewf.DRAFT_0061.setAttachableImage = function (rowIndex) {
        $ewf.DRAFT_0061.setEVKEY_Image(rowIndex, 'attachable');
    };
    $ewf.DRAFT_0061.setEVKEY_Image = function (rowIndex, type) {
        var url = {
            noEvidence: '',
            hasEvidence: '/images/btn/icon_ev.gif',
            attachable: '/images/btn/btn_view.gif'
        }[type];
        $ewf.DRAFT_0061.__gridObj3.setImage('EVKEY_', rowIndex, url)
    };

    $ewf.DRAFT_0061.gridObj3OnCellClick = function (columnKey, rowIndex) {
        var gridObj3 = $ewf.DRAFT_0061.__gridObj3;
        if (columnKey === 'BELNR' && gridObj3.$V(columnKey, rowIndex)) $efi.popup.openStatementViewWithParamMap(gridObj3.getJSONDataByRowIndex(rowIndex));
        if (columnKey === 'EVKEY_') {
            var evkey = gridObj3.$V('EVKEY', rowIndex);
            var evi_gb = gridObj3.$V('EVI_GB', rowIndex);
            if (evi_gb === 'C') $efi.popup.openCardBill(evkey);
            if (evi_gb === 'E') {
                var $dialog = $u.dialog.fineUploaderDialog.open(evkey, $ewf.DRAFT_0061.gridObj3_FileAttacheReadOnly);
                $dialog.find('#file-attach-content').on('fileCountChange', function (event, fileCount) {
                    $ewf.DRAFT_0061.setEvidenceImageByFileCount(rowIndex, fileCount);
                    gridObj3.$V('EVKEY', rowIndex, $dialog.data('fineUploader').getFileGroupId());
                });
            }
        }
    };

    $ewf.UD_0220_122 = {};
    $ewf.UD_0220_002 = {};
    $ewf.UD_0220_002.__gridObj = null;
    $ewf.UD_0220_002.fileAttachableInGrid = false;
    $ewf.UD_0220_002.setTargetGridObj = function(gridObj){
        $ewf.UD_0220_002.__gridObj = gridObj;
    };
    $ewf.UD_0220_002.alignSummaryTableVertical = function() {
        var $tbody = $('#expenses_summary').find('tbody');
        var $ths = $tbody.find('th');
        var $tds = $tbody.find('td');
        var $inputs = $tds.find('.input-box');
        var COLUMNS_HEIGHT = '30px';

        $tbody.parent().css('width', 'auto');
        $ths.css('height', COLUMNS_HEIGHT);
        $ths.last().attr('colspan', $inputs.length / $ths.length);
        $tds.css({
            'width': '',
            'height': COLUMNS_HEIGHT,
            'text-align': 'right'
        });
        $tds.last().css('border-right', '1px solid #ddd');
        $tds.find('.input-box').css('width', (($ths.length / $inputs.length) * 200) + 'px');

        $ths.appendTo($tbody).wrapAll('<tr></tr>');
        $tds.appendTo($tbody).wrapAll('<tr></tr>');
        $tbody.find('tr').each(function(_, elem) {
            if (elem.children.length === 0) elem.remove();
        });
    }
    $ewf.UD_0220_002.getExpensesSummaries = function(){
        var gridObj = $ewf.UD_0220_002.__gridObj;
        return gridObj.getJSONData().reduce(function(summary, rowData) {
            var key = !rowData['EXP_GB'] ? 'ETC' : rowData['EXP_GB'];
            var wrbtr = parseFloat(rowData['WRBTR']);
            if (isNaN(wrbtr)) return summary;
            summary[key] += wrbtr;
            return summary;
        }, gridObj.getGridHeader('EXP_GB').combos.reduce(function(summary, comboOption) {
            var key = !comboOption['EXP_GB'] ? 'ETC' : comboOption['EXP_GB'];
            summary[key] = 0;
            return summary;
        }, {}));
    }
    $ewf.UD_0220_002.setSummaryFormValues = function(summaries){
        var total = 0;
        var table = $ewf.UD_0220_002.getExpensesFieldNameMappingTable();
        $.each(summaries, function(key, value) {
            var formInput = $u.get(table[key]);
            if (formInput) formInput.setValue(value === 0 ? '' : value.toLocaleString());
            total += value;
        });
        $u.get('SUM_EXP').setValue(total.toLocaleString());
        if ($u.get('SUM_EXP_A')) $u.buttons.runCustomHandler('setColorIndicatorOnEXP');
    }
    $ewf.UD_0220_002.getExpensesFieldNameMappingTable = function(){
        return $u.webData.programSetting.getData('UD_0220_002')['expKeyMappingTable'];
    };
    $ewf.UD_0220_002.setGridEvidenceImage = function(){
        var gridData;
        if(/^UD_0220_112$|^UD_0220_122$|^UD_0220_132$/.test($u.page.getPROGRAM_ID())) {
            gridData = $u.gridWrapper.getGrid().getJSONData();
        }  else gridData = $ewf.UD_0220_002.__gridObj.getJSONData();
        $.each(gridData, function (rowIndex, item) {
            var evi_gb = item['EVI_GB'];
            if (evi_gb === 'E') $ewf.UD_0220_002.setEvidenceImageByFileCount(rowIndex, $nst.is_data_ot_data('ZUNIECM_5000', {EVI_SEQ: item['EVKEY']}).length);
            if (evi_gb === 'C') {
                if (item['EVKEY']) $ewf.UD_0220_002.setHasEvidenceImage(rowIndex);
                else $ewf.UD_0220_002.setAttachableImage(rowIndex);
            }
        });
    };
    $ewf.UD_0220_002.setEvidenceImageByFileCount = function (rowIndex, fileCount) {
        if (fileCount > 0) $ewf.UD_0220_002.setHasEvidenceImage(rowIndex);
        else $ewf.UD_0220_002.setAttachableImage(rowIndex);
    };
    $ewf.UD_0220_002.setHasEvidenceImage = function (rowIndex) {
        $ewf.UD_0220_002.setEVKEY_Image(rowIndex, 'hasEvidence');
    };
    $ewf.UD_0220_002.setAttachableImage = function (rowIndex) {
        $ewf.UD_0220_002.setEVKEY_Image(rowIndex, 'attachable');
    };
    $ewf.UD_0220_002.setEVKEY_Image = function (rowIndex, type) {
        var url = {
            noEvidence: '',
            hasEvidence: '/images/btn/icon_ev.gif',
            attachable: '/images/btn/btn_view.gif'
        }[type];
        if(/^UD_0220_122$|^UD_0220_132$|^UD_0220_112$/.test($u.page.getPROGRAM_ID())) $u.gridWrapper.getGrid().setImage('EVKEY_', rowIndex, url);
        else $ewf.UD_0220_002.__gridObj.setImage('EVKEY_', rowIndex, url)
    };

    $ewf.UD_0220_002.handleDivideExpPopupClose = function (popup) {
        var TARGET_EVENT = 'beforePageReload';
        var interval = setInterval(function () {
            if (popup.closed) {
                clearInterval(interval);
                $('.ui-dialog.autoRemovable').remove();
            } else {
                if (document.hasFocus() && $('.ui-dialog').length === 0) {
                    unidocuAlert($mls.getByCode('M_UD_0220_002_outOfControlWhenPopupIsOpened'), function () {
                        if (popup.focus) popup.focus();
                    }).parent().addClass('autoRemovable');
                }
            }
        }, 100);
        function closePopup() {
            popup.close();
            clearInterval(interval);
            document.removeEventListener(TARGET_EVENT, closePopup);
        }
        window.addEventListener('beforeunload', closePopup);
        document.addEventListener(TARGET_EVENT, closePopup);
    };

    $ewf.UD_0220_002.closeWhenOpenerIsClosed = function () {
        var openerChecker = setInterval(function () {
            if (!window.opener || window.opener.closed) {
                clearInterval(openerChecker);
                window.close();
            }
        }, 300);
    };

    $ewf.UD_0220_122.addHandlerCreateStatementInPopup = function () {
        if(/^UD_0220_122$|^UD_0220_132$/.test(opener.$u.page.getPROGRAM_ID())) {
            $u.programSetting.setValue('setCreateStatementFunction', opener.$u.programSetting.getValue('DividedStatementFunction'));
            $u.programSetting.setValue('기준 금액 체크 사용여부', opener.$u.programSetting.getValue('기준 금액 체크 사용여부'));
        }
        $u.buttons.addHandler({
            'createStatement': function() {
                $efi.createStatement.validateCreateStatement();
                var params = $efi.createStatement.getCreateStatementCommonParams();
                if (opener.$u.programSetting.getValue('sendExpsWhenCreateDividedStatement') === 'true') {
                    params['paramMap'] = $.extend(params['paramMap'], {
                        'REQNO': opener.$u.getValues()['REQNO'],
                        'VALUE': $u.page.getPageParams()['EXP_GB'],
                        'EVIGB': $u.page.getPageParams()['EVI_GB']
                    });
                }
                params['afterWhenCreateStatement'] = function (os_data, os_docNo) {
                    if (opener && !opener.closed) {
                        var rowIndex = $u.page.getPageParams()['rowIndex'];
                        opener.$u.buttons.runCustomHandler('setDividedDataFromChild', rowIndex, os_data);
                        opener.$u.buttons.runCustomHandler('saveDocument3', opener.$u.buttons.runCustomHandler('getDocument'));
                    }
                    $efi.dialog.afterCreateStatementDialogInPopup.open(os_docNo);
                    window.close();
                };
                if($u.page.getPROGRAM_ID() === 'UD_0202_001') params.paramMap.SEQ=$u.page.getPageParams()['rowIndex'];
                if (!window.opener || window.opener.closed) return;
                $efi.createStatement.callCreateStatementFn_UD_0220_122(params);
            }
        })
    }
    $ewf.UD_0220_002.addHandlerCreateStatementInPopup = function () {
        if(/^UD_0220_122$|^UD_0220_132$/.test(opener.$u.page.getPROGRAM_ID())) {
            return $ewf.UD_0220_122.addHandlerCreateStatementInPopup()
        }

        if (opener.$u.page.getPROGRAM_ID() !== 'UD_0220_002') {
            $u.programSetting.setValue('setCreateStatementFunction', opener.$u.programSetting.getValue('DividedStatementFunction'));
        }
        $u.buttons.addHandler({
            'createStatement': function() {
                $efi.createStatement.validateCreateStatement();
                var params = $efi.createStatement.getCreateStatementCommonParams();
                var doc = {};
                if (opener.$u.programSetting.getValue('sendExpsWhenCreateDividedStatement') === 'true') {
                    params['paramMap'] = $.extend(params['paramMap'], {
                        'REQNO': opener.$u.getValues()['REQNO_A'],
                        'VALUE': $u.page.getPageParams()['EXP_GB'],
                        'EVIGB': $u.page.getPageParams()['EVI_GB']
                    });
                }
                params['afterWhenCreateStatement'] = function (os_docNo) {
                    if (opener && !opener.closed) {
                        var rowIndex = $u.page.getPageParams()['rowIndex'];
                        opener.$u.buttons.runCustomHandler('setDividedDataFromChild', rowIndex, os_docNo);
                        opener.$u.buttons.runCustomHandler('saveDocument', opener.$u.buttons.runCustomHandler('getDocument'))
                            .then(function(nsReturn) {
                                var os_data = nsReturn.getExportMap('OS_DATA');
                                opener.$u.setValues(os_data);
                                return opener.$u.buttons.runCustomHandler('fetchDocument', os_data);
                            })
                            .then(opener.$u.buttons.getCustomHandler('convertNSReturnToDocument'))
                            .then(function(docu) {
                                doc = docu;
                                return docu;
                            })
                            .then(opener.$u.buttons.getCustomHandler('fillThePageWithDocument'))
                            .then(function() {
                                if (opener.$u.buttons.runCustomHandler('haveAllLinesBELNR', opener.$u.gridWrapper.getGrid().getJSONData()))
                                    opener.$u.buttons.runCustomHandler('showResultDialog', doc['formData']);
                            })
                    }
                    $efi.dialog.afterCreateStatementDialogInPopup.open(os_docNo);
                };
                if (!window.opener || window.opener.closed) return;
                $efi.createStatement.callCreateStatementFn(params);
            }
        })
    };

    $ewf.UD_0220_002.onCellClick = function (columnKey, rowIndex) {
        var gridObj = $ewf.UD_0220_002.__gridObj;
        var evi_gb = gridObj.$V('EVI_GB', rowIndex);
        if (columnKey === 'BELNR' && gridObj.$V(columnKey, rowIndex)) $efi.popup.openStatementViewWithParamMap(gridObj.getJSONDataByRowIndex(rowIndex));
        else if (columnKey === 'EVKEY_') {
            var evkey = gridObj.$V('EVKEY', rowIndex);
            if (evi_gb === 'C') {
                if (!evkey) gridObj.triggerChangeCell('EVI_GB', rowIndex);
                else $efi.popup.openCardBill(evkey);
            }
            if (evi_gb === 'E') {
                var $dialog = $u.dialog.fineUploaderDialog.open(evkey, !$ewf.UD_0220_002.fileAttachableInGrid);
                if ($u.programSetting.getValue('useFileSearchDialog') === 'true')
                    $dialog.data('fineUploader').useSearchButton();
                $dialog.find('#file-attach-content').on('fileCountChange', function (event, fileCount) {
                    $ewf.UD_0220_002.setEvidenceImageByFileCount(rowIndex, fileCount);
                    gridObj.$V('EVKEY', rowIndex, $dialog.data('fineUploader').getFileGroupId());
                });
            }
        }
        else if (columnKey === 'EXP_DIVIDE' && gridObj.isCellEditable('EXP_DIVIDE', rowIndex)
            && gridObj.$V('EXP_DIVIDE', rowIndex) !== '1' && $u.page.getPROGRAM_ID() !== 'DRAFT_0010') {
            if (evi_gb === 'C') {
                $nst.is_data_os_data($u.programSetting.getValue('businessCreditSearchFunction'),
                    {'CRD_SEQ': gridObj.$V('EVKEY', rowIndex)}, function(os_data) {
                        os_data['APPR_DATE_APPR_TIME'] = $u.util.date.getDateAsUserDateFormat(os_data['APPR_DATE']) + ' ' + os_data['APPR_TIME'];
                        $efi.vendorInfoAddedDataHandler.handleByProgramId($u.page.getPROGRAM_ID(), os_data, function (vendorAddedData) {
                            var popup = $u.popup.openByProgramId('UD_0201_001', 1250, 950,
                                $.extend({'rowIndex': rowIndex}, vendorAddedData, gridObj.getJSONDataByRowIndex(rowIndex)));
                            $ewf.UD_0220_002.handleDivideExpPopupClose(popup);
                        });
                    });
            } else {
                var popup = $u.popup.openByProgramId('UD_0202_001', 1250, 700,
                    $.extend({'rowIndex': rowIndex, 'hideFileUI': !gridObj.$V('EVI_GB', rowIndex)}, gridObj.getJSONDataByRowIndex(rowIndex)));
                $ewf.UD_0220_002.handleDivideExpPopupClose(popup);
            }
        }
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
                var $dialog = $u.dialog.fineUploaderDialog.open(evkey, !$ewf.UD_0220_002.fileAttachableInGrid);
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
            if (evi_gb === 'C') {
                if (gridObj.$V('EXP_GB', rowIndex) === '') throw '비용구분을 선택해 주세요.';
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
                if (gridObj.$V('EXP_GB', rowIndex) === '') throw '비용구분을 선택해 주세요.';
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
                    var popup = $u.popup.openByProgramId('UD_0202_001', 1250, 700,
                        $.extend({'SEQ': gridObj.$V('SEQ', rowIndex), 'rowIndex': rowIndex, 'hideFileUI': !gridObj.$V('EVI_GB', rowIndex)}, gridObj.getJSONDataByRowIndex(rowIndex)));
                    $ewf.UD_0220_002.handleDivideExpPopupClose(popup);
                });
            }
        }
    };
});
