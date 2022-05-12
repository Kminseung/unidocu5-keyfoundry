/** @module test/jasmine/efiSpec */
define(['stache!test/jasmine/efiTestTemplate'], function (efiTestTemplate) {
    // noinspection JSNonASCIINames,NonAsciiCharacters
    var specItems = {
        "$efi": {
            "$efi.dialog": {
                "$efi.dialog.MULTIPODATADialog": {
                    "구매전표번호 입력 dialog": '',
                    "open": function () {
                        $efi.dialog.MULTIPODATADialog.open(function () {
                        });
                        expect(jasmineUtil.hasDialog()).toBeTruthy();
                    }
                },
                "$efi.dialog.POHISTORYDialog": {
                    "구매오더 이력 dialog": '',
                    "open": function () {
                        $efi.dialog.POHISTORYDialog.open([{}, {}]);
                        expect($u.gridWrapper.getGrid('dialog-search-grid').getRowCount()).toBe(2);
                    }
                },
                "$efi.dialog.batchApplyDialog": {
                    "open": function () {
                        $efi.dialog.batchApplyDialog.open();
                        expect(jasmineUtil.hasDialog()).toBeTruthy();
                    }
                },
                "$efi.dialog.evidenceSelectDialog": {
                    "증빙 선택 dialog": '',
                    "dialogParams": {
                        "evidencePROGRAM_ID": {
                            "UD_0201_000 법인카드 내역 선택 dialog": function () {
                                $efi.dialog.evidenceSelectDialog.open({evidencePROGRAM_ID: 'UD_0201_000'});
                                expect(jasmineUtil.getNamedServiceCalledInfo('ZUNIEFI_1000')).toBeTruthy();
                            }
                        }
                    },
                    "selectCallback": {
                        "조회 내역 클릭시 선택 항목에 업체 정보가 더해진 데이터를 반환": function () {
                            jasmineUtil.appendMockNamedServiceReturn('ZUNIEFI_4001', {tableReturns: {OT_DATA: [{LIFNR: 'testLIFNR'}]}});
                            jasmineUtil.appendMockNamedServiceReturn('ZUNIEFI_1000', {tableReturns: {OT_DATA: [{CARDNO: 'testCARDNO'}]}});
                            var actual = null;
                            $efi.dialog.evidenceSelectDialog.open({
                                evidencePROGRAM_ID: 'UD_0201_000', selectCallback: function (vendorInfoAddedData) {
                                    actual = vendorInfoAddedData
                                }
                            });
                            $u.gridWrapper.getGrid('dialog-search-grid').__onCellClick('CARDNO', 0);
                            jasmineUtil.expectSameObjIgnoreUndefined(actual, {LIFNR: 'testLIFNR', CARDNO: 'testCARDNO'})
                        }
                    },
                    "closeWithoutSelectCallback": {
                        "선택 없이 창을 닫는 경우 호출": function () {
                            var closeCount = 0;

                            function closeWithoutSelectCallback() {
                                closeCount++;
                            }

                            var $dialog;
                            $dialog = $efi.dialog.evidenceSelectDialog.open({
                                evidencePROGRAM_ID: 'UD_0201_000',
                                closeWithoutSelectCallback: closeWithoutSelectCallback
                            });
                            $dialog.dialog('close');
                            expect(closeCount).toBe(1);
                            $dialog = $efi.dialog.evidenceSelectDialog.open({
                                evidencePROGRAM_ID: 'UD_0201_010',
                                closeWithoutSelectCallback: closeWithoutSelectCallback
                            });
                            $dialog.dialog('close');
                            expect(closeCount).toBe(2);
                        }
                    }
                },
                "$efi.dialog.addDataDialog": {
                    "open": function () {
                        $efi.dialog.addDataDialog.open('addDataPROGRAM_ID', 'addDataKey', 0, JSON.stringify({dummyField: 'dummyValue'}));
                        expect(jasmineUtil.hasDialog()).toBeTruthy();
                    }
                },
                "$efi.dialog.afterCreateStatementDialog.open": {
                    "create_statement default": function () {
                        var $dialog = $efi.dialog.afterCreateStatementDialog.open({BELNR: 'BELNR', BUKRS: 'BUKRS', GJAHR: 'GJAHR'}, function () {});
                        expect($dialog.find('#message').text()).toContain('전표가 정상적으로 생성 되었습니다');
                        expect($dialog.find('.unidocu-table tr').length).toBe(3);
                    },
                    "statement_modify": function () {
                        var $dialog = $efi.dialog.afterCreateStatementDialog.open({BELNR: 'BELNR', BUKRS: 'BUKRS', GJAHR: 'GJAHR', mode: 'statement_modify'}, function () {});
                        expect($dialog.find('#message').text()).toContain('전표가 정상적으로 수정 되었습니다');
                    },
                    "create_statement_draft_0061": function () {
                        var $dialog = $efi.dialog.afterCreateStatementDialog.open({REQTXT: 'foo REQTXT', mode: 'create_statement_draft_0061'}, function () {});
                        expect($dialog.find('#message').text()).toContain('작성이 완료 되었습니다');
                        expect($dialog.find('.unidocu-table tr').length).toBe(1);
                    }
                },
                "$efi.dialog.openRequestApprovalConfirm": function(){
                    $efi.dialog.openRequestApprovalConfirm('title', 'message', [{title: 'tableContextsText', value: 'tableContextsValue' }], 'question', {
                        text: 'confirmRequestApprovalCallback',
                        fn: function(){
                            unidocuAlert('confirmRequestApprovalCallback');
                        }
                    }, {
                        text: 'cancelCallback',
                        fn: function(){
                            unidocuAlert('cancelCallback');
                        }
                    });

                }
            },
            "$efi.vendorInfoAddedDataHandler": {
                "beforeEach": function () {
                    jasmineUtil.appendMockNamedServiceReturn('ZUNIEFI_4001', function (namedServiceCalledInfo) {
                        return {tableReturns: {OT_DATA: [$.extend({}, namedServiceCalledInfo['importParam'], {addedFoo: 'added bar'})]}};
                    });
                },
                "증빙 종류별 업체 정보 추가 데이터를 호출시 요청한 데이터에 추가해 callback parameter로 반환.": {
                    "UD_0201_010, UD_0201_016": {
                        "UD_0201_016 ZUNIEFI_4004 고객 마스터 정보 GET (전표생성시) OT_DATA 첫 번째 데이터 OT_DATA 0 건인 경우 에러 처리. UD_0201_010 ZUNIEFI_4001 구매처 마스터 정보 GET (전표생성시) OT_DATA 첫 번째 데이터 UD_0201_010 ZUNIEFI_4001 호출시 SU_ID -> ID UD_0201_016 ZUNIEFI_4001 호출시 IP_ID -> ID": function () {
                            jasmineUtil.appendMockNamedServiceReturn('ZUNIEFI_4001', function () {
                                return {tableReturns: {OT_DATA: []}};
                            });
                            jasmineUtil.appendMockNamedServiceReturn('ZUNIEFI_4004', function () {
                                return {tableReturns: {OT_DATA: []}};
                            });

                            expect(function(){
                                $efi.vendorInfoAddedDataHandler.handleByProgramId('UD_0201_010', {foo: 'bar'}, function (result) {
                                });
                            }).toThrow('vendor info does not exists. [ZUNIEFI_4001]');

                            expect(function(){
                                $efi.vendorInfoAddedDataHandler.handleByProgramId('UD_0201_016', {foo: 'bar'}, function (result) {});
                            }).toThrow('vendor info does not exists. [ZUNIEFI_4004]');

                            jasmineUtil.appendMockNamedServiceReturn('ZUNIEFI_4001', function (namedServiceCalledInfo) {
                                return {tableReturns: {OT_DATA: [$.extend({}, namedServiceCalledInfo['importParam'], {addedFoo: 'added bar'})]}};
                            });
                            jasmineUtil.appendMockNamedServiceReturn('ZUNIEFI_4004', function (namedServiceCalledInfo) {
                                return {tableReturns: {OT_DATA: [$.extend({}, namedServiceCalledInfo['importParam'], {addedFoo: 'added bar'})]}};
                            });

                            var result = null;
                            $efi.vendorInfoAddedDataHandler.handleByProgramId('UD_0201_010', {
                                'SU_ID': 'fooSU_ID',
                                foo: 'bar'
                            }, function (_result) {
                                result = _result;
                            });
                            expect(result).toEqual({
                                'SU_ID': 'fooSU_ID',
                                foo: 'bar',
                                addedFoo: 'added bar',
                                'ID': 'fooSU_ID'
                            });

                            $efi.vendorInfoAddedDataHandler.handleByProgramId('UD_0201_016', {
                                'IP_ID': 'fooIP_ID',
                                foo: 'bar'
                            }, function (_result) {
                                result = _result;
                            });
                            expect(result).toEqual({
                                'IP_ID': 'fooIP_ID',
                                foo: 'bar',
                                addedFoo: 'added bar',
                                'ID': 'fooIP_ID'
                            });
                        },
                        "OT_DATA 2 건 이상인 경우 업체코드 조회 팝업 호출.": {
                            "UD_0201_010 LIFNR 조회 팝업 호출시. SU_ID -> STCD2 UD_0201_016 LIFNR 조회 팝업 호출시. IP_ID -> STCD2 OT_DATA 2 건 이상인 경우 업체코드 조회 팝업 호출.": function () {
                                jasmineUtil.appendMockNamedServiceReturn('ZUNIEFI_4001', function () {
                                    return {tableReturns: {OT_DATA: [{LIFNR: 'fooLIFNR'}, {LIFNR: 'barLIFNR'}]}};
                                });
                                jasmineUtil.appendMockNamedServiceReturn('ZUNIEFI_4004', function () {
                                    return {tableReturns: {OT_DATA: [{LIFNR: 'fooLIFNR'}, {LIFNR: 'barLIFNR'}]}};
                                });

                                var dialogParams = null;
                                spyOn($u.dialog.f4CodeDialog, 'open').and.callFake(function (_dialogParams) {
                                    dialogParams = _dialogParams;
                                    _dialogParams['codePopupCallBack']('bazLINFR', 'text', {LIFNR: 'bazLINFR'});
                                });

                                expect(function(){
                                    $efi.vendorInfoAddedDataHandler.handleByProgramId('UD_0201_010', {'SU_ID': 'fooSU_ID', foo: 'bar'});
                                }).toThrow('Can not find vendor info with selected code. code: bazLINFR');

                                expect(dialogParams['popupKey']).toBe('LIFNR');
                                expect(dialogParams['readonlyInfo']['key']).toBe('STCD2');
                                expect(dialogParams['readonlyInfo']['value']).toBe('fooSU_ID');

                                expect(function(){
                                    $efi.vendorInfoAddedDataHandler.handleByProgramId('UD_0201_016', {
                                        'IP_ID': 'fooIP_ID',
                                        foo: 'bar'
                                    });
                                }).toThrow('Can not find vendor info with selected code. code: bazLINFR');

                                expect(dialogParams['popupKey']).toBe('KUNNR');
                                expect(dialogParams['readonlyInfo']['key']).toBe('STCD2');
                                expect(dialogParams['readonlyInfo']['value']).toBe('fooIP_ID');
                            }
                        }
                    }
                }
            },
            "$efi.addDataHandler": {
                "추가데이터 사용조건.": {
                    "HKONT, ADD_DATA header 가 있는경우": ""
                },
                "ZUNIEFI_4005 추가데이타 입력구조 FNAME 순 데이터를 @_@ 구분자로 분리 전달.": '',
                "ZUNIEFI_4005 입력 HKONT, PROGRAM_ID, SUB_ID(GRIDHEADER 고정)": '',
                "ADD_DATA 필수 입력 전표생성 기본값[ZUNIEFI_4000] OT_ADD HKONT 값이 있는경우": "",

                "handleADD_DATAKeyChange": {
                    "HKONT 변경시 추가 데이터 사용 유무 확인. ADD_DATA 입력 가능 여부 표시.추가데이터 입력값 초기화.": "",
                    "비용항목 행추가시. 엑셀 업로드 후, HKONT 변경시": ""
                },
                "$efi.addDataHandler.handleClickADD_DATA": {
                    "추가 데이터 입력 가능 계정인 경우 추가데이터 입력 dialog 호출.": ""
                },
                "$efi.addDataHandler.validateAddData": {
                    "전표생성시 추가데이터를 입력해야하는 계정 확인. 빈값이면 메시지 출력[추가 데이타를 입력하세요.]": ""
                },
                "$efi.addDataHandler.setADD_DATA": {
                    "전표생성시 비용항목 데이터에 addData 추가.": function () {
                        jasmineUtil.appendMockNamedServiceReturn('ZUNIEFI_4005', {
                            tableReturns: {
                                OT_DATA: [
                                    {FNAME: 'U_DEPART'},
                                    {FNAME: 'U_DESTIN'},
                                    {FNAME: 'U_DISTANCE'},
                                    {FNAME: 'U_VEHICLE'},
                                    {FNAME: 'U_VALUE'}
                                ]
                            }
                        });
                        spyOn($u.page, 'getPROGRAM_ID').and.returnValue('UD_0202_001');
                        var gridData = [
                            {HKONT: '53000300', ADD_DATA__HIDDEN: JSON.stringify({})},
                            {
                                HKONT: '54000600',
                                ADD_DATA__HIDDEN: JSON.stringify({
                                    U_DEPART: 'A',
                                    U_DESTIN: 'B',
                                    U_DISTANCE: 'C',
                                    U_VEHICLE: 'D',
                                    U_VALUE: 'E'
                                })
                            }
                        ];
                        $efi.addDataHandler.setADD_DATA(gridData);
                        expect(gridData[0]['ADD_DATA']).toBe('@_@@_@@_@@_@@_@');
                        expect(gridData[1]['ADD_DATA']).toBe('A@_@B@_@C@_@D@_@E@_@');
                    }
                },
                "$efi.addDataHandler.validateFNAME_FormField": {
                    "폼설정과 추가 데이터 설정 동일한지 여부 검증": function () {
                        spyOn($u.page, 'getPROGRAM_ID').and.returnValue('UD_0202_001');
                        $efi.addDataHandler.validateFNAME_FormField('53000300', ['U_DEPART', 'U_DESTIN', 'U_DISTANCE', 'U_VEHICLE', 'U_VALUE']);
                        $efi.addDataHandler.validateFNAME_FormField('53000300', []);
                    }
                },
                "전표미리보기 ZUNIEFI_4110 OT_DATA2 PROGRAM_ID 가 있는건 추가 데이터 보기 표시": {},
                "변경사항": {
                    "추가데이터 input 변경시 ZUNIECM_4100 호출 로직. 계산된 금액 설정 제거. 필요한경우 업체별 customizing": "",
                    "ZUNIEFI_4005 입력 구조로 input field 설정 제거 => form 설정으로 사용.": ""
                },
                "TODO": {
                    "경비 전표 여비교통비 계정 전표 생성. -> 그룹 결재 전표 미리보기 추가데이터 표시 되지 않음.": "",
                    "donwha": {
                        "전표미리보기 ZUNIEFI_4110 OT_DATA2 PROGRAM_ID 가 있는건 추가 데이터 보기 표시": {
                            "parameter 조정 HKONT -> EP_CODE": ""
                        }
                    }
                }
            },
            "$efi.createStatementCommon": {
                "calculateAmount": {
                    "beforeAll": function () {
                        var $fixture = $(efiTestTemplate({calculateAmount:true}));
                        jasmineUtil.appendFixture($fixture);
                        spyOn(jasmineUtil, 'clearFixture').and.stub();
                        $u.renderUIComponents($fixture, '$efi_amount_type1');

                        var $u_controls1 = $u.get('controls1');
                        var $u_wrbtr_read_only_v = $u.get('WRBTR_READ_ONLY_V');
                        var $u_chargetotal_v = $u.get('CHARGETOTAL_V');
                        var $u_wmwst_read_only_v = $u.get('WMWST_READ_ONLY_V');

                        var $u_mwskz_v = $u.get('MWSKZ_V');
                        var $u_waers_v = $u.get('WAERS_V');

                        var $u_program_id_v = $u.get('PROGRAM_ID_V');

                        $u.setValues({
                            WRBTR_READ_ONLY_V: 1100,
                            CHARGETOTAL_V: 1000,
                            WMWST_READ_ONLY_V: 100,
                            PROGRAM_ID_V: 'UD_0201_001'
                        });

                        $u_controls1.$el.change(resetContents).change();
                        $u_wrbtr_read_only_v.$el.change(resetContents);
                        $u_chargetotal_v.$el.change(resetContents);
                        $u_wmwst_read_only_v.$el.change(resetContents);
                        $u_mwskz_v.$el.change(resetContents);
                        $u_waers_v.$el.change(resetContents);
                        $u_program_id_v.$el.change(resetContents);

                        $u.buttons.addHandler({
                            "alertMWSKZ_FLAG_Map": function(){
                                $u.dialog.jsonDialog.open($u.f4Data.getCodeMapWithParams('MWSKZ', 'FLAG'));
                            },
                            "alertMWSKZ_KBETR_Map": function(){
                                $u.dialog.jsonDialog.open($u.f4Data.getCodeMapWithParams('MWSKZ', 'KBETR'));
                            }
                        });

                        function resetContents(){
                            var values = $u.getValues();
                            $u.page.update({PROGRAM_ID: values['PROGRAM_ID_V']});
                            $u.renderUIComponents($fixture.find('#contents'), '$efi_amount_type1');
                            var gridObj = $u.gridWrapper.getGrid();
                            var controls1 = $u_controls1.getValue();
                            $u.get('WRBTR').setReadOnly(/set WRBTR readonly/.test(controls1));
                            $u.get('WMWST').setReadOnly(/set WMWST readonly/.test(controls1));

                            if(/remove evidence amount/.test(controls1)) {
                                $u.remove('WRBTR_READ_ONLY');
                                $u.remove('CHARGETOTAL');
                                $u.remove('WMWST_READ_ONLY');
                            }

                            if(/remove WMWST/.test(controls1)) $u.remove('WMWST');
                            if(/remove WRBTR/.test(controls1)) $u.remove('WRBTR');

                            $u.setValues({
                                WRBTR_READ_ONLY: values['WRBTR_READ_ONLY_V'],
                                CHARGETOTAL: values['CHARGETOTAL_V'],
                                WMWST_READ_ONLY: values['WMWST_READ_ONLY_V'],
                                MWSKZ: values['MWSKZ_V'],
                                WAERS: values['WAERS_V']
                            });
                            gridObj.setNumberNegative('WRBTR', 'false');
                            $efi.createStatementCommon.handleEditMode();
                            $efi.createStatementCommon.bindFormButton();
                            $efi.createStatement.bindGridEvent();
                            $efi.createStatement.bindEvent.bindWRBTRChange();
                            $efi.createStatement.bindEvent.bindWMWSTChange();
                            $efi.createStatement.bindEvent.bindWMWSTDblClick();
                            $efi.createStatement.bindEvent.bindMWSKZChange();
                        }
                        expect(true).toBeTruthy();
                    },
                    "WRBTR, WMWST 수정 불가 인 경우 증빙 세액이 WMWST 값으로 설정 되고 변경 되지 않음.": function () {
                        $u.get('MWSKZ_V').setValue('V9');
                        $u.get('controls1').setValue('set WRBTR readonly,set WMWST readonly');
                        $u.get('controls1').$el.change();
                        $u.get('form1', 'MWSKZ').$el.change();
                        expect($u.get('form1', 'WMWST').getValue()).toBe(100);

                        $u.get('form1', 'MWSKZ').setValue('');
                        $u.get('form1', 'MWSKZ').$el.change();
                        expect($u.get('form1', 'WMWST').getValue()).toBe(100);
                        expect($u.get('form1', 'difference_amount').getValue()).toBe(100);
                        expect($u.get('form1', 'debitSum').getValue()).toBe(1200);
                        expect($u.get('form1', 'creditSum').getValue()).toBe(1100);
                    }
                }
            },
            "amount-display": {
                "render": function () {
                    var $fixture = $('<div></div>');
                    jasmineUtil.appendFixture($fixture);
                    $.each(['KD_0202_001', 'UD_0201_001', 'UD_0201_011', 'UD_0201_013', 'UD_0201_031', 'UD_0202_001', 'UD_0204_001', 'UD_0205_000', 'UD_0207_020', 'UD_0208_001'], function(index, programId){
                        $fixture.append($('<div></div>').text(programId));

                        var $el = $($efi.mustache.amountDisplayWrapper()).wrapAll('<div></div>').parent();
                        $el.find('.unidocu-form-table-wrapper,.uni-form-table-button-area,.unidocu-grid').data('subGroup', programId);
                        $el.find('.unidocu-grid').height(300);

                        $fixture.append($el);
                    });
                    $u.renderUIComponents($fixture);
                },
                "UD_0210_001": function (done) {
                    var $fixture = $('<div></div>');
                    jasmineUtil.appendFixture($fixture);

                    require(['stache!uni-e-fi/view/UD_0210_001'], function (UD_0210_001Template) {
                        var $UD_0210_001 = $(UD_0210_001Template()).wrapAll('<div></div>').parent();
                        $UD_0210_001.find('.unidocu-form-table-wrapper').data('subGroup', 'UD_0210_001');
                        $UD_0210_001.find('.uni-form-table-button-area').data('subGroup', 'UD_0210_001');
                        $UD_0210_001.find('.unidocu-grid').data('subGroup', 'UD_0210_001').height(300);
                        $fixture.append($UD_0210_001);
                        $u.renderUIComponents($UD_0210_001);
                        done();
                    });
                },
                "FI_0001": function (done) {
                    var $fixture = $('<div></div>');
                    jasmineUtil.appendFixture($fixture);

                    require(['stache!uni-e-fi/view/FI_0001'], function (FI_0001Template) {
                        var $FI_0001 = $(FI_0001Template()).wrapAll('<div></div>').parent();
                        $FI_0001.find('.unidocu-form-table-wrapper').data('subGroup', 'FI_0001');
                        $FI_0001.find('.uni-form-table-button-area').data('subGroup', 'FI_0001');
                        $FI_0001.find('.unidocu-grid').data('subGroup', 'FI_0001').height(300);
                        $fixture.append($FI_0001);
                        $u.renderUIComponents($FI_0001);
                        $('#amount-display').html('총금액: <span class="wrbtr">{WRBTR_formatted}</span> 과표: <span class="fwbas">{FWBAS_formatted}</span> 세액: <span class="fwste">{FWSTE_formatted}</span>');
                        $('#form1,#form2').hide();
                        $('#unidocu-grid2-panel-toolbar').css('min-width', '800px');
                        done();
                    });
                }
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
