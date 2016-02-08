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

     ConsoleService.logStringMessage('[delete-only-empty-folder] '+aMessage);
    },

    getTargetFolder: function(aFolder) {
      var folders = aFolder ? [aFolder] : gFolderTreeView.getSelectedFolders();
      return folders[0];
    },

    isEmpty: function(aFolder) {
      return !aFolder.hasSubFolders && aFolder.getTotalMessages(false) === 0;
    },

    isInTrash: function(aFolder) {
      if (!aFolder)
        return false;

      if (aFolder.flags & Ci.nsMsgFolderFlags.Trash)
        return true;

      return this.isInTrash(aFolder.parent);
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

      window.__delete_only_empty_folder__EnableMenuItem = window.EnableMenuItem;
      window.EnableMenuItem = function(aId, ...aArgs) {
        if (aId === 'folderPaneContext-remove') {
          let folders = gFolderTreeView.getSelectedFolders();
          if (!folders.every(DeleteOnlyEmptyFolder.isEmpty, DeleteOnlyEmptyFolder)) {
            DeleteOnlyEmptyFolder.log('Disallow to delete non-empty folder.');
            document.getElementById(aId).disabled = true;
            return;
          }
        }
        return window.__delete_only_empty_folder__EnableMenuItem.apply(this, [aId].concat(aArgs));
      };

      gFolderTreeView.__delete_only_empty_folder__canDrop = gFolderTreeView.canDrop;
      gFolderTreeView.canDrop = function(aRow, aOrientation, ...aArgs) {
        var dropTargetFolder = gFolderTreeView._rowMap[aRow]._folder;
        if (dropTargetFolder &&
            DeleteOnlyEmptyFolder.isInTrash(dropTargetFolder) &&
            aOrientation === Ci.nsITreeView.DROP_ON) {
          let dt = this._currentTransfer;
          let types = dt.mozTypesAt(0);
          if (Array.indexOf(types, 'text/x-moz-folder') > -1) {
            for (let i = 0, maxi = dt.mozItemCount; i < maxi; i++) {
              let folder = dt.mozGetDataAt('text/x-moz-folder', i)
                             .QueryInterface(Ci.nsIMsgFolder);
              if (!DeleteOnlyEmptyFolder.isEmpty(folder)) {
                DeleteOnlyEmptyFolder.log('Dropped folder '+i+' is not empty..');
                return false;
              }
            }
          }
        }
        return gFolderTreeView.__delete_only_empty_folder__canDrop.apply(this, [aRow, aOrientation].concat(aArgs));
      };
    }
  };

  document.addEventListener('DOMContentLoaded', function onDOMContentLoaded(aEvent) {
    document.removeEventListener('DOMContentLoaded', onDOMContentLoaded);
    DeleteOnlyEmptyFolder.init();
  });

  aGlobal.DeleteOnlyEmptyFolder = DeleteOnlyEmptyFolder;
})(this);
