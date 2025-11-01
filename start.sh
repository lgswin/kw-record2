#!/bin/bash

# KW한인장로교회 관리 시스템 시작 스크립트

echo "KW한인장로교회 관리 시스템 시작 중..."

# 백엔드 서버 시작 (백그라운드)
echo "백엔드 서버 시작 중..."
npm run server &
SERVER_PID=$!

# React 개발 서버 시작
echo "React 클라이언트 시작 중..."
npm run client

# 종료 시 백그라운드 프로세스도 종료
trap "kill $SERVER_PID" EXIT

