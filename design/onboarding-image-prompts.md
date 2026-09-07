# JoanX 온보딩 — ChatGPT 이미지 프롬프트 세트 (정지 삽화용 v2)

정지 이미지 16컷 · 9:16 풀스크린 · 문구는 이미지에 넣지 않고 UI 텍스트로 올림

**v2에서 바뀐 점**
- 애니메이션이 아니라 **한 장의 정지 그림**으로 뜻이 전달되도록, 추상적 연출을
  전부 눈에 보이는 물리적 형태로 바꿨습니다. ("빛이 흘러간다" → 굵고 선명한
  발광 리본이 화면을 가로지르고, 흐르는 방향이 화살 모양 입자로 보이게.)
- 각 컷에 **카메라·구도·크기 대비**를 명시했습니다. 아이는 3초 안에 읽습니다.
- Rare 캐릭터(Rex·Blaze) 이름 노출 제거 → Common 버디만 등장.
- **아이·배경을 동아시아로 고정** (한국 1차 출시 → 일본·홍콩 확장 대비).
  한국 전용 요소는 빼서 한 세트로 세 시장을 커버합니다. → `0-B. CAST & SETTING`
- **빌런은 생성하지 않고 레포의 완성 아트를 첨부**합니다. 게임 안 빌런과
  온보딩 빌런이 다른 몬스터로 나오던 문제를 막습니다. → `0-V. VILLAIN STYLE ANCHOR`

---

## 0-A. 생성 순서 — 마스터 시트 체계 (★ 이걸 안 지키면 절대 안 맞습니다)

ChatGPT는 매 요청을 **처음부터 새로 상상**합니다. 프롬프트 글이 아무리 정확해도
같은 캐릭터가 두 번 나오지 않습니다. 해결책은 하나뿐입니다 — **앞에서 만든
이미지를 뒤 프롬프트에 첨부해서 "이걸 그대로 쓰라"고 시키는 것.** 그래서 16컷을
평평하게 뽑지 않고 **마스터 시트 4장을 먼저 확정한 뒤 나머지를 파생**시킵니다.

**전제 조건**
- **하나의 ChatGPT 대화창에서 전부 진행하세요.** 대화를 새로 열면 문맥이 사라집니다.
- 매 프롬프트는 `0. STYLE ANCHOR` + (거리 컷이면 `0-B`) + 해당 컷 블록 순으로
  **전문을 매번 다시 붙여넣습니다.** "아까랑 같게"는 통하지 않습니다.
- 마스터 시트는 **마음에 들 때까지 재생성**하세요. 여기서 타협하면 15장이 흔들립니다.

**순서**

| 단계 | 만들 것 | 첨부할 이미지 | 확정되는 것 |
|---|---|---|---|
| 1 | **시트 A** = 컷 7 | **공식 캐릭터 시트** (10종 로스터 이미지) | Common 5종의 형태·색·재질 |
| 2 | **시트 B** = 컷 14 | 시트 A | 알의 껍질색·반점·비율 |
| 3 | **시트 C** = 컷 1 | 시트 A | 아이 외형·옷 색·거리 구조 |
| 4 | **시트 D** — 만들지 않음 | `public/assets/villains/villain1.png` **첨부** | 빌런은 이미 완성 아트가 있음 |
| 5 | 파생 11장 | 아래 표대로 | — |

> **시트 D는 생성하지 마세요.** 빌런 10종은 이미 최종 아트가 레포에 있습니다
> ([public/assets/villains/](public/assets/villains/)). Ping = `villain1.png`,
> Temo = `villain2.png`, Chrono = `villain5.png`, Shatter = `villain7.png`,
> Vilord = `villain10.png`. 빌런이 나오는 컷(2·4·5·6·13)에서는 **해당 PNG를
> 그대로 첨부**하고 "이 캐릭터를 그대로 쓰라"고 지시하세요. 새로 그리게 하면
> 게임 안의 빌런과 다른 몬스터가 나옵니다.

**파생 컷별 첨부물** (각 컷 블록 첫 줄 `CONTINUE FROM …` 에 이미 적혀 있습니다)

| 컷 | 첨부 | 컷 | 첨부 |
|---|---|---|---|
| 3 | A | 10 | C + A |
| 4 | A + `villain1.png` | 11 | A |
| 5 | `villain1.png` + `villain3/5/7.png` | 12 | A + 컷 11 결과 |
| 6 | **컷 5 결과** + `villain10.png` | | |
| 13 | A + `villain1.png` + 컷 11 결과 | | |
| 8 | C + A | 15 | B |
| 9 | **컷 8 결과** + 컷 3 결과 | 16 | **컷 15 결과** |

**특히 중요한 세 쌍** — 여기가 어긋나면 스토리가 무너집니다.
- **5 → 6**: 카메라가 계속 위로 올라가는 **한 번의 동작**입니다. 컷 5는 위쪽을
  어둠으로 비워두고, 컷 6은 컷 5 결과물을 첨부해 같은 보라 안개·같은 조명을
  이어받습니다. 컷 5에서 거대했던 실루엣 3개가 컷 6에서는 **화면 바닥의 개미**로
  다시 나와야, "이 계단의 끝이 저 녀석이었다"가 그림만으로 읽힙니다.
