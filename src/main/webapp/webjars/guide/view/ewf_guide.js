/**
 * @module guide/view/ewf_guide
 */
define(function(){
    return [
        {
            description: "$ewf.DRAFT_0061(국내출장비정산)",
            fn:function ($result) {
                $(
                '<div class="btn_area uni-form-table-button-area" id="uni-buttons2"></div>' +
                    '<div id="DRAFT_0061-grid" class="unidocu-grid" data-sub-id="GRIDHEADER" style="height: 150px;"></div>' +
                    '<div id="file-attach-wrapper"> <div id="file-attach-content"></div> </div>' +
                '<div class="btn_area uni-form-table-button-area" id="uni-buttons4"></div>' +
                    '<div id="DRAFT_0061-grid3" class="unidocu-grid" data-sub-id="GRIDHEADER3" style="height: 300px;"></div>'
                ).appendTo($result);

                $.extend($u.webData.customWebDataMap, {
                    "ewf_guide@uni-buttons2": {
                        "OS_DATA": {
                            "BUTTON_AREA_ID": "uni-buttons2"
                        },
                        "OT_DATA": [
                            {
                                "BUTTON_ID": "addEmployee",
                                "TEXT": "출장대상자 추가",
                                "ICON": "add-row"
                            },
                            {
                                "BUTTON_ID": "deleteEmployee",
                                "TEXT": "출장대상자 삭제",
                                "ICON": "del-row"
                            }
                        ]
                    },
                    "ewf_guide@uni-buttons4": {
                        "OS_DATA": {
                            "BUTTON_AREA_ID": "uni-buttons4"
                        },
                        "OT_DATA": [
                            {
                                "BUTTON_ID": "addEmp_exp",
                                "TEXT": "비용항목추가",
                                "ICON": "add-row",
                                "LOCATE_LEFT": "1"
                            },
                            {
                                "BUTTON_ID": "deleteEmp_exp",
                                "TEXT": "비용항목삭제",
                                "ICON": "del-row",
                                "LOCATE_LEFT": "1"
                            }
                        ]
                    },
                    "ewf_guide@GRIDHEADER": {
                        "OS_DATA": {
                            "PANEL_TITLE": "출장자"
                        },
                        "OT_DATA": [
                            {
                                "FNAME": "PERNR",
                                "FNAME_TXT": "출장자 사번",
                                "WIDTH": "0",
                                "TYPE": "text"
                            },
                            {
                                "FNAME": "PERNR_TXT",
                                "FNAME_TXT": "출장자",
                                "WIDTH": "100",
                                "TYPE": "text",
                                "ALIGN": "center"
                            },
                            {
                                "FNAME": "ROOM_EXP",
                                "FNAME_TXT": "정산숙박비",
                                "WIDTH": "100",
                                "TYPE": "number",
                                "ALIGN": "right",
                                "DFORMAT": "#,###"
                            },
                            {
                                "FNAME": "TRANS_EXP",
                                "FNAME_TXT": "정산교통비",
                                "WIDTH": "100",
                                "TYPE": "number",
                                "ALIGN": "right",
                                "DFORMAT": "#,###"
                            },
                            {
                                "FNAME": "DAILY_EXP",
                                "FNAME_TXT": "정산일비",
                                "WIDTH": "100",
                                "TYPE": "number",
                                "ALIGN": "right",
                                "DFORMAT": "#,###"
                            },
                            {
                                "FNAME": "SUM_TOTAL",
                                "FNAME_TXT": "정산합계",
                                "WIDTH": "100",
                                "TYPE": "number",
                                "ALIGN": "right",
                                "DFORMAT": "#,###"
                            }
                        ]
                    },
                    "ewf_guide@GRIDHEADER3": {
                        "OS_DATA": {
                            "PANEL_TITLE": "비용정산"
                        },
                        "OT_DATA": [
                            {
                                "FNAME": "PERNR",
                                "FNAME_TXT": "출장자 사번",
                                "WIDTH": "0",
                                "TYPE": "text"
                            },
                            {
                                "FNAME": "PERNR_TXT",
                                "FNAME_TXT": "출장자",
                                "WIDTH": "80",
                                "TYPE": "text",
                                "ALIGN": "center"
                            },
                            {
                                "FNAME": "BUDAT",
                                "FNAME_TXT": "전기일",
                                "WIDTH": "100",
                                "TYPE": "date",
                                "ALIGN": "center",
                                "EDIT": "X",
                                "DFORMAT": "yyyy-MM-dd"
                            },
                            {
                                "FNAME": "EVI_GB",
                                "FNAME_TXT": "증빙종류",
                                "WIDTH": "100",
                                "TYPE": "combo",
                                "EDIT": "X"
                            },
                            {
                                "FNAME": "EVKEY_",
                                "FNAME_TXT": "증빙",
                                "WIDTH": "35",
                                "TYPE": "imagecell",
                                "IMAGE_URL": "/images/btn/btn_view.gif"
                            },
                            {
                                "FNAME": "EVKEY",
                                "FNAME_TXT": "증빙번호",
                                "WIDTH": "100"
                            },
                            {
                                "FNAME": "EXP_GB",
                                "FNAME_TXT": "비용구분",
                                "WIDTH": "80",
                                "TYPE": "combo",
                                "EDIT": "X"
                            },
                            {
                                "FNAME": "WRBTR",
                                "FNAME_TXT": "금액",
                                "WIDTH": "80",
                                "TYPE": "number",
                                "REQUIRED": "X",
                                "ALIGN": "right",
                                "EDIT": "X",
                                "DFORMAT": "#,###"
                            }
                        ]
                    }
                });
                $u.unidocuUI();

                var gridObj = $u.gridWrapper.getGrid('DRAFT_0061-grid');
                var gridObj3 = $u.gridWrapper.getGrid('DRAFT_0061-grid3');
                gridObj3.onCellClick($ewf.DRAFT_0061.gridObj3OnCellClick);
                gridObj3.onChangeCell(function (columnKey, rowIndex) {
                    if (columnKey === 'EVI_GB') {
                        gridObj3.$V('EVKEY', rowIndex, '');
                        $ewf.DRAFT_0061.setEVKEY_Image(rowIndex, 'noEvidence');
                        var evi_gb = gridObj3.$V('EVI_GB', rowIndex);
                        if (evi_gb === 'C') {
                            var defaultFormValues = null;
                            if($u.programSetting.getValue('법인카드 내역조회 사용자 검색 조건 선택된 행데이터로 설정')) {
                                defaultFormValues = {
                                    PERNR__DIALOG: gridObj3.$V('PERNR', rowIndex),
                                    PERNR__DIALOG_TXT: gridObj3.$V('PERNR_TXT', rowIndex)
                                }
                            }
                            $efi.dialog.evidenceSelectDialog.open({
                                evidencePROGRAM_ID: 'UD_0201_000',
                                selectCallback: function (data) {
                                    $.extend(data, {
                                        EVKEY: data['CRD_SEQ'],
                                        BUDAT: data['APPR_DATE'],
                                        WRBTR: data['TOTAL']
                                    });
                                    delete data['PERNR'];
                                    gridObj3.setRowDataByJSONObj(rowIndex, data);
                                    $ewf.DRAFT_0061.setHasEvidenceImage(rowIndex);
                                    $ewf.DRAFT_0061.summaryGrid3ToGrid();
                                },
                                closeWithoutSelectCallback: function () {
                                    gridObj3.$V(columnKey, rowIndex, '');
                                    $u.buttons.runCustomHandler('setGrid3WRBTREditable');
                                },
                                defaultFormValues: defaultFormValues
                            });
                        }
                        if (evi_gb === 'E') $ewf.DRAFT_0061.setAttachableImage(rowIndex);
                        $u.buttons.runCustomHandler('setGrid3WRBTREditable');
                    }
                    $ewf.DRAFT_0061.summaryGrid3ToGrid();
                });

                $u.buttons.addHandler({
                    "addEmp_exp": function () {
                        gridObj.asserts.rowSelected($mls.getByCode('M_draft_0031_gridObjNotSelected'));
                        gridObj3.addRow();
                        var selectedjsonData = gridObj.getSELECTEDJSONData()[0];
                        delete selectedjsonData['BELNR'];
                        delete selectedjsonData['GJAHR'];
                        delete selectedjsonData['BUKRS'];
                        if($u.get('WAERS')) selectedjsonData['WAERS'] = $u.get('WAERS').getValue();
                        gridObj3.setRowDataByJSONObj(gridObj3.getActiveRowIndex(), selectedjsonData)
                    },
                    "addEmployee": function () {
                        $u.dialog.f4CodeDialog.open({
                            popupKey: 'PERNR',
                            codePopupCallBack: function (code) {
                                $.each(gridObj.getJSONData(), function (index, item) {
                                    if (item['PERNR'] === code) throw $mls.getByCode('M_draft_0030_draft_0031_alreadyExists');
                                });
                                $nst.is_data_os_data('ZUNIEWF_1042', {PERNR: code}, function (os_data) {
                                    gridObj.addRowByJSONData($.extend(os_data, {PERNR_TXT: os_data['SNAME']}));
                                });
                            }
                        });
                    },
                    "deleteEmployee": function () {
                        gridObj.asserts.rowSelected();
                        var selectedPERNR = gridObj.getSELECTEDJSONData()[0]['PERNR'];
                        if (gridObj3.$F(selectedPERNR, 'PERNR').length > 0) throw $mls.getByCode('M_DRAFT_0061_deleteEmployee') + gridObj.getSELECTEDJSONData()[0]['PERNR_TXT'];
                        gridObj.deleteSelectedRows();
                    },
                    "deleteEmp_exp": function () {
                        gridObj3.asserts.rowSelected();
                        $.each(gridObj3.getSELECTEDJSONData(), function (index, item) {
                            if (item['BELNR']) throw $mls.getByCode('M_DRAFT_0061_cannotDelete');
                        });
                        gridObj3.deleteSelectedRows();
                        $ewf.DRAFT_0061.summaryGrid3ToGrid();
                    }
                });
                $u.buttons.addCustomHandler({
                    setGrid3WRBTREditable: function () {
                        $.each(gridObj3.getJSONData(), function (index, item) {
                            if (item['EVI_GB'] === 'C') {
                                gridObj3.makeCellReadOnly('BUDAT', index);
                                gridObj3.makeCellReadOnly('WRBTR', index);
                            } else {
                                gridObj3.makeCellEditable('BUDAT', index);
                                gridObj3.makeCellEditable('WRBTR', index);
                            }
                        });
                    }
                });
                    $ewf.DRAFT_0061.setTargetGridObj(gridObj, gridObj3);
                    $ewf.DRAFT_0061.gridObj3_FileAttacheReadOnly = false;
            }
        },
        {
            description: '$ewf.dialog.modifyApprovalDialog.open(params)',
            fn: function($result){
                $ewf.dialog.modifyApprovalDialog.open({
                    "mode": 'directChange',
                    "tableReturns": {},
                    "directChangeConfirmCallback": function(wf_secur, tableReturns){
                        $result.append(wf_secur);
                        $result.append('<hr>');
                        $result.append(JSON.stringify(tableReturns));
                    }
                });
            }
        },
        {
            description: '$ewf.dialog.js',
            descriptionDetail: [
                "$ewf.dialog.approvalCommentsDialog.open(params) : 결재비밀번호사용유무(FLAG_PW)에 따라 결재 비밀번호   입력",
                "$ewf.dialog.changeWF_ORGDialog.open(addCallback)",
                "$ewf.dialog.sendApprovalAlarmDialog.open(params)",
                "$ewf.dialog.draftPreviewDialog.open($el)"
            ],
            fn: function ($result) {
                $(
                    '<div id="unidocu-grid-panel-toolbar">' +
                    '<div class="btn_area uni-form-table-button-area" id="uni-buttons"></div>' +
                    '</div>'
                ).appendTo($result);

                $.extend($u.webData.customWebDataMap, {
                    "ewf_guide@uni-buttons": {
                        "OS_DATA": {
                            "BUTTON_AREA_ID": "uni-buttons"
                        },
                        "OT_DATA": [
                            {
                                "BUTTON_ID": "dialogBtn1",
                                "TEXT": "$ewf.dialog.approvalCommentsDialog.open(params)",
                                "LOCATE_LEFT": "1"
                            },
                            {
                                "BUTTON_ID": "dialogBtn2",
                                "TEXT": "$ewf.dialog.changeWF_ORGDialog.open(addCallback)",
                                "LOCATE_LEFT": "1"
                            },
                            {
                                "BUTTON_ID": "dialogBtn3",
                                "TEXT": "$ewf.dialog.sendApprovalAlarmDialog.open(params)",
                                "LOCATE_LEFT": "1"
                            },
                            {
                                "BUTTON_ID": "dialogBtn4",
                                "TEXT": "$ewf.dialog.draftPreviewDialog.open($el)",
                                "LOCATE_LEFT": "1"
                            }
                        ]
                    }
                });
                $u.unidocuUI();
                $u.buttons.addHandler({
                   "dialogBtn1": function() {
                       var usePassword = false;
                       var approvalPassword;
                       var zuniewf_1103_os_data = $nst.is_data_os_data('ZUNIEWF_1103', {ID: staticProperties.user['ID']});

                       if (zuniewf_1103_os_data['FLAG_PW'] === 'X') usePassword = true;
                       approvalPassword = zuniewf_1103_os_data['WF_PW'];
                       $ewf.dialog.approvalCommentsDialog.open({
                           title: '승인의견',
                           usePassword: usePassword,
                           approvalPassword: approvalPassword,
                           confirmCallback: function () {
                               unidocuAlert('완료되었습니다.');
                           }
                       });
                   },
                    "dialogBtn2": function () {$ewf.dialog.changeWF_ORGDialog.open({});},
                    "dialogBtn3": function () {$ewf.dialog.sendApprovalAlarmDialog.open({});},
                    "dialogBtn4": function () {$ewf.dialog.draftPreviewDialog.open($('<div>TEST</div>'));}
                });
            }
        }
    ]
});