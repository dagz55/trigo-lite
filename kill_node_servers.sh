#!/bin/bash

# Find all running node processes except for the grep command itself
ps aux | grep ' node ' | grep -v grep | awk '{print $2}' | xargs kill