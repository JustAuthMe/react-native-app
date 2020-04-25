#!/usr/bin/env bash

echo "Copying artifact to "$HOST
scp -oStrictHostKeyChecking=no -i $PK_PATH ./dist/bundle.$ENV_NAME.tar.gz root@$HOST:$ROOT_PATH-$CI_COMMIT_TAG.tar.gz

echo "rm $ROOT_PATH-$CI_COMMIT_TAG || true"
ssh -oStrictHostKeyChecking=no -i $PK_PATH root@$HOST "rm $ROOT_PATH-$CI_COMMIT_TAG || true"

echo "mkdir $ROOT_PATH-$CI_COMMIT_TAG"
ssh -oStrictHostKeyChecking=no -i $PK_PATH root@$HOST "mkdir $ROOT_PATH-$CI_COMMIT_TAG"

echo "tar -xzvf $ROOT_PATH-$CI_COMMIT_TAG.tar.gz -C $ROOT_PATH-$CI_COMMIT_TAG && rm $ROOT_PATH-$CI_COMMIT_TAG.tar.gz"
ssh -oStrictHostKeyChecking=no -i $PK_PATH root@$HOST "tar -xzvf $ROOT_PATH-$CI_COMMIT_TAG.tar.gz -C $ROOT_PATH-$CI_COMMIT_TAG && rm $ROOT_PATH-$CI_COMMIT_TAG.tar.gz"

echo "chown www-data:www-data -R $ROOT_PATH-$CI_COMMIT_TAG && (rm -r $ROOT_PATH || true) && mv $ROOT_PATH-$CI_COMMIT_TAG $ROOT_PATH"
ssh -oStrictHostKeyChecking=no -i $PK_PATH root@$HOST "chown www-data:www-data -R $ROOT_PATH-$CI_COMMIT_TAG && (rm -r $ROOT_PATH || true) && mv $ROOT_PATH-$CI_COMMIT_TAG $ROOT_PATH"

echo "Done "$HOST
