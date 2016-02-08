/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function (aGlobal) {
  var DeleteOnlyEmptyFolder = {
    isEmpty : function(aFolder) {
      return true;
    },

    init: function() {
      gFolderTreeController.__delete_only_empty_folder__deleteFolder = gFolderTreeController.deleteFolder;
      gFolderTreeController.deleteFolder = function(aFolder, ...aArgs) {
        if (!DeleteOnlyEmptyFolder.isEmpty(aFolder))
          return;
        return gFolderTreeController.__delete_only_empty_folder__deleteFolder.apply(this, [aFolder].concat(aArgs));
      };
    }
  };

  document.addEventListener('DOMContentLoaded', function onDOMContentLoaded(aEvent) {
    document.removeEventListener('DOMContentLoaded', onDOMContentLoaded);
    DeleteOnlyEmptyFolder.init();
  });

  aGlobal.DeleteOnlyEmptyFolder = DeleteOnlyEmptyFolder;
})(this);
