minikube start

# Enable local registry

minikube addons enable registry
docker run --rm -it --network=host alpine ash -c "apk add socat && socat TCP-LISTEN:5000,reuseaddr,fork TCP:$(minikube ip):5000"

# Enable dashboard

minikube addons enable metrics-server
minikube dashboard

# Enable ingress

minikube addons enable ingress

# Tunnel

minikube tunnel

# Docker

docker tag brokenrobot.xyz localhost:5000/brokenrobot.xyz:1.0.0
docker push localhost:5000/brokenrobot.xyz:1.0.0

# kubectl

kubectl create -f namespace.yml
kubectl create -f deployment.yml
kubectl create -f service.yml
kubectl create -f ingress.yml

# BusyBox

kubectl exec -it busybox-6b95744666-kxs2k -n brokenrobot-xyz -- /bin/sh

# Links

https://kubernetes.github.io/ingress-nginx/user-guide/basic-usage/
