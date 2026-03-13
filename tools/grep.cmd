@echo off
powershell -NoProfile -Command "Select-String -Path '%2' -Pattern '%1' | ForEach-Object { $_.Line }"
