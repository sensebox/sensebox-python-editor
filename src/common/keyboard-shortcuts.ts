// Shortcuts are global unless noted otherwise.
export const keyboardShortcuts = {
  // This is scoped by keyboard focus.
  copyCode: ["ctrl+c", "meta+c", "enter"],
  search: ["ctrl+shift+f", "meta+shift+f"],
  // senseBox: also flash on the editor save shortcut.
  sendToMicrobit: ["ctrl+shift+e", "meta+shift+e", "ctrl+s", "meta+s"],
  saveProject: ["ctrl+shift+s", "meta+shift+s"],
};

export const globalShortcutConfig = {
  preventDefault: true,
  enableOnContentEditable: true,
  enableOnFormTags: true,
};
