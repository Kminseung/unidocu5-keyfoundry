package com.unipost.email;

import com.unipost.unidocu.module.email.UniPostMailSender;
import org.junit.Ignore;
import org.junit.Test;

import java.util.Collections;
import java.util.List;

/**
 * SendMailTest
 */
public class SendMailTest {
    @Test
	@Ignore
    public void testSendMail() {
        String subject = "subject";
        String contents = "contents";
		List<String> receiverList = Collections.singletonList("solarb0526@gmail.com");
		UniPostMailSender.sendMail(subject, contents, receiverList);
    }

	@Test
	@Ignore
	public void testSendHtmlMail() {
		String subject = "subject";
		String contents = "contents";
		List<String> receiverList = Collections.singletonList("solarb0526@gmail.com");
		UniPostMailSender.sendHtmlMail(subject,contents, receiverList);
	}

	@Test
	@Ignore
	public void testSendMailEapproval() {
		String subject = "[UniDocu] 전자 결재 알림";
		String contents =
				"<div>                                                                                                                    " +
				"    <h4>[UNIDOCU 결재요청]</h4>                                                                                          " +
				"    <table style=\"text-align:left;border-collapse:collapse;font-size:small;width:700px\" border=\"1\">                  " +
				"        <tr>                                                                                                             " +
				"            <th style=\"background-color:#ddd;width:100px;font-weight:normal;padding-left:10px\">상신자</th>             " +
				"            <td style=\"padding-left:10px\">김지현</td>                                                                  " +
				"        </tr>                                                                                                            " +
				"        <tr>                                                                                                             " +
				"            <th style=\"background-color:#ddd;width:100px;font-weight:normal;padding-left:10px\">상신일자</th>           " +
				"            <td style=\"padding-left:10px\">2014-07-04</td>                                                              " +
				"        </tr>                                                                                                            " +
				"        <tr>                                                                                                             " +
				"            <th style=\"background-color:#ddd;width:100px;font-weight:normal;padding-left:10px\">문서번호</th>           " +
				"            <td style=\"padding-left:10px\"><a href=\"https://unidocu.unipost.co.kr/unidocu4\" target=\"_blank\">20140701-001</a></td>" +
				"        </tr>                                                                                                            " +
				"        <tr>                                                                                                             " +
				"            <th style=\"background-color:#ddd;width:100px;font-weight:normal;padding-left:10px\">제목</th>               " +
				"            <td style=\"padding-left:10px\">전자결재 알림 양식 테스트</td>                                               " +
				"        </tr>                                                                                                            " +
				"    </table>                                                                                                             " +
				"    <h4>※ 문서번호 클릭시 직접 문서 확인이 가능합니다.</h4>                                                             " +
				"</div>                                                                                                                   ";
				

		List<String> receiverList = Collections.singletonList("solarb0526@gmail.com");
		UniPostMailSender.sendHtmlMail(subject,contents, receiverList);
	}
}
