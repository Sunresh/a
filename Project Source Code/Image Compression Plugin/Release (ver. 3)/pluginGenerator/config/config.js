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
  
    // get form information
    const apiFormData = document.getElementById('checkvalue-field-appApiKey');
  
    // get configuration settings
    const config = kintone.plugin.app.getConfig(PLUGIN_ID);
  
    // set initial value
    apiFormData.value = config.appApiKey || '';
  
    // get app id
    const appId = kintone.app.getId();
  
    // save button
    const saveButton = document.getElementById('submit');
    saveButton.addEventListener('click', () => {
      const appApiKey = escapeHtml(apiFormData.value);
      // required values check
      if (appApiKey === '') {
        alert('Required value is missing.');
        return;
      }
      // duplicated values check
      if (new Set([appApiKey]).size < 1) {
        alert('Duplicate values.');
        return;
      }
      // save plugin configuration settings
      const newConfig = {appApiKey};
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