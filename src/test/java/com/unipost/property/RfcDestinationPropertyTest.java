package com.unipost.property;

import com.unipost.unidocu.module.property.RfcDestinationProperty;
import org.junit.Ignore;
import org.junit.Test;

import java.util.Map;

import static org.hamcrest.core.Is.is;
import static org.junit.Assert.assertArrayEquals;
import static org.junit.Assert.assertThat;

public class RfcDestinationPropertyTest {
	@Test
	public void testGetDestinationAliases(){
		assertArrayEquals(RfcDestinationProperty.getDestinationAliases(), new String[]{"UPD_800","S4H_800","MCD_410"});
	}

	@Test
	public void testGetDefaultDestinationAlias() {
		assertThat(RfcDestinationProperty.getDefaultDestinationAlias(), is("UPD_800"));
	}

	@Test
	public void testGetDestinationPropertyMap() {
		Map<String, String> destinationPropertyMap;
		destinationPropertyMap = RfcDestinationProperty.getDestinationPropertyMap("UPD_800");
		assertThat(destinationPropertyMap.get("jco.client.sysnr"), is("00"));
		assertThat(destinationPropertyMap.get("jco.client.user"), is("IF_UNIDOCU"));
		assertThat(destinationPropertyMap.get("jco.client.passwd"), is("ADEB58A977A8D74A9ED81F783F0691B7"));
		assertThat(destinationPropertyMap.get("jco.client.client"), is("800"));
		assertThat(destinationPropertyMap.get("jco.client.ashost"), is("211.48.245.138"));
	}
}