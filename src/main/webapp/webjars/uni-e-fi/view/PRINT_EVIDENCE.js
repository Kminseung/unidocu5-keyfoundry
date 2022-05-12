define(function () {
    return function () {
        $u.unidocuUI();

        return function () {
            var paramsList = JSON.parse($u.page.getPageParams()['selectedGridData']);
            var view = {list: []};
            var STATUS_SUBSTR_0_1_IS_1 = null;
            $.each(paramsList, function (index, params) {
                view.list.push(params);
                var attachData = [];
                $.each($nst.is_data_ot_data('ZUNIECM_5013', params), function (index, item) {
                    if (item['EVI_KB'] === 'CD') {
                        var os_data = $nst.is_data_os_data('ZUNIEFI_1002', {CRD_SEQ: item['EVI_SEQ']});
                        $efi.reMapCardBillData(os_data);
                        params.cardData = os_data;
                    }
                    if (item['EVI_KB'] === 'AP') {
                        var tableReturns = $nst.is_data_tableReturns('ZUNIEFI_2001', {INV_SEQ: item['EVI_SEQ']});
                        params.taxInvoiceView = $efi.toMustacheViewZUNIEFI_2001(tableReturns);
                        STATUS_SUBSTR_0_1_IS_1 = params.taxInvoiceView['STATUS_SUBSTR_0_1_IS_1'];
                    }
                    if (item['EVI_KB'] === 'AT') {
                        $.each($nst.is_data_ot_data('ZUNIECM_5000', {EVI_SEQ: item['EVI_SEQ']}), function (index, item2) {
                            var name = item2['FILE_NAME'];
                            var isImage = $u.fineUploader.isImageFileName(name);
                            var iconClass = $u.fineUploader.getFileIconClass(name);
                            attachData.push({
                                name: name,
                                isImage: isImage,
                                iconClass: iconClass,
                                imageUrl: $u.getUrlFromRoot('/fineuploader/download.do?' + $.param(item2))
                            });
                        });
                    }
                });
                params.attachData = attachData;
            });
            $('#contents').append($efi.mustache.PRINT_EVIDENCETemplate($.extend(view, {STATUS_SUBSTR_0_1_IS_1: STATUS_SUBSTR_0_1_IS_1}), {
                cardBillTemplateHeadAsPartial: $efi.mustache.cardBillTemplateHeadAsPartial,
                cardBillTemplateAsPartial: $efi.mustache.cardBillTemplateAsPartial,
                TaxInvoiceHeadTemplateAsPartial: $efi.mustache.TaxInvoiceHeadTemplateAsPartial,
                TaxInvoiceTemplateAsPartial: $efi.mustache.TaxInvoiceTemplateAsPartial
            }));
            $('.print-tax-invoice').remove();
            setTimeout(function () {
                window.print();
            }, 1000);
        }
    }
});