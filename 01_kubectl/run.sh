#!/usr/bin/env bash

run() {
	# create deployment
	kubectl run my-nginx --image=nginx
}

expose() {
	# expose pod
	kubectl expose deployment my-nginx --type=NodePort --port=80
	# kubectl expose deployment my-nginx --type=NodePort --port=8001 --target-port=80
}

open() {
	# echo url
	minikube service my-nginx --url

	# open in browser
	minikube service my-nginx
}

cleanup(){
	kubectl delete svc,deploy my-nginx
}


default(){
	run && expose && open
	kubectl get all

	echo -en "\nClean up [y/N]? ";read x
	if [[ "$x" == "y" ]]; then
		# delete deployment and service
		cleanup
	else
		echo -e "\nYou should remember to clean up\n"
		echo -e "> $0 cleanup\n"
	fi
}

help() {
	echo "Commands: run, expose, open, cleanup"
}

if [[ "$1" == "" ]]; then
	default
else
	$*
fi
