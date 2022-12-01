/**
 * @module vendorCustomkeyfoundry/view/customizeUD_0601_030
 */
define(function () {
    return function (initFn) {
        initFn();

        var gridObj = $u.gridWrapper.getGrid();

        if($u.page.getPROGRAM_ID() === 'UD_0601_030') {
            if(staticProperties.user['ROLE'].indexOf('FI_2120') === -1 && $u.get('FLAG')) {
                $('#unidocu-td-FLAG label:nth-child(2)').hide();
            }
        }

        var sendMailBtn = $('#sendMail');
        var $USE_DOC = $u.get('USE_DOC');
        if(staticProperties.user['ROLE'].indexOf('FI_2120') > -1) {
            if($USE_DOC) {
                $USE_DOC.$el.change(function() {
                    $USE_DOC.getValue() === 'C' ? sendMailBtn.show() : sendMailBtn.hide();
                });
            }
        } else {
            sendMailBtn.hide();
        }
        $efi.createStatement.bindEvent.triggerChange('USE_DOC');

        $u.buttons.addHandler({
            "sendMail": function() {
                gridObj.asserts.rowSelected();
                var sendInfo = [];
                var getSELECTEDData = gridObj.getSELECTEDJSONData();
                var sendFailFlag = getSELECTEDData.some(function(rowData) {
                    if(rowData['BELNR'] !== '') return true;

                    if(rowData['BELNR'] === '') {
                        if(rowData['IP_EMAIL1'] === rowData['IP_EMAIL2']) rowData['IP_EMAIL2'] = '';
                        if(rowData['IP_EMAIL1'] !== '') {
                            addMailList(sendInfo, rowData, rowData['IP_EMAIL1'], rowData['SNAME']);
                        }
                        if(rowData['IP_EMAIL2'] !== '') {
                            if(rowData['IP_EMAIL1'] !== rowData['IP_EMAIL2']) addMailList(sendInfo, rowData, rowData['IP_EMAIL2'], rowData['SNAME2']);
                        }
                        if(rowData['IP_EMAIL1'] === '' && rowData['IP_EMAIL2'] === '') {
                            addMailList(sendInfo, rowData, '', '');
                        }

                        return false;
                    }
                });

                if(!sendFailFlag) {
                    unidocuConfirm('메일발송을 하시겠습니까?', function() {
                        $nst.it_data_nsReturn('SendUnprocessedMail', sendInfo, function(nsReturn) {
                            unidocuAlert(nsReturn.getStringReturn('message'), function() {
                                $u.buttons.runCustomHandler('unCheckAll');
                            });
                        });
                    });
                } else {
                    unidocuAlert('미처리 건만 메일발송이 가능합니다.', function() {
                        $u.buttons.runCustomHandler('unCheckAll');
                    });
                }
            }
        });

        $u.buttons.addCustomHandler({
            checkAll: function() {
                gridObj.loopRowIndex(function(rowIndex) {
                    gridObj.$V('SELECTED', rowIndex, '1');
                });
            },
            unCheckAll: function() {
                var selectedRowIndexes = gridObj.getSelectedRowIndexes();
                selectedRowIndexes.some(function(rowIndex) {
                    gridObj.$V('SELECTED', rowIndex, '0');
                });
            }
        });

        function toLocaleString(amount) {
            return amount.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',');
        }

        function addMailList(sendInfo, rowData, IP_EMAIL, SNAME) {
            sendInfo.push({
                'ISSUE_DATE': rowData['ISSUE_DATE'],
                'ISSUE_ID': rowData['ISSUE_ID'],
                'SU_ID': rowData['SU_ID'],
                'SU_NAME': rowData['SU_NAME'],
                'GRANDTOTAL': toLocaleString(rowData['GRANDTOTAL']),
                'CHARGETOTAL': toLocaleString(rowData['CHARGETOTAL']),
                'TAXTOTAL': toLocaleString(rowData['TAXTOTAL']),
                'DESC_TEXT1': rowData['DESC_TEXT1'],
                'IP_EMAIL': IP_EMAIL,
                'SNAME': SNAME
            });
        }
    }
});