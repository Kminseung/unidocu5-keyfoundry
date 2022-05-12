package com.unipost.rfc;

import com.unipost.unidocu.service.NamedService;
import com.unipost.ImportParam;
import com.unipost.unidocu.spring_config.MvcConfiguration;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.context.web.WebAppConfiguration;

/**
 * Created by Administrator on 2016-09-21.
 */
@RunWith(SpringRunner.class)
@WebAppConfiguration
@ContextConfiguration(classes = {MvcConfiguration.class})
public class NamedServiceGetInstanceTest {
    @Test
    public void testGetInstance() throws Exception {
        ImportParam importParam = new ImportParam();
        importParam.put("MODE", "selectList");
        NamedService.getInstance().call("ZUNIECM_WEB_DATA", importParam);
    }
}