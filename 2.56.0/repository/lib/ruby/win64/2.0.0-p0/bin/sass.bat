@ECHO OFF
IF NOT "%~f0" == "~f0" GOTO :WinNT
@"ruby.exe" "C:/Users/kellett/P4/client/project/joinin-ui/MAIN/repository/lib/ruby/win64/2.0.0-p0/bin/sass" %1 %2 %3 %4 %5 %6 %7 %8 %9
GOTO :EOF
:WinNT
@"ruby.exe" "%~dpn0" %*
