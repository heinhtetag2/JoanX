// JoanX — lightweight i18n. L(str) returns Korean when active, else the
// English source string. App sets the active language each render.

let __lang = 'en';
function setLang(l) { __lang = l; }
function getLang() { return __lang; }

const KO = {
  // ── app chrome / tabs ──
  'Home': '홈', 'Collect': '컬렉션', 'Battle': '배틀', 'Rewards': '보상',
  'Reports': '리포트', 'Children': '자녀', 'Rules': '설정',
  'Child app': '자녀 앱', 'Parent app': '부모 앱',

  // ── onboarding ──
  'Walk safe, grow your buddy': '안전하게 걷고, 친구를 키워요',
  "JoanX gently notices when you're walking and looking at your phone — and turns staying safe into a game you win.":
    '조안X는 걸으면서 폰을 볼 때를 부드럽게 알아채고, 안전을 즐거운 게임으로 바꿔 줘요.',
  'Get started': '시작하기', 'Pick a mode': '모드 선택', 'mode': '모드',
  'You can change this anytime in the parent app.': '부모님 앱에서 언제든 바꿀 수 있어요.',
  'Smart': '스마트', 'Lite': '라이트',
  'Gentle warnings + character game. For kids who can self-correct.': '부드러운 알림 + 캐릭터 게임. 스스로 조절할 수 있는 아이에게 좋아요.',
  'Simple full-screen block while walking. For younger kids.': '걸을 때 화면을 잠시 막아요. 어린 아이에게 좋아요.',
  'Continue': '다음', 'Finish setup': '설정 완료', 'Back': '뒤로',
  'Allow access': '권한 허용',
  "JoanX still works if you skip one — that feature just turns off. We never read your messages.":
    '하나를 건너뛰어도 조안X는 작동해요 — 그 기능만 꺼질 뿐이에요. 메시지는 절대 읽지 않아요.',
  'Optional': '선택',
  'Motion & Fitness': '동작 및 피트니스', 'Location': '위치', 'Notifications': '알림', 'Screen Time': '스크린 타임',
  'Detects when your child is walking so JoanX can step in at the right moment.': '아이가 걷는 순간을 감지해 조안X가 알맞은 때 도와줘요.',
  'Smart mode only — warns near danger zones while walking. Never tracked at rest.': '스마트 모드 전용 — 걸을 때 위험 구역을 알려줘요. 멈춰 있을 땐 추적하지 않아요.',
  'Sends gentle warnings to your child and updates to you.': '아이에게 부드러운 알림을, 부모님께 소식을 보내요.',
  'Sees when an app is open while walking. Never reads your messages.': '걸을 때 앱이 열려 있는지만 봐요. 메시지는 읽지 않아요.',

  // ── home ──
  'Good afternoon': '안녕하세요', 'Good morning': '좋은 아침이에요',
  "You're protected": '안전하게 보호 중', 'Safely tracking · 47 min safe today': '안전 추적 중 · 오늘 47분 안전',
  'Lite mode · Protected': '라이트 모드 · 보호 중', 'Phone pauses while you walk': '걸을 때 폰이 잠시 멈춰요',
  'Common': '일반', 'Rare': '레어', 'Special': '스페셜',
  'Evolving': '성장 중', 'Level': '레벨', 'Stage': '단계',
  '180 XP to Stage 3 — keep walking safely!': '단계 3까지 180 XP — 계속 안전하게 걸어요!',
  'to': '까지',
  'Safe points': '안전 포인트', 'Day streak': '연속 일수',
  "Today's safe-walk goal": '오늘의 안전 걷기 목표', 'min': '분',
  '13 more minutes phone-free while walking earns a +100 bonus.': '걸으면서 13분 더 폰을 안 보면 +100 보너스를 받아요.',
  'Play': '놀기', 'Collection': '컬렉션', 'Customize': '꾸미기',
  "Today's wins": '오늘의 성과',
  'Stopped in 2s near Oak St.': '오크 거리 근처에서 2초 만에 멈췄어요', '+30 bonus points': '+30 보너스 포인트',
  '20 min safe walking': '20분 안전 걷기', '+200 points': '+200 포인트',
  'Foxy reached Level 7': 'Foxy가 레벨 7 달성', 'New trait unlocked': '새 특성 해금', 'Your buddy leveled up': '친구가 레벨 업했어요',

  // ── safety ──
  'Safety': '안전', "JoanX is watching out for you in the background.": '조안X가 백그라운드에서 지켜주고 있어요.',
  "You're protected": '안전하게 보호 중', 'Active & protected': '활성화 · 보호 중', 'Lite mode active': '라이트 모드 작동 중',
  "Walking + phone use is being watched.": '걷기 + 폰 사용을 지켜보고 있어요.', 'Your phone pauses while you walk.': '걸을 때 폰이 잠시 멈춰요.',
  'Preview a safety moment': '안전 순간 미리보기',
  'mode': '모드', 'Set by your parent': '부모님이 설정함', 'Sensors OK': '센서 정상',
  'Motion · GPS while walking': '동작 · 걸을 때 GPS', 'Motion · no GPS': '동작 · GPS 없음',
  'Danger zones nearby': '근처 위험 구역',
  "You'll only get a heads-up if you walk toward a busy crossing — never just for passing by.": '복잡한 횡단보도로 향할 때만 알려줘요 — 그냥 지나갈 땐 알리지 않아요.',
  'toward': '향해 갈',

  // ── notifications ──
  'Notifications': '알림', 'Mark read': '모두 읽음', 'All caught up': '모두 확인했어요',
  'Today': '오늘', 'Earlier': '이전',
  'JoanX only pings you for safety, rewards, and your buddy.': '조안X는 안전, 보상, 친구 소식만 알려드려요.',
  'Daily reward is ready': '오늘의 보상이 준비됐어요', 'Claim +100 points for walking safely.': '안전하게 걸어서 +100 포인트를 받으세요.', 'Claim': '받기',
  'New danger zone near school': '학교 근처 새 위험 구역', 'A busy crossing was added to your route.': '경로에 복잡한 횡단보도가 추가됐어요.',
  'Nice save near Oak St.': '오크 거리 근처에서 잘했어요', 'You looked up in 2s — +30 bonus points.': '2초 만에 고개를 들었어요 — +30 보너스 포인트.',
  '5-day safe streak!': '5일 연속 안전!', '2 more days unlocks a Special buddy.': '2일 더 하면 스페셜 친구를 해금해요.',
  'You won a battle vs. Bolt': 'Bolt와의 배틀에서 이겼어요', '+120 points and +2 coins earned.': '+120 포인트와 +2 코인 획득.',
  'A grown-up updated your settings': '보호자가 설정을 변경했어요', 'Warning style is now set to “gentle”.': '알림 스타일이 “부드럽게”로 설정됐어요.',

  // ── collection ──
  'Collection House': '컬렉션 하우스', 'Cozy Den': '아늑한 둥지', 'Sky Loft': '하늘 다락', 'Star Studio': '별 스튜디오', 'Garden': '정원',
  'Locked': '잠김', 'Empty': '비어 있음', 'All buddies': '모든 친구',
  'Collect 8 characters': '캐릭터 8마리 모으기', 'Reach a 30-day streak': '30일 연속 달성',

  // ── character detail ──
  'Evolve to Stage': '진화하기 — 단계', 'to evolve': '에서 진화 가능', 'Reach': '필요:',
  'Fully evolved — max stage!': '완전 진화 — 최고 단계!',
  'Battle traits': '배틀 특성', 'Guard': '방어', 'Speed': '스피드', 'Heart': '하트',
  'Color': '색상', 'Items': '아이템', 'Hero Scarf': '히어로 스카프', 'Guardian Cape': '수호자 망토', 'Star Crown': '별 왕관', 'Cool Shades': '멋진 선글라스',
  'Set as my buddy': '내 친구로 설정', 'Evolving!': '진화 중!',

  // ── battle ──
  'Finding opponent…': '상대를 찾는 중…', 'Matching within ±3 levels': '±3 레벨 내에서 매칭 중',
  'Victory!': '승리!', 'So close!': '아쉬워요!', 'Still earned +40 points for trying!': '도전만으로도 +40 포인트를 받았어요!',
  'Battle again': '다시 배틀', 'Back home': '홈으로',
  'battles left today. Battles pause while you\'re walking.': '회의 배틀이 남았어요. 걷는 동안에는 배틀이 멈춰요.',
  'Your fighter': '내 파이터', 'Choose a buddy': '친구 선택', 'Find a match': '매칭 찾기',

  // ── rewards ──
  '5-day streak': '5일 연속', '-day streak': '일 연속', '2 more days for a Special buddy!': '2일 더 하면 스페셜 친구!',
  'Daily safe-walk reward': '매일 안전 걷기 보상', 'Ready to claim · +100 points': '받을 수 있어요 · +100 포인트',
  'Achievements': '업적',
  'First Steps': '첫 걸음', 'Walk safely for 10 minutes': '10분 안전하게 걷기',
  '5-Day Streak': '5일 연속', 'Be safe 5 days in a row': '5일 연속 안전하게',
  'Quick Reflex': '빠른 반응', 'Stop within 3s, 10 times': '3초 안에 멈추기 10회',
  'Zone Dodger': '위험 회피', 'Avoid 5 danger zones': '위험 구역 5번 피하기',
  'Collector': '수집가', 'Own 8 characters': '캐릭터 8마리 보유',
  'Early Walker': '아침 보행자', 'Safe morning commute, 7 days': '7일간 안전한 아침 등굣길',

  // ── profile ──
  'Profile': '프로필', 'My profile': '내 프로필', 'Age': '나이',
  'Buddies': '친구', 'Best streak': '최고 연속', 'days': '일',
  'Preferences': '환경설정', 'Language': '언어', 'Sound effects': '효과음', 'Haptics': '진동',
  'Push notifications': '푸시 알림', 'Account': '계정', 'Protection mode': '보호 모드',
  'Managed by your parent': '부모님이 관리해요', 'Help & support': '도움말 및 지원', 'About JoanX': '조안X 정보',
  'Sign out': '로그아웃', 'This device is managed by a parent or guardian.': '이 기기는 부모님 또는 보호자가 관리합니다.',
  'English': 'English', '한국어': '한국어',

  // ── coins / shop ──
  'Coins': '코인', 'Your coins': '내 코인',
  'Win battles': '배틀 승리', 'Keep streaks': '연속 유지', 'Daily reward': '매일 보상',
  'Mystery Buddy Box': '미스터리 친구 상자', 'Get a random new buddy': '랜덤으로 새 친구를 받아요',
  'Opened': '열었어요', 'Outfits': '의상', 'Owned': '보유', 'Unlock rooms': '방 잠금 해제',
  'Not enough coins yet': '아직 코인이 부족해요', 'unlocked!': '해금!', 'A new buddy': '새 친구',
  'Ribbon Bow': '리본', 'Explorer Cap': '탐험가 모자',
  'Claimed': '받음', 'Claimed — see you tomorrow!': '받았어요 — 내일 또 만나요!', 'Daily reward claimed!': '오늘의 보상을 받았어요!',

  // ── parent ──
  "This week's progress": '이번 주 진행 상황', 'Mina is improving': '미나가 나아지고 있어요',
  'Risky-walking moments': '위험한 보행 순간', 'fewer this week': '이번 주 감소',
  'Risky moments': '위험 순간', 'Safe stops': '안전 멈춤', 'This week': '이번 주',
  'Risky moments by day': '일별 위험 순간', 'Safest day': '가장 안전한 날',
  'Weekly activity': '주간 활동', 'Acceptance': '수용률', 'Build safer habits with Mina': '미나와 안전 습관 키우기',
  'Warning acceptance': '경고 수용률', 'Safe walking': '안전 걷기', 'Avg. response': '평균 반응', 'Safe streak': '안전 연속',
  'How Mina responds to warnings': '미나가 경고에 반응하는 방식',
  'Most warnings end in an immediate stop — exactly what we want.': '대부분의 경고가 즉시 멈춤으로 이어져요 — 바라던 모습이에요.',
  'Immediate': '즉시 멈춤', 'Delayed': '늦은 멈춤', 'Ignored': '무시',
  'What this means': '이게 무슨 의미냐면', 'Mina is reacting faster and ignoring fewer warnings than two weeks ago. The habit is forming — keep it up.': '미나는 2주 전보다 더 빨리 반응하고 경고를 덜 무시해요. 습관이 자리 잡고 있어요 — 계속 응원해요.',
  'Rules & settings': '규칙 및 설정', 'Warnings + game': '경고 + 게임', 'Hard block': '강제 차단',
  'Block while walking': '걸을 때 차단', 'Video': '동영상', 'Games': '게임', 'Social': '소셜', 'Web Browser': '웹 브라우저', 'Camera': '카메라', 'Phone & Texts': '전화 및 문자', 'Always allowed': '항상 허용',
  'Warning sensitivity': '경고 민감도', 'Gentle': '부드럽게', 'Balanced': '균형', 'Strict': '엄격',
  'Warns only in clear risk — fewest interruptions.': '명백한 위험에서만 알려요 — 방해 최소화.', 'Recommended balance of safety and calm.': '안전과 편안함의 권장 균형.', 'Warns earlier and more often.': '더 일찍, 더 자주 알려요.',
  'Time rules': '시간 규칙', 'School commute': '등하굣길', 'After school': '방과 후', 'At home': '집에서',
  'Relaxed': '완화', 'Add a schedule': '일정 추가', 'Playground': '놀이터',

  // ── parent: schedule editor ──
  'Edit schedule': '일정 편집', 'New schedule': '새 일정', 'Schedule name': '일정 이름',
  'e.g. School commute': '예: 등하굣길', 'Protection level': '보호 강도', 'Active days': '활성 요일',
  'Time': '시간', 'Start': '시작', 'End': '종료', 'Save schedule': '일정 저장', 'Delete schedule': '일정 삭제',
  'Notify me of activity': '활동 알림 받기', 'Character game & rewards': '캐릭터 게임 및 보상',
  '2 connected': '2명 연결됨', 'Protected now': '보호 중', 'Offline': '오프라인', 'Battery': '배터리',
  'Privacy first': '개인정보 우선', "JoanX never reads messages or listens. Location is used only in Smart mode while walking, and stored separately from your child's identity.": '조안X는 메시지를 읽거나 엿듣지 않아요. 위치는 스마트 모드에서 걸을 때만 사용되며, 자녀의 신원과 분리해 저장해요.',
  'Last seen': '마지막 접속',

  // ── parent: account settings ──
  'Settings': '설정', 'Subscription': '구독', 'JoanX Family': '조안X 패밀리',
  'of 5 children connected': '/ 5명 연결됨', 'Active': '활성',
  'Weekly summary email': '주간 요약 이메일',
  'Privacy & data': '개인정보 및 데이터', 'Data & privacy': '데이터 및 개인정보',
  'Location history': '위치 기록', 'Export my data': '내 데이터 내보내기', 'General': '일반',

  // ── parent: add a child ──
  'Add a child': '자녀 추가', 'Add child': '자녀 추가하기', 'Connect a new device': '새 기기 연결',
  'How pairing works': '연결 방법',
  'Install JoanX on your child’s phone, open it, and enter the pairing code below. Their device links to your account.':
    '자녀의 휴대폰에 조안X를 설치하고 열어서 아래 연결 코드를 입력하세요. 자녀 기기가 부모님 계정과 연결돼요.',
  "Child's name": '자녀 이름', 'e.g. Mina': '예: 미나', 'Device': '기기',
  'Starting mode': '시작 모드', 'Pairing code': '연결 코드', 'Copy': '복사',

  // ── parent: account detail ──
  'Profile & security': '프로필 및 보안', 'Parent account': '부모 계정', 'Account details': '계정 정보',
  'Name': '이름', 'Email': '이메일', 'Phone': '전화번호', 'Security': '보안',
  'Change password': '비밀번호 변경', 'Two-factor authentication': '2단계 인증', 'Face ID unlock': 'Face ID 잠금 해제',
  'Guardians': '보호자', 'Co-parent': '공동 양육자', 'Invite a guardian': '보호자 초대',

  // ── parent: subscription detail ──
  'JoanX Family plan': '조안X 패밀리 플랜', '/ month': '/ 월', 'Renews': '갱신일',
  "What's included": '포함 사항', 'Up to 5 children': '자녀 최대 5명', 'Smart & Lite modes': '스마트 및 라이트 모드',
  'Live safety warnings': '실시간 안전 경고', 'Weekly progress reports': '주간 진행 리포트', 'Priority support': '우선 지원',
  'Children connected': '자녀 연결됨', 'Manage billing': '결제 관리', 'Change plan': '플랜 변경',

  // ── parent: privacy detail ──
  'Control your data': '데이터 관리', 'Your privacy is protected. JoanX never reads messages or sells your data.': '개인정보는 보호돼요. 조안X는 메시지를 읽거나 데이터를 판매하지 않아요.',
  'Share anonymous analytics': '익명 분석 공유', 'Personalized safety tips': '맞춤 안전 팁',
  'What we collect': '수집 항목', 'Third-party sharing': '제3자 공유', 'None': '없음', 'Delete all my data': '내 데이터 모두 삭제',

  // ── parent: location detail ──
  'Smart mode only': '스마트 모드 전용', 'Location is only used in Smart mode while your child is walking. Never tracked at rest.': '위치는 자녀가 걸을 때 스마트 모드에서만 사용돼요. 멈춰 있을 땐 추적하지 않아요.',
  'Keep location history': '위치 기록 보관', 'Keep for': '보관 기간', 'Recent locations': '최근 위치',
  'Oak St. crossing': '오크 거리 횡단보도', 'School gate': '학교 정문', 'Home': '집', 'Yesterday': '어제', 'Clear history': '기록 지우기',

  // ── parent: export detail ──
  'Download a copy': '사본 다운로드', 'Get a copy of everything JoanX stores about your family.': '조안X가 보관 중인 가족 데이터 전체 사본을 받으세요.',
  'Included in export': '내보내기 포함 항목', 'Reports & activity': '리포트 및 활동', 'Safety events': '안전 이벤트', 'Settings & rules': '설정 및 규칙',
  'Format': '형식', 'Send to': '받는 이메일', 'Request export': '내보내기 요청', "We'll email you a download link shortly.": '곧 다운로드 링크를 이메일로 보내드릴게요.',

  // ── parent: language detail ──
  'Choose your language': '언어를 선택하세요', 'Changes the language across the whole app.': '앱 전체의 언어가 바뀌어요.',

  // ── parent: help detail ──
  "We're here to help": '도움이 필요하신가요', 'Popular questions': '자주 묻는 질문',
  'How does Smart mode work?': '스마트 모드는 어떻게 작동하나요?', 'Is my child’s location private?': '자녀의 위치는 비공개인가요?',
  'How do I add another child?': '자녀를 추가하려면 어떻게 하나요?', 'How are points earned?': '포인트는 어떻게 얻나요?',
  'Contact us': '문의하기', 'Chat with support': '채팅 상담', 'Email us': '이메일 보내기',
  'User guide': '사용자 가이드', 'Video tutorials': '영상 튜토리얼',

  // ── parent: about detail ──
  'A calmer way to keep kids safe while they walk and grow.': '아이들이 걷고 자라는 동안 더 편안하게 지켜주는 방법.',
  'Terms of Service': '서비스 약관', 'Privacy Policy': '개인정보 처리방침', 'Open-source licenses': '오픈소스 라이선스',
  'Rate JoanX': '조안X 평가하기', 'Made with care for safer walks.': '더 안전한 걸음을 위해 정성껏 만들었어요.',

  // ── parent: sign out ──
  'Sign out?': '로그아웃할까요?', 'You can sign back in anytime. Your children stay protected.': '언제든 다시 로그인할 수 있어요. 자녀는 계속 보호돼요.',
  'Cancel': '취소',

  // ── safety moments ──
  'Eyes up,': '고개 들어요,', "Let's put the phone away while we're walking.": '걷는 동안 폰은 잠시 넣어둬요.',
  'One gentle buzz': '부드러운 진동 한 번', 'I looked up': '고개 들었어요',
  'Auto-dismisses in a moment · no nagging': '잠시 후 자동으로 사라져요 · 잔소리 없이',
  "Foxy noticed you're walking. Let's put the phone away and stay safe.": '친구가 걷는 걸 알아챘어요. 폰을 넣고 안전하게 걸어요.',
  'Stop fast for bonus points': '빨리 멈추면 보너스 포인트', 'Eyes up while walking': '걸을 땐 고개 들어요', "Tap when you've looked up": '고개를 들면 눌러요',
  'Nice save!': '잘했어요!', "Stopped in": '멈춤:', "that's an immediate stop.": '즉시 멈춤이에요.', 'points': '포인트',
  "Let's walk first": '먼저 걷고 나서', "Your phone takes a quick break while you're walking. It comes back as soon as you stop.": '걷는 동안 폰이 잠깐 쉬어요. 멈추면 바로 돌아와요.',
  'Calls & texts still work': '전화와 문자는 계속 돼요', 'Unlocks when you stop walking': '걷기를 멈추면 잠금 해제',
};

function L(s) { return getLang() === 'ko' ? (KO[s] != null ? KO[s] : s) : s; }

Object.assign(window, { L, setLang, getLang });
