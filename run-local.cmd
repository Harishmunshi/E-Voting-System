@echo off
setlocal
cd /d "%~dp0"
echo Starting M.E.S. E-Voting at http://127.0.0.1:3001
"C:\Program Files\nodejs\node.exe" node_modules\next\dist\bin\next dev --hostname 127.0.0.1 --port 3001
