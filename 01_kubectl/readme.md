# Kubectl basics
 
creating and running an nginx server

```
	# create deployment 
	kubectl run my-nginx --image=nginx

	# expose pod
	kubectl expose deployment my-nginx --type=NodePort --port 80
```

Open using minikube


```
	# echo url 
	minikube service my-nginx --url
	
	# open in browser
	minikube service my-nginx
```

Open "manually"
 
```
	# find port
	kubectl get svc | grep my-nginx
	> my-nginx     10.0.0.219   <nodes>       80:**30325**/TCP   0s
	
	# open in browser
	open http://$(minikube ip):30325
```

Cleanup

```
	# delete deployment and service
	kubectl delete svc,deploy my-nginx
```