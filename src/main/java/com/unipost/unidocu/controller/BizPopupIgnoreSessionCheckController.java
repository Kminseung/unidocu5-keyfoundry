package com.unipost.unidocu.controller;

import com.unipost.unidocu.util.UniDocuUtil;

import com.unipost.unidocu.vender_custom.CustomServerProperty;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;

@Controller
@RequestMapping("/biz/popup")
public class BizPopupIgnoreSessionCheckController {

    @RequestMapping("/ShowEvidence/view")
    public String showEvidenceView(HttpServletRequest request, ModelMap model) throws IOException {
        model.put("VIEW_NAME", CustomServerProperty.getOverrideShowEvidencePath());
        return UniDocuUtil.returnBlankTemplate(request, model, "ShowEvidence");
    }

    @RequestMapping("/StatementPreview/view")
    public String statementPreviewView(HttpServletRequest request, ModelMap model) throws IOException {
        model.put("VIEW_NAME", "uni-e-fi/view/popup/StatementPreview");
        return UniDocuUtil.returnBlankTemplate(request, model, "StatementPreview");
    }

    @RequestMapping("/CardBill/view")
    public String view(HttpServletRequest request, ModelMap model) throws IOException {
        model.put("VIEW_NAME", "uni-e-fi/view/popup/CardBill");
        return UniDocuUtil.returnBlankTemplate(request, model, "CardBill");
    }

    @RequestMapping("/TaxInvoice/view")
    public String taxInvoice2View(HttpServletRequest request, ModelMap model) throws IOException {
        model.put("VIEW_NAME", "uni-e-fi/view/TaxInvoice");
        return UniDocuUtil.returnBlankTemplate(request, model, "TaxInvoice");
    }
}