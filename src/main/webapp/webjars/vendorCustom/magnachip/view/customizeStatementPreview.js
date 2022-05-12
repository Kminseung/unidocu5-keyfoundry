/**
 * @module vendorCustom/magnachip/view/customizeStatementPreview
 */

define([
],function() {
    var hkontval = $u.page.getPageParams()['HKONT']
    function setFormattedData(obj, fieldName){
        var value = obj[fieldName];
        if (value === '0000-00-00') return;
        if(value) obj['FORMATTED_' + fieldName] = $u.util.date.getDateAsUserDateFormat(value.replace(/-/g, ''))
    }
    return function() {
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
            var add_data
            for(var i=0; i<ot_data2.length; i++){
                if(ot_data2[i].ADD_DATA !== ""){
                     add_data= ot_data2[i].ADD_DATA
                    $magnachip.addDataDialog(add_data,hkontval);
                }
            }

            $('.HKONT').click(function (){
                var hkont = $(this).text()
                var index = $(".HKONT").index(this);
                var clickdata = ot_data2[index].ADD_DATA;
                var hkontArray = ['500820010', '500820020', '500820030']
                if (hkontArray.indexOf(hkont) !== -1) {
                    $magnachip.addDataDialog(clickdata,hkont);
                }else{
                    unidocuAlert("추가데이터가 존재하지 않습니다")
                }
            })

            var belnrData = $.extend(true, {}, first_ot_data1);
            belnrData['DOKNR'] = belnrData['BELNR'];
            var $evidenceLink = $('#evidence-wrapper').find('img');
            if(!evikey) $evidenceLink.hide();
            $evidenceLink.click(function(){
                $efi.evikbClickHandler(belnrData);
            });

            $(document).ready(function (){
                var classval=$('.HKONT')
                for(var i=0; i<classval.length; i++){
                    var hkont = classval.eq(i).text()
                    if(hkont==="500820010"||hkont==="500820020"||hkont==="500820030"){
                        classval.eq(i).css("color","red")
                    }
                }

            })

            if (WAERS === '') $('#WRBTR_SUM_tr').hide();
        });
        }


});