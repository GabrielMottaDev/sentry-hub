// src/utils/stringExtensions.d.ts

// Extend the built-in String interface to add the capitalize method
declare interface String {
    capitalize: (capitalizeAll?: boolean) => string;
}