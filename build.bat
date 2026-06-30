@echo off
echo ========================================
echo    PrismDashboard Build Script (Windows)
echo ========================================

REM === CONFIGURATION ===
set PROJECT_NAME=PrismDashboard
set BUILD_TYPE=Release
set VSWHERE="%ProgramFiles(x86)%\Microsoft Visual Studio\Installer\vswhere.exe"

REM Locate Visual Studio with the C++ toolchain.
if not exist %VSWHERE% (
    echo [ERROR] vswhere.exe was not found.
    echo Install Visual Studio or Build Tools with the "Desktop development with C++" workload.
    pause
    exit /b 1
)

for /f "usebackq tokens=*" %%i in (`%VSWHERE% -latest -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath`) do set VS_INSTALL=%%i

if not defined VS_INSTALL (
    echo [ERROR] No Visual Studio C++ toolchain was found.
    echo Install the "Desktop development with C++" workload from Visual Studio Installer.
    pause
    exit /b 1
)

set MSVC_PATH="%VS_INSTALL%\VC\Auxiliary\Build\vcvars64.bat"

if not exist %MSVC_PATH% (
    echo [ERROR] Visual Studio C++ environment script was not found:
    echo %MSVC_PATH%
    pause
    exit /b 1
)

echo Setting up Visual Studio environment...
call %MSVC_PATH%

where cl >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Visual Studio environment initialized, but cl.exe is not on PATH.
    echo Check that the C++ compiler component is installed for:
    echo %VS_INSTALL%
    pause
    exit /b 1
)

echo Building %PROJECT_NAME%...

set SOURCES=
for %%f in (src\*.cpp) do call set SOURCES=%%SOURCES%% %%f

if not defined SOURCES (
    echo [ERROR] No C++ source files found in src.
    pause
    exit /b 1
)

cl /EHsc /std:c++20 /O2 ^
    %SOURCES% ^
    /I "src" ^
    /I "auth" ^
    /Fe%PROJECT_NAME%.exe ^
    /link user32.lib gdi32.lib opengl32.lib

if %ERRORLEVEL% == 0 (
    echo.
    echo ========================================
    echo Build Successful! %PROJECT_NAME%.exe created.
    echo ========================================
) else (
    echo.
    echo [ERROR] Build failed. Check errors above.
)

pause
