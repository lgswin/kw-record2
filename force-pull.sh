#!/bin/bash
# 강제로 git pull을 수행하는 스크립트
# 로컬 변경사항을 무시하고 원격 저장소의 내용으로 덮어씁니다

echo "원격 저장소에서 최신 변경사항을 가져오는 중..."
git fetch origin main

echo "로컬 변경사항을 무시하고 강제로 업데이트 중..."
git reset --hard origin/main

echo "완료되었습니다!"

