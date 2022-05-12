/**
 * @module demo/UD_DEMO_000
 * 차량일지
 */
define(function () {
    return function () {
        $u.unidocuUI();
        var gridDistance = $u.gridWrapper.getGrid('UD_DEMO_000_grid-distance');
        var gridCarCostHis = $u.gridWrapper.getGrid('UD_DEMO_000_grid-carCostHis');
        var gridCarCostItem = $u.gridWrapper.getGrid('UD_DEMO_000_grid-carCostItem');
        var gridCarCostItemDetail = $u.gridWrapper.getGrid('UD_DEMO_000_grid-carCostItemDetail');
        var gridEvid = $u.gridWrapper.getGrid('UD_DEMO_000_grid-evid');

        var $u_PERNR = $u.get('PERNR');
        var $u_NODE_KEY_TXT = $u.get('NODE_KEY_TXT');
        var $u_CAR_NM = $u.get('CAR_NM');
        var $u_CAR_NUM = $u.get('CAR_NUM');
        var $u_APPR_TYPE = $u.get('APPR_TYPE');
        var $u_EFFICIENCY = $u.get('EFFICIENCY');

        var initSY_CAR_000_USER_INFO = $u.getValues('UD_DEMO_000_USER_INFO');
        var initColumnDescriptionData = [0, 0];

        gridCarCostItem.onCellClick(function (columnKey, rowIndex) {
            if (columnKey === 'BELNR' && gridCarCostItem.$V(columnKey, rowIndex)) {
                $efi.popup.openStatementViewWithParamMap(gridCarCostItem.getJSONDataByRowIndex(rowIndex));
            }
            if (columnKey === 'EVKEY_') {
                var evkey = gridCarCostItem.$V('EVKEY', rowIndex);
                var evi_gb = gridCarCostItem.$V('EVI_GB', rowIndex);
                if (evi_gb === 'C') $efi.popup.openCardBill(evkey);
                if (evi_gb === 'E') {
                    var $dialog = $u.dialog.fineUploaderDialog.open(evkey, $ewf.DRAFT_0061.gridObj3_FileAttacheReadOnly);
                    $dialog.find('#file-attach-content').on('fileCountChange', function (event, fileCount) {
                        setEvidenceImageByFileCount(rowIndex, fileCount);
                        gridCarCostItem.$V('EVKEY', rowIndex, $dialog.data('fineUploader').getFileGroupId());
                    });
                }
            }
        });

        gridCarCostItem.onChangeCell(function (columnKey, rowIndex) {
            if (columnKey === 'EVI_GB') {
                gridCarCostItem.$V('EVKEY', rowIndex, '');
                setEVKEY_Image(rowIndex, 'noEvidence');
                var evi_gb = gridCarCostItem.$V('EVI_GB', rowIndex);
                if (evi_gb === 'C') {
                    var defaultFormValues = null;
                    if($u.programSetting.getValue('법인카드 내역조회 사용자 검색 조건 선택된 행데이터로 설정') === 'true') {
                        defaultFormValues = {
                            PERNR__DIALOG: gridCarCostItem.$V('PERNR', rowIndex),
                            PERNR__DIALOG_TXT: gridCarCostItem.$V('PERNR_TXT', rowIndex)
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
                            gridCarCostItem.setRowDataByJSONObj(rowIndex, data);
                            setEVKEY_Image(rowIndex, 'hasEvidence');
                        },
                        closeWithoutSelectCallback: function () {
                            gridCarCostItem.$V(columnKey, rowIndex, '');
                        },
                        defaultFormValues: defaultFormValues
                    });
                }
                if (evi_gb === 'E') {
                    setEVKEY_Image(rowIndex, 'attachable');
                }
            }
        });

        if ($u_CAR_NUM) {  // 자동차 등록번호
            $u_CAR_NUM.$el.change(function () {
                var car_num = $u_CAR_NUM.getValue();
                var rowDataOfF4carnm = $u_CAR_NUM.$el.find('input').data('dialogRowData');
                if (!car_num) {
                    if ($u_EFFICIENCY) $u_EFFICIENCY.setValue(0);
                    setTableColumnDescription('FUEL_COST', initColumnDescriptionData);
                    setTableColumnDescription('TOLL_FEE', initColumnDescriptionData);
                } else {
                    $u_NODE_KEY_TXT.setValue("솔루션팀");
                    $u_CAR_NM.setValue(rowDataOfF4carnm['CAR_NUM_TXT']);
                    $u_PERNR.setValue({code: rowDataOfF4carnm['OWNER'], text: rowDataOfF4carnm['SNAME']});
                    $u_EFFICIENCY.setValue($.number(Number(7.1), 1));
                    setTableColumnDescription('FUEL_COST', [$.number(Number(249.5), 1), $.number(Number(1771.37), 2)]);
                    setTableColumnDescription('TOLL_FEE', [$.number(Number(800000)), $.number(Number(99100))]);

                    var ot_data1 = [
                        {USE_DT: '2021-04-10', DISTANCE: '155480.0~155520.0', REMARK: ''},
                        {USE_DT: '2021-04-09', DISTANCE: '155440.0~155480.0', REMARK: ''},
                        {USE_DT: '2021-04-08', DISTANCE: '155400.0~155440.0', REMARK: ''},
                        {USE_DT: '2021-04-07', DISTANCE: '155310.0~155400.0', REMARK: ''},
                        {USE_DT: '2021-04-06', DISTANCE: '155270.0~155310.0', REMARK: ''},
                        {USE_DT: '2021-04-05', DISTANCE: '155150.0~155270.0', REMARK: ''},
                        {USE_DT: '2021-04-04', DISTANCE: '155110.0~155150.0', REMARK: ''},
                        {USE_DT: '2021-04-03', DISTANCE: '155070.0~155110.0', REMARK: ''},
                        {USE_DT: '2021-04-02', DISTANCE: '154950.0~155070.0', REMARK: ''},
                        {USE_DT: '2021-04-01', DISTANCE: '154910.0~154950.0', REMARK: ''}
                    ]

                    var ot_data2 = [
                        {USE_DT: '2021-04-10', START_POINT: '서울', START_KM: '155424', VIA_POINT1: '의왕', VIA_POINT2: '천안', VIA_POINT3: '', END_POINT: '광주', END_KM: '155448', TOT_MOVE_KM: '', COMMUTE_MOVE_KM: '48', WORK_MOVE_KM: '', REMARK: ''},
                        {USE_DT: '2021-04-09', START_POINT: '수원', START_KM: '155135', VIA_POINT1: '대전', VIA_POINT2: '대구', VIA_POINT3: '', END_POINT: '부산', END_KM: '1554240', TOT_MOVE_KM: '', COMMUTE_MOVE_KM: '240', WORK_MOVE_KM: '', REMARK: ''},
                        {USE_DT: '2021-04-08', START_POINT: '성남', START_KM: '155112', VIA_POINT1: '전주', VIA_POINT2: '', VIA_POINT3: '', END_POINT: '인천', END_KM: '155485', TOT_MOVE_KM: '', COMMUTE_MOVE_KM: '75', WORK_MOVE_KM: '10', REMARK: ''},
                        {USE_DT: '2021-04-08', START_POINT: '안산', START_KM: '155548', VIA_POINT1: '', VIA_POINT2: '', VIA_POINT3: '', END_POINT: '서울', END_KM: '155438', TOT_MOVE_KM: '', COMMUTE_MOVE_KM: '25', WORK_MOVE_KM: '13', REMARK: ''},
                        {USE_DT: '2021-04-07', START_POINT: '광주', START_KM: '155978', VIA_POINT1: '', VIA_POINT2: '', VIA_POINT3: '', END_POINT: '서울', END_KM: '1554168', TOT_MOVE_KM: '', COMMUTE_MOVE_KM: '157', WORK_MOVE_KM: '11', REMARK: ''},
                        {USE_DT: '2021-04-06', START_POINT: '부산', START_KM: '155577', VIA_POINT1: '대구', VIA_POINT2: '대전', VIA_POINT3: '오산', END_POINT: '서울', END_KM: '1554285', TOT_MOVE_KM: '', COMMUTE_MOVE_KM: '285', WORK_MOVE_KM: '', REMARK: ''},
                        {USE_DT: '2021-04-05', START_POINT: '대전', START_KM: '155488', VIA_POINT1: '', VIA_POINT2: '', VIA_POINT3: '', END_POINT: '수원', END_KM: '1554108', TOT_MOVE_KM: '', COMMUTE_MOVE_KM: '108', WORK_MOVE_KM: '', REMARK: ''},
                        {USE_DT: '2021-04-04', START_POINT: '대전', START_KM: '155453', VIA_POINT1: '', VIA_POINT2: '', VIA_POINT3: '', END_POINT: '안산', END_KM: '155498', TOT_MOVE_KM: '', COMMUTE_MOVE_KM: '95', WORK_MOVE_KM: '8', REMARK: ''},
                        {USE_DT: '2021-04-03', START_POINT: '울산', START_KM: '155458', VIA_POINT1: '대구', VIA_POINT2: '세종', VIA_POINT3: '', END_POINT: '인천', END_KM: '1554277', TOT_MOVE_KM: '', COMMUTE_MOVE_KM: '270', WORK_MOVE_KM: '7', REMARK: ''}
                    ];
                    var ot_data3 = [
                        {"EVI_GB": "C", "EVKEY_": "/images/btn/icon_ev.gif", "EVKEY": "20200620001000018088", "BUDAT": "20201007", "HKONT": "54000600", "HKONT_TXT": "교통비", "WRBTR": "36000", "WAERS": "KRW", "SGTXT": "교통비"},
                        {"EVI_GB": "E", "EVKEY_": "/images/btn/btn_view.gif", "BUDAT": "20210419", "EXP_GB": "A", "HKONT": "54000600", "HKONT_TXT": "교통비", "WRBTR": "86000", "WAERS": "KRW", "SGTXT": "교통비"},
                        {"EVI_GB": "E", "EVKEY_": "/images/btn/btn_view.gif", "BUDAT": "20210419", "EXP_GB": "B", "HKONT": "54000600", "HKONT_TXT": "교통비", "WRBTR": "128500", "WAERS": "KRW", "SGTXT": "교통비"}
                    ]
                    var ot_data4 = [
                        {COLUMN1: '1', COLUMN2: '법인카드', COLUMN3: '04.03 ~ 05 유류비'},
                        {COLUMN1: '2', COLUMN2: '영수증', COLUMN3: '04.03 ~ -05 식대'},
                        {COLUMN1: '3', COLUMN2: '영수증', COLUMN3: '04.06 ~ -08 식대'},
                        {COLUMN1: '4', COLUMN2: '영수증', COLUMN3: '04.09 회식'}
                    ];
                    gridDistance.setJSONData(ot_data1);
                    gridCarCostHis.setJSONData(ot_data2);
                    gridCarCostItem.setJSONData(ot_data3);
                    gridCarCostItemDetail.setJSONData(ot_data3);
                    gridEvid.setJSONData(ot_data4);
                }
            });
        }

        if ($u_APPR_TYPE) {  // 품의종류
            $u_APPR_TYPE.$el.change(function () {
                var appr_type = $u_APPR_TYPE.getValue();
                setleLayoutFromAPPR_TYPE(appr_type);
                clearInputData();
            });
        }

        $u.buttons.addCustomHandler({
            "callZUNIEFI_U611_SAVE": function () { // save
            }
        });

        $u.buttons.addHandler({
            "save": function () {},
            "delete": function () {},
            "addCarCostHis": function () {},
            "deleteCarCostHis": function () {
                gridCarCostHis.asserts.rowSelected();
                gridCarCostHis.deleteRowByRowIndexes(gridCarCostHis.getBlockedRowIndexes());
            },
            "addCostItem": function () {
                gridCarCostItem.addRow();
            },
            "deleteCostItem": function () {},
            "addRentFee": function () {},
            "addCostItemDetail": function () {},
            "createBELNR": function () {},
            "deleteBELNR": function () {},
            "up": function () {},
            "down": function () {},
            "addEvid": function () {
                gridEvid.addRow();
            },
            "deleteEvid": function () {
                gridEvid.asserts.rowSelected();
                gridEvid.deleteRowByRowIndexes(gridEvid.getBlockedRowIndexes());
            }
        });

        function clearInputData () {
            gridDistance.clearGridData();
            gridCarCostHis.clearGridData();
            gridCarCostItem.clearGridData();
            gridCarCostItemDetail.clearGridData();
            gridEvid.clearGridData();

            delete initSY_CAR_000_USER_INFO['APPR_TYPE'];
            $u.setValues('UD_DEMO_000_USER_INFO', initSY_CAR_000_USER_INFO);
            $u_CAR_NM.$el.change();
        }

        function initSY_CAR_000() {
            $.each(['ADD_ETC', 'APPR_TYPE__DES', 'CAR_NUM__DES'], function (_, columnId) {
                mergeTableColumn(columnId);
            });

            $.each(['APPR_TYPE__DES', 'CAR_NUM__DES', 'FUEL_COST', 'TOLL_FEE'], function (_, columnId) {
                if (columnId === 'FUEL_COST' || columnId === 'TOLL_FEE') setTableColumnDescription(columnId, initColumnDescriptionData);
                else setTableColumnDescription(columnId);
            });

            var $etcInfo = $('#UD_DEMO_000_ETC_INFO');
            $etcInfo.find('table').css('text-align', 'right')
            $etcInfo.find('.unidocu-input-wrapper').css({'display': 'inline-block'});
            $etcInfo.find('.unidocu-input-wrapper .check-input-wrapper').css({'margin-right': '0'});

            setGridHeaderDescription(gridDistance, '(법인렌트 및 회사소유 차량인 경우 "미사용구간 입력 필수", 자차인 경우는 미사용 구간이 "개인용도")');
            setleLayoutFromAPPR_TYPE();
        }

        function setleLayoutFromAPPR_TYPE (appr_type) {
            var inivisibleElements, visibleElements;
            if (!appr_type) appr_type = $u.get('APPR_TYPE').getValue();
            if (appr_type === 'D') {
                visibleElements = ['UD_DEMO_000_grid-carCostHis','UD_DEMO_000_BUTTONS2'];
                inivisibleElements = ['UD_DEMO_000_grid-carCostItem','UD_DEMO_000_grid-carCostItemDetail','UD_DEMO_000_BUTTONS2-1', 'UD_DEMO_000_BUTTONS2-2'];
            } else if (appr_type === 'C') {
                visibleElements = ['UD_DEMO_000_grid-carCostItem','UD_DEMO_000_BUTTONS2-1'];
                inivisibleElements = ['UD_DEMO_000_grid-carCostItemDetail', 'UD_DEMO_000_BUTTONS2-2'];
            } else if (appr_type === 'S') {
                visibleElements = ['UD_DEMO_000_grid-carCostItemDetail','UD_DEMO_000_BUTTONS2-2'];
                inivisibleElements = ['UD_DEMO_000_grid-carCostHis', 'UD_DEMO_000_grid-carCostItem', 'UD_DEMO_000_BUTTONS2', 'UD_DEMO_000_BUTTONS2-1'];
            }
            $.each(visibleElements, function (_, id) {
                $('#' + id).show();
            });
            $.each(inivisibleElements, function (_, id) {
                $('#' + id).hide();
            });
            $(window).resize();
        }

        function mergeTableColumn (columnId) {
            if ($u.get(columnId)) {
                var $td = $u.get(columnId).$el.parent();
                var $th = $td.prev();
                $th.remove();
                $td.attr('colspan', 1 + Number($td.attr('colspan')));
            }
        }

        function setTableColumnDescription (columnId, data) {
            var $u_column = $u.get(columnId);
            if ($u_column) {
                var description = $u_column.params.description;
                var $span = $('<span style="color: red;"></span>');
                $u_column.$el.empty().append($span.append($u.util.formatString(description, data)));
            }
        }

        function setGridHeaderDescription (gridObj, text) {
            $(gridObj).find('h2').after().append($u.util.formatString('<span style="padding-left: 5px;">{text}</span>', {text: text}));
        }

        function setEVKEY_Image (rowIndex, type) {
            var url = {noEvidence: '', hasEvidence: '/images/btn/icon_ev.gif', attachable: '/images/btn/btn_view.gif'}[type];
            gridCarCostItem.setImage('EVKEY_', rowIndex, url)
        }

        function setEvidenceImageByFileCount(rowIndex, fileCount) {
            if (fileCount > 0) setEVKEY_Image(rowIndex, 'hasEvidence');
            else setEVKEY_Image(rowIndex, 'attachable');
        }

        // initFn
        return function () {
            initSY_CAR_000();
            $u_CAR_NUM.$el.find('input').data('dialogRowData', {"SELECTED": "0", "CAR_NUM": "02하5821", "CAR_NUM_TXT": "마이바흐 S500", "OWNER": "00000007", "SNAME": "임우철", "OFFICE_CAR": "X"});
            $u_CAR_NUM.setValue({code: '02하5821'});
            $u_CAR_NUM.triggerChange();
        }
    };
});