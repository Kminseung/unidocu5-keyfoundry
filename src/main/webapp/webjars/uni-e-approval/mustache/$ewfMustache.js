/**
 * @module uni-e-approval/mustache/$ewfMustache
 */
define([
    'stache!uni-e-approval/mustache/embedStatementZUNIEFI_4207Template',
    'stache!uni-e-approval/mustache/embedStatementZUNIEFI_4208Template',
    'stache!uni-e-approval/mustache/embedStatementZUNIEFI_4208_RequestTemplate',
    'stache!uni-e-approval/mustache/embedStatementZUNIEFI_6732_apply_Template',
    'stache!uni-e-approval/mustache/embedStatementZUNIEFI_6732_calculate_Template',
    'stache!uni-e-approval/mustache/embedStatementZUNIEFI_6732_domesticTemplate',
    'stache!uni-e-approval/mustache/embedStatementZUNIEFI_6732_apply_overseasTemplate',
    'stache!uni-e-approval/mustache/embedStatementZUNIEFI_6732_calculate_overseasTemplate',
    'stache!uni-e-approval/mustache/embedStatementZUNIEFI_6500Template',
    'stache!uni-e-approval/mustache/modifyApprovalDialogTemplate',
    'stache!uni-e-approval/mustache/approvalLineTemplate',
    'stache!uni-e-approval/mustache/draftTitleTemplate'
], function (
    embedStatementZUNIEFI_4207Template,
    embedStatementZUNIEFI_4208Template,
    embedStatementZUNIEFI_4208_RequestTemplate,
    embedStatementZUNIEFI_6732_apply_Template,
    embedStatementZUNIEFI_6732_calculate_Template,
    embedStatementZUNIEFI_6732_domesticTemplate,
    embedStatementZUNIEFI_6732_apply_overseasTemplate,
    embedStatementZUNIEFI_6732_calculate_overseasTemplate,
    embedStatementZUNIEFI_6500Template,
    modifyApprovalDialogTemplate,
    approvalLineTemplate,
    draftTitleTemplate
) {
    return function () {
        $ewf.mustache = {};
        $ewf.mustache.embedStatementZUNIEFI_4207Template = embedStatementZUNIEFI_4207Template;
        $ewf.mustache.embedStatementZUNIEFI_4208Template = embedStatementZUNIEFI_4208Template;
        $ewf.mustache.embedStatementZUNIEFI_4208_RequestTemplate = embedStatementZUNIEFI_4208_RequestTemplate;
        $ewf.mustache.embedStatementZUNIEFI_6732_apply_Template = embedStatementZUNIEFI_6732_apply_Template;
        $ewf.mustache.embedStatementZUNIEFI_6732_calculate_Template = embedStatementZUNIEFI_6732_calculate_Template;
        $ewf.mustache.embedStatementZUNIEFI_6732_domesticTemplate = embedStatementZUNIEFI_6732_domesticTemplate;
        $ewf.mustache.embedStatementZUNIEFI_6732_apply_overseasTemplate = embedStatementZUNIEFI_6732_apply_overseasTemplate;
        $ewf.mustache.embedStatementZUNIEFI_6732_calculate_overseasTemplate = embedStatementZUNIEFI_6732_calculate_overseasTemplate;
        $ewf.mustache.embedStatementZUNIEFI_6500Template = embedStatementZUNIEFI_6500Template;
        $ewf.mustache.modifyApprovalDialogTemplate = modifyApprovalDialogTemplate;
        $ewf.mustache.approvalLineTemplate = approvalLineTemplate;
        $ewf.mustache.draftTitleTemplate = draftTitleTemplate;
    }
});