- **8 → 9**: 같은 카메라·같은 아이·같은 거리에서 "고개만 든" 다음 순간이어야 합니다.
  반드시 컷 8 결과물을 첨부하고 `the very next second of the same shot`을 지키세요.
- **14 → 15 → 16**: 같은 알이어야 합니다. 매번 직전 결과물을 첨부하세요.

**그래도 틀어질 때** — 결과가 다르면 새 프롬프트를 쓰지 말고, 그 이미지에 대고
이어서 이렇게만 말하세요:

```
Keep this exact image and change only ONE thing: <바꿀 것>.
Do not redesign the characters, the colors, the materials, the camera angle or
the background. Same render, minimal edit.
```

---

## 0. STYLE ANCHOR (모든 프롬프트 맨 위에 붙여넣기)

```
STYLE: 3D rendered designer vinyl-toy illustration. Characters are built from
simple geometric primitives (star, teardrop, egg, blob) in soft-touch glossy
plastic with subtle matte shading and NO outlines. Faces are flat graphic
decals: diamond-shaped eyes with white highlight triangles, a short thin line
mouth. Chunky rounded stubby feet with a dark sole. Soft studio lighting, gentle
rim light, small contact shadow on the ground.
PALETTE: warm sand cream #F8F7F7 background, ocean blue #447AAF, buddy green
#4B814F, XP gold #D19900, mint #A8C3EB, warm rust #D14532 for danger only.
READABILITY (most important): this is a SINGLE STILL image for a 7-year-old.
One big obvious subject, exaggerated scale contrast, high figure/ground
separation, minimal background clutter. Every idea must be shown as a solid
physical object, never as a subtle mood or a faint effect.
RULES: no text, no letters, no numbers, no logos, no UI chrome, no watermark.
Keep the bottom third of the frame empty and uncluttered for caption text.
Vertical 9:16 full-screen composition.
BUDDIES ONLY — no spikes, no spines, no horns, no tentacles, no fangs, no claws,
no neon purple, no creepy faces. Every buddy is a smooth rounded glossy toy.
(This restriction applies to the buddies alone. Villains follow the separate
VILLAIN STYLE block and are meant to look dark and spiky.)
Children are always shown OUTDOORS and WALKING, never seated at a desk or
indoors. Nothing in any image is gory or bloody.
```

---

## 0-V. VILLAIN STYLE ANCHOR (빌런이 나오는 컷 2·4·5·6·13에 붙여넣기)

**중요 — 이 프로젝트는 시각 언어가 의도적으로 두 개입니다.**

| | 버디 | 빌런 |
|---|---|---|
| 스타일 | 3D 비닐 토이, 무광 파스텔 | 다크 판타지 일러스트, 잉크·에어브러시 |
| 색 | 크림·민트·노랑 | 검정 + 앤티크 골드 + **네온 보라** |
| 형태 | 둥근 기하 도형 | 가시·톱니·갈고리, 흘러내리는 천 |
| 눈 | 납작한 다이아몬드 데칼 | **빛나는 보라색 최면 소용돌이** |

이 대비가 "귀여운 친구 vs 무서운 위협"을 만듭니다. **섞지 마세요.** 두 진영이
한 컷에 나오면 각자 자기 스타일을 유지한 채 한 화면에 있어야 합니다.

```
VILLAIN STYLE: dark fantasy creature illustration, painted and inked, semi-
realistic with heavy rendering — NOT the soft vinyl-toy style used for the
buddies. Matte black bodies with antique brass and gold trim, jagged spikes,
sawtooth mouths, tattered cloth. Glowing neon purple (#A020F0 to #E040FF)
hypnotic spiral eyes that read as swirling vortexes. Purple energy wisps and
splatter droplets flicking off the body. Thin spindly limbs with clawed hands.
Glossy highlights, strong contrast, cinematic rim light.
IMPORTANT: use the attached villain artwork as the exact character design. Do
not redesign it, do not simplify it, do not make it cute or toy-like. Keep its
silhouette, its colors, its eyes and its proportions.
```

---

## 0-G. 브랜드 컬러 시스템 (모든 컷에 적용)

앱 로고는 **#4B814F 브랜드 그린** 하나입니다
([logo-wordmark.svg](public/assets/brand/logo-wordmark.svg)). 삽화에도 이 색이
있어야 온보딩이 JoanX처럼 보입니다. 단, **아무 데나 칠하면 안 됩니다** — 이
스토리는 이미 색으로 편을 나누고 있습니다.

| 색 | 뜻 | 쓰는 곳 |
|---|---|---|
| **브랜드 그린 #4B814F** | JoanX · 버디 · 안전 | 버디의 기운, 신호 링, 회복하는 빛, 초록 식물 |
| **시안 #7FD4E8** | **빼앗기는 힘** | 폰에서 새어나가는 리본, 빌런이 삼킨 빛 |
| **네온 보라** | 빌런 | Ping·Vilord 등 빌런 전용 |
| **골드 #D19900** | Point | 획득·보상 |

**절대 지킬 것 — 초록은 아이가 이겼을 때만 나옵니다.** 컷 1~6(빼앗기는 구간)의
빛은 시안이지 초록이 아닙니다. 여기서 초록을 쓰면 "폰을 보는 게 좋은 일"로
읽힙니다. 초록은 컷 8(신호)에서 처음 등장해, 9(회복)에서 터지고, 이후 계속
남습니다. **관객이 초록을 "안심"으로 학습하게 만드는 장치입니다.**

