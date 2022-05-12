package com.unipost.util;

import org.apache.commons.net.util.Base64;
import org.junit.Test;

import static org.hamcrest.core.Is.is;
import static org.junit.Assert.assertThat;

/**
 * Base64UtilTest
 */
public class Base64UtilTest {
	@Test
	public void testDecodeString() {
		assertThat("TEST_USER", is(new String(Base64.decodeBase64(Base64.encodeBase64String("TEST_USER".getBytes())))));
	}
}