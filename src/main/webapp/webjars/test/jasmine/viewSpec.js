/** @module test/jasmine/viewSpec */
define(['stache!test/jasmine/unidocuViewSpecDescription', 'test/jasmine/viewSpec/DRAFT_0061Spec'], function (unidocuViewSpecDescription, DRAFT_0061Spec) {

    // noinspection JSNonASCIINames,NonAsciiCharacters
    var specItems = {
        "uni-e-fi/view/UniDocu001/UD_0201_000 spec": {
            "beforeAll": function (done) {
                spyOn(jasmineUtil, 'clearFixture').and.stub();
                $.when(jasmineUtil.setProgramSpecFixture('UD_0201_000')).done(done);
            },
            "button": {
                "createMassStatement": function () {
                    expect($('#createMassStatement').length).toBe(1);
                }
            }
        },
        "uni-e-fi/view/UD_0201_013 spec": {
            "beforeAll": function (done) {
                spyOn(jasmineUtil, 'clearFixture').and.stub();
                $.when(jasmineUtil.setProgramSpecFixture('UD_0201_013')).done(done);
            },
            "initialize": {
                "TODO grid fit size 그리드가 두개이상인 경우에 대해서도 처리.": function () {
                },
                "외화처리 KURSF를 제외한 모든 금액 필드[form: Uni_InputAmount, grid: number]": function () {
                }
            },
            "form event": {
                "change XWARE_BNK": {
                    "changeXWARE_BNKSpec01 custom handle handleGrid2Data 호출": function () {
                        spyOn($u.buttons.getCustomHandlers(), 'handleGrid2Data');
                        $u.get('xware_bnk_table', 'XWARE_BNK').$el.change();
                        expect($u.buttons.getCustomHandlers()['handleGrid2Data']).toHaveBeenCalled();
                    }
                }
            },
            "button event": {
                "doQuery [구매전표번호 검색]": {
                    "구매전표 번호 검색 조건이 있는경우 해당 값으로 custom handler setRequestOrderData 호출": function () {
                    },
                    "구매전표 번호 검색 조건이 없는 경우 구매문서번호 입력 dialogConfirm": {
                        "yes dialog 호출 입력된 값으로 custom handler setRequestOrderData 호출": function () {
                        },
                        "no it_polist 빈값 전달 custom handler setRequestOrderData 호출": function () {
                        }
                    }
                },
                "createStatement[전표생성]": {
                    "beforeEach": function () {
                        jasmineUtil.appendMockNamedServiceReturn('ZUNIEFI_2011', {exportMaps: {OS_DOCNO: {}}});
                    },
                    "createStatementSpec04 전표생성 후처리 dialog 호출. ZUNIEFI_2011 [전자세금계산서 송장 생성] 호출. grid 선택된 데이터 IT_DATA 로 설정.": function () {
                        $u.setValues('header-invoicer-content', {WRBTR: '123456', SGTXT: 'jasmine test'});
                        $u.gridWrapper.getGrid().setJSONData([{SELECTED: '1', WRBTR: '1000'}]);
                        spyOn($u.page, 'getPageParams').and.returnValue({CHARGETOTAL: '1000'});
                        $u.buttons.runCustomHandler('calculateBalance');
                        $u.buttons.runHandler('createStatement');
                        $('.ui-dialog').remove();
                        expect(jasmineUtil.getNamedServiceCalledInfo('ZUNIEFI_2011')).toBeTruthy();
                    }
                }
            },
            "grid event": {
                "gridCellClick": {
                    "PO_NUMBER": {
                        "beforeEach": function () {
                            jasmineUtil.appendMockNamedServiceReturn('ZUNIEFI_2012', {tableReturns: {OT_DATA: [{}, {}]}});
                            spyOn($efi.dialog.POHISTORYDialog, 'open').and.callThrough();
                            $u.gridWrapper.getGrid().setJSONData([{}]);
                        },
                        "gridCellClickSpec01 ZUNIEFI_2012 [PO History] 호출": function () {
                            $u.gridWrapper.getGrid()._onCellClick('PO_NUMBER', 0);
                            expect(jasmineUtil.getNamedServiceCalledInfo('ZUNIEFI_2012')).toBeTruthy();
                        },
                        "gridCellClickSpec02 ZUNIEFI_2012 출력 데이터로 POHISTORYDialog 호출": function () {
                            $u.gridWrapper.getGrid()._onCellClick('PO_NUMBER', 0);
                            expect($efi.dialog.POHISTORYDialog.open).toHaveBeenCalled();
                        }
                    }
                },
                "grid2ChangeCell": {
                    "SElECTED": {
                        "grid2ChangeCellSpec01 zunid_2210_ot_item 중 COND_TYPE, PO_NUMBER 와 선택된 행의 KSCHL, EBELN 이 일치하는 데이터를 grid로 설정.": function () {
                            var zunid_2210_ot_item = [
                                {COND_TYPE: 'fooCOND_TYPE01', PO_NUMBER: 'fooPO_NUMBER01', WRBTR: '1000'},
                                {COND_TYPE: 'fooCOND_TYPE01', PO_NUMBER: 'fooPO_NUMBER01', WRBTR: '2000'},
                                {COND_TYPE: 'fooCOND_TYPE01', PO_NUMBER: 'fooPO_NUMBER01', WRBTR: '3000'},
                                {COND_TYPE: 'fooCOND_TYPE02', PO_NUMBER: 'fooPO_NUMBER02'}
                            ];
                            $u.page.setCustomParam('zunid_2210_ot_item', zunid_2210_ot_item);
                            $u.gridWrapper.getGrid('unidocu-grid2').setJSONData([
                                {SELECTED: '1', KSCHL: 'fooCOND_TYPE01', EBELN: 'fooPO_NUMBER01'}
                            ]);
                            $u.gridWrapper.getGrid('unidocu-grid2').triggerChangeCell('SELECTED', 0);
                            expect($u.gridWrapper.getGrid().getRowCount()).toBe(3);
                        }
                    }
                }
            },
            "custom handler": {
                "calculateBalance 금액 합계 표시": {
                    "calculateBalanceSpec01 CHARGETOTAL - sum(선택된 grid[WRBTR])": function () {
                        spyOn($u.page, 'getPageParams').and.returnValue({CHARGETOTAL: '10000'});
                        $u.gridWrapper.getGrid().setJSONData([
                            {SELECTED: '1', WRBTR: '1000'},
                            {SELECTED: '1', WRBTR: '2000'},
                            {SELECTED: '0', WRBTR: '3000'}
                        ]);
                        $u.buttons.runCustomHandler('calculateBalance');
                        expect($u.get('amount-display', 'difference_amount').getValue()).toBe(-7000);
                    }
                },
                "handleGrid2Data": {
                    "beforeEach": function () {
                        var zunid_2210_ot_data = [
                            {EBELN: 'fooBELNR', DMBTR: '1000', KSCHL: 'X'},
                            {EBELN: 'barBELNR', DMBTR: '2000', KSCHL: ''}
                        ];
                        $u.page.setCustomParam('zunid_2210_ot_data', zunid_2210_ot_data);
                        spyOn($u.gridWrapper.getGrid('unidocu-grid2'), 'setJSONData');
                        window.handleGrid2DataSpec = {
                            getExpected: function () {
                                return $u.gridWrapper.getGrid('unidocu-grid2').setJSONData.calls.argsFor(0)[0];
                            }
                        }
                    },
                    "setRequestOrderData 로 설정된 zunid_2210_ot_data XWARE_BNK 값에 따라 grid2로 설정.": {
                        "handleGrid2DataSpec01 1[물대] KSCHL 빈값이 아닌 데이터": function () {
                            $u.get('xware_bnk_table', 'XWARE_BNK').setValue('1');
                            $u.buttons.runCustomHandler('handleGrid2Data');
                            expect(handleGrid2DataSpec.getExpected()).toEqual([{
                                EBELN: 'fooBELNR',
                                DMBTR: '1000',
                                KSCHL: 'X'
                            }]);
                        },
                        "handleGrid2DataSpec02 2[운송비용] KSCHL 빈값": function () {
                            $u.get('xware_bnk_table', 'XWARE_BNK').setValue('2');
                            $u.buttons.runCustomHandler('handleGrid2Data');
                            expect(handleGrid2DataSpec.getExpected()).toEqual([{
                                EBELN: 'barBELNR',
                                DMBTR: '2000',
                                KSCHL: ''
                            }]);
                        },
                        "handleGrid2DataSpec03 3[물대+운송비용] 전체": function () {
                            $u.get('xware_bnk_table', 'XWARE_BNK').setValue('3');
                            $u.buttons.runCustomHandler('handleGrid2Data');
                            expect(handleGrid2DataSpec.getExpected()).toEqual([{
                                EBELN: 'fooBELNR',
                                DMBTR: '1000',
                                KSCHL: 'X'
                            }, {EBELN: 'barBELNR', DMBTR: '2000', KSCHL: ''}]);
                        }
                    }
                },
                "setRequestOrderData": {
                    "beforeEach": function () {
                        spyOn($u.gridWrapper.getGrid('unidocu-grid2'), 'setJSONData').and.callThrough();
                        jasmineUtil.appendMockNamedServiceReturn('ZUNIEFI_2010', {
                            tableReturns: {OT_DATA: [], OT_ITEM: []},
                            exportMaps: {OS_HEADER: {}}
                        });
                        $u.buttons.runCustomHandler('setRequestOrderData', []);
                    },
                    "setRequestOrderDataSpec01 ZUNIEFI_2010 [전자세금계산서 송장처리(구매오더) 조회] 호출": function () {
                        expect(jasmineUtil.getNamedServiceCalledInfo('ZUNIEFI_2010')).toBeTruthy('ZUNIEFI_2010 called');
                    },
                    "setRequestOrderDataSpec02 OT_DATA grid2 data 설정.": function () {
                        expect($u.gridWrapper.getGrid('unidocu-grid2').setJSONData).toHaveBeenCalled();
                    },
                    "setRequestOrderDataSpec03 OS_HEADER, OT_ITEM custom parameter로 설정.": function () {
                        expect($u.page.getCustomParam('zunid_2210_os_header')).toBeDefined();
                        expect($u.page.getCustomParam('zunid_2210_ot_item')).toBeDefined();
                        expect($u.page.getCustomParam('zunid_2210_ot_data')).toBeDefined();
                    }

                }
            }
        },
        "uni-e-fi/view/FI_0204_001 spec": {
            "beforeAll": function (done) {
                // jasmineUtil.afterCall($u, 'unidocuUI', done);
                // spyOn(jasmineUtil, 'clearFixture').and.stub();
                // jasmineUtil.setProgramSpecFixture('FI_0204_001');
                done();
            },
            "initialize": {
                "vendor code 설정 LIFNR, KUNNR 사용. 전표검색 공급업체콛 LIFNR2, KUNNR2 로 사용": "",
                "PAYGB A[정산전표], B[반화전표], C[초과전표]": '',
                "EVIKB A[법인카드], B[매입세금계산서], C[실물증빙], Z[증빙없음]": '',
                "EVIKB 한가지 인 경우 증빙정보 숨김": ''
            },
            grid: {
                gridObj: {
                    cellClick: {
                        "ADD_DATA 처리": ''
                    },
                    changeCell: {
                        "WRBTR,SHKZG,MWSKZ $efi.createStatementCommon.changeWRBTRExpense": '',
                        "KOSTL handleKOSTLChange": {
                            "HKONT: $efi.addDataHandler.handleADD_DATAKeyChange": '',
                            "setGridBudget": '',
                            "changeGridAlert": ''
                        },
                        "PAYGB C(초과 전표 인경우 지금금액이 gridObj3 WRBTR 금액 보다 큰경우 차액 AMOUNT 로 설정": ''
                    }
                },
                gridObj2: {
                    "전표검색 tree grid": '',
                    "changeCell": {
                        "SELECTED S[차변] 만 선택 가능": '',
                        "선택된 행데이터로 gridObj3(정산 구분) 그리드 값 설정.": '',
                        "DIV_AMT -> WRBTR, WRBTR -> AMOUNT": '',
                        "trigger PAYGB change event": '',
                        "BELNR 전표 미리보기": ''
                    }
                },
                cellClick: {
                    gridObj3: {
                        changeCell: {
                            "WRBTR PAY_GB A 변경된 금액이 선택된 gridObj2 DIV_AMT 값을 초과 할수 없음": ''
                        }
                    }
                }

            },
            "button event": {},
            "formEvent": {
                "PAYGB change": {
                    "A: 정산전표, B: 반환전표, C: 초과전표": '',
                    "gridObj3 header 설정": {
                        "grid setting GRIDHEADER3_PAYGB_{0} 을 따름": ''
                    },
                    "헤더 공급자 정보 설정": {
                        "form setting header-invoicer-content_PAYGB_{0}_EVIKB_{1} 을 따름": '',
                        "todo 전표생성 기본값 설정": ''
                    }
                },
                "EVIKB change": {
                    validation: {
                        "EVIKB[Z] 가 아닌 경우 LIFNR2 필수 입력": ''
                    },
                    "PAYGB[C] 초과 전표": {
                        "gridObj3 초과 예정 금액 초기화 -> 0": ''
                    },
                    "증빙정보, 헤더 공급자 정보, 비용항목 그리드(gridObj) render": {
                        "combo options 증빙별[EVIKB] 설정": {
                            "A:UD_0201_001, B:UD_0201_011, Z:currentPROGRAM_ID": ''
                        }
                    }
                }
            }
        },

        "uni-e-fi/view/UD_0201_011": {
            "beforeAll": function (done) {
                spyOn(jasmineUtil, 'clearFixture').and.stub();
                $.when(jasmineUtil.setProgramSpecFixture('UD_0201_011', {
                    "CHARGETOTAL": "1000",
                    "TAXTOTAL": "100",
                    "GRANDTOTAL": "1100"
                })).done(done);
            },
            "#7141 unidocu4 매입세금계산서 헤더 공급자정보 세금금액 수정 불가 상태에서 변경됨.": function () {
                $u.get('MWSKZ').$el.change();
                expect($u.get('WMWST').getValue()).toBe(100);
            }
        },
        "uni-e-fi/view/KD_0202_001": {
            "beforeAll": function (done) {
                spyOn(jasmineUtil, 'clearFixture').and.stub();
                $.when(jasmineUtil.setProgramSpecFixture('KD_0202_001')).done(done);
                jasmineUtil.getJasmineFixture().prepend(unidocuViewSpecDescription({KD_0202_001Spec: true}));
            },
            "spec test": function(){
                expect(true).toBeTruthy();
            }
        },
        "uni-e-approval/view/DRAFT_0011 spec": {
            "beforeAll": function (done) {
                spyOn(jasmineUtil, 'clearFixture').and.stub();
                $.when(jasmineUtil.setProgramSpecFixture('DRAFT_0011')).done(done);
            },
            "initial": {
                "#draft-title exists": function(){
                    expect($('#draft-title').length).toBe(1);
                }
            }
        },
        "DRAFT_0061Spec": DRAFT_0061Spec,
        "uni-e-approval/view/UFL_0101_020": {
            "beforeEach": function (done) {
                spyOn(jasmineUtil, 'clearFixture').and.stub();
                jasmineUtil.appendMockNamedServiceReturn('ZUNIEWF_1200', {
                    exportMaps: {OS_DATA: {}}
                });
                var $deferred = jasmineUtil.setProgramSpecFixture('UFL_0101_020');

                $.when($deferred).done(done);
            },
            "UFL_0101_020Spec01 #3342 문서구분에 대한 결재선 지정 상세 버튼 표시 확인": function () {
                var gridObj3 = $u.gridWrapper.getGrid('unidocu-grid3');
                expect(jasmineUtil.getJasmineFixture().find('#grid3DetailWrapper').css('display')).toBe('none');
                spyOn(gridObj3.asserts, 'selectedExactOneRow').and.stub();
                $u.buttons.runHandler('gridObj3Detail');
                expect(jasmineUtil.getJasmineFixture().find('#grid3DetailWrapper').css('display')).toBe('block');
            }
        },
        "unidocu-debug/subView/compareWebData": {
            "beforeAll": function(done){
                spyOn(jasmineUtil, 'clearFixture').and.stub();
                jasmineUtil.appendFixture('<div id="debug-contents"></div>');
                $.when($debug.renderDebugSubView('compareWebData')).done(done);
            },
            "beforeEach": function(){
                spyOn($u.webData, 'selectList').and.callFake(function(queryParams, fn){
                    fn([
                        {
                            "SCOPE": "buttonSetting",
                            "SUB_ID": "",
                            "DESCRIPTION": "",
                            "DATA": "{\"OS_DATA\":{\"BUTTON_AREA_ID\":\"uni-grid_top_buttons\"},\"OT_DATA\":[]}",
                            "WEB_DATA_ID": "@uni-grid_top_butto ns"
                        }
                    ]);
                });
                $u.buttons.runCustomHandler('setBackupData', JSON.stringify([
                    {
                        "SCOPE": "buttonSetting",
                        "SUB_ID": "",
                        "DESCRIPTION": "",
                        "DATA": "{\"OS_DATA\":{\"BUTTON_AREA_ID\":\"uni-grid_top_buttons\"},\"OT_DATA\":[]}",
                        "WEB_DATA_ID": "@uni-grid_top_buttons"
                    }
                ]));
            },
            "backup 파일 업로드 후 오른쪽 저장 버튼 표시 하지 않음.": function(){
                expect($('#saveRight').css('display')).toBe('none');
            },
            "backup data 저장인 경우 기존 backup 데이터와 left data 비교": "",
            "xit 저장 후 재조회시 form validation 수행하지 않음.": function(){ // clearWebData 호출됨
                $('#saveLeft').click();
                expect($('.ui-dialog').length).toBe(0);
            },
            "unlock 수행시 오른쪽 저장 버튼 표시": function(){
                $('#unLockDest').click();
                expect($('#saveRight').css('display')).toBe('inline-block');
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