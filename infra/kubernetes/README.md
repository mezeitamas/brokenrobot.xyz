# Local development

## Minikube

[Minikube](https://minikube.sigs.k8s.io/)

### Start

```shell
minikube start --cni calico --nodes 3 -p brokenrobot-xyz
```

### Configure

```shell
minikube addons list -p brokenrobot-xyz
```

#### ingress

```shell
minikube addons enable ingress -p brokenrobot-xyz
```

#### registry

```shell
minikube addons enable registry -p brokenrobot-xyz
```

```shell
docker run --rm -it --network=host alpine ash -c "apk add socat && socat TCP-LISTEN:5000,reuseaddr,fork TCP:$(minikube ip -p brokenrobot-xyz):5000"
```

#### dashboard

```shell
minikube addons enable dashboard -p brokenrobot-xyz
```

```shell
minikube addons enable metrics-server -p brokenrobot-xyz
```

```shell
minikube dashboard --url -p brokenrobot-xyz
```

#### Tunnel

```shell
minikube tunnel -p brokenrobot-xyz
```

### Status

```shell
minikube status -p brokenrobot-xyz
```

### Stop

```shell
minikube stop -p brokenrobot-xyz
```

```shell
minikube delete --all
```

### Docker

```shell
docker tag brokenrobot.xyz localhost:5000/brokenrobot.xyz
```

```shell
docker push localhost:5000/brokenrobot.xyz
```

## BusyBox

```shell
kubectl run busybox --rm -ti --image=busybox -- /bin/sh
```

```shell
wget --spider --timeout=1 <IP>
```

## Network policy

```shell
kubectl describe networkpolicy brokenrobot-xyz-networkpolicy -n development
```

## Helm

```shell
helm upgrade brokenrobot-xyz ./chart --values values-local-minikube.yaml --namespace development --create-namespace --install --atomic --cleanup-on-fail --timeout 1m
```

```shell
helm uninstall brokenrobot-xyz --namespace development
```
