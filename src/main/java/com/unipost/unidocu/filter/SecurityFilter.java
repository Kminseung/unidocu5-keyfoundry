package com.unipost.unidocu.filter;

import javax.servlet.*; // NOPMD
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class SecurityFilter implements Filter {
    public void destroy() { }
    public void init(FilterConfig config) { }

    public void doFilter(ServletRequest req, ServletResponse resp, FilterChain chain) throws ServletException, IOException {
        HttpServletRequest httpServletRequest = (HttpServletRequest) req;
        HttpServletResponse httpServletResponse = (HttpServletResponse) resp;

        // https://stackoverflow.com/questions/38195273/how-to-set-x-frame-option-in-tomcat
        httpServletResponse.setHeader("x-frame-options", "SAMEORIGIN");

        // https://stackoverflow.com/questions/24182367/how-to-add-x-content-type-options-to-tomcat-configuration
        httpServletResponse.setHeader("X-XSS-Protection", "1; mode=block");
        // Disabling browsers to perform risky mime sniffing

        boolean isDownloadUrl = httpServletRequest.getRequestURI().contains("/fineuploader/download");
        if(!isDownloadUrl) httpServletResponse.setHeader("X-Content-Type-Options", "nosniff");

        chain.doFilter(req, resp);
    }
}
