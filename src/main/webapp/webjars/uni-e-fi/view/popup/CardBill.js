/**
 * @module uni-e-fi/view/popup/CardBill
 */
define(function () {
    return function () {
        $(window).focus();
        $(document).attr("title", $mls.getByCode('M_CardBill_Evidence inquiry'));

        var importParam = {CRD_SEQ: Base64.decode($u.page.getPageParams()['CRD_SEQ'])};
        $nst.is_data_os_data('ZUNIEFI_1002', importParam, function (os_data) {
            $efi.reMapCardBillData(os_data);
            $('body').append($efi.mustache.cardBillTemplate(os_data));
            var $buttonBar;
            $buttonBar = $('#buttonBar');
            $buttonBar.show();
            $('#print').click(printScreen);

            function printScreen() {
                $buttonBar.hide();
                window.print();
                $buttonBar.show();
            }
            $u.util.resizeWindowBy$el($('.card'));
        });
    }
});