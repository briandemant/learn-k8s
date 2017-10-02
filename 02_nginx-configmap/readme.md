# ConfigMap

using config map to setup a service

## Resources:
https://kubernetes.io/docs/tasks/configure-pod-container/configmap/


### Load inline

```bash
kubectl apply -f nginx-configmap.yaml 
kubectl apply -f nginx-controller.yaml 
kubectl apply -f nginx-service.yaml 

curl "$(minikube service nginx-configmap --url)" 
```

### load from file

```bash
kubectl create configmap ex-02-file --from-file=index.html

kubectl apply -f nginx-controller-file.yaml 
kubectl apply -f nginx-service-file.yaml 
 
curl "$(minikube service nginx-configmap-file --url)" 
```


### shof diff

```bash
diff -b <(curl -s "$(minikube service nginx-configmap --url)") <(curl -s "$(minikube service nginx-configmap-file --url)")
```