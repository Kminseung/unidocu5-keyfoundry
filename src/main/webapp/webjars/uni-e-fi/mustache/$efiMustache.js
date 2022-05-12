/**
 * @module uni-e-fi/mustache/$efiMustache
 */
define([
    'text!uni-e-fi/mustache/cardBillTemplate.mustache',
    'stache!uni-e-fi/mustache/cardBillTemplate',
    'stache!uni-e-fi/$efi/afterCreateStatementDialogTemplate',
    'stache!uni-e-fi/mustache/PRINT_EVIDENCETemplate',
    'text!uni-e-fi/mustache/TaxInvoiceHeadTemplate.mustache',
    'text!uni-e-fi/mustache/TaxInvoiceTemplate.mustache',
    'stache!uni-e-fi/mustache/TaxInvoiceHeadTemplate',
    'stache!uni-e-fi/mustache/TaxInvoiceTemplate',
    'stache!uni-e-fi/mustache/amountDisplayWrapper',
    'stache!uni-e-fi/view/popup/StatementPreview_contents',
    'stache!uni-e-fi/$efi/requestApprovalConfirmTemplate',
    'stache!uni-e-fi/mustache/costItemAutoInputTemplate'

], function(
    cardBillTemplateAsPartial,
    cardBillTemplate,
    afterCreateStatementDialogTemplate,
    PRINT_EVIDENCETemplate,
    TaxInvoiceHeadTemplateAsPartial,
    TaxInvoiceTemplateAsPartial,
    TaxInvoiceHeadTemplate,
    TaxInvoiceTemplate,
    amountDisplayWrapper,
    StatementPreview_contents,
    requestApprovalConfirmTemplate,
    costItemAutoInputTemplate
){
    return function(){
        $efi.mustache = {};
        $efi.mustache.cardBillTemplateAsPartial = cardBillTemplateAsPartial;
        $efi.mustache.cardBillTemplate = cardBillTemplate;
        $efi.mustache.afterCreateStatementDialogTemplate = afterCreateStatementDialogTemplate;
        $efi.mustache.PRINT_EVIDENCETemplate = PRINT_EVIDENCETemplate;
        $efi.mustache.TaxInvoiceHeadTemplate = TaxInvoiceHeadTemplate;
        $efi.mustache.TaxInvoiceTemplate = TaxInvoiceTemplate;
        $efi.mustache.TaxInvoiceHeadTemplateAsPartial = TaxInvoiceHeadTemplateAsPartial;
        $efi.mustache.TaxInvoiceTemplateAsPartial = TaxInvoiceTemplateAsPartial;
        $efi.mustache.TaxInvoiceHeadTemplate = TaxInvoiceHeadTemplate;
        $efi.mustache.TaxInvoiceTemplate = TaxInvoiceTemplate;
        $efi.mustache.amountDisplayWrapper = amountDisplayWrapper;
        $efi.mustache.StatementPreview_contents = StatementPreview_contents;
        $efi.mustache.requestApprovalConfirmTemplate = requestApprovalConfirmTemplate;
        $efi.mustache.costItemAutoInputTemplate = costItemAutoInputTemplate;
    }
});