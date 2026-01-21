#!/bin/sh
repo_root=$(git rev-parse --show-toplevel)
hook_scripts_dir="$repo_root/hooks"
git_hooks_dir="$repo_root/.git/hooks"
ln -s -f "$hook_scripts_dir/pre-commit" "$git_hooks_dir/pre-commit"