빼앗기는 구간에도 브랜드를 심는 방법은 **환경**입니다 — 배경의 화분·가로수·낮은
생울타리를 브랜드 그린 계열로 깔면, 의미를 해치지 않으면서 화면에 초록이 남습니다.

```
COLOR SYSTEM: the JoanX brand green (#4B814F) is reserved for the buddies, for
safety, and for anything the child earns. It appears in the environment of every
scene — hedges, street trees, potted plants, painted railings — so the set reads
as one product.
The light being DRAINED from the phones and the children is pale cyan (#7FD4E8),
never green. Nothing that belongs to the villains is ever green.
Green light only radiates from a buddy once the child is doing the right thing.
```

---

## 0-B. CAST & SETTING (아이·거리가 나오는 컷 1·2·8·9·10에 함께 붙여넣기)

1차 시장은 한국, 이후 일본·홍콩 등 아시아권으로 확장합니다. 그래서 **동아시아
아이**로 고정하되, **한국 전용 요소(한글 간판, 한국식 교복·아파트 브랜드)는
넣지 않습니다.** 서울·도쿄·홍콩 어디로도 읽히는 중립적인 동아시아 도시 골목이면
같은 삽화를 세 시장에 그대로 씁니다.

**복장은 보수적으로 고정합니다** — 짧은 반바지·맨다리·치마 금지, 긴바지나 무릎
길이 반바지. 아동 안전 앱이라 심사·학부모 리뷰에서 트집 잡힐 여지를 아예 없애는
쪽이 낫고, **컷 1(시트 C)에서 정해진 옷이 컷 2·8·9·10에 그대로 이어지므로** 여기서
잡아두지 않으면 나중에 다섯 장을 다시 만들어야 합니다.

```
CAST: East Asian children, around 7 to 9 years old. Straight dark hair, warm
light skin. Mixed boys and girls. Simple modern everyday clothes — hoodie,
t-shirt, sneakers, a small backpack. Legs are covered: long trousers, jeans, or
knee-length shorts worn with leggings. No school uniform, no national costume,
no team logos.
MODEST DRESS, non-negotiable for a children's safety app: no short shorts, no
bare thighs, no skirts, no cropped or fitted tops, no exposed midriff or
shoulders. Loose, practical, everyday play clothes on every child.
SETTING: a calm East Asian residential side street that could be Seoul, Tokyo or
Hong Kong — low-rise buildings, tidy pavement, a painted crosswalk, a few potted
plants, thin utility poles and wires, a low guardrail. Signage exists only as
blank colored panels with NO readable characters of any writing system. No
landmarks, no flags, no brand marks.
```

---

## 0-R. 버디 로스터 & 노출 규칙 (버디가 나오는 컷 3·4·7·9·10·11·12·13)

공식 캐릭터 시트 10종. **시트 이미지를 매번 첨부**하고, 아래 표에서 ✅ 인 캐릭터만
그리게 하세요.

| 캐릭터 | 생김새 | 등급 | 온보딩 |
|---|---|---|---|
| **Munch** | 한 입 베어 문 주황 쿠키, 물방울무늬 신발, 막대사탕 | Common | ✅ 이름·모습 그대로 |
| **Milo** | 물어뜯긴 하늘색 아이스바, 물방울 3개, 물결무늬 신발 | Common | ✅ |
| **Lumi** | 노란 별, 별무늬 파란 망토, 흰 러프 칼라 | Common | ✅ |
| **Bolt** | 회색 팔각 너트, 렌치, 금속 부츠 | Common | ✅ |
| **Theo** | 연두 마름모, 학사모, 동그란 안경, 펼친 책 | Common | ✅ |
| **Sailo** | 초록 오각형, 흰 종이배 모자, 스카프 | Rare | ⚠️ 검은 실루엣만 |
| **Rex** | 파란 정육면체, 금관, 별무늬 로브 | Rare | ⚠️ 검은 실루엣만 |
| **Blaze** | 빨간 병뚜껑, 나비넥타이, 지팡이 | Rare | ⚠️ 검은 실루엣만 |
| **Glim** | 보라 육각형, 반짝임, 줄무늬 신발 | Rare | ⚠️ 검은 실루엣만 |
| **Dewey** | 민트 물방울, 졸린 눈, 회색 곰인형 | **Epic** | ❌ **절대 금지** |

**규칙**
- **Common 5종만** 이름과 모습을 그대로 씁니다.
- **Rare 4종**은 이름·색·소품(왕관·병뚜껑·종이배·반짝임) 일절 금지. 컷 5·13의
  "아직 못 만난 빌런" 자리처럼 **검은 실루엣**으로만 암시할 수 있습니다.
- **Dewey는 Epic이라 존재 자체를 숨깁니다.** 민트색 물방울 형태, 회색 곰인형,
  졸린 눈 — 이 세 요소가 한 컷에라도 들어가면 Epic이 새어 나갑니다.
- 특정 한 마리를 클로즈업해 주인공으로 세우지 않습니다. 랜덤 부화인데 한 마리를
  기대하게 만들면 첫 부화가 실망으로 시작합니다.

