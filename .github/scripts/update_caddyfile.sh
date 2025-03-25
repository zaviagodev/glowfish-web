#!/bin/bash

# Check if argument is provided
if [ -z "$1" ]; then
    echo "Error: Please provide the host as an argument"
    echo "Usage: $0 <host>"
    exit 1
fi

# Replace the placeholder in the Caddyfile
sed -i "s/<MULTI_TENANT_SSH_HOST>/$1/g" caddy/Caddyfile