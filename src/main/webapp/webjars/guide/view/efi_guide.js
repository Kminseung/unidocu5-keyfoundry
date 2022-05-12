/**
 * @module guide/view/efi_guide
 */
define(function () {
    return [
        {
            description: '$efi.get$evidenceIcon(evidenceData)',
            fn: function ($result) {
                var params = {
                    "BUKRS": "KR01",
                    "DATE_FR": "20161201",
                    "DATE_TO": "20190131",
                    "MODE": "A",
                    "MODE2": "A",
                    "PERNR": "00000009",
                    "PERNR_TXT": "탁진광",

                    "DATUM_FR": "20190401",
                    "DATUM_TO": "20190516",
                    "USE_DOC": "A"
                };

                $nst.is_data_ot_data('ZUNIEFI_1000', params, function (ot_data) {
                    $result.append('CRD_SEQ');
                    $result.append($efi.get$evidenceIcon(ot_data[0]));
                });
                $nst.is_data_ot_data('ZUNIEFI_8005',params, function (ot_data) {
                    $result.append('INV_SEQ');
                    $result.append($efi.get$evidenceIcon(ot_data[0]));
                });
            }
        },
        {
            description: '$efi.evidenceHandler()',
            fn: function ($result) {
                $u.createSingleInput({name: "ISSUE_ID", type: "Uni_InputText"}, $result);
                var paramMap = {
                    "BUKRS": "KR01",
                    "FLAG": "P",
                    "ISSUE_DATE_FR": "20140107",
                    "ISSUE_DATE_TO": "20181230",
                    "R001": "A"
                };
                $nst.is_data_ot_data('ZUNIEFI_2000', paramMap, function (ot_data) {
                    var inv_seq = ot_data[0];
                    $u.page.setCustomParam("selected_evidence_is_key", inv_seq);
                    $result.append($efi.evidenceHandler());
                });
            }
        },
        {
            description: '$efi.evikbClickHandler(paramMap) ',
            fn: function () {
                var paramMap = {
                    "BUKRS": "KR01",
                    "DATE_FR": "20170101",
                    "DATE_TO": "20181231",
                    "MODE": "A",
                    "MODE2": "A",
                    "PERNR": "00009999",
                    "PERNR_TXT": "탁진광"
                };
                $efi.evikbClickHandler(paramMap);
            }
        },
        {
            description: '$efi.handleEvidenceByZUNIECM_5013_RowData(rowData)',
            fn: function () {
                $efi.handleEvidenceByZUNIECM_5013_RowData({"EVI_KB": 'AT', "EVI_SEQ": 'text'});
            }
        },
        {
            description: '$efi.showExGateClosedVendorStatus(bizNo)',
            fn: function () {
                $efi.showExGateClosedVendorStatus('1048621562');
            }
        },
        {
            description: '$efi.UD_0302_000EventHandler.openApprovalPopup(nsReturn.getStringReturn(o_url))',
            fn: function () {
                var params = [{
                    "BELNR": "1000000440",
                    "CRD_SEQ": '20190108001000006227',
                    "DOC_TYPE": "R0002",
                    "GJAHR": "2018",
                    "GRONO": "RB20180000001648"
                }];
                $nst.it_data_nsReturn('ZUNIEFI_4203', params, function (nsReturn) {
                    $efi.UD_0302_000EventHandler.openApprovalPopup(nsReturn.getStringReturn("O_URL"));
                })
            }
        },
        {
            description: '$efi.UD_0302_000EventHandler',
            descriptionDetail : [
                '$efi.UD_0302_000EventHandler.editStatement() - $efi.UD_0302_000EventHandler.editStatement()를 호출 하고 RFC호출을 완료하게 되면 화면 전환이 되는데 지금은 popup으로 화면 전환',
                '$efi.UD_0302_000EventHandler.cancelGroup()',
                '$efi.UD_0302_000EventHandler.gridCellClick(columnKey, rowIndex)'
            ],
            fn : function ($result) {

                $(
                    '<div class="unidocu-form-table-wrapper" id="search-condition"></div>' +
                    '<div id="unidocu-grid-panel-toolbar">' +
                    '<div class="btn_area uni-form-table-button-area" id="uni-buttons"></div>' +
                    '</div>' +
                    '<div id="unidocu-grid" class="unidocu-grid" data-sub-id="GRIDHEADER" style="margin-top: 10px;"></div>'
                ).appendTo($result);

                $.extend($u.webData.customWebDataMap, {
                    "efi_guide@search-condition": {

                        "OS_DATA": {
                            "COL_LEN": "3",
                            "IS_SEARCH": "1",
                            "COLOR": "gray",
                            "PANEL_TITLE": "검색조건"
                        },
                        "OT_DATA": [
                            {
                                "COLUMN_ID": "BUKRS",
                                "TEXT": "회사코드",
                                "COLUMN_TYPE": "Uni_CodeCombo",
                                "READ_ONLY": "1",
                                "SCOPE": "userInfo",
                                "DEFAULT_VALUE": "BUKRS"
                            },
                            {
                                "COLUMN_ID": "EVIKB",
                                "TEXT": "종류",
                                "COLUMN_TYPE": "Uni_CodeCombo"
                            },
                            {
                                "COLUMN_ID": "BUDAT",
                                "TEXT": "전기일자",
                                "COLUMN_TYPE": "Uni_DatePickerFromTo",
                                "FROM_NAME": "BUDAT_FR",
                                "TO_NAME": "BUDAT_TO"
                            },
                            {
                                "COLUMN_ID": "STATS",
                                "TEXT": "결재상태",
                                "COLUMN_TYPE": "Uni_CodeCombo",
                                "SCOPE": "param",
                                "DEFAULT_VALUE": "STATS"
                            },
                            {
                                "COLUMN_ID": "BELNR",
                                "TEXT": "전표번호",
                                "COLUMN_TYPE": "Uni_InputText",
                                "SCOPE": "param",
                                "DEFAULT_VALUE": "BELNR"
                            },
                            {
                                "COLUMN_ID": "empty",
                                "COLUMN_TYPE": "Uni_Empty",
                                "COL_SPAN": "2"
                            },
                            {
                                "COLUMN_ID": "PERNR",
                                "TEXT": "사원번호",
                                "COLUMN_TYPE": "Uni_CodePopup",
                                "SCOPE": "userInfo",
                                "DEFAULT_VALUE": "PERNR",
                                "CODE_VALUE": "PERNR",
                                "TEXT_VALUE": "SNAME"
                            }
                        ]
                    }
                });
                $.extend($u.webData.customWebDataMap, {
                    "efi_guide@GRIDHEADER": {
                        "OS_DATA": {
                            "PANEL_TITLE": ""
                        },
                        "OT_DATA": [
                            {
                                "FNAME": "GRONO",
                                "FNAME_TXT": "그룹번호",
                                "WIDTH": "150",
                                "TYPE": "imagetext",
                                "ALIGN": "center"
                            },
                            {
                                "FNAME": "BSTAT_TXT",
                                "FNAME_TXT": "전표상태",
                                "WIDTH": "100",
                                "TYPE": "text",
                                "ALIGN": "left"
                            },
                            {
                                "FNAME": "STATS_TXT",
                                "FNAME_TXT": "결재상태",
                                "WIDTH": "100",
                                "TYPE": "text",
                                "ALIGN": "left"
                            },
                            {
                                "FNAME": "BLART_TXT",
                                "FNAME_TXT": "전표유형내역",
                                "WIDTH": "100",
                                "TYPE": "text",
                                "ALIGN": "left"
                            },
                            {
                                "FNAME": "EVIKB",
                                "FNAME_TXT": "전표종류",
                                "WIDTH": "100",
                                "TYPE": "combo",
                                "ALIGN": "left"
                            },
                            {
                                "FNAME": "BELNR",
                                "FNAME_TXT": "전표번호",
                                "WIDTH": "100",
                                "TYPE": "imagetext",
                                "ALIGN": "center"
                            },
                            {
                                "FNAME": "BUDAT",
                                "FNAME_TXT": "전기일",
                                "WIDTH": "80",
                                "TYPE": "date",
                                "ALIGN": "center",
                                "DFORMAT": "yyyy-MM-dd"
                            },
                            {
                                "FNAME": "ZFBDT",
                                "FNAME_TXT": "지급일",
                                "WIDTH": "100",
                                "TYPE": "date",
                                "ALIGN": "center",
                                "DFORMAT": "yyyy-MM-dd"
                            },
                            {
                                "FNAME": "HKONT",
                                "FNAME_TXT": "계정코드",
                                "WIDTH": "100",
                                "TYPE": "text",
                                "ALIGN": "center"
                            },
                            {
                                "FNAME": "HKONT_TXT",
                                "FNAME_TXT": "GL 계정명",
                                "WIDTH": "150",
                                "TYPE": "text",
                                "ALIGN": "left"
                            },
                            {
                                "FNAME": "LIFNR",
                                "FNAME_TXT": "거래처",
                                "WIDTH": "100",
                                "TYPE": "text",
                                "ALIGN": "left"
                            },
                            {
                                "FNAME": "LIFNR_TXT",
                                "FNAME_TXT": "거래처명",
                                "WIDTH": "150"
                            },
                            {
                                "FNAME": "MWSKZ",
                                "FNAME_TXT": "세금코드",
                                "WIDTH": "100",
                                "TYPE": "text",
                                "ALIGN": "center"
                            },
                            {
                                "FNAME": "WAERS",
                                "FNAME_TXT": "통화",
                                "WIDTH": "60",
                                "ALIGN": "center"
                            },
                            {
                                "FNAME": "DMBTR",
                                "FNAME_TXT": "금액",
                                "WIDTH": "120",
                                "TYPE": "number",
                                "ALIGN": "right",
                                "DFORMAT": "#,###"
                            },
                            {
                                "FNAME": "PERNR_TXT",
                                "FNAME_TXT": "전표생성자",
                                "WIDTH": "100",
                                "TYPE": "text"
                            },
                            {
                                "FNAME": "SGTXT",
                                "FNAME_TXT": "적요",
                                "WIDTH": "250",
                                "TYPE": "text",
                                "ALIGN": "left"
                            },
                            {
                                "FNAME": "EVIKB_@",
                                "FNAME_TXT": "증빙조회",
                                "WIDTH": "100",
                                "TYPE": "imagetext",
                                "ALIGN": "center",
                                "IMAGE_URL": "/images/btn/btn_view.gif"
                            },
                            {
                                "FNAME": "APPR_SEQ_STAT",
                                "FNAME_TXT": "결재순번상태"
                            },
                            {
                                "FNAME": "APPR_SEQ_STATS",
                                "FNAME_TXT": "결재상태"
                            },
                            {
                                "FNAME": "APPR_SEQ_STATS_TXT",
                                "FNAME_TXT": "결재상태"
                            },
                            {
                                "FNAME": "APPR_SEQ_STAT_INT"
                            },
                            {
                                "FNAME": "APPR_SEQ_STAT_TXT",
                                "FNAME_TXT": "결재상태"
                            },
                            {
                                "FNAME": "APPR_STAT",
                                "FNAME_TXT": "결재상태"
                            },
                            {
                                "FNAME": "APPR_STATS",
                                "FNAME_TXT": "결재상태"
                            },
                            {
                                "FNAME": "APPR_STATS_TXT",
                                "FNAME_TXT": "결재상태"
                            },
                            {
                                "FNAME": "APPR_STAT_TXT",
                                "FNAME_TXT": "결재상태"
                            },
                            {
                                "FNAME": "BLART",
                                "FNAME_TXT": "전표유형",
                                "WIDTH": "0",
                                "ALIGN": "center"
                            },
                            {
                                "FNAME": "BLDAT",
                                "FNAME_TXT": "전표증빙일",
                                "TYPE": "date"
                            },
                            {
                                "FNAME": "BSTAT",
                                "FNAME_TXT": "전표상태"
                            },
                            {
                                "FNAME": "BUKRS",
                                "FNAME_TXT": "회사 코드"
                            },
                            {
                                "FNAME": "CRD_SEQ",
                                "FNAME_TXT": "법인카드증빙일련번호"
                            },
                            {
                                "FNAME": "DOKNR",
                                "FNAME_TXT": "문서번호",
                                "WIDTH": "0"
                            },
                            {
                                "FNAME": "EVIKB_TXT",
                                "FNAME_TXT": "증빙구분내역"
                            },
                            {
                                "FNAME": "EVI_SEQ",
                                "FNAME_TXT": "증빙일련번호(년월일+회사코드+12) 내부사용"
                            },
                            {
                                "FNAME": "GJAHR",
                                "FNAME_TXT": "회계연도"
                            },
                            {
                                "FNAME": "GRONO_IMAGE",
                                "FNAME_TXT": "아이콘(결재문서)",
                                "WIDTH": "0"
                            },
                            {
                                "FNAME": "INV_SEQ",
                                "FNAME_TXT": "세금계산서 일련번호(년월일+회사코드+12) 내부사용",
                                "TYPE": "imagetext",
                                "ALIGN": "center"
                            },
                            {
                                "FNAME": "KOSTL",
                                "FNAME_TXT": "코스트센터",
                                "TYPE": "text",
                                "ALIGN": "center"
                            },
                            {
                                "FNAME": "KOSTL_TXT",
                                "FNAME_TXT": "코스트센터명",
                                "TYPE": "text",
                                "ALIGN": "left"
                            },
                            {
                                "FNAME": "NAME1",
                                "FNAME_TXT": "공급업체명",
                                "TYPE": "text",
                                "ALIGN": "left"
                            },
                            {
                                "FNAME": "PERNR",
                                "FNAME_TXT": "전표생성자"
                            },
                            {
                                "FNAME": "STATS",
                                "FNAME_TXT": "결재상태",
                                "WIDTH": "0",
                                "TYPE": "text",
                                "ALIGN": "center"
                            },
                            {
                                "FNAME": "STATUS"
                            },
                            {
                                "FNAME": "XBLNR",
                                "FNAME_TXT": "참조전표번호"
                            },
                            {
                                "FNAME": "ZLSCH",
                                "FNAME_TXT": "지급방법"
                            },
                            {
                                "FNAME": "ZLSCH_TXT",
                                "FNAME_TXT": "지급방법"
                            },
                            {
                                "FNAME": "TEST",
                                "FNAME_TXT": "테스트 필드",
                                "WIDTH": "0",
                                "TYPE": "imagecell"
                            },
                            {
                                "FNAME": "TEST2",
                                "FNAME_TXT": "테스트 필드2",
                                "WIDTH": "0",
                                "TYPE": "text"
                            }
                        ]
                    }
                });

                $.extend($u.webData.customWebDataMap, {
                    "efi_guide@uni-buttons": {
                        "OS_DATA": {
                            "BUTTON_AREA_ID": "uni-buttons"
                        },
                        "OT_DATA": [
                            {
                                "BUTTON_ID": "editStatement",
                                "TEXT": "전표수정"
                            },
                            {
                                "BUTTON_ID": "requestApproval",
                                "TEXT": "그룹결재요청",
                                "COLOR": "blue",
                                "DESCRIPTION": "한화 에너지 사용하지 않음"
                            }
                        ]
                    }
                });

                $u.unidocuUI();
                var gridObj = $u.gridWrapper.getGrid();


                gridObj.onCellClick(function (columnKey, rowIndex) {
                    $efi.UD_0302_000EventHandler.gridCellClick(columnKey, rowIndex);
                });

                $u.buttons.addHandler({
                    "doQuery": function () {
                        function callback(gridData) {
                            gridObj.setJSONData(gridData);
                            if ($self.data('callback')) {
                                $self.data('callback')();
                                $self.data('callback', null);
                            }
                        }
                        var $self = $(this);
                        var values = $u.getValues('search-condition');
                        if (/,/.test(values['BELNR'])) {
                            var it_belnr = [];
                            $.each(values['BELNR'].split(','), function () {
                                it_belnr.push({BELNR: this});
                            });
                            delete values['BELNR'];
                            $nst.is_data_tableParams_nsReturn('ZUNIEFI_4200', values, {IT_BELNR: it_belnr}, function (nsReturn) {
                                callback(nsReturn.getTableReturn('OT_DATA'));
                            });
                        } else {
                            $nst.is_data_ot_data('ZUNIEFI_4200', values, callback);
                        }
                    },
                    "editStatement": function () {
                        gridObj.asserts.selectedExactOneRow();
                        if (gridObj.getSELECTEDJSONData()[0].BSTAT !== 'V') throw $mls.getByCode('M_UD_0302_000_modifyStatementOnlyTempStatement');

                        $nst.is_data_nsReturn('ZUNIEFI_4105', gridObj.getSELECTEDJSONData()[0], function () {
                            $u.popup.openByProgramId('UD_0302_011', 1035, 1200, gridObj.getSELECTEDJSONData()[0]);
                        });
                    },
                    "requestApproval" : function () {
                        gridObj.asserts.rowSelected();
                        $nst.it_data_nsReturn('ZUNIEFI_4203', gridObj.getSELECTEDJSONData(), function (nsReturn) {
                            $efi.UD_0302_000EventHandler.openApprovalPopup(nsReturn.getStringReturn("O_URL"))
                        });
                    },
                    "cancelGroup": $efi.UD_0302_000EventHandler.cancelGroup
                });
                $u.buttons.addHandler($u.Unidocu001.layoutButtonHandler);

                gridObj.fitToWindowSize();
            }
        },
        {
            description: "$efi.popup",
            descriptionDetail: [
                "$efi.popup.openCardBillUD_0398_000",
                "$efi.popup.openTaxInvoiceUD_0398_000",
                "$efi.popup.openStatementViewWithParamMap",
                "$efi.popup.openUD_0398_000",
                "$efi.popup.showEvidence",
                "$efi.popup.openCardBill",
                "$efi.popup.openTaxInvoice"
            ],
            fn: function ($result) {
                $(
                    '<div id="unidocu-grid-panel-toolbar">'
                    + '<div class="btn_area uni-form-table-button-area" id="uni-buttons"></div>'
                    + '</div>'
                ).appendTo($result);

                $.extend($u.webData.customWebDataMap, {
                    "efi_guide@uni-buttons": {
                        "OS_DATA": {
                            "BUTTON_AREA_ID": "uni-buttons"
                        },
                        "OT_DATA": [
                            {
                                "BUTTON_ID": "popupBtn1",
                                "TEXT": "$efi.popup.openCardBillUD_0398_000",
                                "LOCATE_LEFT": "1"
                            },
                            {
                                "BUTTON_ID": "popupBtn2",
                                "TEXT": "$efi.popup.openTaxInvoiceUD_0398_000",
                                "LOCATE_LEFT": "1"
                            },
                            {
                                "BUTTON_ID": "popupBtn3",
                                "TEXT": "$efi.popup.openStatementViewWithParamMap",
                                "LOCATE_LEFT": "1"
                            },
                            {
                                "BUTTON_ID": "popupBtn4",
                                "TEXT": "$efi.popup.openUD_0398_000",
                                "LOCATE_LEFT": "1"
                            },
                            {
                                "BUTTON_ID": "popupBtn9",
                                "TEXT": "$efi.popup.showEvidence",
                                "LOCATE_LEFT": "1"
                            },
                            {
                                "BUTTON_ID": "popupBtn10",
                                "TEXT": "$efi.popup.openCardBill",
                                "LOCATE_LEFT": "1"
                            },
                            {
                                "BUTTON_ID": "popupBtn11",
                                "TEXT": "$efi.popup.openTaxInvoice",
                                "LOCATE_LEFT": "1"
                            }
                        ]
                    }
                });
                $u.unidocuUI();

                var paramMap = {
                    "BUKRS": "KR01",
                    "DOKNR": "4810000449",
                    "EVIKB": "FI_04",
                    "EVIKB_TXT": "개인카드/간이영수증",
                    "GJAHR": "2019",

                    "BSTAT": "V",
                    "BUDAT_FR": "20150101",
                    "BUDAT_TO": "20190516",
                    "PERNR": "00000009",
                    "PERNR_TXT": "탁진광",
                    "empty": null,

                    "DATE_FR": "20150101",
                    "DATE_TO": "20190131",
                    "MODE": "A",
                    "MODE2": "A",
                    "DATUM_FR": "20190401",
                    "DATUM_TO": "20190516",
                    "USE_DOC": "A",

                    "EVI_DATE_FR": "20150101",
                    "EVI_DATE_TO": "20181230"
                };

                $u.buttons.addHandler({
                    "popupBtn1": function () {
                        $nst.is_data_ot_data('ZUNIEFI_1000', paramMap, function (ot_data) {
                            var crdSeq = ot_data[0]['CRD_SEQ'];
                            var url = '/biz/popup/CardBill/view.do?CRD_SEQ=' + Base64.encode(crdSeq);
                            $efi.popup.openCardBillUD_0398_000(url);
                        });
                    },
                    "popupBtn2": function () {
                        $nst.is_data_ot_data('ZUNIEFI_8005', paramMap, function (ot_data) {
                            var inv_seq = ot_data[0]['INV_SEQ'];
                            var url = '/biz/popup/TaxInvoice/view.do?INV_SEQ=' + Base64.encode(inv_seq);
                            $efi.popup.openTaxInvoiceUD_0398_000(url);
                        });
                    },
                    "popupBtn3": function () {
                        $nst.is_data_ot_data('ZUNIEFI_4200', paramMap, function (ot_data) {
                            $efi.popup.openStatementViewWithParamMap(ot_data[0]);
                        });
                    },
                    "popupBtn4": function () {
                        $nst.is_data_ot_data('ZUNIEFI_8005', paramMap, function (ot_data) {
                            $efi.popup.openUD_0398_000(ot_data[0]);
                        });
                    },
                    "popupBtn9": function () {
                        $nst.is_data_ot_data('ZUNIEFI_8008',paramMap, function(ot_data){
                            $efi.popup.showEvidence(ot_data[0]['EVI_SEQ']);
                        });
                    },
                    "popupBtn10": function () {
                        $nst.is_data_ot_data('ZUNIEFI_1000', paramMap, function (ot_data) {
                            var crdSeq = ot_data[0]['CRD_SEQ'];
                            $efi.popup.openCardBill(crdSeq);
                        });
                    },
                    "popupBtn11": function () {
                        $nst.is_data_ot_data('ZUNIEFI_2000', paramMap, function (ot_data) {
                            $efi.popup.openTaxInvoice(ot_data[0]['INV_SEQ']);
                        });
                    }
                });
            }
        },
        {
            description: "$ewi.OrgTree",
            descriptionDtail: [
              "210번에서 조직관리 안나옴. "
            ],
            fn :function ($result) {
                $(
                    '<div id="leftWrapper" style="width: 390px; float: left;">' +
                    '<div id="org-tree" style="height: 500px;"></div>' +
                    '</div>'
                ).appendTo($result);

                $u.unidocuUI();

                var formHandler = {};
                formHandler.$leftWrapper = null;

                formHandler.initialize = function () {
                    formHandler.$leftWrapper = $('#leftWrapper');
                };

                var orgTree = new $efi.OrgTree($('#org-tree'), {
                    load_node: function () {
                        orgTree.select_node(staticProperties.user['ID']);
                    }
                });
                formHandler.initialize();
                orgTree.initOrgData();
            }
        },
        {
            description: "$efi.pdf",
            fn :function ($result) {
                $(
                    '<div class="unidocu-form-table-wrapper" id="search-condition"></div>' +
                    '<div id="unidocu-grid-panel-toolbar">' +
                    '<div class="btn_area uni-form-table-button-area" id="uni-buttons"></div>' +
                    '</div>' +
                    '<div id="unidocu-grid" class="unidocu-grid" data-sub-id="GRIDHEADER" style="margin-top: 10px;"></div>'
                ).appendTo($result);


                $.extend($u.webData.customWebDataMap, {
                    "efi_guide@search-condition" : {
                        "OS_DATA": {
                            "COL_LEN": "3",
                            "IS_SEARCH": "1",
                            "COLOR": "gray",
                            "SEARCH_BTN_ID": "queryForGridObj1",
                            "FUNCNAME": "ZUNIEFI_4100",
                            "PANEL_TITLE": "검색조건"
                        },
                        "OT_DATA": [
                            {
                                "COLUMN_ID": "BUKRS",
                                "TEXT": "회사코드",
                                "COLUMN_TYPE": "Uni_CodeCombo",
                                "READ_ONLY": "1",
                                "SCOPE": "userInfo",
                                "DEFAULT_VALUE": "BUKRS"
                            },
                            {
                                "COLUMN_ID": "EVIKB",
                                "TEXT": "종류",
                                "COLUMN_TYPE": "Uni_CodeCombo"
                            },
                            {
                                "COLUMN_ID": "BUDAT",
                                "TEXT": "전기일자",
                                "COLUMN_TYPE": "Uni_DatePickerFromTo",
                                "FROM_NAME": "BUDAT_FR",
                                "TO_NAME": "BUDAT_TO"
                            },
                            {
                                "COLUMN_ID": "BELNR",
                                "TEXT": "전표번호",
                                "COLUMN_TYPE": "Uni_InputText",
                                "MAX_LENGTH": "10"
                            },
                            {
                                "COLUMN_ID": "STATS",
                                "TEXT": "결재상태",
                                "COLUMN_TYPE": "Uni_CodeCombo",
                                "DEFAULT_VALUE": "4"
                            },
                            {
                                "COLUMN_ID": "PERNR",
                                "TEXT": "작성자",
                                "COLUMN_TYPE": "Uni_CodePopup",
                                "READ_ONLY": "1",
                                "SCOPE": "userInfo",
                                "DEFAULT_VALUE": "PERNR",
                                "CODE_VALUE": "PERNR",
                                "TEXT_VALUE": "SNAME"
                            }
                        ]
                    }
                });

                $.extend($u.webData.customWebDataMap, {
                    "efi_guide@uni-buttons": {
                        "OS_DATA": {
                            "BUTTON_AREA_ID": "uni-buttons"
                        },
                        "OT_DATA": [
                            {
                                "BUTTON_ID": "batchPrint",
                                "TEXT": "일괄인쇄"
                            },
                            {
                                "BUTTON_ID": "eachPrint",
                                "TEXT": "개별인쇄"
                            }
                        ]
                    }
                });

                $.extend($u.webData.customWebDataMap, {
                    "efi_guide@GRIDHEADER" : {
                        "OS_DATA": {
                            "PANEL_TITLE": ""
                        },
                        "OT_DATA": [
                            {
                                "FNAME": "GRONO",
                                "FNAME_TXT": "그룹번호",
                                "WIDTH": "150",
                                "TYPE": "imagetext",
                                "ALIGN": "center"
                            },
                            {
                                "FNAME": "BSTAT_TXT",
                                "FNAME_TXT": "전표상태",
                                "WIDTH": "100",
                                "TYPE": "text",
                                "ALIGN": "center"
                            },
                            {
                                "FNAME": "STATS",
                                "FNAME_TXT": "결재상태",
                                "WIDTH": "80",
                                "TYPE": "text",
                                "ALIGN": "center"
                            }
                        ]
                    }
                });
                $u.unidocuUI();

                var gridObj = $u.gridWrapper.getGrid();
                $u.buttons.addHandler({
                    "batchPrint" : function () {
                        gridObj.asserts.rowSelected();
                        $efi.pdf.downloadMultiStatementZUNIDU_6202({it_docString: JSON.stringify(gridObj.getSELECTEDJSONData())});
                    },
                    "eachPrint": function () {
                        gridObj.asserts.rowSelected();
                        $efi.pdf.downloadSingleStatementZUNIDU_6203({it_docString: JSON.stringify(gridObj.getSELECTEDJSONData())});
                    }
                });
                $u.buttons.addHandler($u.Unidocu001.layoutButtonHandler);
                gridObj.fitToWindowSize();
            }
        },
        {
            description :'$efiBindEvent.js',
            descriptionDetail: [
                '$efi.createStatement.bindEvent.bindCommonFormEvent()'
            ],
            fn :function ($result) {
                $(
                    '<div id="header-invoicer-content" class="unidocu-form-table-wrapper"></div>' +
                    '<div class="btn_area uni-form-table-button-area" id="uni-grid_top_buttons"></div>' +
                    '<div id="amount-display" class="unidocu-form-table-wrapper"></div>' +
                    '<div id="unidocu-grid" class="unidocu-grid" data-sub-id="GRIDHEADER" style="margin-top:10px;"></div>'
                ).appendTo($result);

                $.extend($u.webData.customWebDataMap, {
                    "efi_guide@header-invoicer-content": {
                        "OS_DATA": {
                            "COL_LEN": "3",
                            "IS_SEARCH": "0",
                            "COLOR": "light-blue",
                            "TH_WIDTH": "100",
                            "PANEL_TITLE": "헤더/공급자정보"
                        },
                        "OT_DATA": [
                            {
                                "COLUMN_ID": "BUDAT",
                                "TEXT": "전기일",
                                "COLUMN_TYPE": "Uni_DatePicker",
                                "REQUIRED": "1"
                            },
                            {
                                "COLUMN_ID": "BLDAT",
                                "TEXT": "증빙일",
                                "COLUMN_TYPE": "Uni_DatePicker"
                            },
                            {
                                "COLUMN_ID": "BLART",
                                "TEXT": "전표유형",
                                "COLUMN_TYPE": "Uni_CodeCombo",
                                "READ_ONLY": "1"
                            },
                            {
                                "COLUMN_ID": "WWEST",
                                "TEXT": "환산일",
                                "COLUMN_TYPE": "Uni_DatePicker",
                                "NOT_IN_USE": "1",
                                "DESCRIPTION": "외화 처리 관련"
                            },
                            {
                                "COLUMN_ID": "WAERS",
                                "TEXT": "통화",
                                "COLUMN_TYPE": "Uni_CodeCombo",
                                "NOT_IN_USE": "1",
                                "DEFAULT_VALUE": "KRW",
                                "DESCRIPTION": "외화 처리 관련"
                            },
                            {
                                "COLUMN_ID": "KURSF",
                                "TEXT": "환율",
                                "COLUMN_TYPE": "Uni_InputAmount",
                                "NOT_IN_USE": "1",
                                "DEFAULT_VALUE": "1",
                                "DESCRIPTION": "외화 처리 관련"
                            },
                            {
                                "COLUMN_ID": "BUKRS",
                                "TEXT": "회사코드",
                                "COLUMN_TYPE": "Uni_CodeCombo",
                                "SCOPE": "userInfo",
                                "DEFAULT_VALUE": "BUKRS",
                                "CODE_VALUE": "BUKRS",
                                "TEXT_VALUE": "BUKRS_TXT"
                            },
                            {
                                "COLUMN_ID": "BUPLA",
                                "TEXT": "사업장",
                                "COLUMN_TYPE": "Uni_CodeCombo",
                                "SCOPE": "userInfo",
                                "DEFAULT_VALUE": "BUPLA"
                            },
                            {
                                "COLUMN_ID": "MWSKZ",
                                "TEXT": "세금코드",
                                "COLUMN_TYPE": "Uni_CodeCombo",
                                "DEFAULT_VALUE": "V0"
                            },
                            {
                                "COLUMN_ID": "LIFNR",
                                "TEXT": "공급업체코드",
                                "COLUMN_TYPE": "Uni_CodePopup",
                                "MAX_LENGTH": "10",
                                "REQUIRED": "1",
                                "SCOPE": "userInfo",
                                "CODE_VALUE": "LIFNR",
                                "TEXT_VALUE": "LIFNR_TXT"
                            },
                            {
                                "COLUMN_ID": "AKONT",
                                "TEXT": "계정번호",
                                "COLUMN_TYPE": "Uni_CodeCombo",
                                "NOT_IN_USE": "1",
                                "CODE_KEY": "AKONT"
                            },
                            {
                                "COLUMN_ID": "WRBTR",
                                "TEXT": "지급금액",
                                "COLUMN_TYPE": "Uni_InputAmount",
                                "REQUIRED": "1",
                                "SCOPE": "param",
                                "DEFAULT_VALUE": "WRBTR"
                            },
                            {
                                "COLUMN_ID": "EMPFB",
                                "TEXT": "대체수취인",
                                "COLUMN_TYPE": "Uni_InputText"
                            },
                            {
                                "COLUMN_ID": "ZLSCH",
                                "TEXT": "지급방법",
                                "COLUMN_TYPE": "Uni_CodeCombo",
                                "SCOPE": "param",
                                "DEFAULT_VALUE": "ZLSCH"
                            },
                            {
                                "COLUMN_ID": "ZTERM",
                                "TEXT": "지급조건",
                                "COLUMN_TYPE": "Uni_CodeCombo",
                                "SCOPE": "param",
                                "DEFAULT_VALUE": "ZTERM"
                            },
                            {
                                "COLUMN_ID": "WMWST",
                                "TEXT": "세금금액",
                                "COLUMN_TYPE": "Uni_InputAmount",
                                "SCOPE": "param",
                                "DEFAULT_VALUE": "FWSTE"
                            },
                            {
                                "COLUMN_ID": "ZFBDT",
                                "TEXT": "지급기산일",
                                "COLUMN_TYPE": "Uni_DatePicker"
                            },
                            {
                                "COLUMN_ID": "BVTYP",
                                "TEXT": "지급계좌",
                                "COLUMN_TYPE": "Uni_CodeCombo",
                                "SCOPE": "param",
                                "DEFAULT_VALUE": "LIFNR"
                            },
                            {
                                "COLUMN_ID": "BKTXT",
                                "TEXT": "헤더텍스트",
                                "COLUMN_TYPE": "Uni_InputText",
                                "NOT_IN_USE": "1",
                                "MAX_LENGTH": "25"
                            },
                            {
                                "COLUMN_ID": "WRBTR_SLASH",
                                "COLUMN_TYPE": "Uni_Slash",
                                "NOT_IN_USE": "1",
                                "APPEND_INPUT": "1",
                                "TARGET_ID": "WRBTR",
                                "DESCRIPTION": "외화 처리 관련"
                            },
                            {
                                "COLUMN_ID": "DMBTR",
                                "TEXT": "환산금액",
                                "COLUMN_TYPE": "Uni_InputAmount",
                                "NOT_IN_USE": "1",
                                "APPEND_INPUT": "1",
                                "TARGET_ID": "WRBTR"
                            },
                            {
                                "COLUMN_ID": "SGTXT",
                                "TEXT": "적요",
                                "COLUMN_TYPE": "Uni_InputText",
                                "MAX_LENGTH": "50",
                                "REQUIRED": "1"
                            },
                            {
                                "COLUMN_ID": "REQNO",
                                "TEXT": "품의서 번호",
                                "COLUMN_TYPE": "Uni_CustomCodePopup",
                                "NOT_IN_USE": "1"
                            },
                            {
                                "COLUMN_ID": "GSBER",
                                "TEXT": "GSBER",
                                "COLUMN_TYPE": "Uni_CodePopup",
                                "NOT_IN_USE": "1"
                            }
                        ]
                    }
                });

                $.extend($u.webData.customWebDataMap, {
                    "efi_guide@uni-grid_top_buttons" : {
                        "OS_DATA": {
                            "BUTTON_AREA_ID": "uni-grid_top_buttons"
                        },
                        "OT_DATA": [
                            {
                                "BUTTON_ID": "addRow",
                                "TEXT": "행 추가",
                                "ICON": "add-row",
                                "LOCATE_LEFT": "1"
                            },
                            {
                                "BUTTON_ID": "deleteRow",
                                "TEXT": "행 삭제",
                                "ICON": "del-row",
                                "LOCATE_LEFT": "1"
                            }
                        ]
                    }
                });


                $.extend($u.webData.customWebDataMap, {
                    "efi_guide@amount-display": {
                        "OS_DATA": {
                            "COL_LEN": "3",
                            "IS_SEARCH": "0",
                            "TH_WIDTH": "50",
                            "IGN_PANEL": "1"
                        },
                        "OT_DATA": [
                            {
                                "COLUMN_ID": "difference_amount",
                                "TEXT": "차액",
                                "COLUMN_TYPE": "Uni_InputAmount",
                                "READ_ONLY": "1"
                            },
                            {
                                "COLUMN_ID": "debitSum",
                                "TEXT": "차변합계",
                                "COLUMN_TYPE": "Uni_InputAmount",
                                "READ_ONLY": "1"
                            },
                            {
                                "COLUMN_ID": "creditSum",
                                "TEXT": "대변합계",
                                "COLUMN_TYPE": "Uni_InputAmount",
                                "READ_ONLY": "1"
                            }
                        ]
                    }
                });

                $.extend($u.webData.customWebDataMap, {
                    "efi_guide@GRIDHEADER" :{
                        "OS_DATA": {
                            "PANEL_TITLE": "비용항목"
                        },
                        "OT_DATA": [
                            {
                                "FNAME": "SHKZG",
                                "FNAME_TXT": "차변/대변",
                                "WIDTH": "100",
                                "TYPE": "combo",
                                "ALIGN": "center",
                                "EDIT": "X"
                            },
                            {
                                "FNAME": "HKONT",
                                "FNAME_TXT": "계정코드",
                                "WIDTH": "150",
                                "TYPE": "popup",
                                "REQUIRED": "X",
                                "ALIGN": "left",
                                "EDIT": "X"
                            },
                            {
                                "FNAME": "WRBTR",
                                "FNAME_TXT": "금액",
                                "WIDTH": "100",
                                "TYPE": "number",
                                "REQUIRED": "X",
                                "ALIGN": "right",
                                "EDIT": "X",
                                "DFORMAT": "#,###"
                            },
                            {
                                "FNAME": "ADD_DATA",
                                "FNAME_TXT": "추가데이터",
                                "WIDTH": "100",
                                "ALIGN": "left",
                                "IMAGE_ALIGN": "center"
                            },
                            {
                                "FNAME": "KOSTL",
                                "FNAME_TXT": "코스트센터",
                                "WIDTH": "140",
                                "TYPE": "popup",
                                "ALIGN": "left",
                                "EDIT": "X"
                            },
                            {
                                "FNAME": "AUFNR",
                                "FNAME_TXT": "오더번호",
                                "WIDTH": "100",
                                "TYPE": "popup",
                                "EDIT": "X"
                            },
                            {
                                "FNAME": "MWSKZ",
                                "FNAME_TXT": "세금코드",
                                "WIDTH": "200",
                                "TYPE": "combo",
                                "EDIT": "X",
                                "ADD_EMPTY": "X"
                            },
                            {
                                "FNAME": "SGTXT",
                                "FNAME_TXT": "적요",
                                "WIDTH": "300",
                                "TYPE": "text",
                                "ALIGN": "left",
                                "EDIT": "X"
                            },
                            {
                                "FNAME": "FWBAS",
                                "FNAME_TXT": "과세표준액",
                                "WIDTH": "100",
                                "TYPE": "text",
                                "ALIGN": "right",
                                "EDIT": "X"
                            },
                            {
                                "FNAME": "ADD_DATA__HIDDEN",
                                "WIDTH": "0"
                            },
                            {
                                "FNAME": "ANLN1",
                                "FNAME_TXT": "주요자산번호"
                            },
                            {
                                "FNAME": "BUZEI",
                                "FNAME_TXT": "회계전표의 개별항목번호"
                            },
                            {
                                "FNAME": "DMBTR",
                                "FNAME_TXT": "환산금액",
                                "WIDTH": "0",
                                "TYPE": "number",
                                "ALIGN": "right",
                                "EDIT": "X",
                                "DFORMAT": "#,###"
                            },
                            {
                                "FNAME": "FISTL",
                                "FNAME_TXT": "예산관리센터"
                            },
                            {
                                "FNAME": "FLAG",
                                "FNAME_TXT": "일반표시"
                            },
                            {
                                "FNAME": "LIFNR",
                                "FNAME_TXT": "구매처 또는 채권자 계정번호",
                                "ALIGN": "left",
                                "EDIT": "X"
                            },
                            {
                                "FNAME": "PRCTR",
                                "FNAME_TXT": "손익센터"
                            },
                            {
                                "FNAME": "PROJK",
                                "FNAME_TXT": "계정지정 프로젝트(PS_PSP_PNR batch 입력필"
                            },
                            {
                                "FNAME": "TXT50",
                                "FNAME_TXT": "G/L 계정설명"
                            },
                            {
                                "FNAME": "XNEGP",
                                "FNAME_TXT": "지시자: 마이너스전기"
                            },
                            {
                                "FNAME": "XREF1",
                                "FNAME_TXT": "거래처참조키"
                            },
                            {
                                "FNAME": "XREF2",
                                "FNAME_TXT": "거래처참조키"
                            },
                            {
                                "FNAME": "XREF3",
                                "FNAME_TXT": "개별항목참조키"
                            },
                            {
                                "FNAME": "ZUONR",
                                "FNAME_TXT": "지정번호"
                            },
                            {
                                "FNAME": "WAERS",
                                "FNAME_TXT": "통화키"
                            }
                        ]
                    }
                });

                $u.unidocuUI();

                $efi.createStatementCommon.init();
                $u.programSetting.appendTemplate('evidenceAmountNegative', {
                    defaultValue: 'false',
                    description: '입력 금액 -로 처리. 차대변 지시자 반대로 적용 H, S'
                });

                var gridObj = $u.gridWrapper.getGrid();
                $efi.createStatement.bindGridEvent();
                $efi.createStatementCommon.bindFormButton();

                $efi.createStatement.bindEvent.bindCommonFormEvent();
                gridObj.setNumberNegative('WRBTR', 'false');
                $efi.createStatementCommon.addRow();
                $efi.createStatement.bindEvent.triggerZTERM_BUDATChange();
                $efi.createStatement.bindEvent.triggerSGTXTChange();
                gridObj.fitToWindowSize();

                var lifnr = $u.get('LIFNR');
                if (lifnr && lifnr.getValue() !== '') lifnr.$el.change();

                if ($u.page.getPageParams()['callByFI_0002']) $efi.createStatement.handleCallByFI_0002();

            }
        },
        {
            description : "$efiDialog.js",
            fn: function ($result) {

                $result.append('<div class="btn_area uni-form-table-button-area" id="uni-buttons"></div>');

                $.extend($u.webData.customWebDataMap, {
                    "efi_guide@uni-buttons": {
                        "OS_DATA": {
                            "BUTTON_AREA_ID": "uni-buttons"
                        },
                        "OT_DATA": [
                            {
                                "BUTTON_ID": "button1",
                                "TEXT": "$efi.dialog.MULTIPODATADialog.open()",
                                "LOCATE_LEFT": "1"
                            },
                            {
                                "BUTTON_ID": "button2",
                                "TEXT": "$efi.dialog.POHISTORYDialog.open(ot_data)",
                                "LOCATE_LEFT": "1"
                            },
                            {
                                "BUTTON_ID": "button3",
                                "TEXT": "$efi.dialog.batchApplyDialog.open(firstSelectedJSONData)",
                                "LOCATE_LEFT": "1"
                            },
                            {
                                "BUTTON_ID": "button4",
                                "TEXT": "$efi.dialog.evidenceSelectDialog.open(UD_0201_000)",
                                "LOCATE_LEFT": "1"
                            },
                            {
                                "BUTTON_ID": "button5",
                                "TEXT": "$efi.dialog.evidenceSelectDialog.open(UD_0201_010)",
                                "LOCATE_LEFT": "1"
                            },
                            {
                                "BUTTON_ID": "button7",
                                "TEXT": "$efi.dialog.addDataDialog.open()",
                                "LOCATE_LEFT": "1"
                            },
                            {
                                "BUTTON_ID": "button9",
                                "TEXT": "$efi.dialog.clr_amtDialog.open()",
                                "LOCATE_LEFT": "1"
                            },
                            {
                                "BUTTON_ID": "button10",
                                "TEXT": "$efi.dialog.afterCreateStatementDialog.open()",
                                "LOCATE_LEFT": "1"
                            },
                            {
                                "BUTTON_ID": "button11",
                                "TEXT": "$efi.dialog.openRequestApprovalConfirm()",
                                "LOCATE_LEFT": "1"
                            }
                        ]
                    }
                });
                $u.unidocuUI();

                var params = {
                    "DATUM_FR": "20100101",
                    "DATUM_TO": "20190527",
                    "MODE1": "A",
                    "PERNR": "00000009",
                    "WAERS": "KRW"
                };

                $u.buttons.addHandler({
                    "button1": function () {
                        $efi.dialog.MULTIPODATADialog.open(function () {});
                    },
                    "button2": function () {
                        $efi.dialog.POHISTORYDialog.open(function () {});
                    },
                    "button3": function () {
                        $efi.dialog.batchApplyDialog.open(function () {});
                    },
                    "button4": function () {
                        $efi.dialog.evidenceSelectDialog.open({evidencePROGRAM_ID: 'UD_0201_000'});
                    },
                    "button5": function () {
                        $efi.dialog.evidenceSelectDialog.open({evidencePROGRAM_ID: 'UD_0201_010'});
                    },
                    "button7": function () {
                        $efi.dialog.addDataDialog.open('UD_0202_001','54000600',0,0);
                    },
                    "button9": function () {
                        $nst.is_data_ot_data('ZUNIEFI_3703',params,function(ot_data) {
                            if (ot_data.length > 0) {
                                $efi.dialog.clr_amtDialog.open('UD_0210_000', ot_data);
                            } else {
                                unidocuAlert('데이터가 없습니다. 410에서 확인해주세요.');
                            }
                        });
                    },
                    "button10": function () {
                        $efi.dialog.afterCreateStatementDialog.open({BELNR: 'BELNR', BUKRS: 'BUKRS', GJAHR: 'GJAHR'}, function () {});
                    },
                    "button11": function () {
                        $efi.dialog.openRequestApprovalConfirm('TEST ', 'message', [{title: '정기지급번호', value: '20190000000055' }], '신규 작성을 진행 하시곘습니까?', {
                            text: '계속 작성',
                            fn: function(){
                                unidocuAlert('확인');
                            }
                        }, {
                            text: '전자결재 작성',
                            fn: function(){
                                unidocuAlert('확인');
                            }
                        });
                    }
                });
            }
        }
    ]
});