```
BUDDY ROSTER (use the attached character sheet as the exact designs): the only
buddies allowed in this image are MUNCH (an orange cookie with a bite taken out
of it, polka-dot shoes), MILO (a light blue popsicle with a bite out of the top
and three water droplets above it, wave-pattern shoes), LUMI (a yellow star in a
blue star-patterned cape with a white ruff collar), BOLT (a grey octagonal nut
holding a wrench, metal boots) and THEO (a yellow-green diamond in a graduation
cap and round glasses, holding an open book).
Every buddy is a glossy vinyl toy: a flat geometric body shape standing on one
short leg that splits into two chunky rounded shoes, with a flat graphic face —
two black-and-white diamond eyes and a short thin line mouth.
FORBIDDEN, do not draw under any circumstance: a mint or pale-blue TEARDROP
shape, a grey teddy bear, sleepy half-closed eyes, a blue cube with a crown, a
red bottle cap, a green pentagon with a paper boat hat, a purple hexagon.
```

---

---

## 0-S. 세계관 한 장 — "폰이 나쁜 게 아니야"

**문구**
- KO — 스마트폰이 나쁜 건 아니야. 걸으면서 계속 보는 게 문제지.
- MY — စမတ်ဖုန်းက ဆိုးတာ မဟုတ်ဘူး။ လမ်းလျှောက်ရင်း ဆက်ကြည့်နေတာက ပြဿနာ။

이 문장은 **비교문**입니다. "A가 아니라 B가 문제다" — 그래서 그림도 하나가
아니라 **둘을 나란히** 놓아야 합니다. 하늘에 그림자를 띄우는 식의 단일 구도로는
"폰은 괜찮다"는 전반부가 그려지지 않습니다.

**절대 놓치면 안 되는 한 가지 — 오른쪽 아이도 폰을 들고 있어야 합니다.**
폰을 아예 안 든 아이를 그리면 그림의 메시지는 "폰을 버려라"가 됩니다. 폰을 든 채
고개만 든 아이여야 "문제는 폰이 아니라 **보면서 걷는 것**"이 증명됩니다. 이 앱은
폰을 뺏는 앱이 아니라 **걸을 때만 고개를 들게 하는 앱**이고, 이 한 장이 학부모에게
그 차이를 설명하는 그림입니다.

```
CONTINUE FROM MASTER SHEET C (the street) AND MASTER SHEET A (the buddy cast), both attached: the same street, the same children, the same buddies. Do not redesign anything.

One sunny East Asian residential street, seen straight down its length, split by
composition into two halves that a child reads as a before/after pair. Same
street, same daylight, same moment — only the two children behave differently.

LEFT HALF — the drained lane. A child of about 8 walks with their head tilted
straight down at a phone held in both hands, face lit by the screen. Around them
the air has gone violet: a swarm of dark villain creatures with glowing purple
spiral eyes crowds their shoulders, purple mist pooling around their shoes, the
greenery behind them desaturated to grey-violet. Their buddy trails a step
behind, small and grey and slumped, unable to get their attention.

RIGHT HALF — the safe lane. Another child of the same age walks with their head
UP, looking straight ahead down the street, smiling. CRITICAL: this child is
still holding a phone — visibly, in one hand, lowered to their side, screen
still on. They have not put it away, they have simply stopped staring at it.
Warm sunlight, real green foliage. Glowing golden footprints light up the
pavement behind them and an arc of golden star-coins rises from their path.
Their buddy strides beside them, bright and full-colour, one arm up in triumph.

CENTRE: the two halves meet along the middle of the pavement, where the violet
mist stops in a clean vertical line against the golden light. No fence, no wall
— just the two atmospheres meeting.

THE PHONES ARE IDENTICAL AND ORDINARY in both halves: same plain handset, no
glow, no cracks, no evil aura, no skull, no monster face on the screen. The
phone is never drawn as the villain. What differs between the two halves is only
where the child is looking.

MOOD BALANCE: about 60 percent of the frame is the bright safe half. Nothing is
gory and no child is in danger — the left child is distracted, not hurt.

Vertical 9:16, low kid's-eye camera, deep perspective down the street, clean
uncluttered bottom third for the caption.
```

**어디에 쓰나** — 온보딩 스토리의 **마지막 스토리 컷**으로 씁니다(현재 앱의
`10.png`). 맨 앞에 놓으면 아직 빌런도 버디도 못 본 아이에게는 추상적인 주장일
뿐이고, 아홉 컷을 본 뒤에 놓으면 방금 본 이야기의 결론으로 떨어집니다.
학부모용 스토어 스크린샷·소개 자료로도 이 한 장이 가장 잘 통합니다.

---

## 1. 이상한 일

```
CONTINUE: none — this is MASTER SHEET C (the child and the street). Generate this THIRD. Lock the child’s hair, clothing colors and the street layout here; every later street shot reuses them exactly.

Wide vertical shot of a sunny East Asian residential side street. Three East
Asian children, 7 to 9 years old with straight dark hair in simple everyday
clothes, walk in a row along the pavement, all heads tilted straight down at
their phones, faces half hidden by their hair. From each phone screen rises ONE
thick, clearly visible ribbon of pale cyan light — solid and rope-like, not a
faint glow — curving up out of frame like smoke from a chimney. Everything else
in the scene is flat, plain and normal so the three light ribbons are the only
strange thing. Blank signage with no readable characters. Bright daylight, clean
background, empty pavement across the bottom third. The street planting —
potted plants, a street tree, a low hedge — is a rich brand green (#4B814F), the
only strong green in the frame.
```

