package com.unipost.property;

import com.unipost.unidocu.module.property.SmtpProperty;
import org.junit.Test;

import static org.hamcrest.core.Is.is;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;

public class SmtpPropertyTest {

    @Test
    public void testIsSmtpDebug() {
        assertTrue(SmtpProperty.isSmtpDebug());
    }

    @Test
    public void testIsStartTLSEnabled() {
        assertFalse(SmtpProperty.isStartTLSEnabled());
    }

    @Test
    public void testGetSmtpPort() {
        assertThat(SmtpProperty.getSmtpPort(), is(25));
    }

    @Test
    public void testGetSmtpHostName() {
        System.out.println(SmtpProperty.getSmtpHostName());
        assertThat(SmtpProperty.getSmtpHostName(), is("192.168.0.115"));
    }

    @Test
    public void testGetSmtpCharSet() {
        assertThat(SmtpProperty.getSmtpCharSet(), is("UTF-8"));
    }

    @Test
    public void testGetSmtpSendermail() {
        assertThat(SmtpProperty.getSmtpSenderMail(), is("noreply@unipost.co.kr"));
    }

    @Test
    public void testGetSmtpSendername() {
        assertThat(SmtpProperty.getSmtpSenderName(), is("noreply"));
    }
}
