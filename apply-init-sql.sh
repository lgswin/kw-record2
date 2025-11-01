#!/bin/bash

# initi.sql 파일을 MySQL 컨테이너에서 실행하는 스크립트

echo "MySQL 컨테이너에 initi.sql 적용 중..."

# Docker 컨테이너에서 SQL 파일 실행
docker exec -i kwchurch-mysql mysql -u kwchurch -pads123 kwchurchdb < initi.sql

echo "완료!"
echo ""
echo "적용된 테이블 확인:"
docker exec -it kwchurch-mysql mysql -u kwchurch -pads123 kwchurchdb -e "SHOW TABLES;"

