/**
 * daily-story-platform — 일일 단편소설 자동 생성 (Google Apps Script)
 * =========================================================
 * script.google.com에 새 프로젝트를 만들고 이 파일 내용을 그대로 붙여넣어 쓴다.
 * apps/api(Render)가 잠들어 있어도 상관없이, 이 스크립트가 Gemini 호출부터
 * Supabase Storage 업로드, posts 테이블 insert까지 전부 직접 처리한다.
 * (apps/api/src/generation은 수동/로컬 테스트용으로 그대로 둔다 — 이 스크립트와 별개)
 *
 * ── 설정 (Script Properties, 프로젝트 설정 → Script Properties) ──────────
 *   GEMINI_API_KEY             aistudio.google.com/apikey
 *   SUPABASE_URL               예: https://xxxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY  레거시 JWT service_role 키를 쓴다.
 *                              ※ 새 sb_secret_ 키는 UrlFetchApp을 브라우저로 오인해
 *                                401로 차단한다. SUPABASE_USER_AGENT 헤더로 우회를
 *                                시도했으나 실패했고, 레거시 키로 해결했다.
 *                                레거시 키는 2026년 말 폐기 예정 — 그 전에 재대응 필요.
 *
 * ── 사용법 ────────────────────────────────────────────────
 *   1) Script Properties에 위 3개 값 저장
 *   2) generateDailyPost 를 한 번 수동 실행해서 정상 동작 확인 (실행 로그 확인)
 *   3) Triggers 메뉴에서 generateDailyPost를 하루 DAILY_POST_COUNT(기본 2)번,
 *      시간을 나눠(예: 오전 9시 / 오후 9시) 시간 기반 트리거로 등록
 *      (트리거 개수 != DAILY_POST_COUNT면 실제 생성량이 어긋나니 둘을 맞춰서 조정한다)
 *
 * ── Gemini 폴백 체인 ──────────────────────────────────────
 *   여러 모델을 순서대로 시도. 하나가 막히면(429 한도 / 503 혼잡 / 404 없음)
 *   즉시 다음 모델로 넘어간다. 텍스트/이미지 각각 별도 체인.
 *   ※ 모델 ID는 계정/시점에 따라 열려있는 게 다르다 — debugModels_() /
 *     debugImageModels_() 로 각 ID의 HTTP 상태를 확인해 목록을 조정한다.
 */

// ── 텍스트 폴백 체인 (검증된 무료 모델, 위→아래 순서로 시도) ──
var GEMINI_MODELS = [
  'gemini-3.1-flash-lite', // 라이트 · 일일 500 · RPM 15
  'gemini-3.5-flash-lite', // 라이트 · 일일 500 · RPM 15
  'gemini-3.6-flash', // 플래시(최신 최고) · 일일 20 · RPM 5
  'gemini-3.5-flash', // 플래시 · 일일 20 · RPM 5
  'gemma-4-31b-it', // 안전망 · 일일 14,400 · RPM 30
];

// ── 이미지 폴백 체인 (이번 프로젝트 실 계정으로 검증) ──
// gemini-2.5-flash-image: billing 연결 후 실제 성공 확인.
// gemini-3.1-flash-image: billing 연결 전엔 429(무료 쿼터 0)였음 — 연결 후 재시도 가치 있어 포함.
var GEMINI_IMAGE_MODELS = ['gemini-2.5-flash-image', 'gemini-3.1-flash-image'];

function getGeminiKey_() {
  return PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY') || '';
}
function getSupabaseUrl_() {
  return PropertiesService.getScriptProperties().getProperty('SUPABASE_URL') || '';
}
function getSupabaseServiceKey_() {
  return PropertiesService.getScriptProperties().getProperty('SUPABASE_SERVICE_ROLE_KEY') || '';
}

// 새 sb_secret_ 키가 UrlFetchApp을 브라우저로 오인해 차단하는 걸 우회하려던 헤더.
// 우회는 실패했고 결국 레거시 service_role JWT 키를 쓰기로 했다 — 레거시 키에는 이 제한이
// 없으므로 이 헤더는 사실상 무해한 잔재다. 레거시 키 폐기 시 재대응할 때의 출발점으로 남겨둔다.
var SUPABASE_USER_AGENT = 'daily-story-generator-apps-script/1.0';

