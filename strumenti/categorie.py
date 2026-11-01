"""Categorie per argomento delle parole. Le parole non elencate vanno in "base"."""

ETICHETTE = {
    "persone": "Persone e famiglia",
    "corpo": "Corpo e salute",
    "cibo": "Cibo e bevande",
    "casa": "Casa e oggetti",
    "luoghi": "Luoghi e posizioni",
    "natura": "Natura e animali",
    "tempo": "Tempo e calendario",
    "studio": "Scuola e lavoro",
    "soldi": "Soldi e acquisti",
    "tecnologia": "Tecnologia e internet",
    "societa": "Società e notizie",
    "emozioni": "Emozioni e pensieri",
    "descrivere": "Aggettivi e descrizioni",
    "numeri": "Numeri e quantità",
    "comunicare": "Parlare e comunicare",
    "svago": "Svago, arte e sport",
    "viaggi": "Viaggi e spostamenti",
    "azioni": "Azioni quotidiane",
    "base": "Parole di base",
}

CATEGORIE = {
    "persone": """사람 우리 너 나 여자 남자 아이 애 당신 자신 놈 누구 가족 너희 친구 인간 여성
        아들 딸 자식 그녀 여러분 저희 할머니 아버지 엄마 어머니 남편 아내 부모 어린이 남성
        본인 개인 주민 남 인물 상대 저 내 제 자기 그 얘 니 넌 난 우린 누 누군 씨 새끼 나이
        인생 삶 결혼 결혼하다 태어나다 자기""",
    "corpo": """몸 머리 얼굴 눈 손 입 발 목 피 목소리 병원 의사 환자 약 아프다 병 죽다 목숨""",
    "cibo": """먹다 밥 음식 맛 맛있다 마시다 커피 달다 취하다""",
    "casa": """집 문 아파트 옷 책 카메라 불 입다""",
    "luoghi": """곳 미국 한국 중국 일본 서울 세계 세상 지역 나라 대한민국 우리나라 도시 영국 유럽
        독일 러시아 프랑스 부산 북한 해외 국내 전국 마을 동네 장소 근처 주변 거리 길 건물
        센터 현장 이곳 여기 거기 저기 어디 앞 뒤 위 아래 옆 밑 밖 속 안 사이 가운데 내부
        위치 위치하다 방향 향하다 멀다 가깝다 쪽 이리""",
    "natura": """물 땅 하늘 바다 산 나무 빛 바람 동물 개 별 해 환경 에너지 새""",
    "tempo": """때 지금 시간 이제 후 전 처음 다음 오늘 날 하루 이번 이후 동안 언제 현재 당시
        시대 과거 미래 요즘 최근 아침 밤 오후 어제 내년 년 달 주 분 초 시 매일 평생 순간
        시기 시절 그때 예전 이전 나중 곧 벌써 이미 아직 늦다 먼저 이젠 마지막 끝 시작
        시작하다 시작되다 끝나다 기간 동시 갑자기 항상 늘 자주 계속 여름 예정""",
    "studio": """학교 학생 교수 교육 대학 배우다 가르치다 연구 일 일하다 회사 기업 직원 작업
        사업 프로젝트 계획 목표 능력 단어 언어 영어 글 읽다 질문 의미 뜻 문서 자료 개념
        기준 과정 방법 방식 결과 문제 해결하다 이해 이해하다 선생님 변호사 회장 대표 운영
        운영하다 관리 제작 생산 산업 선수""",
    "soldi": """돈 사다 팔다 가격 싸다 벌다 달러 원 시장 경제 계약 부동산 혜택 가치 카드 선물""",
    "tecnologia": """프로그램 인터넷 컴퓨터 시스템 데이터 소프트웨어 네트워크 링크 사이트 웹사이트
        홈페이지 코드 디지털 버전 기능 설치 설치하다 사용자 댓글 메시지 기술 서비스 개발
        개발하다 영상""",
    "societa": """정부 대통령 경찰 국가 정치 정책 사회 국민 시민 법 법률 국회 의원 장관 후보
        전쟁 범죄 사건 사고 피해 피해자 감옥 죄 증거 기자 뉴스 방송 언론 소식 논란 단체
        조직 기관 제도 사회적 공식 당 군 총 문화 역사 교회 목사 하나님 악마 신 진실 정의
        책임 삼성""",
    "emozioni": """마음 사랑 사랑하다 좋다 싫다 좋아하다 싫어하다 기분 느낌 느끼다 행복하다 즐겁다
        즐기다 웃다 울다 무섭다 겁 걱정 궁금하다 고맙다 감사하다 미안하다 힘들다 재밌다
        웃기다 바라다 원하다 싶다 꿈 관심 진심 믿다 기대하다 참다 진정하다 맘 착하다 바보
        멍청하다 미치다 대단하다 멋지다 예쁘다 아름답다 기억 잊다 다행 괜찮다 편하다 정신""",
    "comunicare": """말 말하다 이야기 얘기 얘기하다 말씀 소리 듣다 묻다 대화 전화 부르다 알리다
        설명하다 표현 거짓말 이름 네 예 응 아니 그래 안녕하다 들리다 전하다 주장 주장하다
        발표하다 요구하다 제발 닥치다 꺼지다""",
    "svago": """영화 게임 음악 노래 드라마 작품 그림 그리다 사진 찍다 배우 감독 작가 공연 무대
        스포츠 경기 팀 대회 시즌 시리즈 캐릭터 놀다 인기 유명하다 디자인 이기다""",
    "viaggi": """가다 오다 차 차량 자동차 타다 여행 떠나다 돌아가다 돌아오다 들어가다 나가다 나오다
        들어오다 올라가다 다니다 걷다 달리다 호텔 속도""",
    "azioni": """하다 보다 되다 주다 받다 만들다 쓰다 찾다 잡다 두다 놓다 넣다 빼다 열다 닫다 끄다
        자다 쉬다 앉다 서다 일어나다 기다리다 만나다 보내다 가지다 갖다 버리다 바꾸다 돕다
        도와주다 사용하다 이용하다 준비하다 준비 확인하다 시키다 키우다 고치다 자르다 던지다
        붙이다 끌다 옮기다 모으다 나누다 정하다 결정하다 선택하다 선택 결정 데리다 챙기다
        숨기다 지키다 막다 때리다 싸우다 죽이다 살다 살리다 깨다 치다 쏘다 걸다 풀다 올리다
        내리다 남기다 잃다 얻다 구하다 맞추다 노력하다 포기하다""",
}

