$WORKING_DIR = (Get-Location).Path
$env:VCPKG_DEFAULT_TRIPLET = 'x86-windows'

cd src
vcpkg install
cd ..

.\scripts\build_windows_manual.ps1 $WORKING_DIR Debug 32
