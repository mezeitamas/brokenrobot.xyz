#!/usr/bin/env bash

set -eoux pipefail

echo "Installing brokenrobot.xyz to minikube..."
helm upgrade brokenrobot-xyz ./chart --values values-local-minikube.yaml --namespace development --create-namespace --install --atomic --cleanup-on-fail --timeout 1m
