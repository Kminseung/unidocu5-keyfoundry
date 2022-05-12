package com.unipost.rfc;

import com.unipost.NSParam;
import com.unipost.NSReturn;
import com.unipost.unidocu.module.named_service.JCOManagerWrapperFactory;
import com.unipost.unidocu.module.property.ServerProperty;
import com.unipost.unidocu.service.NamedService;
import com.unipost.unidocu.spring_config.MvcConfiguration;
import org.hamcrest.core.Is;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.MockitoAnnotations;
import org.powermock.api.mockito.PowerMockito;
import org.powermock.core.classloader.annotations.PowerMockIgnore;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;
import org.springframework.test.context.ContextConfiguration;

import java.io.IOException;

import static org.mockito.Mockito.*;

/**
 * Created by Administrator on 2016-09-21.
 */
@RunWith(PowerMockRunner.class)
@PowerMockIgnore({"javax.crypto.*" })
@ContextConfiguration(classes = {MvcConfiguration.class})
@PrepareForTest({JCOManagerWrapperFactory.class,ServerProperty.class})
public class NamedServiceTest {
    @InjectMocks
    private NamedService namedService;

    @Before
    public void initMocks(){
        PowerMockito.mockStatic(JCOManagerWrapperFactory.class);
    }

    @Test
    public void testCall() {
        NSParam anyNSParam = anyObject();
        NSReturn jcoReturn = new NSReturn();
        jcoReturn.setReturnMessage("jco called");
        when(JCOManagerWrapperFactory.call(anyString(), anyNSParam)).thenReturn(jcoReturn);

        NSReturn actual = namedService.call("ZUNIECM_XXXX", new NSParam());
        Assert.assertThat(actual.getReturnMessage(), Is.is("jco called"));
    }

    @Test
    public void testGetInstance() {
        namedService.call("ZUNIECM_WEB_DATA", new NSParam());
    }
}