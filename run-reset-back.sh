# Creditos a wuasakaka-explosiva por la ayuda <3

docker rm $(docker ps -a | grep chiguirongos | awk '{print $1}')
docker rmi $(docker images | grep 'chiguirongos-back' -a | awk '{print $1}')
docker compose up