**화면 문구 (이미지에 넣지 말고 UI 텍스트로 올릴 것)**
- KO — 요즘, 이상한 일이 벌어지고 있어.
- MY — အခုတလော ထူးဆန်းတဲ့ အရာတွေ ဖြစ်နေတယ်။

---

## 2. Ping 등장

```
CONTINUE FROM MASTER SHEET C (attached) for the child, the clothes, the street and the daylight. USE THE SECOND ATTACHED IMAGE (villain1.png) as the EXACT character design for the Ping creatures — copy its silhouette, its matte black spiky sphere body, its glowing neon purple spiral eyes, its small fanged mouth, its thin clawed limbs and its purple splatter. Do NOT redesign it, do NOT simplify it, do NOT make it cute or toy-like.

An East Asian child of about 8 WALKING OUTDOORS on a residential street,
mid-stride, seen from the front at chest height, holding a phone up in both
hands. Not sitting, not indoors, not at a table. The phone screen is a blank
pane of pale purple light with no readable text or icons.

Floating in the air around the phone are FOUR Ping creatures, drawn exactly like
the attached villain artwork. Each is small — about the size of a grapefruit,
clearly smaller than the child's head — so they read as pests, not as a threat
that could hurt the child. The nearest one perches on the top edge of the phone
and holds up a blank notification speech bubble like a lure. Thin purple threads
run from their claws down to the phone screen, pulling the child's gaze
downward.

KEEP IT KID-SAFE through staging, not through redesign: bright open daylight, a
pale uncluttered background, the creatures small and outnumbered by open space,
no creature touching the child, no snarling, no blood, no gore. The child is
rendered in the soft everyday style and the creatures in the dark painted
villain style — this clash of styles is intentional and must be preserved.
```

**화면 문구 (이미지에 넣지 말고 UI 텍스트로 올릴 것)**
- KO — 이 녀석들은 우리가 화면에서 눈을 떼지 못하게 해.
- MY — ဒီကောင်တွေက ငါတို့ကို ဖန်သားပြင်ကနေ မျက်လွှာ မဖယ်နိုင်အောင် လုပ်တယ်။

---

## 3. 캐릭터가 아프다

```
CONTINUE FROM MASTER SHEET A and the attached character sheet: the exact same buddies, same shapes, same colors, same materials, same faces. Change ONLY their pose and their health.

Three buddies sit on plain cream ground in front of a low brand-green (#4B814F)
hedge, clearly sick and drained. LEFT is
LUMI, the yellow star in the blue star-patterned cape — two of her five points
are visibly wilted and bent downward and her cape hangs limp. CENTRE is MUNCH,
the orange bitten cookie — slumped sideways, his lollipop drooping in his hand.
RIGHT is THEO, the yellow-green diamond in the graduation cap and round glasses
— sitting with his head hanging, his book closed and fallen at his feet, his
glasses slipping down.

The lower half of every body has washed out to flat grey, as if the color is
literally draining downward out of them. Their diamond eyes droop and each has a
small blue teardrop beside it. Their mouths are short downward curves. Sad and
gentle, NOT scary, no injuries. Same glossy vinyl-toy style as the sheet, soft
even light, plain uncluttered background.
```

**화면 문구 (이미지에 넣지 말고 UI 텍스트로 올릴 것)**
- KO — 특히 걸으면서 화면을 계속 보고 있으면… 우리까지 아파져.
- MY — အထူးသဖြင့် လမ်းလျှောက်ရင်း ဆက်ကြည့်နေရင်… ငါတို့တောင် နာလာတယ်။

---

## 4. 빌런의 성장

```
CONTINUE FROM MASTER SHEET A (attached) for the buddies. USE THE ATTACHED VILLAIN ARTWORK (villain1.png) as the exact design of the Ping on the right — same black spiky sphere, same glowing purple spiral eyes, same clawed limbs, same purple splatter, only scaled up enormously. No new character designs.

Split composition, read left to right. LEFT SIDE: LUMI, MUNCH and THEO from the
previous shot, shrunken, grey and drooping, with thick glowing cyan ribbons pulled OUT of their
chests. The ribbons stretch across the middle of the frame with visible
arrow-shaped light particles flowing rightward along them. RIGHT SIDE: the Ping
creature from the attached artwork, now ENORMOUS — four times the height of the
buddies, its black body swollen and glossy, veins of stolen cyan light glowing
through the cracks between its spikes, its purple spiral eyes burning brighter
and wider than in the reference. Heavy purple splatter around it. The extreme
size contrast is the whole point of the image. Pale background so both sides
read clearly.
```

**화면 문구 (이미지에 넣지 말고 UI 텍스트로 올릴 것)**
- KO — 우리가 약해질수록, 저 녀석들은 더 강해지지.
- MY — ငါတို့ အားနည်းလေလေ၊ ဟိုကောင်တွေ ပိုအားကောင်းလေလေ။

---

## 5. 더 강한 빌런들

