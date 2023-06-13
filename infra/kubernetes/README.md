# Local development

## Minikube

[Minikube](https://minikube.sigs.k8s.io/)

### Start

```shell
minikube start
```

### Configure

```shell
minikube addons list
```

#### ingress

```shell
minikube addons enable ingress
```

#### registry

```shell
minikube addons enable registry
```

```shell
docker run --rm -it --network=host alpine ash -c "apk add socat && socat TCP-LISTEN:5000,reuseaddr,fork TCP:$(minikube ip):5000"
```

#### dashboard

```shell
minikube addons enable dashboard
```

```shell
minikube addons enable metrics-server
```

```shell
minikube dashboard --url
```

#### Tunnel

```shell
minikube tunnel
```

### Status

```shell
minikube status
```

### Stop

```shell
minikube stop
```

```shell
minikube delete -all
```

### Docker

```shell
docker tag brokenrobot.xyz localhost:5000/brokenrobot.xyz
```

```shell
docker push localhost:5000/brokenrobot.xyz
```

## Microk8s

[Microk8s](https://microk8s.io/)

`// TODO`

## BusyBox

```shell
kubectl run -i --tty busybox --image=busybox --restart=Never -- sh
```

## Helm

```shell
helm upgrade brokenrobot-xyz ./chart --values values-local-minikube.yaml --namespace development --create-namespace --install --atomic --cleanup-on-fail --timeout 1m
```

```shell
helm uninstall brokenrobot-xyz --namespace development
```
