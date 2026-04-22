@echo off
:: This script auto-elevates to admin and opens firewall ports
net session >nul 2>&1
if %errorlevel% neq 0 (
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

echo Opening firewall for Rajmudra...
netsh advfirewall firewall add rule name="Rajmudra Frontend" dir=in action=allow protocol=TCP localport=5173
netsh advfirewall firewall add rule name="Rajmudra Backend" dir=in action=allow protocol=TCP localport=5000
echo.
echo ✅ Done! Firewall ports 5173 and 5000 are now open.
echo Your friend can now connect to your app.
echo.
pause
