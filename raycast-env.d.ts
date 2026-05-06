/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `switchWindowsFocused` command */
  export type SwitchWindowsFocused = ExtensionPreferences & {
  /** Show Window Titles First - Show window titles (e.g., document names, browser tabs) before app names */
  "showWindowTitlesFirst": boolean
}
  /** Preferences accessible in the `switchWindowsAll` command */
  export type SwitchWindowsAll = ExtensionPreferences & {
  /** Show Window Titles First - Show window titles (e.g., document names, browser tabs) before app names */
  "showWindowTitlesFirst": boolean
}
  /** Preferences accessible in the `goToWorkspace` command */
  export type GoToWorkspace = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `switchWindowsFocused` command */
  export type SwitchWindowsFocused = {}
  /** Arguments passed to the `switchWindowsAll` command */
  export type SwitchWindowsAll = {}
  /** Arguments passed to the `goToWorkspace` command */
  export type GoToWorkspace = {}
}

