package com.unipost.unidocu.ns.ewf;

import com.unipost.NSParam;
import com.unipost.NSReturn;
import com.unipost.rfc.TableParam;
import com.unipost.unidocu.module.SystemProperty;
import com.unipost.unidocu.module.email.UniPostMailSender;
import com.unipost.unidocu.module.mustache.UniDocuUITemplateRenderer;
import com.unipost.unidocu.module.property.ServerProperty;
import com.unipost.unidocu.service.AbstractJAVAService;
import com.unipost.unidocu.service.NamedService;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.apache.commons.lang3.StringUtils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class SendApprovalAlarmService extends AbstractJAVAService {
    private static final Logger logger = LoggerFactory.getLogger(SendApprovalAlarmService.class);
    private final NamedService namedService;

    public SendApprovalAlarmService(NamedService namedService) {
        this.namedService = namedService;
    }

    @Override
    public NSReturn call(NSParam nsParam) {
        TableParam it_data = nsParam.getTableParam("IT_DATA");

        Thread thread = new Thread(() -> {
            for (Map<String, String> map : it_data) {
                try {
                    sendSingle(map);
                    Thread.sleep(1000);
                } catch (InterruptedException | RuntimeException ex) {
                    logger.info(ExceptionUtils.getStackTrace(ex));
                    Thread.currentThread().interrupt();
                }
            }
        });
        thread.setName("SendApprovalMailThread");
        thread.start();

        return new NSReturn();
    }

    private void sendSingle(final Map<String, String> map) {
        if (!ServerProperty.useApprovalAlarmAsSendMail()) return;
        String receiverListString = map.get("SMTP_ADDR");
        if (StringUtils.isEmpty(receiverListString)) {
            logger.info("SMTP_ADDR is empty. " + map);
            return;
        }
        String wf_mail_title = map.get("WF_MAIL_TITLE");
        String wf_key_text = map.get("WF_KEY_TEXT");
        String redirectUrl = map.get("redirectUrl");
//        String redirectUrlM = map.get("redirectUrlM");
        map.put("redirectUrl", SystemProperty.get().get("WAS_IP") + redirectUrl);
//        map.put("redirectUrlM", SystemProperty.get().get("WAS_IP") + ":8443" + redirectUrlM);

        String subject = String.format("%s %s", wf_mail_title, wf_key_text);
        String contents = UniDocuUITemplateRenderer.getUniDocuEApprovalTemplate(map);
        List<String> receiverList = Arrays.asList(receiverListString.split(","));

        UniPostMailSender.sendHtmlMail(subject, contents, receiverList);
    }

}
