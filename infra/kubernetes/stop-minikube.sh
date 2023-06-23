#!/usr/bin/env bash

set -eoux pipefail

echo "Stopping minikube..."
minikube stop -p brokenrobot-xyz
echo "\n"

echo "Cleaning up..."
minikube delete --all
