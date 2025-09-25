# FocusTube HTML Structure Guide

This document explains the purpose of the main HTML elements used in the FocusTube project.  

---

## `<!DOCTYPE html>`
Declares that the document uses **HTML5** so the browser renders it with modern standards.

---

## `<html>`
The root of the HTML page. Everything inside belongs to the web document.  

- Attribute `lang="en"` specifies the language (English).

---

## `<head>`
Contains **metadata** and resources the browser needs but which are not directly displayed on the page (title, CSS, viewport settings, etc.).

---

## `<meta>`
Provides metadata such as character encoding and viewport settings for mobile scaling.

---

## `<title>`
Defines the **page title** shown in the browser tab or bookmarks.

---

## `<link>`
Links an external resource such as a **CSS stylesheet**.

---

## `<style>`
Allows you to add **internal CSS styles** directly inside the HTML document.

---

## `<body>`
The main container where **all visible content** is placed (what the user sees in the browser).

---

## `<div>`
A **generic block container** used for grouping elements.  

- In this project:  
  - `results-container` holds the search results.  
  - `videoModal` acts as the modal overlay.

---

## `<h2>`
A **heading element (second-level)**. Used for titles or section headings.

---

## `<span>`
An **inline container**, usually for styling or interaction.  

- In this project: it holds the **“×” close button** for the modal.

---

## `<script>`
Loads **JavaScript files** or embeds code to add interactivity.  

- In this project:  
  - The YouTube IFrame API is loaded.  
  - A local script (`results.js`) handles results logic and modal functionality.
