#!/bin/bash

# Script to run Nightwatch tests for Smart Table

# Start HTTP server
http-server -p 8080 &
server_pid=$!

# Wait for server to start
echo "Starting HTTP server..."
sleep 2

# Run the tests
echo "Running Nightwatch tests..."
nightwatch "$@"
test_result=$?

# Kill the HTTP server
kill $server_pid

# Return test result
exit $test_result
