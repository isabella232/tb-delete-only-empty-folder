/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function (aGlobal) {
  var Ci = Components.interfaces;
  var Cc = Components.classes;
  var ObserverService = Cc['@mozilla.org/observer-service;1']
                          .getService(Ci.nsIObserverService);
  var DeleteOnlyEmptyFolder = {
    // nsIObserver
    observe: function observe(aEvent) {
      ObserverService.removeObserver(this, 'mail-startup-done', false);
      this.init();
    }
  };

  document.addEventListener('DOMContentLoaded', function onDOMContentLoaded(aEvent) {
    document.removeEventListener('DOMContentLoaded', onDOMContentLoaded);
    ObserverService.addObserver(DeleteOnlyEmptyFolder, 'mail-startup-done', false);
  });

  aGlobal.DeleteOnlyEmptyFolder = DeleteOnlyEmptyFolder;
})(this);
