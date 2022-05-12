/** @module test/jasmine/$ewfSpec */
define(function () {
    // noinspection JSNonASCIINames,NonAsciiCharacters
    var specItems = {
        "$ewf": {
            "$ewf.draftUtil.isReadOnly pageParams mode 값 으로 readOnly 여부 return": function () {
                $u.page.update({pageParams: {}});
                expect($ewf.draftUtil.isReadOnly()).toBe(false);
                $u.page.update({pageParams: {mode: 'readOnly'}});
                expect($ewf.draftUtil.isReadOnly()).toBe(true);
            },
            "$ewf.draftUtil.hasSavedData 저장된 데이터가 있는지 여부 return. readOnly, edit mode 인경우 저장된 데이터가 존재": function () {
                $u.page.update({pageParams: {}});
                expect($ewf.draftUtil.hasSavedData()).toBe(false);
                $u.page.update({pageParams: {mode: 'readOnly'}});
                expect($ewf.draftUtil.hasSavedData()).toBe(true);
                $u.page.update({pageParams: {mode: 'edit'}});
                expect($ewf.draftUtil.hasSavedData()).toBe(true);
            },
            "$ewf.draftUtil.initializeDraftPage WF_GB program setting, draft title, setDraftTitle": {
                "beforeAll": function(){
                    spyOn($u.page, 'getPROGRAM_ID').and.returnValue('TEST_DRAFT');
                    this.callInitializeDraftPage = function () {
                        $u.programSetting.initialize();
                        $ewf.draftUtil.initializeDraftPage();
                    };
                },
                "WF_GB 설정 validation": function(){
                    expect(this.callInitializeDraftPage).toThrow('WF_GB is empty. set default WF_GB using program setting.');
                },
                "changeLine validation": function(){
                    $u.initialize();
                    spyOn($u.page, 'getPageParams').and.returnValue({WF_GB: 'pageParams WF_GB'});
                    expect(this.callInitializeDraftPage).toThrow('uni-form-table1 changeLine required set form setting');
                }
            },
            "$ewf.draftUtil.getWF_GB pageParams[WF_GB] 또는 programSetting['WF_GB'] pageParam 우선": function(){
                spyOn($u.programSetting, 'getValue').and.returnValue('programSetting WF_GB');
                expect($ewf.draftUtil.getWF_GB()).toBe('programSetting WF_GB');
                spyOn($u.page, 'getPageParams').and.returnValue({WF_GB: 'pageParams WF_GB'});
                expect($ewf.draftUtil.getWF_GB()).toBe('pageParams WF_GB');
            },
            "$ewf.draftUtil.getWF_GB_TXT WF_GB code 값으로 code text return": function(){
                expect($ewf.draftUtil.getWF_GB_TXT('10')).toBe('비용전표');
            },

            "$ewf.dialog.approvalCommentsDialog": {
                "open": function(){
                    $ewf.dialog.approvalCommentsDialog.open({ title: 'approval comments dialog'});
                    expect(jasmineUtil.hasDialog()).toBeTruthy();
                    expect($('#unidocu-td-APPROVAL_PASSWORD').length).toBe(0);
                    expect($u.get("approvalCommentsDialog", 'APPROVAL_PASSWORD').$el.find('.input-box').hasClass('state-require')).toBeFalsy();
                    expect($u.get("approvalCommentsDialog", 'APPROVAL_COMMENTS').$el.find('input-box').hasClass('state-require')).toBeFalsy();
                },
                "usePassword": function(){
                    $ewf.dialog.approvalCommentsDialog.open({
                        title: 'approval comments dialog',
                        usePassword: true
                    });
                    expect(jasmineUtil.hasDialog()).toBeTruthy();
                    expect($('#unidocu-td-APPROVAL_PASSWORD').length).toBe(1);
                    expect($u.get("approvalCommentsDialog", 'APPROVAL_PASSWORD').$el.find('.input-box').hasClass('state-require')).toBeTruthy();
                }
            },
            "$ewf.dialog.changeWF_ORGDialog": {
                "참조기안 조회": '',
                "todo dialog layout 적용": '',
                "open": function(){
                    $ewf.dialog.changeWF_ORGDialog.open();
                    expect(jasmineUtil.hasDialog()).toBeTruthy();
                },
                "callback 선택된 데이터를 반환": function() {
                    $ewf.dialog.changeWF_ORGDialog.open(function(result){
                        expect(result[0]['WF_TITLE']).toBe('test');
                    });
                    $u.gridWrapper.getGrid('reference-search-grid').setJSONData([{SELECTED: '1', WF_TITLE: 'test'}]);
                    $('.ui-dialog-buttonset button').click();
                }
            },
            "$ewf.dialog.sendApprovalAlarmDialog": {
                "open": function(){
                    $ewf.dialog.sendApprovalAlarmDialog.open({WF_ID_TXT: 'WF_ID_TXT(상신자)', WF_DATE: 'WF_DATE(상신일자)', WF_KEY_TEXT: 'WF_KEY_TEXT(문서번호)'});
                }
            },
            "$ewf.dialog.modifyApprovalDialog": {
                "beforeEach": function(){
                    jasmineUtil.appendMockNamedServiceReturn('ZUNIEWF_1200', {
                        exportMaps: {OS_DATA: {}}
                    });
                },
                open: function(){
                    $ewf.dialog.modifyApprovalDialog.open({
                        ZUNIEWF_2001Params: {}
                    });
                    expect(jasmineUtil.hasDialog()).toBeTruthy();
                },
                "mode": {
                    "directChange": {
                        "approval-dialog-form-table 제거": function () {
                            $ewf.dialog.modifyApprovalDialog.open({
                                mode: 'directChange',
                                ZUNIEWF_2001Params: {}
                            });
                            expect(jasmineUtil.hasDialog()).toBeTruthy();
                        }
                    }
                },
                "보안문서 체크시 wf_secure X 로 전달": function () {
                    var tableReturns = {OT_DATA1: [], OT_DATA2: [], OT_DATA3: [], OT_DATA4: []};
                    $ewf.dialog.modifyApprovalDialog.open({
                        mode: 'directChange',
                        tableReturns: tableReturns,
                        ZUNIEWF_2001Params: {},
                        directChangeConfirmCallback: function (wf_secure) {
                            expect(wf_secure).toBe('X');
                        }
                    });
                    $u.gridWrapper.getGrid('approval-line-grid1').addRow();
                    $u.get('approval-dialog-form-table2', 'WF_SECUR').setValue('X');
                    $('.ui-dialog-buttonset').find('button').first().click();
                },
                "open with dummy data (ZUNIEWF_1032)": function () {
                    jasmineUtil.appendMockNamedServiceReturn({
                        "tableReturns": {
                            "OT_USER": [
                                {"JOB_KEY_TXT": "team1", "PERNR": "00000002", "SNAME": "user1", "NODE_KEY": "3000000000", "ID": "2"},
                                {"JOB_KEY_TXT": "team12", "PERNR": "00000003", "SNAME": "user2", "NODE_KEY": "1000000000", "ID": "3"}
                            ],
                            "OT_DATA": [
                                {"NODE_KEY": "1000000000", "HEAD_KEY": "", "NODE_KEY_TXT": "유니포스트"},
                                {"NODE_KEY": "2000000000", "HEAD_KEY": "1000000000", "NODE_KEY_TXT": "개발팀"},
                                {"NODE_KEY": "3000000000", "HEAD_KEY": "1000000000", "NODE_KEY_TXT": "운영팀"}
                            ]
                        }
                    });

                    $ewf.dialog.modifyApprovalDialog.open({
                        ZUNIEWF_2001Params: {}
                    });
                }
            },
            "$ewf.dialog.draftPreviewDialog": {
                "open": function(){
                    $ewf.dialog.draftPreviewDialog.open($('<div>test</div>'));
                    expect(jasmineUtil.hasDialog()).toBeTruthy();
                }
            },
            "$ewf.draftTitleTemplate": function () {
                var $draftTitle = $($ewf.mustache.draftTitleTemplate({
                    WF_GB_TXT: 'WF_GB_TXT',
                    description: 'description',
                    WF_KEY_TEXT: 'WF_KEY_TEXT'
                }));
                jasmineUtil.appendFixture($('<div style="background-color: #fff; padding: 20px;width: 1000px"></div>').append($draftTitle));
                expect($draftTitle.find('.title').text()).toBe('[WF_GB_TXT]  description');
            },

            "$ewf.changeLine": {
                "beforeEach": function(){
                    spyOn($u.programSetting, 'getValue').and.returnValue('WF_GB');
                    jasmineUtil.appendFixture($(
                        '<div id="uni-form-table1" data-sub-group="DRAFT_0012" class="unidocu-form-table-wrapper"></div>' +
                        '<div id="approval-line-wrapper" style="margin-top: 10px;"></div>'
                    ));
                    $u.renderUIComponents(jasmineUtil.getJasmineFixture());
                    $ewf.changeLine.initialize([
                        {SEQ: 'foo1', SEQ_TXT: 'bar1'},
                        {SEQ: 'foo2', SEQ_TXT: 'bar2'},
                        {SEQ: 'foo3', SEQ_TXT: 'bar3'}
                    ]);
                },
                "$ewf.changeLine.initialize 결재선 변경 combo 초기화": function(){
                    expect($u.get('uni-form-table1', 'changeLine').$el.find('select option').length).toBe(3);
                },
                "$ewf.changeLine.getSelectedOT_DATA 선택된 결재라인 정보 return": function(){
                    $u.get('uni-form-table1', 'changeLine').setValue('foo3');
                    expect($ewf.changeLine.getSelectedOT_DATA()).toEqual({SEQ: 'foo3', SEQ_TXT: 'bar3'});
                },
                "$ewf.changeLine.getTableReturns $ewf.changeLine.setTableReturns": function(){
                    $ewf.changeLine.setTableReturns('foo');
                    expect($ewf.changeLine.getTableReturns()).toBe('foo');
                },
                "$ewf.changeLine.getWF_SECUR $ewf.changeLine.setWF_SECUR": function(){
                    $ewf.changeLine.setWF_SECUR('foo');
                    expect($ewf.changeLine.getWF_SECUR()).toBe('foo');
                }
            },
            "$ewf.getApprovalLineEl": {
                "beforeEach": function(){
                    jasmineUtil.appendMockNamedServiceReturn('ZUNIEWF_1200', {
                        exportMaps: {OS_DATA: {}}
                    });
                },
                "approvalLineSpec02 마지막 결재자는 제일 뒤로 표시": function () {
                },
                "approvalLineSpec03 ZUNIEWF_4323 OT_DATA 결과가 있는 경우 결재 의견 표시": function () {
                    var mockZUNIEWF_4323_OT_DATA = [{
                        APPR_STAT_TXT: 'APPR_STAT_TXT',
                        APPR_DEPT_TXT: 'APPR_DEPT_TXT',
                        APPR_ID_TXT: 'APPR_ID_TXT',
                        JOB_KEY_TXT: 'JOB_KEY_TXT',
                        APPR_DATE: 'APPR_DATE',
                        APPR_TIME: 'APPR_TIME',
                        APPR_TEXT: 'APPR_TEXT'
                    }];
                    jasmineUtil.appendFixture($ewf.getApprovalLineEl({}, {}, [], mockZUNIEWF_4323_OT_DATA));
                    expect(jasmineUtil.getJasmineFixture().find('.approval-comments').css('display')).not.toBe('none');
                },
                "approvalLineSpec04 문서 정보 text가 긴경우 ellipsis 적용": function () {
                    jasmineUtil.appendFixture($ewf.getApprovalLineEl({
                        WF_DATE: '1234567890123456789012345678901234567890123456789012345678901234567890',
                        WF_SECUR_TXT: '1234567890123456789012345678901234567890123456789012345678901234567890'
                    }, {}, [], []));
                    jasmineUtil.getJasmineFixture().find('.approval-line-template-left table').each(function () {
                        expect($(this).width()).toBeLessThan(251);
                    });
                }
            },
            "$ewf.handleChangeLine": function () {
                jasmineUtil.appendMockNamedServiceReturn('ZUNIEWF_1200', {
                    exportMaps: {OS_DATA: {}}
                });
                spyOn($u.programSetting, 'getValue').and.returnValue('WF_GB');
                jasmineUtil.appendFixture($(
                    '<div id="uni-form-table1" data-sub-group="DRAFT_0012" class="unidocu-form-table-wrapper"></div>' +
                    '<div id="approval-line-wrapper" style="margin-top: 10px;"></div>'
                ));
                expect(jasmineUtil.getJasmineFixture().find('.approval-line-template').length).toBe(0);

                $u.renderUIComponents(jasmineUtil.getJasmineFixture());
                $ewf.handleChangeLine();
                expect(jasmineUtil.getJasmineFixture().find('.approval-line-template').length).toBe(1);
            },
            "$ewf.getStatementElZUNIEFI_4207": function(){
                jasmineUtil.appendMockNamedServiceReturn('ZUNIEFI_4207', {
                    exportMaps: {
                        OS_HEAD: {}
                    },
                    tableReturns: {
                        OT_DATA1: [{BELNR: 'BELNR1'}, {BELNR: 'BELNR2'}],
                        OT_DATA2: [{BELNR: 'BELNR1'}, {BELNR: 'BELNR1'}, {BELNR: 'BELNR2'}, {BELNR: 'BELNR2'}, {BELNR: 'BELNR2'}]
                    }
                });
                jasmineUtil.appendFixture($ewf.getStatementElZUNIEFI_4207('FI20170000001824'));
                var $fixture = jasmineUtil.getJasmineFixture();
                expect($fixture.find('.embed-statement-header').length).toBe(2);
            },
            "$ewf.getStatementElZUNIEFI_4208": function(){
                jasmineUtil.appendMockNamedServiceReturn('ZUNIEFI_4208', {
                    exportMaps: {},
                    tableReturns: {}
                });
                jasmineUtil.appendFixture($('<div id="contents" style="width: 1000px;"></div>'));
                var $fixture = jasmineUtil.getJasmineFixture();
                var $input = $('<input />');
                $input.val('FI20180000001283').change(function(){
                    $fixture.find('#contents').empty().append($ewf.getStatementElZUNIEFI_4208($input.val()))
                }).change();
                $fixture.prepend($input);
                $fixture.prepend('GRONO: ');
            },
            "$ewf.getApprovalContentsAsStringForGWInterface(grono, useAnchor)": function () {
                jasmineUtil.appendFixture('<div></div>');
                jasmineUtil.specWithFormNButton('ewfSpec', 'getApprovalContentsAsStringForGWInterfaceForm', function(){
                    var grono = $u.get('GRONO').getValue();
                    function renderContents(approvalContentsDeferred, additionalTitle){
                        $.when(approvalContentsDeferred).done(function(content){
                            var title = '<h2>getApprovalContentsAsStringForGWInterface</h2>';
                            if(additionalTitle) title += additionalTitle;
                            var win = $u.popup.openPopup('', '_blank', 1000, 1200);
                            win.document.body.innerHTML = title + content;
                            jasmineUtil.getJasmineFixture().append(title + content);
                        });
                    }

                    renderContents($ewf.getApprovalContentsAsStringForGWInterface(grono));
                    renderContents($ewf.getApprovalContentsAsStringForGWInterface(grono, true), '<h2>useAnchor</h2>');

                    var title = '<h2>getStatementElZUNIEFI_4207</h2>';
                    jasmineUtil.getJasmineFixture().append(title + $ewf.getStatementElZUNIEFI_4207(grono));
                });
            }
        }
    };
    return function () {
        jasmineUtil.runSpecItems({
            beforeAll: function () {
                jasmineUtil.$ajaxToSynchronousCall();
                jasmineUtil.bindMockNamedServices();
            },
            beforeEach: jasmineUtil.beforeEachSpec,
            specItems: specItems
        });
    };
});