```
USE THE ATTACHED ARTWORK as the exact designs: villain1.png is the fully lit creature in front, and villain3 / villain5 / villain7 are the three shapes behind it — but those three must appear ONLY as solid black silhouettes, so their designs stay hidden.

A staircase of villains receding into violet fog, arranged clearly by size from
front to back. FRONT: the Ping creature from villain1.png, fully lit and
detailed exactly as in the reference, small. BEHIND IT: three progressively
taller villain shapes taken from the other attached artworks, each roughly
double the height of the one before, rendered as pure black silhouettes with a
hard neon purple rim light and two glowing purple spiral eyes — no surface
detail, no color, no readable features at all. The tallest one at the back
nearly touches the top of the frame. Strong depth, clear stepped size ladder,
ominous but not gruesome, no gore.

CONNECTION TO THE NEXT SHOT — compose for it deliberately: the camera is already
tilted slightly upward, the size ladder climbs from lower-left to upper-right,
and the top of the frame is left OPEN and swallowed in violet-black darkness.
The ladder must feel unfinished, as if it keeps climbing past the top edge into
something the viewer cannot see yet.
```

**화면 문구 (이미지에 넣지 말고 UI 텍스트로 올릴 것)**
- KO — Ping은 시작일 뿐이야. 훨씬 골치 아픈 녀석들이 기다리고 있어.
- MY — Ping က အစသာ။ ပိုခေါင်းခဲစရာ ကောင်တွေ စောင့်နေတယ်။

---

## 6. Vilord

```
CONTINUE FROM THE PREVIOUS IMAGE (the villain ladder, attached): this is the SAME place, the same violet fog, the same lighting — the camera has simply kept tilting upward past the top edge of that shot to reveal what the ladder was climbing toward. Carry over the identical fog color and grain so the two images read as one continuous move.

ALSO USE THE ATTACHED ARTWORK (villain10.png, Vilord) as the exact design — but show only a FRAGMENT of it. Keep its spiked crown, its dark robed mass, its brass trim and its purple vortex light. Do not reveal the full figure and do not show its central eye.

Dark chamber, low camera looking steeply up. ALONG THE BOTTOM EDGE, small and
far below, the same three black villain silhouettes from the previous image are
still standing in their size ladder — now tiny, dwarfed, clearly the same shapes
with the same purple spiral eyes. This is the payoff: the giants of the last
image are ants here. Scattered among them, a dozen small phone-shaped rectangles
glow in the dark like candles, each showing a faint purple spiral. From every
single one a bright purple ribbon rises, passes the silhouettes, and converges
into ONE point high above. At the top of the frame only a fragment of Vilord is
visible: the heavy lower hem of its dark robe, one brass chain, and a single
sharp glint off the edge of its spiked crown. Everything above that is swallowed
in black. The scale should feel like a mountain seen from below. Deep violet and
iron. Ominous and mysterious but kid-safe — no visible face, no eye, no teeth,
no blood.
```

**화면 문구 (이미지에 넣지 말고 UI 텍스트로 올릴 것)**
- KO — 그리고 녀석들의 우두머리는… 우리의 마음까지 노리고 있어.
- MY — ပြီးတော့ သူတို့ခေါင်းဆောင်က… ငါတို့စိတ်ကိုပါ ပစ်မှတ်ထားတယ်။

---

## 7. JoanX 캐릭터들

```
USE THE ATTACHED CHARACTER SHEET as the exact designs. This image becomes MASTER SHEET A (the buddy cast in a scene) — generate it FIRST, before any other image in the set, since every later buddy shot reuses it. Draw ONLY these five and no others.

The five Common buddies stand together in a loose huddle in the centre of a
plain cream background, seen as a GROUP — no single one is featured, none is
closer to camera than the others, all the same height on the same ground line:
MUNCH the orange bitten cookie with his lollipop, MILO the light blue popsicle
with three droplets above him, LUMI the yellow star in her star-patterned cape,
BOLT the grey octagonal nut with his wrench, and THEO the yellow-green diamond
in his graduation cap and glasses.

They are NOT in heroic poses — each is doing something goofy and individual: one
yawns, one looks the wrong way, one puffs up too proudly, one waves, one is
reading and not paying attention. Warm, funny, ordinary. Even lighting, clean
uncluttered bottom third.

DO NOT DRAW any other character: no mint teardrop, no teddy bear, no blue cube
with a crown, no red bottle cap, no green pentagon, no purple hexagon.
```

**화면 문구 (이미지에 넣지 말고 UI 텍스트로 올릴 것)**
- KO — 그래서 우리가 녀석들과 싸우고 있지. 뭐… 쉽진 않지만.
- MY — ဒါကြောင့် ငါတို့ သူတို့နဲ့ တိုက်နေတာ။ ဟုတ်တယ်… လွယ်တော့ မလွယ်ဘူး။

---

## 8. 신호

```
CONTINUE FROM MASTER SHEETS C AND A (both attached): the same child, clothes and street as C; MILO exactly as he appears in A and on the character sheet.

Over-the-shoulder view of an East Asian child, about 8, with straight dark hair
and a small backpack, walking on the pavement of a calm East Asian residential
street, phone held up in front of them. MILO, the light blue popsicle buddy, has climbed onto the TOP EDGE of the phone
from outside the screen and is leaning over into the child's view, both arms
raised, waving hard. Three concentric glowing green rings pulse outward from the
buddy like a big obvious signal. The buddy is clearly OUTSIDE the screen,
standing on the phone's frame. Bright daylight, blurred street behind, crisp
sharp subject.
```

