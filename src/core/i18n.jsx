// JoanX — lightweight i18n. L(str) returns Korean when active, else the
// English source string. App sets the active language each render.

let __lang = 'en';
function setLang(l) { __lang = l; }
function getLang() { return __lang; }

const KO = {
  // ── app chrome / tabs ──
  'Collect': '컬렉션', 'Battle': '배틀', 'Rewards': '보상',
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

  // permissions overview + request sheets
  'A few permissions': '몇 가지 권한',
  'So I can keep you safe while you walk': '걸을 때 너를 지킬 수 있도록',
  'JoanX asks for these one at a time — you decide on each.': '조안X가 하나씩 요청해요 — 각각 직접 정할 수 있어요.',
  'Allow all at once, or tap each one. You can change these anytime in settings.':
    '한 번에 모두 허용하거나, 하나씩 눌러도 돼요. 설정에서 언제든 바꿀 수 있어요.',
  'Allow': '허용', 'Allowed': '허용됨', 'Allow all': '모두 허용', 'Skip for now': '나중에 하기',
  // permission-denied fallback (F-26)
  'Limited': '제한됨', 'Turn on': '켜기', 'Not now': '지금 안 함',
  'Protection will be limited': '보호가 제한돼요',
  'Without these, JoanX keeps running — but some warnings won’t work. You can turn them on anytime in Settings.':
    '이 권한이 없어도 조안X는 계속 작동해요 — 하지만 일부 경고가 작동하지 않아요. 설정에서 언제든 켤 수 있어요.',
  'Go back & allow': '돌아가서 허용하기', 'Continue with limited protection': '제한된 보호로 계속하기',
  'To keep you safe,\nwe need a little help': '너를 지키려면\n도움이 조금 필요해요',
  'For JoanX to notice danger while you walk, the permissions below are needed. Turn them on together with your parents.':
    '걸을 때 조안X가 위험을 알아채려면 아래 권한이 필요해요. 부모님과 함께 켜 주세요.',
  'Pending': '대기 중', 'Turn on one by one': '하나씩 켜기',
  "JoanX notices when you're walking on your phone — and turns staying safe into a game.":
    '조안X는 걸으면서 폰을 볼 때를 알아채고, 안전을 게임으로 바꿔 줘요.',
  'Every safe walk levels you up': '안전하게 걸을수록 레벨업',
  'Earn points, evolve your buddy, and beat the distractions.': '포인트를 모으고 친구를 진화시키며 딴짓을 이겨내요.',
  'Private by design — JoanX never reads your messages': '설계부터 안전하게 — 조안X는 메시지를 절대 읽지 않아요',
  'Private & secure — only used to keep you safe': '비공개로 안전하게 — 너를 지키는 데만 써요',
  'Connect with your parent': '부모님과 연결하기',
  'Ask a parent to scan this in the JoanX Parent app to link your accounts.':
    '부모님께 조안X 부모 앱으로 스캔해 달라고 하면 두 앱이 연결돼요.',
  'Or enter this code': '또는 이 코드 입력', 'or': '또는', "We're connected": '연결했어요',
  "Enter your parent's\nconnect code": '부모님의\n연결 코드를 입력하세요',
  'Open the JoanX Parent app and type the 6-digit code shown there.':
    '조안X 부모 앱을 열고, 화면에 표시된 6자리 코드를 입력하세요.',
  'Connect': '연결하기',
  'Show a QR to scan instead': '스캔용 QR 보여주기',
  'Show this to\nyour parent': '부모님께\n보여주세요',
  'Have a parent scan this QR in the JoanX Parent app to link your accounts.':
    '부모님이 조안X 부모 앱으로 이 QR을 스캔하면 두 앱이 연결돼요.',
  'Enter code instead': '코드로 입력하기',
  'Valid for 5 minutes': '5분간 유효',
  'Expires in': '만료까지', 'This QR expired': 'QR이 만료됐어요', 'Get a new QR': '새 QR 받기',
  'Tap to preview the expired state': '눌러서 만료 화면 미리보기',
  'The 5-minute code ran out. Get a new one to try again.': '5분이 지났어요. 새 QR을 받아 다시 시도하세요.',
  'The QR expired — tap “Get a new QR” to refresh it.': 'QR이 만료됐어요 — "새 QR 받기"를 눌러 새로고침하세요.',
  'Enter all 6 digits of the code.': '코드 6자리를 모두 입력해 주세요.',
  'Connecting': '연결 중',
  "Linking with your parent's app — this only takes a moment.": '부모님 앱과 연결하고 있어요 — 잠깐이면 돼요.',
  'Keep both apps open.': '두 앱 모두 열어 두세요.',
  'Connected!': '연결 완료!', 'Mom': '엄마', "Let's go": '시작하기',
  "You're now linked with your parent and protected together.": '이제 부모님과 연결되어 함께 안전하게 보호돼요.',
  'Linked with parent': '부모님과 연결됨',
  'Your first buddy': '첫 번째 친구',
  'A surprise gift!': '깜짝 선물이 도착했어요!',
  'Walk safely with your parent to grow your buddy together.': '부모님과 안전하게 걸으며 친구를 함께 키워요.',
  "You're linked with your parent. Let's finish setting up.": '이제 부모님과 연결됐어요. 마지막 설정만 끝내면 돼요.',
  'If it expires, create a new code in the Parent app.': '시간이 지나면 부모님 앱에서 새 코드를 만들어 주세요.',
  'Time left': '남은 시간',
  'The code expired — create a new one in the Parent app.': '코드 시간이 지났어요 — 부모님 앱에서 새 코드를 만들어 주세요.',
  "The linking code is valid for 5 minutes. If time runs out, please create a new one in your parent's app.":
    '연결 코드는 5분간 유효해요. 시간이 지나면 부모님 앱에서 새 코드를 만들어 주세요.',
  'To keep you safe while you walk, JoanX asks for these one at a time. You can decide on each.':
    '걸을 때 안전을 지키기 위해 조안X가 하나씩 권한을 요청해요. 각각 직접 정할 수 있어요.',
  'Permission': '권한', 'Allow': '허용',
  'Go to settings': '설정으로 이동', 'Do it later': '나중에 하기',
  'Motion · Activity recognition': '동작 · 활동 인식',
  'Needed to tell whether you are walking.': '걷고 있는지 알기 위해 필요해요.',
  'JoanX uses activity recognition to notice when you start walking, so it only steps in at the right moment.':
    '조안X는 활동 인식으로 걷기 시작하는 순간을 알아채, 딱 알맞은 때에만 도와줘요.',
  'If denied, JoanX can’t tell when you start walking, so warnings won’t trigger.':
    '거부하면 걷기 시작을 알 수 없어 경고가 작동하지 않아요.',
  'Usage access': '사용 정보 접근',
  'Needed to know when the screen is on and which apps are in use.': '화면이 켜져 있는지와 어떤 앱을 쓰는지 알기 위해 필요해요.',
  'This lets JoanX see when the screen is on and which app is open while you walk. It never reads your messages.':
    '걸을 때 화면이 켜져 있는지와 어떤 앱이 열려 있는지 확인해요. 메시지는 절대 읽지 않아요.',
  'If denied, JoanX can’t tell the screen is in use while walking, so warnings are limited.':
    '거부하면 걸을 때 화면 사용을 알 수 없어 경고가 제한돼요.',
  'Display over other apps': '다른 앱 위에 표시',
  'Needed to show a warning when it’s dangerous.': '위험할 때 경고를 보여주기 위해 필요해요.',
  'This permission is needed to show a warning on screen when it’s dangerous while you walk. You will be taken to the settings screen.':
    '걸을 때 위험한 순간 화면에 경고를 띄우기 위해 필요해요. 설정 화면으로 이동해요.',
  'If denied, Smart mode warnings are limited. Vibration and notifications will still work.':
    '거부하면 스마트 모드 경고가 제한돼요. 진동과 알림은 계속 작동해요.',
  'Notifications': '알림',
  'Needed to receive rewards and guidance.': '보상과 안내를 받기 위해 필요해요.',
  'JoanX sends gentle warnings and reward updates to you, and progress notes to your parent.':
    '조안X가 부드러운 경고와 보상 소식을 보내고, 부모님께 진행 상황을 전해요.',
  'If denied, you won’t receive reward and guidance alerts.': '거부하면 보상과 안내 알림을 받을 수 없어요.',

  // ── home ──
  'Good afternoon': '안녕하세요', 'Good morning': '좋은 아침이에요',
  "You're protected": '안전하게 보호 중', 'Active while walking · 47 min safe today': '걸을 때만 활성화 · 오늘 47분 안전',
  'Lite mode · Protected': '라이트 모드 · 보호 중', 'Phone pauses while you walk': '걸을 때 폰이 잠시 멈춰요',
  // home protection edge states (limited / offline)
  'Limited protection': '보호가 제한됨', 'Some warnings are off right now.': '지금 일부 경고가 꺼져 있어요.',
  "You're offline": '오프라인 상태예요', 'Protection paused — reconnect to stay safe.': '보호가 멈췄어요 — 다시 연결해 안전을 지켜요.',
  'Retry': '다시 시도',
  // safety status — walk detection (F-03) + risk score (F-25)
  'Walking detection': '걷기 감지', 'Still right now': '지금은 멈춤',
  'JoanX only steps in after ~10 seconds of walking + phone use — not on the bus or in a car.':
    '걷기 + 폰 사용이 약 10초 이어질 때만 조안X가 나서요 — 버스나 차 안에서는 아니에요.',
  'Risk right now': '지금 위험도', 'Low': '낮음', 'Safe': '안전', 'Risky': '위험',
  'This rises if you look at your phone while walking, and drops as you walk safely.':
    '걸으면서 폰을 보면 올라가고, 안전하게 걸으면 내려가요.',
  // battle daily limit (F-19/A-8)
  "That's your battle for today": '오늘의 배틀은 끝났어요', 'Come back tomorrow': '내일 다시 오세요',
  // character evolution moment (F-16)
  'Ready to evolve!': '진화 준비 완료!', 'XP is full — evolve to the next stage.': 'XP가 가득 찼어요 — 다음 단계로 진화해요.',
  'Evolve': '진화', 'Evolving…': '진화 중…', 'grew stronger': '더 강해졌어요',
  // FAQ / help (parent)
  'What’s the difference between Smart and Lite mode?': '스마트 모드와 라이트 모드의 차이는 뭔가요?',
  'Browse all FAQs': '전체 FAQ 보기', 'Answers to common questions': '자주 묻는 질문',
  'Still need help?': '더 도움이 필요하세요?',
  'Chat with our support team or email help@joanx.app — we usually reply within a day.':
    '고객지원팀과 채팅하거나 help@joanx.app로 메일 주세요 — 보통 하루 안에 답변드려요.',
  'Common': '일반', 'Rare': '레어', 'Special': '스페셜',
  'Evolving': '성장 중', 'Level': '레벨', 'Stage': '단계',
  '180 XP to Stage 3 — keep walking safely!': '단계 3까지 180 XP — 계속 안전하게 걸어요!',
  'to': '까지',
  'Safe points': '안전 포인트', 'Points today': '오늘 포인트', 'Day streak': '연속 일수', 'Safe days': '안전 일수',
  'Safe walking today': '오늘의 안전 걷기',
  'min phone-free': '분 폰 안 보기', 'points per safe minute': '포인트 / 안전 1분',
  "Today's safe-walk goal": '오늘의 안전 걷기 목표', 'Daily goal': '오늘의 목표', 'Next level': '다음 레벨', 'min': '분',
  // today's tasks (home)
  "Today's tasks": '오늘의 미션', 'done': '완료',
  'Finish a phone-free walk': '폰 없이 걷기 끝내기', 'Reach your safe-walk goal': '안전 걷기 목표 달성',
  'Say hi to your buddy': '버디에게 인사하기',
  'All tasks done!': '미션 모두 완료!', 'bonus earned today': '오늘 보너스 획득', 'Tap to complete': '눌러서 완료',
  'Keep your head up and walk safe!': '고개를 들고 안전하게 걸어요!',
  "Today's journey": '오늘의 여정', 'left': '남음',
  'My buddy': '내 친구', 'Claim reward': '보상 받기',
  "Today's missions": '오늘의 미션', 'Done!': '완료!',
  'Walk safely for 60 min': '안전하게 60분 걷기', 'Stop quickly ×3': '빠르게 멈추기 ×3', 'Avoid danger zones': '위험 구역 피하기',
  '13 more minutes phone-free while walking earns a +100 bonus.': '걸으면서 13분 더 폰을 안 보면 +100 보너스를 받아요.',
  'Play': '놀기', 'Collection': '컬렉션', 'Customize': '꾸미기',
  "Today's wins": '오늘의 성과',
  'Stopped in 2s near Oak St.': '오크 거리 근처에서 2초 만에 멈췄어요', '+30 bonus points': '+30 보너스 포인트',
  '20 min safe walking': '20분 안전 걷기', '+200 points': '+200 포인트',
  'Hammy reached Level 7': 'Hammy가 레벨 7 달성', 'New trait unlocked': '새 특성 해금', 'Your buddy leveled up': '친구가 레벨 업했어요',
  // ── home · alternate layouts (timeline feed) ──
  'Daily reward ready': '오늘의 보상 준비됨',
  'Claim +100 points for walking safely.': '안전하게 걸어서 +100 포인트를 받으세요.',
  'Quick reflex — +30 bonus points.': '빠른 반응 — +30 보너스 포인트.',
  'Phone-free the whole way. +200 points.': '걷는 내내 폰 없이. +200 포인트.',

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
  // ── parent activity feed (Alerts tab) ──
  'Alerts': '알림', 'Recent safety activity': '최근 안전 활동',
  'Distraction warning': '주의 경고', 'Near Oak Street crossing': '오크 거리 횡단보도 근처',
  'Safe walk completed': '안전 걷기 완료', '22 min phone-free': '22분 폰 안 보기',
  'Warning ignored': '경고 무시됨', 'Kept scrolling while walking': '걸으면서 계속 스크롤했어요',
  'Device disconnected': '기기 연결 끊김', 'Galaxy A14 went offline': 'Galaxy A14가 오프라인 됐어요',
  'Protection limited': '보호 제한됨', 'Display-over-apps was turned off': '다른 앱 위에 표시 권한이 꺼졌어요',
  '8-day safe streak!': '8일 연속 안전!', 'New personal best': '새로운 최고 기록',
  'Safe morning commute': '안전한 아침 등굣길', 'School route, no warnings': '학교 가는 길, 경고 없음',
  'Device reconnected': '기기 다시 연결됨', 'iPhone 13 back online': 'iPhone 13이 다시 온라인 됐어요',
  'Nothing yet — safety activity will show up here.': '아직 없어요 — 안전 활동이 여기에 표시돼요.',
  'JoanX only pings you for safety, rewards, and your buddy.': '조안X는 안전, 보상, 친구 소식만 알려드려요.',
  'Daily reward is ready': '오늘의 보상이 준비됐어요', 'Claim +100 points for walking safely.': '안전하게 걸어서 +100 포인트를 받으세요.', 'Claim': '받기',
  'New danger zone near school': '학교 근처 새 위험 구역', 'A busy crossing was added to your route.': '경로에 복잡한 횡단보도가 추가됐어요.',
  'Nice save near Oak St.': '오크 거리 근처에서 잘했어요', 'You looked up in 2s — +30 bonus points.': '2초 만에 고개를 들었어요 — +30 보너스 포인트.',
  '5-day safe streak!': '5일 연속 안전!', '2 more days unlocks a Special buddy.': '2일 더 하면 스페셜 친구를 해금해요.',
  'You won a battle vs. Bolt': 'Bolt와의 배틀에서 이겼어요', '+120 points earned.': '+120 포인트 획득.',
  'A grown-up updated your settings': '보호자가 설정을 변경했어요', 'Warning style is now set to “gentle”.': '알림 스타일이 “부드럽게”로 설정됐어요.',

  // ── collection ──
  'Collection House': '컬렉션 하우스', 'Cozy Den': '아늑한 둥지', 'Sky Loft': '하늘 다락', 'Star Studio': '별 스튜디오', 'Garden': '정원',
  'Locked': '잠김', 'Empty': '비어 있음', 'All buddies': '모든 친구',
  // first-run empty states (collection / friends)
  'No buddies yet': '아직 친구가 없어요',
  'Hatch your first egg to start your collection. Every safe walk earns points toward one!':
    '첫 번째 알을 부화시켜 컬렉션을 시작해요. 안전하게 걸을 때마다 알을 얻을 포인트가 쌓여요!',
  'Get your first egg': '첫 번째 알 받기', 'See what you can collect': '모을 수 있는 친구 보기',
  'No friends yet': '아직 친구가 없어요',
  'Add a friend to visit their room, leave likes, and cheer each other on.':
    '친구를 추가해 방을 구경하고, 좋아요를 남기고, 서로 응원해요.',
  'Collect 8 characters': '캐릭터 8마리 모으기', 'Reach a 30-day streak': '30일 연속 달성',

  // ── character detail ──
  'Evolve to Stage': '진화하기 — 단계', 'to evolve': '에서 진화 가능', 'Reach': '필요:',
  'Fully evolved — max stage!': '완전 진화 — 최고 단계!',
  'Battle traits': '배틀 특성', 'Stats': '능력', 'Guard': '방어', 'Speed': '스피드', 'Heart': '하트',
  'Color': '색상', 'Items': '아이템', 'Hero Scarf': '히어로 스카프', 'Guardian Cape': '수호자 망토', 'Star Crown': '별 왕관', 'Cool Shades': '멋진 선글라스',
  'Equipped': '착용 중', 'Tap to equip': '눌러서 착용',
  'Set as my buddy': '내 친구로 설정', 'Evolving!': '진화 중!',

  // ── battle ──
  'Finding opponent…': '상대를 찾는 중…', 'Matching within ±3 levels': '±3 레벨 내에서 매칭 중',
  'Victory!': '승리!', 'So close!': '아쉬워요!', 'Still earned +40 points for trying!': '도전만으로도 +40 포인트를 받았어요!',
  'Battle math': '배틀 계산', 'Safe-walk bonus': '안전 걷기 보너스', 'Your total': '내 총 파워',
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

  // ── points / shop ──
  'Points': '포인트', 'Your points': '내 포인트', 'Min safe': '안전 분',
  'Win battles': '배틀 승리', 'Keep streaks': '연속 유지', 'Daily reward': '매일 보상',
  'Mystery Buddy Box': '미스터리 친구 상자', 'Get a random new buddy': '랜덤으로 새 친구를 받아요',
  'Opened': '열었어요', 'Outfits': '의상', 'Owned': '보유', 'Unlock rooms': '방 잠금 해제',
  // egg & hatch flow (A-2 / F-15)
  'Buddy Egg': '버디 알', 'Hatch a random new buddy': '랜덤으로 새 버디를 부화시켜요',
  'Tap to hatch': '눌러서 부화하기', 'Hatching…': '부화 중…', 'or shake your phone': '또는 폰을 흔들어요',
  'Shake to hatch too': '흔들어도 부화해요', 'Give your phone a little shake': '폰을 살짝 흔들어 보세요',
  'New buddy!': '새로운 버디!', 'Added to your collection': '컬렉션에 추가됐어요',
  'You already have': '이미 가지고 있어요', 'turned into XP': 'XP로 전환됐어요',
  'Add to collection': '컬렉션에 담기', 'Awesome!': '좋아요!', 'Keep it': '데려가기',
  'Chance': '확률',
  'unlocked!': '해금!', 'A new buddy': '새 친구',
  'Ribbon Bow': '리본', 'Explorer Cap': '탐험가 모자',
  'Claimed': '받음', 'Claimed — see you tomorrow!': '받았어요 — 내일 또 만나요!', 'Daily reward claimed!': '오늘의 보상을 받았어요!',

  // ── parent ──
  "This week's progress": '이번 주 진행 상황', 'Mina is improving': '미나가 나아지고 있어요',
  'Loading…': '불러오는 중…',
  'Getting better': '좋아지고 있어요', 'Switch child': '자녀 전환', 'Needs attention': '살펴봐 주세요',
  'On track': '순조로워요', 'Needs a look': '살펴봐 주세요', 'See all details': '자세히 보기', 'All details': '자세히',
  'Risky-walking moments': '위험한 보행 순간', 'fewer this week': '이번 주 감소',
  'Risky moments': '위험 순간', 'Safe stops': '안전 멈춤', 'This week': '이번 주',
  'vs. week start': '주 초 대비',
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
  'Starting mode': '시작 모드', 'Pairing code': '연결 코드', 'Copy': '복사', 'Copy code': '코드 복사',
  // Parent onboarding + auth
  'Parent': '보호자',
  'Stay close, gently': '가까이, 하지만 부드럽게',
  'See how your child is doing through calm weekly reports — guidance, never surveillance.': '차분한 주간 리포트로 아이의 하루를 살펴보세요 — 감시가 아니라 함께하는 거예요.',
  'Safety, in plain words': '쉬운 말로 전하는 안전',
  'JoanX turns each week into a simple summary and nudges you only when it truly matters.': 'JoanX가 한 주를 쉬운 요약으로 정리하고, 정말 필요할 때만 알려드려요.',
  'Create your parent account': '보호자 계정 만들기',
  'Welcome back': '다시 오셨네요',
  'Set up your account to start protecting your child.': '계정을 만들고 아이 보호를 시작하세요.',
  'Sign in to pick up where you left off.': '로그인하고 이어서 계속하세요.',
  'Your name': '이름',
  'e.g. Sora Kim': '예: 김소라',
  'Password': '비밀번호',
  'Forgot password?': '비밀번호를 잊으셨나요?',
  'By continuing you agree to our Terms & Privacy Policy.': '계속하면 이용약관 및 개인정보 처리방침에 동의하게 됩니다.',
  'Create account': '계정 만들기', 'Sign in': '로그인',
  'Basic info': '기본 정보', 'Login details': '로그인 정보',
  'Already have an account?': '이미 계정이 있으신가요?', 'New to JoanX?': 'JoanX가 처음이신가요?',
  'Reset your password': '비밀번호 재설정',
  "Enter your email and we'll send you a link to reset your password.": '이메일을 입력하시면 비밀번호 재설정 링크를 보내드려요.',
  'Send reset link': '재설정 링크 보내기',
  'Check your email': '이메일을 확인하세요',
  'We sent a reset link to': '재설정 링크를 보냈어요:',
  'Back to sign in': '로그인으로 돌아가기',
  // Parent add-child wizard
  'Add your child': '자녀 추가하기',
  'Connect your child’s phone to start keeping them safe — it only takes a minute.': '아이의 휴대폰을 연결하고 안전 보호를 시작하세요 — 1분이면 충분해요.',
  'Tell us a little about your child to set up their device.': '아이의 기기를 설정할 수 있도록 아이에 대해 알려주세요.',
  'Tell us a little about your child to set up their device. You can add more than one.': '아이의 기기를 설정할 수 있도록 아이에 대해 알려주세요. 여러 명을 추가할 수 있어요.',
  'Add another child': '자녀 추가하기', 'Child': '자녀',
  'Add children': '자녀 추가', 'Done': '완료', 'Connect device': '기기 연결하기',
  'Connected': '연결됨', 'Not connected': '연결 안 됨', 'Reconnect device': '기기 재연결', 'Open to connect': '눌러서 연결',
  // reconnect help sheet (device offline)
  'Reconnect': '재연결', 'Reconnect this device': '이 기기 재연결하기', 'Close': '닫기',
  'Open JoanX on their phone': '아이 폰에서 조안X 열기', 'Check Wi-Fi or mobile data': 'Wi-Fi 또는 데이터 확인',
  'Keep the app running in the background': '앱을 백그라운드에서 계속 실행하기',
  'Send a reconnect reminder': '재연결 알림 보내기', 'Reminder sent': '알림을 보냈어요',
  'Waiting to connect': '연결 대기 중', 'Scan or share a code': 'QR 스캔 또는 코드 공유',
  'Switched to a new phone? Reconnect and scan the new QR shown in their JoanX app.': '새 휴대폰으로 바꿨나요? 다시 연결을 눌러, 아이 조안X 앱에 표시된 새 QR을 스캔하세요.',
  // device-change — child requests to move to a new phone; parent confirms by scanning its QR
  'New device connection request': '새 기기 연결 요청', 'Review': '검토하기',
  'Move protection to the new phone?': '보호를 새 휴대폰으로 옮길까요?',
  "'s new phone is ready to connect. Scan it with your phone to move protection here — only one device is protected at a time.": '님의 새 휴대폰이 연결을 기다리고 있어요. 부모님 휴대폰으로 스캔하면 보호가 이 기기로 옮겨져요 — 한 번에 한 기기만 보호돼요.',
  'Current device': '현재 기기', 'New': '새 기기',
  'Scan new phone to confirm': '새 휴대폰 스캔해서 확인', 'Keep current device': '현재 기기 유지', 'Block this device': '이 기기 차단',
  'Action needed': '확인 필요', 'day safe streak': '일 연속 안전',
  "Child's phone number": '자녀 전화번호', "Child's date of birth": '자녀 생년월일',
  'Relationship to you': '아이와의 관계',
  'Son': '아들', 'Daughter': '딸', 'Grandchild': '손주', 'Other child in my care': '그 외 보호 아동',
  'Position among siblings': '형제자매 중 위치',
  'Oldest child': '첫째', 'Middle child': '중간', 'Youngest child': '막내', 'Only child': '외동',
  'Connect their device': '기기 연결하기',
  "Install JoanX on your child's phone, open it, and enter this code.": '아이 휴대폰에 조안X를 설치해 열고, 이 코드를 입력하세요.',
  "Point at the QR shown in your child's JoanX app.": '아이의 조안X 앱에 표시된 QR을 비춰 주세요.',
  'Point at your child’s QR code': '아이의 QR 코드를 비춰 주세요',
  'Scan their QR instead': 'QR 스캔으로 연결하기',
  'Show a code instead': '코드로 대신 연결하기',
  'Connects automatically once scanned.': '스캔하면 자동으로 연결돼요.',
  // global connect entry (Children tab) + child picker
  'Connect a device': '자녀 기기 연결',
  'Scan a QR or enter a code to link.': 'QR 스캔 또는 코드로 연결해요.',
  'Who are we connecting?': '어떤 자녀를 연결할까요?',
  'Choose the child whose phone is in your hand.': '지금 연결할 자녀를 선택해 주세요.',
  'All children are connected!': '모든 자녀가 이미 연결되어 있어요!',
  'Connect a new device?': '새 기기로 연결할까요?',
  'Connect new device': '새 기기로 연결',
  'Skip': '건너뛰기',
  'Enter a valid email address.': '올바른 이메일 주소를 입력하세요.',
  'Use at least 6 characters.': '6자 이상 입력해 주세요.',
  'Show password': '비밀번호 표시', 'Hide password': '비밀번호 숨기기',
  // Create-account fields
  'Fill in your details to get started.': '정보를 입력하고 시작하세요.',
  'User ID': '아이디', 'e.g. user01': '예: user01',
  // User ID duplicate check (Korean-style 중복확인)
  'Check': '중복확인', 'Checking…': '확인 중…',
  'This ID is already taken. Try another.': '이미 사용 중인 아이디예요. 다른 아이디를 입력해 주세요.',
  'Use at least 4 characters.': '아이디는 4자 이상 입력해 주세요.',
  'This ID is available!': '사용할 수 있는 아이디예요!',
  'Phone number': '전화번호', 'Date of birth': '생년월일',
  'Gender': '성별', 'Select': '선택', 'Male': '남성', 'Female': '여성', 'Prefer not to say': '선택 안 함',
  'Email (optional)': '이메일 (선택)',
  'Phone number or ID': '전화번호 또는 아이디', 'ID or phone number': '아이디 또는 전화번호',
  'Select your birth date': '생년월일 선택', 'Next': '다음',
  'Confirm password': '비밀번호 확인', 'Passwords do not match.': '비밀번호가 일치하지 않습니다.',
  'Tell us a bit about you.': '먼저 기본 정보를 알려주세요.', 'Now set up your login details.': '이제 로그인 정보를 설정하세요.',
  'Step': '단계',
  // parent approvals / consent
  'A few quick approvals': '몇 가지만 확인할게요',
  'Confirm these so JoanX can protect your child and keep you informed.': 'JoanX가 아이를 보호하고 소식을 전할 수 있도록 아래 항목을 확인해 주세요.',
  'Safety alerts': '안전 알림', 'Get notified about risky moments and weekly reports.': '위험한 순간과 주간 리포트를 알림으로 받아요.',
  'Location context': '위치 컨텍스트', 'Used only in Smart mode while walking — never continuous tracking.': '걸을 때 스마트 모드에서만 사용해요 — 계속 추적하지 않아요.',
  'Data processing consent': '개인정보 처리 동의', "I agree JoanX may process my child's on-device motion to keep them safe.": '아이의 안전을 위해 기기 내 모션 정보를 처리하는 데 동의해요.',
  "I'm the parent or legal guardian": '저는 보호자 또는 법적 대리인입니다', 'I have the right to set up protection for this child.': '이 아이의 보호 설정을 할 권한이 있어요.',
  'Private & secure — only used to keep your child safe': '비공개로 안전하게 — 아이를 지키는 데만 써요',
  'Linked with your child': '자녀와 연결됨',
  'Device connected!': '기기가 연결됐어요!',
  'You can now set up protection for your child.': '이제 아이의 보호 설정을 시작할 수 있어요.',
  'Configure protection': '보호 설정하기',
  'Set up protection': '보호 설정',
  'Choose what to block while walking. You can change this anytime.': '걸을 때 차단할 항목을 선택하세요. 언제든 바꿀 수 있어요.',
  'Safety alerts': '안전 알림',
  'Get notified about risky moments.': '위험한 순간을 알림으로 받아요.',

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
  // data & privacy — on-device storage (F-23), sync (F-24), always-on (F-27/F-28), log (F-29)
  'On this device': '이 기기에 저장', 'Safety events stored': '저장된 안전 이벤트',
  'Only the latest 100 events are kept on the phone — older ones are removed automatically.':
    '최근 100개 이벤트만 폰에 보관돼요 — 오래된 건 자동으로 삭제돼요.',
  'Auto-sync': '자동 동기화', 'On': '켜짐', 'Last synced 2 min ago': '2분 전에 동기화됨',
  'What gets sent': '전송 항목', 'Events only': '이벤트만',
  'Safety events — never messages, photos or content': '안전 이벤트만 — 메시지·사진·내용은 절대 아니에요',
  'Always-on protection': '상시 보호', 'Secure background service': '안전한 백그라운드 서비스', 'Running': '작동 중',
  'Runs quietly on Android while your child walks': '아이가 걷는 동안 안드로이드에서 조용히 작동해요',
  'Restarts after reboot': '재부팅 후 자동 시작', 'Protection resumes automatically if the phone restarts': '폰이 다시 켜지면 보호가 자동으로 재개돼요',
  'Diagnostic log': '진단 로그', 'Log cleared': '로그를 지웠어요', 'Clear log': '로그 지우기',
  'Walk detected': '걷기 감지됨', 'Warning shown · looked up in 2s': '경고 표시 · 2초 만에 고개 듦',
  'Safe walk complete · +200': '안전 걷기 완료 · +200', 'Synced to cloud': '클라우드에 동기화됨',
  'Kept 7 days on this device for troubleshooting, then deleted.': '문제 해결을 위해 이 기기에 7일간 보관 후 삭제돼요.',

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

  // ── parent: remove child ──
  'Remove child': '자녀 삭제',
  'Remove': '삭제',
  'This unlinks their device and permanently deletes their reports, rules, and safety history. This can’t be undone.': '이 자녀의 기기 연결이 해제되고 리포트·규칙·안전 기록이 영구히 삭제돼요. 되돌릴 수 없어요.',

  // ── safety moments ──
  'Eyes up,': '고개 들어요,', "Let's put the phone away while we're walking.": '걷는 동안 폰은 잠시 넣어둬요.',
  'One gentle buzz': '부드러운 진동 한 번', 'I looked up': '고개 들었어요',
  // grace period — subtle self-correct window before the warning (F-07)
  'Walking — heads up in a sec': '걷는 중 — 잠시 후 알려줄게요', 'Look up now and no warning is needed.': '지금 고개를 들면 경고가 필요 없어요.', "I've got it": '알겠어요',
  // staged escalation (F-08) + timed character message (F-09)
  'Buzz': '진동', 'Warning': '경고', 'Message': '메시지',
  'Eyes up!': '고개 들어요!', 'Phone away for now': '폰은 잠깐 넣어둬요', 'Look ahead!': '앞을 봐요!',
  'still walking': '계속 걷는 중', 'Still on your phone?': '아직 폰 보고 있어요?',
  'Auto-dismisses in a moment · no nagging': '잠시 후 자동으로 사라져요 · 잔소리 없이',
  'Look up soon, or I’ll keep reminding you': '곧 고개를 들지 않으면 계속 알려줄게요',
  "Hammy noticed you're walking. Let's put the phone away and stay safe.": '친구가 걷는 걸 알아챘어요. 폰을 넣고 안전하게 걸어요.',
  'Stop fast for bonus points': '빨리 멈추면 보너스 포인트', 'Eyes up while walking': '걸을 땐 고개 들어요', "Tap when you've looked up": '고개를 들면 눌러요',
  'Nice save!': '잘했어요!', "Stopped in": '멈춤:', "that's an immediate stop.": '즉시 멈춤이에요.', 'points': '포인트',
  "Let's walk first": '먼저 걷고 나서', "Your phone takes a quick break while you're walking. It comes back as soon as you stop.": '걷는 동안 폰이 잠깐 쉬어요. 멈추면 바로 돌아와요.',
  'Calls & texts still work': '전화와 문자는 계속 돼요', 'Unlocks when you stop walking': '걷기를 멈추면 잠금 해제',

  // ── encyclopedias (A-4 / A-9) ──
  'Encyclopedia': '도감', 'Villain Dex': '빌런 도감', 'Dex': '도감',
  'Characters collected': '수집한 캐릭터', 'Villains defeated': '물리친 빌런',
  'of': '/', 'discovered': '발견', 'Stage': '단계',
  'Not yet discovered': '아직 발견하지 못함', 'Defeated': '물리침', 'Now': '지금',
  'Defeat the villain before to reveal': '이전 빌런을 물리치면 공개돼요',
  'Boss': '보스', 'Reward': '보상', 'Start battle': '배틀 시작',

  // villain roster (names + blurbs, A-8/A-9)
  'Smombie Rookie': '스몸비 새내기', 'Smombie Walker': '스몸비 워커', 'Distractor': '방해꾼',
  'Dark Walker': '어둠의 워커', 'Crossroad Phantom': '교차로 유령', 'Alley Stalker': '골목 스토커',
  'Screen Master': '스크린 마스터', 'Attention Reaper': '집중력 사신', 'Doom Walker': '파멸의 워커',
  'King Smombie': '스몸비 대왕',
  'A freshly-hatched screen zombie. Shuffles along, eyes glued to the glow.': '갓 태어난 스크린 좀비. 화면에 눈을 붙인 채 터덜터덜 걸어요.',
  'Walks and scrolls at once — bumps into lampposts, never looks up.': '걸으면서 스크롤까지 — 가로등에 부딪혀도 고개를 들지 않아요.',
  'Pings and buzzes to steal your attention at the worst moment.': '가장 위험한 순간에 알림과 진동으로 집중력을 훔쳐가요.',
  'Crosses the road head-down in the dark. Your next challenge.': '어두운 밤, 고개를 숙인 채 길을 건너요. 너의 다음 도전 상대!',
  'Haunts busy junctions, luring walkers into traffic.': '복잡한 교차로에 숨어 보행자를 차도로 꾀어내요.',
  'Lurks where sightlines are short and cars come fast.': '시야가 좁고 차가 빨리 달리는 골목에 숨어 있어요.',
  'Bends every walker to the pull of the screen.': '모든 보행자를 화면의 유혹에 빠뜨려요.',
  'Harvests focus until nothing is left for the road.': '길을 볼 집중력이 남지 않을 때까지 몽땅 거둬가요.',
  'Marches on, blind to every warning.': '어떤 경고도 못 본 척 앞만 보고 걸어가요.',
  'Ruler of the screen zombies. Beat it to master the streets.': '스크린 좀비의 왕. 물리치면 거리의 진짜 주인이 돼요.',

  // ── battle / villains (A-8) ──
  'Approaching the villain…': '빌런에게 접근 중…', 'Next villain': '다음 빌런', 'Power': '파워',
  "One villain challenge a day. Battles pause while you're walking.": '하루 한 번 빌런에 도전해요. 걷는 동안에는 배틀이 멈춰요.',
  'Come back tomorrow for your next challenge.': '내일 다시 도전할 수 있어요.',

  // ── friends (F-32) ──
  'Friends': '친구', 'Visit': '방문', 'Visit friends': '친구 방문',
  'Visit a friend’s house, leave a like, sign the guestbook.': '친구 집을 방문해 좋아요를 남기고 방명록을 써요.',
  'JoanX has no chat — just friendly visits, likes, and guestbook notes.': 'JoanX에는 채팅이 없어요 — 방문, 좋아요, 방명록만 있어요.',
  '’s house': '님의 집', 'Featured buddy': '대표 친구',
  'Leave a like': '좋아요 남기기', 'Liked!': '좋아요 완료!',
  'Rooms': '방', 'Guestbook': '방명록', 'Write one line…': '한 줄 남기기…', 'Sign': '남기기',

  // ── my profile / house + decoration (A-6 / A-7) ──
  'My Profile': '내 프로필', 'Friends see this': '친구에게 보여요', 'My rooms': '내 방',
  'Change buddy': '친구 바꾸기', 'Decorate rooms': '방 꾸미기', 'Decorate': '꾸미기',
  'House background': '집 배경', 'Not enough points yet': '포인트가 부족해요',
  'Notes your friends left when they visited.': '친구들이 방문하며 남긴 메모예요.', 'Like': '좋아요',
  'Sky': '하늘', 'Sunset': '노을', 'Mint': '민트', 'Grape': '포도', 'Candy': '캔디', 'Night': '밤',
  'Wallpaper': '벽지', 'Decorations': '장식', 'Save room': '방 저장',
  // room styles (A-12)
  'Room style': '방 스타일', 'Cozy': '아늑한', 'Modern': '모던', 'Playful': '발랄한',
  'Add some decorations below': '아래에서 장식을 추가해요', 'Placed': '배치됨', 'Owned': '보유',
  'Plant': '화분', 'Lamp': '램프', 'Rug': '러그', 'Bookshelf': '책장', 'Poster': '포스터', 'Balloons': '풍선',
  'Edit your buddy, background & rooms': '친구·배경·방을 꾸며요', 'Your friends': '내 친구',
  'Friend ranking': '친구 랭킹', 'd streak': '일 연속',
  'Top streak': '최고 연속', 'Online now': '지금 접속 중', 'Last seen recently': '최근에 접속했어요',

  // ── add friends (F-32) ──
  'Add friends': '친구 추가', 'Add': '추가', 'My friend code': '내 친구 코드', 'Copied!': '복사됐어요!',
  'Add by code': '코드로 추가', 'Friend requests': '친구 요청', 'Suggested friends': '추천 친구',
  'mutual friends': '함께 아는 친구', 'Added': '추가됨', 'Request sent!': '요청을 보냈어요!', 'Friend added!': '친구가 추가됐어요!',

  // ── in-scope build (danger zones / GNSS gated off) ──
  'Motion sensor': '모션 센서', 'You beat Distractor': '디스트랙터를 물리쳤어요',
  "JoanX never reads messages, listens, or tracks location. It only uses on-device motion to notice walking, stored separately from your child's identity.": 'JoanX는 메시지를 읽거나 엿듣거나 위치를 추적하지 않아요. 걷기를 감지하는 기기 내 모션만 사용하며, 자녀의 신원과 분리해 저장해요.',

  // ── AI parent report (F-31) ──
  'AI Safety Report': 'AI 안전 리포트', 'This week · Mina': '이번 주 · 미나',
  'In a nutshell': '요약', 'safer': '더 안전', "What's improving": '개선되는 점',
  'Try this at home': '집에서 해보세요', 'Read the AI Safety Report': 'AI 안전 리포트 보기',
  'A plain-language summary of Mina’s week': '미나의 한 주를 쉬운 말로 요약',
  'Fewer risky walking-while-using moments than her first week on JoanX.': 'JoanX 사용 첫 주보다 걸으며 폰을 보는 위험한 순간이 줄었어요.',
  'AI-generated from this week’s activity. It summarizes behavior trends — it never shares raw locations or messages.': '이번 주 활동을 바탕으로 AI가 생성했어요. 행동 추이를 요약할 뿐, 위치나 메시지 원문은 공유하지 않아요.',
};

function L(s) { return getLang() === 'ko' ? (KO[s] != null ? KO[s] : s) : s; }

export { L, getLang, setLang };
