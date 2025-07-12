#!/bin/bash

license-checker --production --customPath licenseFormat.json --json --out licenses.json
license-checker --production --customPath licenseFormat.json --out ThirdPartyNotices.txt