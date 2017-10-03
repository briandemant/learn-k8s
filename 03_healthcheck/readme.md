# Healthchecks

```bash
kubectl create configmap shared --from-file=../shared/
kubectl apply -f ./
```

> NOTE: Both readyness and liveness are called continuously

### docs 

https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-probes/