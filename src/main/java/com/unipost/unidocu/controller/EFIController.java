package com.unipost.unidocu.controller;

import com.unipost.NSParam;
import com.unipost.rfc.TableParam;
import com.unipost.unidocu.service.NamedService;
import com.unipost.unidocu.util.ConvertUtil;
import com.unipost.unidocu.util.UniDocuUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.ByteArrayInputStream;
import java.io.IOException;

@Controller
@RequestMapping("/unidocu/efi")
public class EFIController {

    private final NamedService namedService;

    @Autowired
    public EFIController(NamedService namedService) {
        this.namedService = namedService;
    }

    @RequestMapping("/pdf/downloadMultiStatementZUNIDU_6202")
    public void downloadMultiStatementPDF(HttpServletRequest request, @RequestParam String it_docString, HttpServletResponse response) throws IOException {
        TableParam it_doc = ConvertUtil.paramMapStringToTableParam(it_docString);
        byte[] byteReturn = namedService.call("ZUNIDU_6202", new NSParam().setTableParam("IT_DOC", it_doc)).getByteReturn("O_DATA");
        UniDocuUtil.responseFileStream(response, "batchBELNR" + ".pdf", new ByteArrayInputStream(byteReturn), request);
    }

    @RequestMapping("/pdf/downloadSingleStatementZUNIDU_6203")
    public void downloadSingleStatementPDF(HttpServletRequest request, @RequestParam String it_docString, HttpServletResponse response) throws IOException {
        TableParam it_doc = ConvertUtil.paramMapStringToTableParam(it_docString);
        byte[] byteReturn = namedService.call("ZUNIDU_6203", new NSParam().setTableParam("IT_DOC", it_doc)).getByteReturn("O_DATA");
        UniDocuUtil.responseFileStream(response, "batchBELNR" + ".pdf", new ByteArrayInputStream(byteReturn), request);
    }

    @RequestMapping("/pdf/downloadFromZUNIEFI_4108")
    public void downloadFromZUNIEFI_4108(HttpServletRequest request, @RequestParam String it_dataString, HttpServletResponse response) throws IOException {
        TableParam it_data = ConvertUtil.paramMapStringToTableParam(it_dataString);
        byte[] byteReturn = namedService.call("ZUNIEFI_4108", new NSParam().setTableParam("IT_DATA", it_data)).getByteReturn("O_CONTENTS");
        UniDocuUtil.responseFileStream(response, "편철현황출력" + ".pdf", new ByteArrayInputStream(byteReturn), request);
    }
}
