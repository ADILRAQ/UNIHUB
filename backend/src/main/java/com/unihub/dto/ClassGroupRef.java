package com.unihub.dto;

/**
 * Minimal reference to a class group (id + name) as embedded in {@link UserDetailDto}'s
 * membership list.
 */
public record ClassGroupRef(Long id, String name) {
}
