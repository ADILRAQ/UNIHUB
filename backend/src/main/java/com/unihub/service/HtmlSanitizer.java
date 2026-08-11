package com.unihub.service;

import com.unihub.exception.BadRequestException;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springframework.stereotype.Service;

/**
 * Server-side HTML sanitizer used before any rich-text content (announcement body) is
 * persisted. Uses Jsoup's {@link Safelist} to whitelist a safe subset of HTML tags and
 * attributes and strip everything else — including {@code script} elements, {@code style}
 * blocks, and inline event handlers. This must be called by the service layer before
 * every CREATE or UPDATE that carries a body.
 */
@Service
public class HtmlSanitizer {

    /**
     * Allowed tags. Inline formatting, headings, lists, and block-quotes cover all
     * reasonable announcement body formatting; no tables, iframes, or media elements.
     */
    private static final Safelist SAFELIST = Safelist.none()
            .addTags("p", "br", "strong", "em", "b", "i", "u",
                     "h1", "h2", "h3", "ul", "ol", "li", "a", "blockquote")
            // Allow href on <a> — absolute URLs only (http and https protocols).
            .addAttributes("a", "href")
            .addProtocols("a", "href", "http", "https");

    /**
     * Sanitizes {@code rawHtml} using the configured safelist.
     *
     * @param rawHtml the untrusted HTML input from the client
     * @return sanitized HTML, safe to persist and render
     * @throws BadRequestException if the sanitized result is blank (i.e. the input
     *                             contained no meaningful allowed content)
     */
    public String sanitize(String rawHtml) {
        if (rawHtml == null || rawHtml.isBlank()) {
            throw new BadRequestException("Announcement body must not be empty.");
        }
        String clean = Jsoup.clean(rawHtml, SAFELIST);
        if (clean.isBlank()) {
            throw new BadRequestException("Announcement body must not be empty after sanitization.");
        }
        return clean;
    }

    /**
     * Sanitizes {@code rawHtml} when non-blank, or returns {@code null} when the input is
     * blank or null. Used for optional rich-text fields (e.g. session recap notes) where an
     * absent value is valid and should be stored as {@code NULL}.
     *
     * @param rawHtml the untrusted HTML input, may be null or blank
     * @return sanitized HTML safe to persist and render, or {@code null}
     */
    public String sanitizeOptional(String rawHtml) {
        if (rawHtml == null || rawHtml.isBlank()) {
            return null;
        }
        String clean = Jsoup.clean(rawHtml, SAFELIST);
        return clean.isBlank() ? null : clean;
    }
}