// 핵심: 막히면 다음 모델로 즉시 전환. 전체 한 바퀴 다 막히면 잠깐 쉬고 한 번 더.
function geminiCall_(prompt, jsonMode) {
  var key = getGeminiKey_();
  if (!key) {
    Logger.log('GEMINI_API_KEY 미설정');
    return null;
  }
  var payload = { contents: [{ parts: [{ text: prompt }] }] };
  if (jsonMode) payload.generationConfig = { responseMimeType: 'application/json' };
  var body = JSON.stringify(payload);
  for (var round = 0; round < 2; round++) {
    for (var i = 0; i < GEMINI_MODELS.length; i++) {
      var url =
        'https://generativelanguage.googleapis.com/v1beta/models/' + GEMINI_MODELS[i] + ':generateContent?key=' + key;
      try {
        var res = UrlFetchApp.fetch(url, {
          method: 'post',
          contentType: 'application/json',
          payload: body,
          muteHttpExceptions: true,
        });
        var code = res.getResponseCode();
        if (code === 200) {
          return JSON.parse(res.getContentText()).candidates[0].content.parts[0].text;
        }
        if (code === 503 || code === 429) continue; // 한도/혼잡 → 다음 모델로 즉시
        Logger.log(
          'Gemini ' + GEMINI_MODELS[i] + ' 오류 ' + code + ': ' + res.getContentText().substring(0, 150),
        ); // 404 등도 다음 모델로
      } catch (e) {
        Logger.log('Gemini 예외(' + GEMINI_MODELS[i] + '): ' + e);
      }
    }
    Utilities.sleep(8000); // 한 바퀴 전부 막힘 → 분당한도 회복 대기 후 재시도
  }
  Logger.log('Gemini 텍스트: 모든 모델 실패(쿼터 초과 또는 과부하 반복)');
  return null; // 모든 모델 실패 (호출부에서 폴백/스킵 처리 권장)
}

function geminiText_(prompt) {
  var out = geminiCall_(prompt, false);
  return out ? out.trim() : null;
}
function geminiJson_(prompt) {
  return parseJsonLoose_(geminiCall_(prompt, true));
}

// 코드펜스(```json)나 잡텍스트가 섞여도 JSON 추출
function parseJsonLoose_(txt) {
  if (!txt) return null;
  txt = String(txt)
    .trim()
    .replace(/^```(json)?\s*/i, '')
    .replace(/```$/, '')
    .trim();
  try {
    return JSON.parse(txt);
  } catch (e) {
    var s = txt.indexOf('{'),
      e2 = txt.lastIndexOf('}');
    if (s >= 0 && e2 > s) {
      try {
        return JSON.parse(txt.substring(s, e2 + 1));
      } catch (e3) {
        /* 그래도 안 되면 포기 */
      }
    }
    Logger.log('JSON 파싱 실패, 원본 일부: ' + txt.substring(0, 200));
    return null;
  }
}

// (선택) 각 텍스트 모델 ID가 이 키에서 열려있는지 점검 — 200=사용가능 / 404=없음 / 429=한도
function debugModels_() {
  var key = getGeminiKey_();
  GEMINI_MODELS.forEach(function (m) {
    var res = UrlFetchApp.fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/' + m + ':generateContent?key=' + key,
      {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify({ contents: [{ parts: [{ text: 'hi' }] }] }),
        muteHttpExceptions: true,
      },
    );
    Logger.log(m + ' → HTTP ' + res.getResponseCode());
  });
}

