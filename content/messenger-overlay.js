/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function (aGlobal) {
  var Cc = Components.classes;
  var Ci  =Components.interfaces;

  var ConsoleService = Cc['@mozilla.org/consoleservice;1']
                         .getService(Ci.nsIConsoleService);

  var DeleteOnlyEmptyFolder = {
    debug: true,

    log: function(aMessage) {
      if (!this.debug)
        return;

     ConsoleService.logStringMessage(aMessage);
    },

    getTargetFolder: function(aFolder) {
      var folders = aFolder ? [aFolder] : gFolderTreeView.getSelectedFolders();
      return folders[0];
    },

    isEmpty: function(aFolder) {
      return !aFolder.hasSubFolders && aFolder.getTotalMessages(false) === 0;
    },

    init: function() {
      gFolderTreeController.__delete_only_empty_folder__deleteFolder = gFolderTreeController.deleteFolder;
      gFolderTreeController.deleteFolder = function(aFolder, ...aArgs) {
        aFolder = DeleteOnlyEmptyFolder.getTargetFolder(aFolder);
        if (!DeleteOnlyEmptyFolder.isEmpty(aFolder)) {
          DeleteOnlyEmptyFolder.log('Cancel to delete folder: it is not empty folder.');
          return;
        }
        return gFolderTreeController.__delete_only_empty_folder__deleteFolder.apply(this, [aFolder].concat(aArgs));
      };

      window.__delete_only_empty_folder__CanDeleteFolder = window.CanDeleteFolder;
      window.CanDeleteFolder = function(aFolder, ...aArgs) {
        if (!DeleteOnlyEmptyFolder.isEmpty(aFolder)) {
          DeleteOnlyEmptyFolder.log('Disallow to delete non-empty folder.');
          return false;
        }
        return window.__delete_only_empty_folder__CanDeleteFolder.apply(this, [aFolder].concat(aArgs));
      };
    }
  };

  document.addEventListener('DOMContentLoaded', function onDOMContentLoaded(aEvent) {
    document.removeEventListener('DOMContentLoaded', onDOMContentLoaded);
    DeleteOnlyEmptyFolder.init();
  });

  aGlobal.DeleteOnlyEmptyFolder = DeleteOnlyEmptyFolder;
})(this);
