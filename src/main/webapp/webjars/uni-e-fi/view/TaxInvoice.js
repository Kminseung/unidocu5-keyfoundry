/**
 * @module uni-e-fi/view/TaxInvoice
 */
define(function() {
    return function(){
        $nst.is_data_tableReturns('ZUNIEFI_2001', {INV_SEQ: $u.thirdParty.base64.decode($u.page.getPageParams()['INV_SEQ'])}, function(tableReturns){
            var view = $efi.toMustacheViewZUNIEFI_2001(tableReturns);
            var $contents = $('#contents');
            $contents.append($efi.mustache.TaxInvoiceHeadTemplate(view)).append($efi.mustache.TaxInvoiceTemplate(view));
            window.focus();
            $u.util.resizeWindowBy$el($contents, 20);
        });
    }
});