// 이미지 폴백 호출: 성공하면 base64 PNG 데이터(문자열) 반환, 전부 실패하면 null
function geminiImageCall_(prompt) {
  var key = getGeminiKey_();
  if (!key) {
    Logger.log('GEMINI_API_KEY 미설정');
    return null;
  }
  var payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { responseModalities: ['IMAGE'] },
  };
  var body = JSON.stringify(payload);
  for (var round = 0; round < 2; round++) {
    for (var i = 0; i < GEMINI_IMAGE_MODELS.length; i++) {
      var url =
        'https://generativelanguage.googleapis.com/v1beta/models/' +
        GEMINI_IMAGE_MODELS[i] +
        ':generateContent?key=' +
        key;
      try {
        var res = UrlFetchApp.fetch(url, {
          method: 'post',
          contentType: 'application/json',
          payload: body,
          muteHttpExceptions: true,
        });
        var code = res.getResponseCode();
        if (code === 200) {
          var json = JSON.parse(res.getContentText());
          var parts = json.candidates && json.candidates[0] && json.candidates[0].content
            ? json.candidates[0].content.parts
            : [];
          for (var p = 0; p < parts.length; p++) {
            if (parts[p].inlineData && parts[p].inlineData.data) {
              return parts[p].inlineData.data;
            }
          }
          Logger.log('Gemini 이미지 ' + GEMINI_IMAGE_MODELS[i] + ': 응답에 이미지 없음, 다음 모델로');
          continue;
        }
        if (code === 503 || code === 429) continue; // 한도/혼잡 → 다음 모델로 즉시
        Logger.log(
          'Gemini 이미지 ' +
            GEMINI_IMAGE_MODELS[i] +
            ' 오류 ' +
            code +
            ': ' +
            res.getContentText().substring(0, 150),
        );
      } catch (e) {
        Logger.log('Gemini 이미지 예외(' + GEMINI_IMAGE_MODELS[i] + '): ' + e);
      }
    }
    Utilities.sleep(8000);
  }
  return null;
}

// (선택) 각 이미지 모델 ID가 이 키에서 열려있는지 점검
function debugImageModels_() {
  var key = getGeminiKey_();
  GEMINI_IMAGE_MODELS.forEach(function (m) {
    var res = UrlFetchApp.fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/' + m + ':generateContent?key=' + key,
      {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify({
          contents: [{ parts: [{ text: 'a red circle' }] }],
          generationConfig: { responseModalities: ['IMAGE'] },
        }),
        muteHttpExceptions: true,
      },
    );
    Logger.log(m + ' → HTTP ' + res.getResponseCode());
  });
}

// ── 장르 (Supabase genres 테이블에서 관리 — supabase/schema.sql 참고) ──
// 매일 genres 테이블 전체를 가져와 랜덤으로 하나 뽑는다. 장르 추가/프롬프트 수정은
// DB row 추가/수정만으로 가능하고 이 스크립트를 다시 배포할 필요 없음.
function fetchGenres_() {
  var supabaseUrl = getSupabaseUrl_();
  var key = getSupabaseServiceKey_();
  var res = UrlFetchApp.fetch(supabaseUrl + '/rest/v1/genres?select=slug,label,story_prompt', {
    method: 'get',
    headers: { apikey: key, Authorization: 'Bearer ' + key, 'User-Agent': SUPABASE_USER_AGENT },
    muteHttpExceptions: true,
  });
  if (res.getResponseCode() !== 200) {
    Logger.log('장르 목록 조회 실패(' + res.getResponseCode() + '): ' + res.getContentText());
    return null;
  }
  return JSON.parse(res.getContentText());
}

// 하루 목표 게시물 수 — 이 개수에 도달하면 트리거가 스킵한다. script.google.com에서
// generateDailyPost 트리거를 이 개수만큼 시간을 나눠 등록해야 실제로 여러 편이 생성된다.
var DAILY_POST_COUNT = 2;

// 오늘자 게시물 개수 — 트리거 중복 실행/일일 목표 도달 여부 판단용
function countTodayPosts_() {
  var supabaseUrl = getSupabaseUrl_();
  var key = getSupabaseServiceKey_();
  var now = new Date();
  var todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  var tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
  var url =
    supabaseUrl +
    '/rest/v1/posts?select=id&published_at=gte.' +
    encodeURIComponent(todayStart.toISOString()) +
    '&published_at=lt.' +
    encodeURIComponent(tomorrowStart.toISOString());
  var res = UrlFetchApp.fetch(url, {
    method: 'get',
    headers: { apikey: key, Authorization: 'Bearer ' + key, 'User-Agent': SUPABASE_USER_AGENT },
    muteHttpExceptions: true,
  });
  if (res.getResponseCode() !== 200) {
    Logger.log('오늘 게시물 조회 실패(' + res.getResponseCode() + '), 생성은 계속 진행: ' + res.getContentText());
    return 0;
  }
  return JSON.parse(res.getContentText()).length;
}

