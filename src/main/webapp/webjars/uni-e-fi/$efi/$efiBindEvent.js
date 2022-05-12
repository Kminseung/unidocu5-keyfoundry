/**
 * @module uni-e-fi/$efi/$efiBindEvent
 */
define(function () {
    return function () {

        $efi.createStatement.bindEvent = {};
        $efi.createStatement.bindEvent.ZTERM_ZTAGGMap = {};
        $efi.createStatement.bindEvent.bindChange = function (fieldName, event) {
            if ($u.get(fieldName)) $u.get(fieldName).$el.change(event);
        };
        $efi.createStatement.bindEvent.triggerChange = function (fieldName) {
            if ($u.get(fieldName)) $u.get(fieldName).triggerChange();
        };
        $efi.createStatement.bindEvent.bindEMPFBChange = function () {
            $efi.createStatement.bindEvent.bindChange('EMPFB', function () {
                    var vendorCodeInput = $efi.statementInitialData.getVendorCodeInput();
                    var vendorCode = $u.get('EMPFB').getValue();
                    if(vendorCode === '' && !vendorCodeInput) return;
                    if(vendorCode === '' ) vendorCode = vendorCodeInput.getValue();
                    var bvtypQueryParams = {};
                    bvtypQueryParams[vendorCodeInput.getName()] = vendorCode;
                    if($u.get('BVTYP')) $u.get('BVTYP').setOptions($u.f4Data.getCodeComboOption($u.get('BVTYP').params['codeKey'], bvtypQueryParams));
                }
            );
        };
        $efi.createStatement.bindEvent.bindVendorCodeChange = function () {
            var vendorCodeInput = $efi.statementInitialData.getVendorCodeInput();
            if (!vendorCodeInput) return;
            vendorCodeInput.$el.change(function () {
                var paramMap = $u.getValues('statement-information-content,header-invoicer-content,vendor-info');
                var vendorCode = vendorCodeInput.getValue();
                if (!vendorCode) return;

                var namedServiceId = 'ZUNIEFI_4001';
                if (vendorCodeInput.getName() === 'KUNNR') namedServiceId = 'ZUNIEFI_4004';
                $nst.is_data_ot_data(namedServiceId, paramMap, function (ot_data) {
                    if (ot_data.length === 0) return;
                    if ($u.hasTable('statement-information-content')) $u.setValues('statement-information-content', ot_data[0]);
                    if ($u.hasTable('header-invoicer-content')) $u.setValues('header-invoicer-content', ot_data[0]);
                    if ($u.hasTable('vendor-info')) $u.setValues('vendor-info', ot_data[0]);

                    var comboCodeQueryParams = {};
                    comboCodeQueryParams[vendorCodeInput.getName()] = vendorCode;

                    if ($u.get('BVTYP')) $u.get('BVTYP').setOptions($u.f4Data.getCodeComboOption($u.get('BVTYP').params['codeKey'], comboCodeQueryParams), ot_data[0]['BVTYP']);
                    if ($u.get('ZLSCH')) $u.get('ZLSCH').setOptions($u.f4Data.getCodeComboOption($u.get('ZLSCH').params['codeKey'], comboCodeQueryParams), ot_data[0]['ZLSCH']);
                    if ($u.get('ZTERM')) $u.get('ZTERM').setOptions($u.f4Data.getCodeComboOption($u.get('ZTERM').params['codeKey'], comboCodeQueryParams), ot_data[0]['ZTERM']);
                    if ($u.get('EMPFB')) {
                        if ($u.get('EMPFB').setOptions) $u.get('EMPFB').setOptions($u.f4Data.getCodeComboOption($u.get('EMPFB').params['codeKey'], comboCodeQueryParams));
                        else if ($u.get('EMPFB').setQueryParams) $u.get('EMPFB').setQueryParams(comboCodeQueryParams)
                    }
                    if ($u.get('AKONT')) $u.get('AKONT').setOptions($u.f4Data.getCodeComboOption($u.get('AKONT').params['codeKey'], comboCodeQueryParams), ot_data[0]['AKONT']);
                    if ($u.get('GL_ALIAS')) {
                        $u.gridWrapper.getGrid().checkAll('SELECTED');
                        $u.get('GL_ALIAS').setValue(ot_data[0]['GL_ALIAS']);
                        $efi.createStatement.bindEvent.triggerGL_ALIAS_Change();
                    }

                    $efi.createStatement.bindEvent.triggerMWSKZChange();
                    $efi.createStatement.bindEvent.triggerZTERM_BUDATChange();
                    if($u.buttons.getCustomHandler('afterVendorCodeChange')) $u.buttons.runCustomHandler('afterVendorCodeChange', ot_data);
                });
            });
        };
        $efi.createStatement.bindEvent.onZTERM_BUDATChange = function () {
            var $u_ZFBDT = $u.get('ZFBDT');
            var $u_ZTERM = $u.get('ZTERM');
            var os_data = $nst.is_data_os_data('ZUNIEFI_4003', $u.getValues('header-invoicer-content,vendor-info'));
            var zlsch = os_data['ZLSCH'];
            var zfbdt = os_data['ZFBDT'];
            if ($u.get('ZLSCH') && zlsch) $u.get('ZLSCH').setValue(zlsch);

            if ($u_ZFBDT && zfbdt) $u_ZFBDT.setValue(zfbdt);
            if ($u.get('ZLSCH')) $u.get('ZLSCH').triggerChange();

            if ($u_ZFBDT && $u_ZTERM) {
                var programId = $u.page.getPROGRAM_ID();
                if (!$efi.createStatement.bindEvent.ZTERM_ZTAGGMap[programId]) $efi.createStatement.bindEvent.ZTERM_ZTAGGMap[programId] = $u.f4Data.getCodeMapWithParams('ZTERM', 'ZTAGG');
                var zterm = $u_ZTERM.getValue();
                var ztermReadOnly = false;
                if ($efi.createStatement.bindEvent.ZTERM_ZTAGGMap[programId][zterm] !== 'X') ztermReadOnly = true;
                $u_ZFBDT.setReadOnly(ztermReadOnly);
            }

            if($u.get('ZTERM')) {
                if (!$u.get('ZLSCH') || !$u.get('ZFBDT')) throw $mls.getByCode("M_UD_0201_011_ZLSCH_ZFBDTNotExists");
            }
        };
        $efi.createStatement.bindEvent.bindZTERM_BUDATChange = function () {
            $efi.createStatement.bindEvent.bindChange('ZTERM', $efi.createStatement.bindEvent.onZTERM_BUDATChange);
            $efi.createStatement.bindEvent.bindChange('BUDAT', $efi.createStatement.bindEvent.onZTERM_BUDATChange);
            $efi.createStatement.bindEvent.bindChange('BLDAT', $efi.createStatement.bindEvent.onZTERM_BUDATChange);
        };
        $efi.createStatement.bindEvent.bindWRBTRChange = function () {
            $efi.createStatement.bindEvent.bindChange('WRBTR', $efi.createStatementCommon.changeWRBTRExpense);
        };
        $efi.createStatement.bindEvent.bindMWSKZChange = function () {
            $efi.createStatement.bindEvent.bindChange('MWSKZ', $efi.createStatementCommon.changeMWSKZ);
        };
        $efi.createStatement.bindEvent.bindWMWSTChange = function () {
            $efi.createStatement.bindEvent.bindChange('WMWST', $efi.createStatementCommon.changeWMWSTExpense);
        };
        $efi.createStatement.bindEvent.bindSGTXTChange = function () {
            $efi.createStatement.bindEvent.bindChange('SGTXT',     function () {
                    var gridObj = $u.gridWrapper.getGrid();
                    if(!$u.get('SGTXT')) return;
                    if(!gridObj.getGridHeader('SGTXT')) return;
                    var formSGTXT = $u.get('SGTXT').getValue();
                    var sgtxt;
                    gridObj.loopRowIndex(function (rowIndex) {
                        sgtxt = gridObj.$V('SGTXT', rowIndex);
                        if(sgtxt === '') gridObj.$V('SGTXT', rowIndex, formSGTXT);
                    })
                }
            );
        };
        $efi.createStatement.bindEvent.bindBUDATChange = function () {
            $efi.createStatement.bindEvent.bindChange('BUDAT', function () {
                if (!$u.get('BLDAT') || $u.get('BLDAT').isReadOnly()) return;
                $u.get('BLDAT').setValue($u.get('BUDAT').getValue());
            });
        };
        $efi.createStatement.bindEvent.bindWMWSTDblClick = function () {
            if ($u.get('WMWST')) $u.get('WMWST').$el.dblclick(    function () {
                    if(!$u.get('difference_amount')) return;
                    var diffAmount = $u.get('difference_amount').getValue();
                    if($u.get('debitSum').getValue() > $u.get('creditSum').getValue()) diffAmount = -diffAmount;
                    $u.get('WMWST').setValue($u.get('WMWST').getValue() + diffAmount);
                    $efi.createStatement.bindEvent.triggerWMWSTChange();
                }
            );
        };
        $efi.createStatement.bindEvent.triggerZTERM_BUDATChange = function () {
            if (!$u.get('ZTERM') && $u.get('BUDAT')) $efi.createStatement.bindEvent.triggerChange('BUDAT');
            if ($u.get('ZTERM')) $efi.createStatement.bindEvent.triggerChange('ZTERM');
        };
        $efi.createStatement.bindEvent.triggerVendorCodeChange = function () {
            var vendorCodeInput = $efi.statementInitialData.getVendorCodeInput();
            if (!vendorCodeInput) return;
            vendorCodeInput.triggerChange();
        };
        $efi.createStatement.bindEvent.triggerWRBTRChange = function () {
            $efi.createStatement.bindEvent.triggerChange('WRBTR');
        };
        $efi.createStatement.bindEvent.triggerMWSKZChange = function () {
            $efi.createStatement.bindEvent.triggerChange('MWSKZ');
        };
        $efi.createStatement.bindEvent.triggerWMWSTChange = function () {
            $efi.createStatement.bindEvent.triggerChange('WMWST');
        };
        $efi.createStatement.bindEvent.triggerSGTXTChange = function () {
            $efi.createStatement.bindEvent.triggerChange('SGTXT');
        };
        $efi.createStatement.bindEvent.triggerHKONT_SChange = function () {
            $efi.createStatement.bindEvent.triggerChange('HKONT_S')
        };
        $efi.createStatement.bindEvent.triggerGL_ALIAS_Change = function () {
            $efi.createStatement.bindEvent.triggerChange('GL_ALIAS')
        };
        $efi.createStatement.bindEvent.onFormF4QueryParams = function () {
            var onFormBeforeOpenF4DialogParams = $u.programSetting.getValue('onFormBeforeOpenF4DialogParams');
            if(!$.isEmptyObject(onFormBeforeOpenF4DialogParams)) {
                $.each(onFormBeforeOpenF4DialogParams, function (targetColumn) {
                    $u.get(targetColumn).onBeforeOpenF4Dialog(function () {
                        var f4QueryParams = $efi.createStatement.F4QueryParamsOutput('formSetting', targetColumn, onFormBeforeOpenF4DialogParams);
                        $u.get(targetColumn).setQueryParams(f4QueryParams);
                    });
                });
            }
        };
        $efi.createStatement.bindEvent.bindGL_ALIASChange = function() {
            var gridObj = $u.gridWrapper.getGrid();
            var $u_GL_ALIAS = $u.get('GL_ALIAS');
            if ($u_GL_ALIAS) $u_GL_ALIAS.$el.change(function() {
                if ($u.programSetting.getValue('useSelectForm') !== 'true' || $('#unidocu-grid').css('display') === 'none') return;

                var $u_gl_optionData = $u_GL_ALIAS.getSelectedOptionData();
                var jsonObj = {'HKONT':'','HKONT_TXT':'','KOSTL':'','KOSTL_TXT':'', 'MWSKZ':''};
                var ot_data;
                if ($u_GL_ALIAS.getValue() !== '') {
                    ot_data = $nst.is_data_ot_data('ZUNIEFI_4032',{GL_ALIAS: $u_GL_ALIAS.getValue()});
                    if ($u_gl_optionData['MWSKZ'] === '') $u_gl_optionData['MWSKZ'] = $u.page.getPageParams()['MWSKZ'];
                    jsonObj = {
                        'HKONT':$u_gl_optionData['HKONT'],
                        'KOSTL':$u_gl_optionData['KOSTL'],
                        'HKONT_TXT':$u_gl_optionData['HKONT_TXT'],
                        'KOSTL_TXT':$u_gl_optionData['KOSTL_TXT'],
                        'MWSKZ':$u_gl_optionData['MWSKZ']
                    };
                } else {
                    jsonObj = $.extend({'HKONT':'','HKONT_TXT':'','KOSTL':'','KOSTL_TXT':'','MWSKZ':''}, $efi.createStatementCommon.getDefaultGridValues());
                }

                if (gridObj.$F('1', 'SELECTED').length === 0) {
                    $u_GL_ALIAS.setValue('');
                    throw $mls.getByCode('M_noSelectedData');
                }

                if (ot_data && ot_data.length > 1) {
                    var shkzg = $efi.createStatementCommon.isEvidenceAmountNegative() ? 'H' : 'S';
                    $.each(ot_data,function(index,item) {item['SHKZG'] = shkzg;});
                    gridObj.setJSONData(ot_data);
                    gridObj.checkAll();
                } else {
                    gridObj.loopRowIndex(function(rowIndex) {
                        if (gridObj.$V('SELECTED',rowIndex) !== '0') gridObj.setRowDataByJSONObj(rowIndex,jsonObj);
                    });
                }

                if($u.get('MWSKZ') && $u_gl_optionData) {
                    $u.get('MWSKZ').setValue($u_gl_optionData['MWSKZ']);
                    gridObj.triggerChangeCell('MWSKZ',0);
                }
            });
        };

        $efi.createStatement.bindEvent.bindCommonFormEvent = function (){
            if (!$u.programSetting.getTemplate()['onFormBeforeOpenF4DialogParams']) {
                $u.programSetting.appendTemplate('onFormBeforeOpenF4DialogParams', {
                    defaultValue: {},
                    type: 'json',
                    description: 'form codePopup F4 조회시 추가 파라미터 설정'
                });
            }

            $efi.createStatement.bindEvent.bindVendorCodeChange();
            $efi.createStatement.bindEvent.bindWRBTRChange();
            $efi.createStatement.bindEvent.bindWMWSTChange();
            $efi.createStatement.bindEvent.bindWMWSTDblClick();
            $efi.createStatement.bindEvent.bindSGTXTChange();
            $efi.createStatement.bindEvent.bindBUDATChange();
            $efi.createStatement.bindEvent.bindZTERM_BUDATChange();
            $efi.createStatement.bindEvent.bindMWSKZChange();
            $efi.createStatement.bindEvent.bindEMPFBChange();
            $efi.createStatement.bindEvent.onFormF4QueryParams();
            $efi.createStatement.bindEvent.bindGL_ALIASChange();
        }
    }
});
