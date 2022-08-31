/**
 * @module uni-e-fi/view/popup/StatementPreview
 */
define(function () {
    return function () {
        function setFormattedData(obj, fieldName){
            var value = obj[fieldName];
            if (value === '0000-00-00') return;
            if(value) obj['FORMATTED_' + fieldName] = $u.util.date.getDateAsUserDateFormat(value.replace(/-/g, ''));
        }

        return function(){
            $nst.is_data_nsReturn('ZUNIEFI_4110', $u.page.getPageParams(), function (nsReturn) {
                var os_key = nsReturn.getExportMap('OS_KEY');
                var ot_data1 = nsReturn.getTableReturn('OT_DATA1');
                var ot_data2 = nsReturn.getTableReturn('OT_DATA2');
                if(ot_data2.length === 0) unidocuAlert('ZUNIEFI_4110-OT_DATA2 is empty. Please check this issue.');

                var first_ot_data1 = ot_data1[0];
                setFormattedData(first_ot_data1, 'BLDAT');
                setFormattedData(first_ot_data1, 'BUDAT');

                var H_DMBTR_TXT_SUM = 0;
                var H_WRBTR_TXT_SUM = 0;
                var S_DMBTR_TXT_SUM = 0;
                var S_WRBTR_TXT_SUM = 0;

                var LWAERS = '', WAERS = '';
                if(ot_data2.length > 0) {
                    LWAERS = ot_data2[0]['LWAERS'];
                    WAERS = ot_data2[0]['WAERS'];
                }
                var precisionOfDMBTR = $u.unidocuCurrency.getPrecision(LWAERS);
                var precisionOfWRBTR = $u.unidocuCurrency.getPrecision(WAERS);

                $.each(ot_data2, function (index, item) {
                    if (item['ZFBDT'] === '0000-00-00') item['ZFBDT'] = '';
                    setFormattedData(item, 'ZFBDT');

                    if (item['SHKZG'] === 'H') {
                        item['H_DMBTR_TXT'] = $.number(item['DMBTR_TXT'], precisionOfDMBTR);
                        item['H_WRBTR_TXT'] = $.number(item['WRBTR_TXT'], precisionOfWRBTR);
                        H_DMBTR_TXT_SUM += Number(item['DMBTR_TXT']);
                        H_WRBTR_TXT_SUM += Number(item['WRBTR_TXT']);

                        if (item['H_DMBTR_TXT'] === '0') item['H_DMBTR_TXT'] = '';
                        if (item['H_WRBTR_TXT'] === '0') item['H_WRBTR_TXT'] = '';
                    } else {
                        item['S_DMBTR_TXT'] = $.number(item['DMBTR_TXT'], precisionOfDMBTR);
                        item['S_WRBTR_TXT'] = $.number(item['WRBTR_TXT'], precisionOfWRBTR);
                        S_DMBTR_TXT_SUM += Number(item['DMBTR_TXT']);
                        S_WRBTR_TXT_SUM += Number(item['WRBTR_TXT']);

                        if (item['S_DMBTR_TXT'] === '0') item['S_DMBTR_TXT'] = '';
                        if (item['S_WRBTR_TXT'] === '0') item['S_WRBTR_TXT'] = '';
                    }
                });
                H_DMBTR_TXT_SUM = $.number(H_DMBTR_TXT_SUM, precisionOfDMBTR);
                S_DMBTR_TXT_SUM = $.number(S_DMBTR_TXT_SUM, precisionOfDMBTR);
                H_WRBTR_TXT_SUM = $.number(H_WRBTR_TXT_SUM, precisionOfWRBTR);
                S_WRBTR_TXT_SUM = $.number(S_WRBTR_TXT_SUM, precisionOfWRBTR);

                var evikey = os_key['CRD_SEQ'] + os_key['INV_SEQ'] + os_key['EVI_SEQ'];
                $('body').append($efi.mustache.StatementPreview_contents({
                    evikey: evikey,
                    first_ot_data1: first_ot_data1,
                    ot_data2: ot_data2,
                    LWAERS: LWAERS,
                    WAERS: WAERS,
                    S_DMBTR_TXT_SUM: S_DMBTR_TXT_SUM,
                    H_DMBTR_TXT_SUM: H_DMBTR_TXT_SUM,
                    S_WRBTR_TXT_SUM: S_WRBTR_TXT_SUM,
                    H_WRBTR_TXT_SUM: H_WRBTR_TXT_SUM
                }));

                var addData;
                var programID;
                var hkont = $('.HKONT');
                for(var i=0; i<ot_data2.length; i++) {
                    if(ot_data2[i].ADD_DATA !== '') {
                        addData = ot_data2[i].ADD_DATA;
                        programID = ot_data2[i].PROGRAM_ID;
                        hkont[i].style.color = 'red';
                        $keyfoundry.addDataDialog(addData, programID);
                    }
                }

                hkont.click(function() {
                    var index = hkont.index(this);
                    var addData = ot_data2[index].ADD_DATA;
                    var programID = ot_data2[index].PROGRAM_ID;

                    if(addData !== '') {
                        $keyfoundry.addDataDialog(addData, programID);
                    }
                });

                var belnrData = $.extend(true, {}, first_ot_data1);
                belnrData['DOKNR'] = belnrData['BELNR'];

                var $evidenceLink = $('#evidence-wrapper').find('img');
                if(!evikey) $evidenceLink.hide();

                $efi.evikbClickHandler(belnrData);
                $evidenceLink.click(function(){
                    $efi.evikbClickHandler(belnrData);
                });

                if (WAERS === '') $('#WRBTR_SUM_tr').hide();
            });

        }
    }
});