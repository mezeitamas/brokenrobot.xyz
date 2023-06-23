#!/usr/bin/env bash

set -eoux pipefail

echo "Uninstalling brokenrobot.xyz from minikube..."
helm uninstall brokenrobot-xyz --namespace development
