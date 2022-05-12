/**
 * @module test/jasmine/viewSpec/DRAFT_0061Spec
 */
define(function () {
    // noinspection JSNonASCIINames
    return {
        "beforeAll": function (done) {
            spyOn(jasmineUtil, 'clearFixture').and.stub();

            this.fillData = function () {
                jasmineUtil.appendMockNamedServiceReturn('ZUNIEWF_1042', {"exportMaps": {"OS_DATA": {"PERNR": "00000009", "SNAME": "홍길동"}}});
                spyOn($u.dialog.f4CodeDialog, 'open').and.callFake(function (params) {
                    params.codePopupCallBack('00000009');
                });
                var gridObj = $u.gridWrapper.getGrid('DRAFT_0061-grid');
                var gridObj3 = $u.gridWrapper.getGrid('DRAFT_0061-grid3');
                gridObj.setJSONData();
                gridObj3.setJSONData([]);
                $.each($u.getValues('DRAFT_0061-form'), function (key, value) {
                    if (!value) $u.get('DRAFT_0061-form', key).setValue('spec test');
                });
                $u.buttons.runHandler('addEmployee');
                gridObj.$V('SELECTED', 0, 1);
                $u.buttons.runHandler('addEmp_exp');
                gridObj3.$V('EXP_GB', 0, 'A');
                gridObj3.$V('HKONT', 0, 'foo');
                gridObj3.$V('HKONT_TXT', 0, 'foo_txt');
                gridObj3.$V('WRBTR', 0, '999');
                gridObj3.$V('WAERS', 0, 'KRW');
            };
            $.when(jasmineUtil.setProgramSpecFixture('DRAFT_0061')).done(function(){
                done();
            });
        },
        "beforeEach": function () {
            this.fillData();
        },
        "button": {
            "addEmployee": {
                "PERNR F4 호출 선택된 데이터로 ZUNIEWF_1042 호출 grid1 data 추가": function () {
                    var gridObj = $u.gridWrapper.getGrid('DRAFT_0061-grid');
                    gridObj.setJSONData([]);
                    $u.buttons.runHandler('addEmployee');
                    expect(gridObj.getRowCount()).toBe(1);
                },
                "동일 사용자 등록 불가": function () {
                    var gridObj = $u.gridWrapper.getGrid('DRAFT_0061-grid');
                    gridObj.setJSONData([]);
                    $u.buttons.runHandler('addEmployee');
                    expect(function () {
                        $u.buttons.runHandler('addEmployee');
                    }).toThrow('이미 추가된 출장자 입니다')
                }
            },
            "deleteDraft": {
                "ZUNIEWF_6533 호출": ""
            }
        },
        "#6876 unidocu4 #6854 2-1. 증빙번호 click 실물증빙인 경우 searFile button 이 추가된 첨부파일 추가 dialog": function () {
            var $mockDialog = $('<div><div id="file-attach-content"></div></div>');
            $mockDialog.data('fineUploader', {
                getFileGroupId: function () {
                    return 'foo fileGroupId'
                }
            });
            spyOn($u.dialog.fineUploaderDialog, 'open').and.returnValue($mockDialog);
            var gridObj3 = $u.gridWrapper.getGrid('DRAFT_0061-grid3');
            gridObj3.$V('EVI_GB', 0, 'E');
            gridObj3.triggerChangeCell('EVI_GB', 0);
            gridObj3.triggerCellClick('EVKEY_', 0);
            $mockDialog.find('#file-attach-content').trigger('fileCountChange');
            expect(gridObj3.$V('EVKEY', 0)).toBe('foo fileGroupId');
        },
        "#6878: unidocu4 #6854 2-3. 증빙일 증빙 없음인 경우 입력 가능": function () {
            spyOn($efi.dialog.evidenceSelectDialog, 'open').and.callFake(function (params) {
                params['selectCallback']({'APPR_DATE': '20180116'});
            });
            var gridObj3 = $u.gridWrapper.getGrid('DRAFT_0061-grid3');
            expect(gridObj3.isCellEditable('BUDAT', 0)).toBeTruthy();
            gridObj3.$V('EVI_GB', 0, 'E');
            gridObj3.triggerChangeCell('EVI_GB', 0);
            expect(gridObj3.isCellEditable('BUDAT', 0)).toBeTruthy();
            gridObj3.$V('EVI_GB', 0, 'C');
            gridObj3.triggerChangeCell('EVI_GB', 0);
            expect(gridObj3.isCellEditable('BUDAT', 0)).toBeFalsy();
        },
        "#6949 unidocu4 #6946 3. 증빙 종류 변경시 정상 동작 하지 않음. 오류 처리. 첨부파일 번호 저장 안됨, 법인카드 증빙 선택 dialog 호출 되지 않음": function () {

        },
        "#7035 unidocu4 #7031 4.전표생성이 완료되면 모든항목 변경불가 처리": function () {
            jasmineUtil.appendMockNamedServiceReturn('ZUNIEWF_6530', {
                returnMessage: 'message foo',
                exportMaps: {OS_DATA: {REQNO: 'foo REQNO'}}
            });
            jasmineUtil.appendMockNamedServiceReturn('ZUNIEWF_6531', {
                returnMessage: 'message foo',
                exportMaps: {OS_DATA: {FOO: 'os foo', REQNO: 'foo REQNO'}, OS_TEXT: {FOO: 'os foo'}},
                tableReturns: {OT_EMP: [{PERNR: 'foo PERNR', PERNR_TXT: 'tester'}], OT_EMP_EXP: [{PERNR: 'foo PERNR', PERNR_TXT: 'tester', BELNR: 'foo BELNR'}]}
            });


            $u.buttons.runHandler('tempSave');
            var gridObj3 = $u.gridWrapper.getGrid('DRAFT_0061-grid3');
            $.each(gridObj3.getGridHeaders(), function (index, header) {
                if (header.key === 'SELECTED') expect(gridObj3.isCellEditable(header.key, 0)).toBeTruthy(header.key + ' should be editable');
                else expect(gridObj3.isCellEditable(header.key, 0)).toBeFalsy(header.key + ' should be readOnly');
            });

            gridObj3.setJSONData([]);
        },
        "#7058 unidocu4 #7031 9. 법인카드 증빙 선택시 수정하지 않은 개인카드 금액 수정 불가로 변경됨": function () {
            var gridObj3 = $u.gridWrapper.getGrid('DRAFT_0061-grid3');
            $u.buttons.runHandler('addEmp_exp');
            gridObj3.$V('EVI_GB', 0, 'E');
            gridObj3.triggerChangeCell('EVI_GB', 0);
            gridObj3.$V('EVI_GB', 1, 'C');
            spyOn($efi.dialog.evidenceSelectDialog, 'open').and.callFake(function (params) {
                params['selectCallback']({});
            });
            gridObj3.triggerChangeCell('EVI_GB', 1);
            expect(gridObj3.isCellEditable('WRBTR', 0)).toBeTruthy();
            expect(gridObj3.isCellEditable('WRBTR', 0)).toBeTruthy();
        },
        "#6879 unidocu4 #6854 2-4. 출장 대상자 삭제시 비용항목이 있는 경우 (alert) 비용정산 정보를 삭제 바랍니다.": function () {
            expect(function () {
                $u.buttons.runHandler('deleteEmployee');
            }).toThrow('비용정산 정보를 삭제 바랍니다. 출장자: 홍길동');
            var gridObj = $u.gridWrapper.getGrid('DRAFT_0061-grid');
            expect(gridObj.getRowCount()).toBe(1);
        },
        "#6880 unidocu4 #6854 2-5. 비용 항목 삭제시 전표번호가 있는 경우 => (alert) 생성된 전표가 존재합니다. 삭제 바랍니다.": function () {
            var gridObj3 = $u.gridWrapper.getGrid('DRAFT_0061-grid3');
            gridObj3.$V('BELNR', 0, 'specTestBelnr');
            expect(function () {
                $u.buttons.runHandler('deleteEmp_exp');
            }).toThrow('생성된 전표가 존재합니다 삭제바랍니다');
            expect(gridObj3.getRowCount()).toBe(1);
        },
        "#7059 unidocu4 #7031 10. 계획대비 실적 삭제시 비용정산에 상세 없는경우도 삭제되지 않음.": function () {
            var gridObj = $u.gridWrapper.getGrid('DRAFT_0061-grid');
            gridObj.addRow();
            gridObj.$V('SELECTED', 0, '0');
            gridObj.$V('SELECTED', 1, '1');
            $u.buttons.runHandler('deleteEmployee');
            expect(gridObj.getRowCount()).toBe(1);
        },
        "#7060 unidocu4 #7031 11. 전표생성 후처리 dialog 적용.": function () {
            jasmineUtil.appendMockNamedServiceReturn('ZUNIEWF_6530', {
                returnMessage: 'message foo',
                exportMaps: {OS_DATA: {REQNO: 'foo REQNO'}}
            });
            jasmineUtil.appendMockNamedServiceReturn('ZUNIEWF_6531', {
                returnMessage: 'message foo',
                exportMaps: {OS_DATA: {FOO: 'os foo', TITLE: 'test', TEXT1: 'test'}, OS_TEXT: {FOO: 'os foo', TEXT1: 'test'}},
                tableReturns: {
                    OT_EMP: [{PERNR: 'foo PERNR', PERNR_TXT: 'tester'}],
                    OT_EMP_EXP: [{PERNR: 'foo PERNR', PERNR_TXT: 'tester', HKONT: 'testHKONT', HKONT_TXT: 'testHKONT_TXT', WAERS: 'KRW', WRBTR: '999'}]
                }
            });
            var gridObj3 = $u.gridWrapper.getGrid('DRAFT_0061-grid3');
            gridObj3.$V('WRBTR', 0, 100);
            gridObj3.$V('WRBTR', 1, 100);
            $u.buttons.runHandler('tempSave');
            expect($('.ui-dialog').length).toBe(0);

            jasmineUtil.appendMockNamedServiceReturn('ZUNIEWF_6531', {
                returnMessage: 'message foo',
                exportMaps: {OS_DATA: {FOO: 'os foo', TITLE: 'test', TEXT1: 'test', REQTXT: 'spec test'}, OS_TEXT: {FOO: 'os foo'}},
                tableReturns: {
                    OT_EMP: [{PERNR: 'foo PERNR', PERNR_TXT: 'tester'}],
                    OT_EMP_EXP: [
                        {
                            PERNR: 'foo PERNR',
                            PERNR_TXT: 'tester',
                            HKONT: 'testHKONT',
                            HKONT_TXT: 'testHKONT_TXT',
                            BUKRS: 'testBUKRS1',
                            BELNR: 'testBELNR1',
                            GJAHR: 'testGJAHR1',
                            WAERS: 'KRW',
                            WRBTR: '100'
                        },
                        {
                            PERNR: 'foo PERNR',
                            PERNR_TXT: 'tester',
                            HKONT: 'testHKONT',
                            HKONT_TXT: 'testHKONT_TXT',
                            BUKRS: 'testBUKRS2',
                            BELNR: 'testBELNR2',
                            GJAHR: 'testGJAHR2',
                            WAERS: 'KRW',
                            WRBTR: '200'
                        }
                    ]
                }
            });
            jasmineUtil.appendMockNamedServiceReturn('ZUNIEWF_6530', {
                returnMessage: 'message foo',
                exportMaps: {OS_DATA: {REQNO: 'foo REQNO', COMPLETE: 'X'}}
            });

            spyOn($efi.dialog.afterCreateStatementDialog, 'open').and.callFake(function (json) {
                expect(json).toEqual({
                    REQTXT: 'spec test',
                    mode: 'create_statement_draft_0061'
                });
            });
            $u.buttons.runHandler('tempSave');
            expect($efi.dialog.afterCreateStatementDialog.open).toHaveBeenCalled();
        },
        "#7061 unidocu4 #7031 12. 비용정산 항목 추가시 기본정보 통화키로 설정.": function () {
            if ($u.exists(['WAERS'])) {
                $u.get('WAERS').setValue('USD');
                $u.buttons.runHandler('addEmp_exp');
                var gridObj3 = $u.gridWrapper.getGrid('DRAFT_0061-grid3');
                expect(gridObj3.$V('WAERS', 1)).toBe('USD');
            }
        },
        "#7094 unidocu4 DRAFT_0061 GRONO 있는 경우 수정불가": {
            "beforeEach": function () {
                jasmineUtil.appendMockNamedServiceReturn('ZUNIEWF_6530', {
                    exportMaps: {OS_DATA: {}},
                    returnMessage: 'message foo'
                });
                jasmineUtil.appendMockNamedServiceReturn('ZUNIEWF_6531', {
                    returnMessage: 'message foo',
                    exportMaps: {OS_DATA: {FOO: 'os foo', GRONO: 'exist'}, OS_TEXT: {FOO: 'os foo'}},
                    tableReturns: {
                        OT_EMP: [{PERNR: 'foo PERNR', PERNR_TXT: 'tester'}],
                        OT_EMP_EXP: [{PERNR: 'foo PERNR', PERNR_TXT: 'tester', HKONT: 'testHKONT', HKONT_TXT: 'testHKONT_TXT', WAERS: 'KRW', WRBTR: '999'}]
                    }
                });
                $u.buttons.runHandler('tempSave');
            },
            "버튼 숨김": function () {
                expect($('#jasmine-fixture').find('.btn_area button:visible').length).toBe(0);
            },
            "form 수정 불가": function () {
                $.each($u.getNames(), function (index, name) {
                    expect($u.get(name).isReadOnly()).toBeTruthy(name + ' should be read only.');
                });
            },
            "grid 수정불가": function () {
                var gridObj = $u.gridWrapper.getGrid('DRAFT_0061-grid');
                var gridObj3 = $u.gridWrapper.getGrid('DRAFT_0061-grid3');
                $.each(gridObj.getGridHeaders(), function (index, header) {
                    expect(gridObj.isColumnEditable(header.key)).toBeFalsy(header.key + ' should be read only.');
                });
                $.each(gridObj3.getGridHeaders(), function (index, header) {
                    expect(gridObj3.isColumnEditable(header.key)).toBeFalsy(header.key + ' should be read only.');
                });
            }
        },
        "#7095 unidocu4 DRAFT_0061 참조기안 문서 제거": {
            "참조기안 문서 사용하지 않음": function () {
                expect($('#document-reference-wf-org').length).toBe(0);

            },
            "결재선 사용하지 않음": function () {
                expect($('#approval-line-wrapper').length).toBe(0);
                expect($('#uni-form-table1').length).toBe(0);
            }
        }
    }
});