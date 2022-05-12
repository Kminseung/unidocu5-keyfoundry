package com.unipost.unidocu.ns.ewf;

import com.unipost.ImportParam;
import com.unipost.NSParam;
import com.unipost.NSReturn;
import com.unipost.TableReturn;
import com.unipost.rfc.TableParam;
import com.unipost.unidocu.service.AbstractJAVAService;
import com.unipost.unidocu.service.NamedService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class ApprovalStepService extends AbstractJAVAService {
    private static final Logger logger = LoggerFactory.getLogger(ApprovalStepService.class);
    private final NamedService namedService;

    public ApprovalStepService(NamedService namedService) {
        this.namedService = namedService;
    }

    @Override
    public NSReturn call(NSParam nsParam) {
        ImportParam importParam = nsParam.getImportParam();
        String targetNamedServiceId = importParam.get("targetNamedServiceId");
        String comments = importParam.get("comments");

        logger.info("ApprovalStep targetNamedServiceId: " + targetNamedServiceId);
        logger.info("importParam: " + importParam);

        NSReturn nsReturn = namedService.call(targetNamedServiceId, nsParam);
        TableReturn ot_data = nsReturn.getTableReturn("OT_DATA");
        logger.info("ot_data: " + ot_data);

        for (Map<String, String> ot_datum : ot_data) {
            String id = importParam.get("ID");
            String pernr = importParam.get("PERNR");
            String bukrs = importParam.get("BUKRS");
            String wf_key = ot_datum.get("WF_KEY");
            String redirectUrl = String.format("/unidocu/view.do?programId=DRAFT_0011&ID=%s&PERNR=%s&BUKRS=%s&WF_KEY=%s&showAsPopup=true", id, pernr, bukrs, wf_key);

            ot_datum.put("redirectUrl", redirectUrl);
            ot_datum.put("comments", comments);
        }

        NSParam nsParamForSendMail = new NSParam();
        nsParamForSendMail.setTableParam("IT_DATA", new TableParam(ot_data));
        namedService.call("SendApprovalAlarm", nsParamForSendMail);

        NSReturn resultNsReturn = new NSReturn();
        resultNsReturn.put("message", nsReturn.getReturnMessage());
        return resultNsReturn;
    }
}
