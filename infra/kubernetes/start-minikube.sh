#!/usr/bin/env bash

set -eoux pipefail

echo "Starting minikube with 3 nodes..."
minikube start --cni calico --nodes 3 -p brokenrobot-xyz
echo "\n"

echo "Enabling the ingress addon..."
minikube addons enable ingress -p brokenrobot-xyz
echo "\n"

echo "Enabling the registry addon..."
minikube addons enable registry -p brokenrobot-xyz
echo "\n"

echo "Enabling the dashboard addon..."
minikube addons enable dashboard -p brokenrobot-xyz
echo "\n"

echo "Enabling the metrics-server addon..."
minikube addons enable metrics-server -p brokenrobot-xyz
echo "\n"

echo "Current status of the addons"
minikube addons list -p brokenrobot-xyz
echo "\n"

echo "Current status of the cluster"
minikube status -p brokenrobot-xyz
