package com.unipost.unidocu.vender_custom;

import com.unipost.NSParam;
import com.unipost.NSReturn;
import com.unipost.rfc.TableParam;
import com.unipost.unidocu.module.email.UniPostMailSender;
import com.unipost.unidocu.module.mustache.UniDocuUITemplateRenderer;
import com.unipost.unidocu.module.property.ServerProperty;
import com.unipost.unidocu.service.AbstractJAVAService;
import com.unipost.unidocu.service.NamedService;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class SendUnprocessedMailService extends AbstractJAVAService {
    private static final Logger logger = LoggerFactory.getLogger(SendUnprocessedMailService.class);
    private final NamedService namedService;
    private int successSend = 0;
    private int failSend = 0;

    public SendUnprocessedMailService(NamedService namedService) {
        this.namedService = namedService;
    }

    @Override
    public NSReturn call(NSParam nsParam) {
        TableParam it_data = nsParam.getTableParam("IT_DATA");
        Map<String, ArrayList<Map<String, String>>> classify_it_data = new HashMap<>();

        String regex = "^[_a-zA-Z0-9-]+(.[_a-zA-Z0-9-]+)*@(?:[\\w-_.]+\\.)+[\\w-_.]+$";
        Pattern p = Pattern.compile(regex);

        for(Map<String, String> map : it_data) {
            if(map.get("SNAME").equals("") || map.get("IP_EMAIL").equals("")) {
                logger.info("Exception : Check if SNAME or IP_EMAIL exist.");
                failSend++;
                continue;
            }

            Matcher m = p.matcher(map.get("IP_EMAIL"));
            if(!m.matches()) {
                logger.info("Exception : Check if Email is correct.");
                failSend++;
                continue;
            }

            String IP_EMAIL = map.get("IP_EMAIL");
            if(classify_it_data.containsKey(IP_EMAIL)) {
                classify_it_data.get(IP_EMAIL).add(map);
            } else {
                ArrayList<Map<String, String>> list = new ArrayList<>();
                list.add(map);
                classify_it_data.put(IP_EMAIL, list);
            }
        }

        Thread thread = new Thread(() -> {
            for(String key: classify_it_data.keySet()) {
                try {
                    sendUnprocessedMail(classify_it_data.get(key));
                    Thread.sleep(10);
                } catch (InterruptedException | RuntimeException ex) {
                    logger.info(ExceptionUtils.getStackTrace(ex));
                    Thread.currentThread().interrupt();
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            }
        });
        thread.setName("SendUnprocessedMailThread");
        thread.start();

        try {
            thread.join();
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }

        NSReturn nsReturn = new NSReturn();
        String returnMessage = String.format("%s건 전송 성공\n%s건 전송 실패", successSend, failSend);
        nsReturn.put("message", returnMessage);

        successSend = 0;
        failSend = 0;

        return nsReturn;
    }

    private void sendUnprocessedMail(final ArrayList<Map<String, String>> unprocessedList) throws IOException {
        if (!ServerProperty.useApprovalAlarmAsSendMail()) return;

        List<String> receiveEmail = new ArrayList<>();
        receiveEmail.add(unprocessedList.get(0).get("IP_EMAIL"));

        String sname = unprocessedList.get(0).get("SNAME");

        Map<String, Object> unprocessedListMap = new HashMap<>();
        unprocessedListMap.put("unprocessedList", unprocessedList);
        unprocessedListMap.put("redirectURL", "https://accounting.key-foundry.com/unidocu/view.do#UD_0201_010");

        int unProcessedCount = unprocessedList.size();
        String subject = String.format("[처리요청] (%s) KF-세금계산서-(미처리 %s건)", sname, unProcessedCount);
        String contents = UniDocuUITemplateRenderer.getUniDocuEUnprocessedTemplate(unprocessedListMap);

        try {
            UniPostMailSender.sendHtmlMail(subject, contents, receiveEmail);
            successSend += unProcessedCount;
        } catch (Exception e) {
            logger.info("Exception : " + e.getMessage());
            failSend += unProcessedCount;
        }
    }
}