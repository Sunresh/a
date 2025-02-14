(async (PLUGIN_ID) => {
  'use strict';

  // escape values
  const escapeHtml = (htmlstr) => {
      return htmlstr
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;')
          .replace(/\n/g, '&#xA;');
  };

  // get dropdown element
  const apiFormData = document.getElementById('dropdown-setting-searchPluginStatus');

  // get configuration settings
  const config = kintone.plugin.app.getConfig(PLUGIN_ID);

  // set initial value for dropdown
  if (apiFormData) {
      apiFormData.value = config.searchPluginStatus || '0'; // Default to 'No' (0)
  } else {
      console.error('Dropdown element not found.');
  }

  // get app id
  const appId = kintone.app.getId();

  // save button
  const saveButton = document.getElementById('submit');
  saveButton.addEventListener('click', () => {
      if (!apiFormData) {
          alert('Dropdown element is missing.');
          return;
      }

      const searchPluginStatus = escapeHtml(apiFormData.value);

      // save plugin configuration settings
      const newConfig = { searchPluginStatus };
      kintone.plugin.app.setConfig(newConfig, () => {
          // redirect to the app settings page
          window.location.href = `/k/admin/app/flow?app=${appId}`;
      });
  });

  // cancel button
  const cancelButton = document.getElementById('cancel');
  cancelButton.addEventListener('click', () => {
      // redirect to the list of plug-ins screen after clicking the cancel button
      window.location.href = `/k/admin/app/${appId}/plugin/`;
  });

})(kintone.$PLUGIN_ID);
