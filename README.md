# AztechWB_SCM
### 아즈텍WB PDA, SCM 접속 정보, 서버 정보, 소스 반영 위치는 IMS에서 확인
- http://ims.gaonsoft.com/projects/k-system/wiki/AZTECHWB


## 로컬에서 개발 시 
### VSCode
1. git clone으로 소스 받기
2. VSCode에서 해당 프로젝트 폴더 오픈
3. VSCode의 Terminal에서 노드 모듈들 설치
- 폴더 오픈으로 열었으면 Terminal 기본 위치가 해당 프로젝트 폴더 내부일것임. 해당 프로젝트 폴더 내부에서 설치 진행
```bach
npm install
```
4. VSCode의 Terminal에서 "nodeWebServer.js"를 node로 실행
- 폴더 오픈으로 열었으면 Terminal 기본 위치가 해당 프로젝트 폴더 내부일것임. 해당 프로젝트 폴더 내부에 "nodeWebServer.js" 파일이 있음
```bash
node nodeWebServer.js
```