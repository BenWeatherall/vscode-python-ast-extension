@echo off
REM git-commit.cmd - Git commit wrapper that strips --trailer flags.
REM Cursor's sandbox appends --trailer which older Git versions don't support.
REM Usage: scripts\git-commit.cmd [git commit arguments...]

setlocal enabledelayedexpansion

set "ARGS="
set "SKIP_NEXT=0"

:loop
if "%~1"=="" goto run

if "!SKIP_NEXT!"=="1" (
    set "SKIP_NEXT=0"
    shift
    goto loop
)

REM --trailer "key: value" (two separate args)
if "%~1"=="--trailer" (
    set "SKIP_NEXT=1"
    shift
    goto loop
)

REM --trailer=value (single arg)
set "ARG=%~1"
if "!ARG:~0,10!"=="--trailer=" (
    shift
    goto loop
)

set "ARGS=!ARGS! "%~1""
shift
goto loop

:run
if defined ARGS (
    git commit !ARGS!
) else (
    git commit
)
endlocal