// 썸네일 업로드, 공개 URL 반환 (apps/api의 PostsEntity.thumbnailUrl과 동일 포맷)
function uploadThumbnailToSupabase_(base64Png) {
  var supabaseUrl = getSupabaseUrl_();
  var key = getSupabaseServiceKey_();
  var path = new Date().getTime() + '.png';
  var bytes = Utilities.base64Decode(base64Png);
  var res = UrlFetchApp.fetch(supabaseUrl + '/storage/v1/object/thumbnails/' + path, {
    method: 'post',
    headers: { Authorization: 'Bearer ' + key, apikey: key, 'User-Agent': SUPABASE_USER_AGENT },
    contentType: 'image/png',
    payload: bytes,
    muteHttpExceptions: true,
  });
  if (res.getResponseCode() >= 300) {
    throw new Error('Storage 업로드 실패: ' + res.getResponseCode() + ' ' + res.getContentText());
  }
  return supabaseUrl + '/storage/v1/object/public/thumbnails/' + path;
}

// posts 테이블 insert — 컬럼은 supabase/schema.sql과 동일한 snake_case
function insertPostToSupabase_(post) {
  var supabaseUrl = getSupabaseUrl_();
  var key = getSupabaseServiceKey_();
  var res = UrlFetchApp.fetch(supabaseUrl + '/rest/v1/posts', {
    method: 'post',
    headers: {
      apikey: key,
      Authorization: 'Bearer ' + key,
      Prefer: 'return=minimal',
      'User-Agent': SUPABASE_USER_AGENT,
    },
    contentType: 'application/json',
    payload: JSON.stringify(post),
    muteHttpExceptions: true,
  });
  if (res.getResponseCode() >= 300) {
    throw new Error('posts insert 실패: ' + res.getResponseCode() + ' ' + res.getContentText());
  }
}

// ── 메인: 이 함수를 시간 기반 트리거에 연결한다 ──
// 실패는 전부 throw로 올린다 — Apps Script가 트리거 예외에 대해 스크립트 소유자에게
// 실패 알림 메일을 자동 발송하므로 별도 알림 코드가 필요 없다.
// (알림 주기는 script.google.com → 트리거 목록 → 알림에서 '즉시'/'매일' 선택)
function generateDailyPost() {
  generateDailyPost_(false);
}

// 테스트용: 오늘자 게시물이 있어도 무시하고 강제로 다시 생성한다.
// 트리거에는 연결하지 말 것 — 수동 실행 전용.
function testGenerateDailyPost() {
  generateDailyPost_(true);
}

function generateDailyPost_(force) {
  if (!force && countTodayPosts_() >= DAILY_POST_COUNT) {
    Logger.log('오늘자 게시물이 이미 ' + DAILY_POST_COUNT + '개 있어 스킵합니다.');
    return;
  }

  var genres = fetchGenres_();
  if (!genres || genres.length === 0) {
    throw new Error('장르 목록 조회 실패, 중단합니다.');
  }
  var genreRow = genres[Math.floor(Math.random() * genres.length)];
  var storyPrompt =
    genreRow.story_prompt +
    ' 다른 설명 없이 반드시 다음 JSON 형식으로만 응답해: {"title": "제목", "content": "본문"}';
  var story = geminiJson_(storyPrompt);
  if (!story || !story.title || !story.content) {
    throw new Error('텍스트 생성 실패, 중단합니다. story=' + JSON.stringify(story));
  }

  var thumbnailPrompt =
    '"' +
    story.title +
    '"라는 제목의 ' +
    genreRow.label +
    ' 단편소설 표지용 썸네일 이미지를 그려줘. 텍스트나 글자는 넣지 말고, 분위기 있는 일러스트로.';
  var imageBase64 = geminiImageCall_(thumbnailPrompt);
  if (!imageBase64) {
    throw new Error('이미지 생성 실패, 중단합니다.');
  }

  var thumbnailUrl = uploadThumbnailToSupabase_(imageBase64);

  insertPostToSupabase_({
    title: story.title,
    content: story.content,
    thumbnail_url: thumbnailUrl,
    genre: genreRow.slug,
    view_count: 0,
    published_at: new Date().toISOString(),
  });

  Logger.log('생성 완료: ' + story.title);
}