**화면 문구 (이미지에 넣지 말고 UI 텍스트로 올릴 것)**
- KO — 걸을 때 우리가 신호를 보내면, 잠깐 화면에서 눈을 떼 줘.
- MY — လမ်းလျှောက်ချိန် ငါတို့ အချက်ပြရင်၊ ခဏ ဖန်သားပြင်ကနေ မျက်လွှာဖယ်ပေး။

---

## 9. 경고 수용

```
CONTINUE FROM THE PREVIOUS IMAGE (the signal shot, attached): keep the identical camera angle, identical street, identical child and clothes. Change ONLY the head lift, the lowered phone and the snapped ribbon. This must read as the very next second of the same shot.

The same East Asian child from the signal shot, now with the phone lowered to
their side and their head lifted, looking ahead down the same bright East Asian
residential street. The thick cyan ribbon that used to run
from the phone is visibly SNAPPED in the middle of the frame, its broken end
curling and fading into sparkles. In the foreground the three buddy toys have
turned bright and saturated again: LUMI's bent star points spring back straight
and her cape lifts, MUNCH stands upright with his lollipop held high, and THEO
raises his head and opens his book again. Fresh sunlight, relieved and energetic. Deliberately the mirror image
of the sick version.
```

**화면 문구 (이미지에 넣지 말고 UI 텍스트로 올릴 것)**
- KO — 그래! 그러면 녀석들은 약해지고, 우리는 다시 힘을 얻어.
- MY — ဟုတ်ပြီ! ဒါဆို သူတို့ အားနည်းပြီး ငါတို့ ခွန်အား ပြန်ရတယ်။

---

## 10. Point 획득

```
CONTINUE FROM MASTER SHEETS C AND A (both attached): same street surface and light as C, LUMI exactly as she appears in A and on the character sheet.

Low camera on the sunny pavement of the same East Asian residential street. A
child's sneaker footprints recede into the distance,
and each footprint has turned into a big glowing golden coin standing upright in
the ground. The coins arc up through the air along a clear curved path and pour
into a growing gold pile beside LUMI, the yellow star buddy, who throws both
arms up in delight. Warm gold light, chunky readable coin shapes with no numbers
or symbols on them, sparkle particles. Cheerful and obvious.
```

**화면 문구 (이미지에 넣지 말고 UI 텍스트로 올릴 것)**
- KO — 네가 잘해낼 때마다 Point도 모을 수 있어.
- MY — မင်း ကောင်းကောင်းလုပ်တိုင်း Point စုနိုင်တယ်။

---

## 11. 성장과 진화

```
CONTINUE FROM MASTER SHEET A and the character sheet (both attached): show BOLT, the grey octagonal nut buddy, twice. Both figures must be unmistakably the same Bolt.

Clean side-by-side comparison on a plain cream background, both figures standing
on the same ground line. LEFT: a small round baby buddy, half the height of the
one on the right, big wide alert eyes, plain smooth body. RIGHT: the exact same
character grown up — clearly taller and sleeker, confident squinting eyes,
deeper saturated color, small gold accent details. A thick gold arrow of light
sweeps from left to right between them. Obviously the SAME character twice, only
bigger and cooler. Even lighting, no background clutter.
```

**화면 문구 (이미지에 넣지 말고 UI 텍스트로 올릴 것)**
- KO — Point를 모으면 친구를 키우고, 더 멋진 모습으로 진화시킬 수 있어.
- MY — Point စုရင် သူငယ်ချင်းကို မွေးမြူပြီး ပိုလှတဲ့ ပုံစံ ဆင့်ကဲနိုင်တယ်။

---

## 12. 꾸미기

```
CONTINUE FROM MASTER SHEET A and the growth shot (attached): BOLT again, the same buddy from the growth shot, now dressed. Same body, same face, same material.

A cheerful buddy toy standing in the middle of a cosy kid's room built from the
same glossy toy materials — small rug, shelf, potted plant, lamp. The buddy is
visibly WEARING a little hat and a coat. Floating in a neat ring around it, laid
out in the air like a sticker sheet, are six more obvious accessory items: a
cap, a scarf, sunglasses, boots, a backpack, a star-shaped hair clip. Each item
is separated and clearly readable, never overlapping. Bright pastel, playful.
```

**화면 문구 (이미지에 넣지 말고 UI 텍스트로 올릴 것)**
- KO — 옷도 입히고, 방도 네 마음대로 꾸밀 수 있고.
- MY — အဝတ်လည်း ဝတ်ပေးလို့ရ၊ အခန်းလည်း စိတ်ကြိုက် အလှဆင်လို့ရ။

---

## 13. 빌런 대결

```
CONTINUE FROM MASTER SHEET A and the growth shot (attached) for BOLT on the left. USE THE ATTACHED VILLAIN ARTWORK (villain1.png) as the exact design of the creature on the right. Two different art styles share one frame on purpose — keep the buddy soft and toy-like, keep the villain dark and painted.

Split-screen face-off, camera at ground level. LEFT: the grown buddy toy
standing tall and braced, feet planted, warm green aura, filling the full height
of its half, rendered in the soft vinyl-toy style. RIGHT: the Ping creature from
the attached artwork, grown large, leaning in toward the buddy, purple spiral
eyes glowing, splatter trailing behind it. BEHIND the villain, receding into
violet fog, three taller villain silhouettes wait in a size ladder — solid black
shapes with glowing purple eyes, no detail. Warm cream light on the left, cold
violet on the right, a hard vertical line of contrast down the middle. Tense but
not violent — no weapons, no impact, no damage, no gore.
```

