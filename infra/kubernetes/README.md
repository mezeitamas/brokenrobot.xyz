# Local development

## Minikube

[Minikube](https://minikube.sigs.k8s.io/)

#### dashboard

```shell
minikube dashboard --url -p brokenrobot-xyz
```

#### Tunnel

```shell
minikube tunnel -p brokenrobot-xyz
```

### Docker

```shell
docker tag brokenrobot.xyz localhost:5000/brokenrobot.xyz:1.0.0
```

```shell
docker push localhost:5000/brokenrobot.xyz:1.0.0
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
kubectl describe networkpolicy brokenrobot-xyz -n development
```
