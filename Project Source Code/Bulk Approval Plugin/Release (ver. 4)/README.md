# Bulk Approval Plugin for Ogusu
This project, developed for Ogusu Industry Co., aims to enhance the Kintone platform by adding new features. The primary goal is to provide additional functionalities and improvements, which are implemented through custom plugins. These plugins are designed to seamlessly integrate with Kintone, enhancing its capabilities and user experience. The codebase reflects a commitment to quality and efficiency, ensuring that the new features meet the specific needs of Ogusu Industry Co. This initiative demonstrates our dedication to delivering tailored solutions that optimize our client's operational workflows and support their business objectives.


# Kintone key commads for CLI
- Direct File upload to the kintone application from  local computer.....
- npm install -g @kintone/customize-uploader
- kintone-customize-uploader init
- kintone-customize-uploader  --base-url https://ogusu.cybozu.com  dest/customize-manifest.json

for more details ---
+ https://cybozu.dev/ja/kintone/sdk/development-environment/customize-uploader/


# Plugin generate and upload related CLI
- kintone-plugin-packer updater-plugin
- kintone-plugin-uploader --base-url https://your_company_name.cybozu.com/ --username your_username --password your_password plugin.zip