CATEGORIE["descrivere"] = """크다 많다 높다 작다 새롭다 나쁘다 다르다 어렵다 쉽다 길다 낮다 강하다
    빠르다 짧다 넓다 깊다 젊다 어리다 바쁘다 위험하다 안전하다 특별하다 이상하다 비슷하다
    똑같다 완벽하다 중요하다 필요하다 가능하다 확실하다 심하다 심각하다 엄청나다 옳다 다양하다
    조용히 빨리 열심히"""
CATEGORIE["numeri"] = """하나 둘 두 세 몇 만 조 번 번째 명 첫 많이 조금 좀 모두 전부 다 일부 대부분
    더 양 크기 평균 최대 최고 최초 얼마 얼마나 여러 각 각각"""
CATEGORIE["emozioni"] += " 알다 모르다 생각 생각하다"
CATEGORIE["corpo"] += " 운동"
CATEGORIE["persone"] += " 혼자 생활"
CATEGORIE["soldi"] += " 제품"

# parole volgari o offensive: si vedono solo con il filtro 18+ attivo
ADULTI = set("놈 새끼 닥치다 꺼지다".split())


def mappa():
    m, doppie = {}, []
    for cat, testo in CATEGORIE.items():
        for w in testo.split():
            if w in m and m[w] != cat:
                doppie.append((w, m[w], cat))
            m.setdefault(w, cat)
    return m, doppie