**화면 문구 (이미지에 넣지 말고 UI 텍스트로 올릴 것)**
- KO — 친구가 강해지면 더 강한 녀석들에게도 도전할 수 있어.
- MY — သူငယ်ချင်း အားကောင်းလာရင် ပိုအားကောင်းတဲ့ ကောင်တွေကိုပါ စိန်ခေါ်နိုင်တယ်။

---

## 14. Egg 발견

```
CONTINUE: none — this is MASTER SHEET B (the egg). Generate this SECOND. The egg’s shell color, speckle pattern and proportions defined here must never change again.

One single large egg resting exactly in the center of a calm, almost empty cream
space. Smooth glossy speckled vinyl shell with a soft warm rim light and a small
contact shadow beneath it, plus a faint circle of light on the ground around it
like a spotlight. NOTHING else in the frame — no characters, no props, no
pattern. Hushed, still, full of anticipation. Generous negative space above and
across the bottom third.
```

**화면 문구 (이미지에 넣지 말고 UI 텍스트로 올릴 것)**
- KO — 그런데 말이야… 모든 친구는 처음엔 이렇게 시작해.
- MY — ဒါပေမဲ့… သူငယ်ချင်းတိုင်း အစမှာ ဒီလိုပဲ စတာ။

---

## 15. Egg의 비밀

```
CONTINUE FROM MASTER SHEET B (attached): the identical egg — same shell color, same speckles, same proportions. Change ONLY the lighting and the camera distance.

Tight close-up of the same egg filling most of the frame, in a darkened cream
room. Inside the shell a warm golden glow is clearly visible through the
translucent surface, bright at the center and diffusing outward. The glow is a
plain soft ORB of light only — absolutely no creature shape, no silhouette, no
eyes, no limbs, no wings, nothing that hints at what is inside. Warm light
spilling onto the ground around the egg. Mysterious, warm, inviting.
```

**화면 문구 (이미지에 넣지 말고 UI 텍스트로 올릴 것)**
- KO — 이 안에서 누가 태어날지는 아무도 몰라.
- MY — ဒီထဲက ဘယ်သူ မွေးဖွားမလဲ ဘယ်သူမှ မသိဘူး။

---

## 16. 시작

```
CONTINUE FROM THE PREVIOUS IMAGE (the glowing egg, attached): the identical egg again. Change ONLY the tilt, the cracks and the escaping light.

The same egg, tilted off balance and mid-wobble, with three clear jagged cracks
spreading across the shell and a bright blade of golden light bursting out
through the largest crack. A few small shell chips fly off. Frozen at the exact
instant BEFORE it opens — the shell is still closed, nothing inside is visible,
no creature shape, no silhouette. Radiating gold light, motion streaks, maximum
anticipation.
```

**화면 문구 (이미지에 넣지 말고 UI 텍스트로 올릴 것)**
- KO — 자… 네 첫 번째 친구는 누가 될까?
- MY — ကဲ… မင်းရဲ့ ပထမဆုံး သူငယ်ချင်း ဘယ်သူ ဖြစ်မလဲ?

---

## 사용 팁

1. **순서와 첨부는 `0-A. 생성 순서`를 그대로 따르세요.** 프롬프트만 좋아도
   순서를 지키지 않으면 매번 다른 게임처럼 나옵니다.
2. 마스터 시트 A를 만들 때 **공식 캐릭터 시트(10종 로스터 이미지)를 첨부**하세요.
   레포의 `public/assets/characters/client/milo-plain.png`는 **첨부하지 마세요** —
   그 아트는 민트 물방울, 즉 **Epic인 Dewey**입니다. 파일명만 Milo일 뿐입니다.
3. 문구는 각 컷 아래에 적어두었지만 **이미지에는 넣지 마세요** — ChatGPT는
   한글·버마 문자를 거의 항상 깨뜨리고, 어차피 2개 언어를 얹으려면 UI 텍스트여야
   합니다. 프롬프트의 "bottom third empty"가 그 자리를 비워둡니다.
4. 미얀마어 문구는 PDF 추출 시 깨진 결합문자를 복원한 것이라 **배포 전 원본
   docx / 원어민으로 대조**해 주세요.
5. 16컷은 아이에게 깁니다. **짧은 버전 9컷 권장: 1 → 2 → 3 → 4 → 8 → 9 → 10 →
   14 → 16** (11·12·13은 게임 내 첫 진입 툴팁으로).
6. **아이가 나오는 컷은 1·2·8·9·10 다섯 장뿐입니다.** 나중에 시장별로 아이
   외형을 바꾸고 싶어지면 이 다섯 장만 다시 생성하면 되고, 버디·빌런·알 컷
   열한 장은 그대로 재사용됩니다. 지금은 그럴 필요 없이 한 세트로 갑니다 —
   동아시아 아이면 한·일·홍콩 모두에서 자연스럽게 읽힙니다.
7. 간판·폰 화면에 **어떤 문자도 넣지 마세요.** 한글이 박히면 일본·홍콩에서
   그 컷만 다시 만들어야 합니다. 프롬프트에 "blank colored panels with no
   readable characters"로 이미 막아뒀습니다.
