/**
 * js/demo.js
 * 대한민국 인프라 소외지역 실시간 분석 지도 - 원터치 자동 시연(Demo Automation) 모듈
 * (한국어 음성 TTS 안내 엔진 탑재)
 * 
 * 시연 시나리오:
 * 1. 전국 인프라 지도 개요 (한반도 전역 위성 & 지명 뷰)
 * 2. 전국 행정구역 실시간 검색 (강원 속초시 검색 및 26km 버퍼/팝업)
 * 3. 초고위험 소외지역 심층 분석 (경북 의성군 소멸위험 & 13대 인프라)
 * 4. 전문 인프라 취약 레이어 다중 시각화 (응급사각, 분만공백, 교통단절)
 * 5. 마커 클러스터링 & 핀 가시성 인터랙션
 * 6. 실시간 자연재해/기상특보 상황판 연동 (호우/대설 통제구간 지도 투사)
 * 7. 소외지역 분석 패널 슬라이드 & UI 컨트롤
 * 8. 시연 완료 및 초기화
 */

(function () {
  'use strict';

  // 음성 TTS 제어 상태
  let ttsEnabled = true;

  // 음성 발화 함수 (Web Speech API)
  function speakText(text) {
    if (!ttsEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel(); // 이전 발화 즉시 정지
      
      // 특수문자 및 이모지 필터링
      const cleanText = text
        .replace(/<[^>]*>/g, '')
        .replace(/[🚨📉👶🚆🌊🎬🎉✨📍📌ℹ️◀▶⏸⏹↺💡👥🔍]/g, '')
        .trim();

      const utter = new SpeechSynthesisUtterance(cleanText);
      utter.lang = 'ko-KR';
      utter.rate = 1.05; // 명확하고 듣기 편한 속도
      utter.pitch = 1.0;

      // 브라우저에 등록된 한국어 음성 우선 선택
      const voices = window.speechSynthesis.getVoices();
      const koVoice = voices.find(v => v.lang === 'ko-KR' || v.lang.startsWith('ko'));
      if (koVoice) {
        utter.voice = koVoice;
      }

      window.speechSynthesis.speak(utter);
    } catch (e) {
      console.warn('TTS 실행 오류:', e);
    }
  }

  // 음성 즉시 정지
  function stopTTS() {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
  }

  // 시연 시나리오 단계 정의 (TTS 스크립트 포함)
  const demoSteps = [
    {
      title: "1. 전국 인프라 지도 개요",
      desc: "초고화질 위성 베이스맵과 한국어 지명 라벨이 탑재된 대한민국 전역 지도를 확인합니다.",
      tts: "1단계, 전국 인프라 지도 개요입니다. 위성 영상과 한국어 지명이 적용된 대한민국 전역 지도를 확인합니다.",
      action: (next) => {
        if (typeof closeDisasterModal === 'function') closeDisasterModal();
        if (typeof closeSearchAlert === 'function') closeSearchAlert();
        if (typeof closeTutorial === 'function') closeTutorial();

        if (window.map) {
          window.map.flyTo([36.2, 127.8], 7, { duration: 1.5 });
        }
        setTimeout(next, 3800);
      }
    },
    {
      title: "2. 행정구역 실시간 검색 (강원 속초시)",
      desc: "검색창에 '속초시'를 입력하여 26km 분석 반경 버퍼와 13대 지표 팝업을 호출합니다.",
      tts: "2단계, 행정구역 검색입니다. 속초시를 검색하여 26킬로미터 분석 반경과 13대 인프라 지표를 실시간 조회합니다.",
      action: (next) => {
        const input = document.getElementById('searchInput');
        if (input) {
          input.value = "속초시";
          input.focus();
          if (typeof handleSearchInput === 'function') {
            handleSearchInput({ target: input });
          }
        }

        setTimeout(() => {
          if (typeof executeSearchButton === 'function') {
            executeSearchButton();
          }
          setTimeout(next, 4500);
        }, 1200);
      }
    },
    {
      title: "3. 초고위험 소외지역 분석 (경북 의성군)",
      desc: "인구소멸위험지수가 가장 높은 경북 의성군으로 이동하여 의료·문화 결핍 지표를 진단합니다.",
      tts: "3단계, 초고위험 소외지역 분석입니다. 소멸위험지수가 가장 높은 경북 의성군으로 이동하여 인프라 결핍을 진단합니다.",
      action: (next) => {
        const input = document.getElementById('searchInput');
        if (input) {
          input.value = "경북 의성군";
        }
        if (typeof executeSearchButton === 'function') {
          executeSearchButton();
        }
        setTimeout(next, 4800);
      }
    },
    {
      title: "4. 인프라 분석 레이어 시각화 (분만공백 & 교통단절)",
      desc: "지도 상단 빠른 토글에서 분만공백(분만실 1시간 초과) 및 교통단절 취약권역을 투사합니다.",
      tts: "4단계, 전문 인프라 레이어 시각화입니다. 분만공백과 대중교통 단절 취약권역을 지도에 투사합니다.",
      action: (next) => {
        if (window.map) {
          window.map.flyTo([36.0, 128.2], 8, { duration: 1.2 });
        }

        setTimeout(() => {
          if (typeof toggleOverlayLayer === 'function') {
            toggleOverlayLayer('maternal'); // 분만공백 ON
            setTimeout(() => {
              toggleOverlayLayer('transit'); // 교통단절 ON
              setTimeout(next, 4500);
            }, 1500);
          } else {
            next();
          }
        }, 1200);
      }
    },
    {
      title: "5. 핀 클러스터 및 광역 뷰 시연",
      desc: "지도를 줌아웃하여 밀집된 인프라 마커들이 iOS 글래스모피즘 클러스터로 통합되는 모습을 확인합니다.",
      tts: "5단계, 핀 클러스터 시연입니다. 지도를 축소하여 밀집된 마커들이 글래스모피즘 클러스터로 통합되는 모습을 확인합니다.",
      action: (next) => {
        if (window.map) {
          window.map.flyTo([36.3, 127.8], 7, { duration: 1.5 });
        }
        setTimeout(next, 4200);
      }
    },
    {
      title: "6. 실시간 자연재해 특보 상황판 연동",
      desc: "재해 상황판을 오픈하고 도서·산간 호우/대설 통제구간 및 여객선 결항 정보를 지도에 즉시 표시합니다.",
      tts: "6단계, 실시간 자연재해 특보 연동입니다. 호우 대설 통제구간 및 여객선 결항 정보를 지도에 즉시 표시합니다.",
      action: (next) => {
        if (typeof openDisasterModal === 'function') {
          openDisasterModal();
        }
        setTimeout(() => {
          if (typeof triggerRainSnowDisaster === 'function') {
            triggerRainSnowDisaster();
          }
          setTimeout(next, 4800);
        }, 1600);
      }
    },
    {
      title: "7. 13대 소외지역 패널 컨트롤",
      desc: "좌측 사이드바 패널을 원터치 핸들로 접고 펼치며 지도 중심의 몰입감 높은 뷰를 제공합니다.",
      tts: "7단계, 소외지역 진단 패널 제어입니다. 좌측 패널을 원터치 핸들로 접고 펼칠 수 있습니다.",
      action: (next) => {
        if (typeof toggleSidebarPanel === 'function') {
          toggleSidebarPanel(); // 접기
          setTimeout(() => {
            toggleSidebarPanel(); // 다시 펼치기
            setTimeout(next, 3800);
          }, 1800);
        } else {
          next();
        }
      }
    },
    {
      title: "8. 시연 완료 및 초기화",
      desc: "자동 시연이 성공적으로 완료되었습니다. 대한민국 전역 지도로 시점을 원위치합니다.",
      tts: "모든 시연이 완료되었습니다. 전국 지도로 복귀합니다. 원하시는 지역을 자유롭게 탐색해 보세요.",
      action: (next) => {
        if (typeof closeDisasterModal === 'function') {
          closeDisasterModal();
        }
        // 활성화된 추가 레이어 정리 (기본 레이어로 복원)
        if (typeof overlayLayers !== 'undefined') {
          if (overlayLayers.maternal && map.hasLayer(overlayLayers.maternal.group)) {
            toggleOverlayLayer('maternal');
          }
          if (overlayLayers.transit && map.hasLayer(overlayLayers.transit.group)) {
            toggleOverlayLayer('transit');
          }
          if (overlayLayers.disasterRainSnow && map.hasLayer(overlayLayers.disasterRainSnow.group)) {
            toggleOverlayLayer('disasterRainSnow');
          }
        }

        if (window.map) {
          window.map.flyTo([36.1, 127.8], 7.2, { duration: 1.8 });
        }
        const input = document.getElementById('searchInput');
        if (input) input.value = '';

        setTimeout(next, 3000);
      }
    }
  ];

  let currentStepIndex = 0;
  let isRunning = false;
  let isPaused = false;
  let isMinimized = false;

  // 플로팅 시연 컨트롤러 UI 생성
  function createDemoControllerUI() {
    if (document.getElementById('demoControlWidget')) return;

    const widget = document.createElement('div');
    widget.id = 'demoControlWidget';
    widget.className = 'demo-control-widget';
    widget.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 10000;
      background: rgba(255, 255, 255, 0.90);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.65);
      border-radius: 18px;
      padding: 16px 20px;
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.18), 0 2px 8px rgba(0, 0, 0, 0.08);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      width: 330px;
      box-sizing: border-box;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    `;

    widget.innerHTML = `
      <!-- 헤더 -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:16px;">🎬</span>
          <span style="font-weight:800; font-size:14px; color:#1d1d1f; letter-spacing:-0.2px;">시연 자동화</span>
        </div>
        <div style="display:flex; align-items:center; gap:6px;">
          <!-- 음성 TTS 토글 버튼 -->
          <button id="demoTtsToggleBtn" title="음성 TTS 안내 켜기/끄기" style="background:rgba(0,122,255,0.1); border:1px solid rgba(0,122,255,0.3); border-radius:12px; font-size:11px; font-weight:700; color:#007aff; padding:3px 8px; cursor:pointer; display:flex; align-items:center; gap:3px; transition:all 0.2s;">
            <span id="demoTtsIcon">🔊</span> <span id="demoTtsText">음성 ON</span>
          </button>
          <span id="demoStepBadge" style="font-size:10.5px; font-weight:700; padding:3px 9px; border-radius:12px; background:#e5e5ea; color:#3a3a3c;">
            READY
          </span>
          <button id="demoMinimizeBtn" title="최소화" style="background:none; border:none; cursor:pointer; font-size:13px; color:#8e8e93; padding:2px 4px; border-radius:4px; line-height:1;">
            ✕
          </button>
        </div>
      </div>

      <!-- 프로그레스 바 -->
      <div style="width:100%; height:4px; background:rgba(0,0,0,0.06); border-radius:2px; margin-bottom:12px; overflow:hidden;">
        <div id="demoProgressBar" style="width:0%; height:100%; background:linear-gradient(90deg, #007aff, #5856d6); transition:width 0.4s ease; border-radius:2px;"></div>
      </div>

      <!-- 단계 제목 & 설명 -->
      <div id="demoTitle" style="font-size:13.5px; font-weight:700; color:#007aff; margin-bottom:5px; line-height:1.35; word-break:keep-all;">
        원터치 자동 시연 모드
      </div>
      <div id="demoDesc" style="font-size:11.5px; color:#636366; margin-bottom:14px; line-height:1.45; min-height:34px; word-break:keep-all;">
        버튼을 누르면 전국 지도 탐색, 지역 검색, 인프라 레이어 및 재해 상황판 연동 시나리오가 음성 TTS와 함께 순차적으로 실행됩니다.
      </div>

      <!-- 컨트롤 버튼 영역 -->
      <div id="demoBtnGroupReady" style="display:flex; gap:6px;">
        <button id="demoStartBtn" style="flex:1; padding:9px 12px; border:none; border-radius:10px; background:#007aff; color:#fff; font-size:12.5px; font-weight:700; cursor:pointer; box-shadow:0 3px 10px rgba(0,122,255,0.3); transition:all 0.2s;">
          ▶ 음성 자동 시연 시작
        </button>
      </div>

      <div id="demoBtnGroupRunning" style="display:none; gap:6px; flex-wrap:wrap;">
        <button id="demoPrevBtn" style="flex:1; padding:7px 8px; border:1px solid #d1d1d6; border-radius:8px; background:#fff; color:#1d1d1f; font-size:11.5px; font-weight:600; cursor:pointer;">
          ◀ 이전
        </button>
        <button id="demoPauseBtn" style="flex:1.2; padding:7px 8px; border:none; border-radius:8px; background:#ff9500; color:#fff; font-size:11.5px; font-weight:700; cursor:pointer;">
          ⏸ 일시정지
        </button>
        <button id="demoNextBtn" style="flex:1; padding:7px 8px; border:1px solid #d1d1d6; border-radius:8px; background:#fff; color:#1d1d1f; font-size:11.5px; font-weight:600; cursor:pointer;">
          다음 ▶
        </button>
        <button id="demoStopBtn" style="width:100%; margin-top:4px; padding:6px; border:none; border-radius:8px; background:rgba(255,59,48,0.12); color:#ff3b30; font-size:11.5px; font-weight:700; cursor:pointer;">
          ⏹ 시연 즉시 종료
        </button>
      </div>
    `;

    document.body.appendChild(widget);

    // 이벤트 리스너 연결
    document.getElementById('demoStartBtn').addEventListener('click', startDemo);
    document.getElementById('demoPauseBtn').addEventListener('click', togglePauseDemo);
    document.getElementById('demoStopBtn').addEventListener('click', stopDemo);
    document.getElementById('demoPrevBtn').addEventListener('click', prevStep);
    document.getElementById('demoNextBtn').addEventListener('click', nextStep);
    document.getElementById('demoMinimizeBtn').addEventListener('click', toggleMinimizeWidget);
    document.getElementById('demoTtsToggleBtn').addEventListener('click', toggleTts);
  }

  // TTS 토글 기능
  function toggleTts() {
    ttsEnabled = !ttsEnabled;
    const btn = document.getElementById('demoTtsToggleBtn');
    const icon = document.getElementById('demoTtsIcon');
    const text = document.getElementById('demoTtsText');

    if (!btn) return;

    if (ttsEnabled) {
      btn.style.background = 'rgba(0,122,255,0.1)';
      btn.style.borderColor = 'rgba(0,122,255,0.3)';
      btn.style.color = '#007aff';
      if (icon) icon.innerText = '🔊';
      if (text) text.innerText = '음성 ON';
      if (isRunning && !isPaused && demoSteps[currentStepIndex]) {
        speakText(demoSteps[currentStepIndex].tts || demoSteps[currentStepIndex].desc);
      }
    } else {
      stopTTS();
      btn.style.background = 'rgba(142,142,147,0.12)';
      btn.style.borderColor = 'rgba(142,142,147,0.3)';
      btn.style.color = '#8e8e93';
      if (icon) icon.innerText = '🔇';
      if (text) text.innerText = '음성 OFF';
    }
  }

  // 위젯 최소화 / 복원 토글
  function toggleMinimizeWidget() {
    const widget = document.getElementById('demoControlWidget');
    if (!widget) return;

    isMinimized = !isMinimized;
    if (isMinimized) {
      widget.style.display = 'none';
      createMinimizedFloatingButton();
    } else {
      widget.style.display = 'block';
      removeMinimizedFloatingButton();
    }
  }

  // 최소화 시 우측 하단 작은 플로팅 알약 버튼
  function createMinimizedFloatingButton() {
    if (document.getElementById('demoFloatingMiniPill')) return;
    const miniPill = document.createElement('button');
    miniPill.id = 'demoFloatingMiniPill';
    miniPill.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 10000;
      background: rgba(0, 122, 255, 0.9);
      color: #fff;
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.4);
      border-radius: 24px;
      padding: 9px 16px;
      font-size: 12.5px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(0, 122, 255, 0.35);
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.25s ease;
    `;
    miniPill.innerHTML = `🎬 시연 모드 ${ttsEnabled ? '🔊' : '🔇'} ${isRunning ? `(${currentStepIndex + 1}/${demoSteps.length})` : ''}`;
    miniPill.addEventListener('click', () => {
      toggleMinimizeWidget();
    });
    document.body.appendChild(miniPill);
  }

  function removeMinimizedFloatingButton() {
    const miniPill = document.getElementById('demoFloatingMiniPill');
    if (miniPill) miniPill.remove();
  }

  // 시연 시작
  function startDemo() {
    if (isMinimized) toggleMinimizeWidget();
    isRunning = true;
    isPaused = false;
    currentStepIndex = 0;

    document.getElementById('demoBtnGroupReady').style.display = 'none';
    document.getElementById('demoBtnGroupRunning').style.display = 'flex';

    runStep();
  }

  // 각 단계 실행
  function runStep() {
    if (!isRunning) return;

    if (currentStepIndex >= demoSteps.length) {
      completeDemo();
      return;
    }

    if (currentStepIndex < 0) {
      currentStepIndex = 0;
    }

    const step = demoSteps[currentStepIndex];
    const total = demoSteps.length;
    const pct = Math.round(((currentStepIndex + 1) / total) * 100);

    const badge = document.getElementById('demoStepBadge');
    if (badge) {
      badge.innerText = `${currentStepIndex + 1} / ${total}`;
      badge.style.background = '#007aff';
      badge.style.color = '#fff';
    }

    const pBar = document.getElementById('demoProgressBar');
    if (pBar) pBar.style.width = `${pct}%`;

    const titleEl = document.getElementById('demoTitle');
    if (titleEl) titleEl.innerText = step.title;

    const descEl = document.getElementById('demoDesc');
    if (descEl) descEl.innerText = step.desc;

    // 한국어 음성 TTS 재생
    speakText(step.tts || step.desc);

    // 단계 액션 실행
    step.action(() => {
      if (isRunning && !isPaused) {
        currentStepIndex++;
        runStep();
      }
    });
  }

  // 일시정지 / 재개
  function togglePauseDemo() {
    const pauseBtn = document.getElementById('demoPauseBtn');
    if (!isPaused) {
      isPaused = true;
      stopTTS();
      pauseBtn.innerText = "▶ 재개";
      pauseBtn.style.background = "#34c759";
      const descEl = document.getElementById('demoDesc');
      if (descEl) descEl.innerText = "[일시정지됨] '재개' 버튼을 누르시면 시연이 계속 진행됩니다.";
    } else {
      isPaused = false;
      pauseBtn.innerText = "⏸ 일시정지";
      pauseBtn.style.background = "#ff9500";
      currentStepIndex++;
      runStep();
    }
  }

  // 수동 이전 단계
  function prevStep() {
    if (!isRunning) return;
    isPaused = true;
    stopTTS();
    const pauseBtn = document.getElementById('demoPauseBtn');
    if (pauseBtn) {
      pauseBtn.innerText = "▶ 재개";
      pauseBtn.style.background = "#34c759";
    }
    currentStepIndex = Math.max(0, currentStepIndex - 1);
    runStep();
  }

  // 수동 다음 단계
  function nextStep() {
    if (!isRunning) return;
    isPaused = true;
    stopTTS();
    const pauseBtn = document.getElementById('demoPauseBtn');
    if (pauseBtn) {
      pauseBtn.innerText = "▶ 재개";
      pauseBtn.style.background = "#34c759";
    }
    currentStepIndex = Math.min(demoSteps.length - 1, currentStepIndex + 1);
    runStep();
  }

  // 시연 정상 완료
  function completeDemo() {
    isRunning = false;
    isPaused = false;
    currentStepIndex = 0;

    document.getElementById('demoBtnGroupReady').style.display = 'flex';
    document.getElementById('demoBtnGroupRunning').style.display = 'none';

    const startBtn = document.getElementById('demoStartBtn');
    if (startBtn) {
      startBtn.innerText = '↺ 자동 시연 다시 시작';
    }

    const badge = document.getElementById('demoStepBadge');
    if (badge) {
      badge.innerText = '완료 🎉';
      badge.style.background = '#34c759';
      badge.style.color = '#fff';
    }

    const pBar = document.getElementById('demoProgressBar');
    if (pBar) pBar.style.width = '100%';

    const titleEl = document.getElementById('demoTitle');
    if (titleEl) titleEl.innerText = '모든 시연이 완료되었습니다 ✨';

    const descEl = document.getElementById('demoDesc');
    if (descEl) descEl.innerText = '전국 인프라 소외지역 분석 플랫폼의 핵심 기능 시연이 끝났습니다. 자유롭게 탐색해보세요!';

    speakText('모든 시연이 성공적으로 완료되었습니다. 대한민국 인프라 분석 지도를 자유롭게 탐색해 보세요.');
  }

  // 시연 강제 종료
  function stopDemo() {
    isRunning = false;
    isPaused = false;
    currentStepIndex = 0;

    stopTTS();

    document.getElementById('demoBtnGroupReady').style.display = 'flex';
    document.getElementById('demoBtnGroupRunning').style.display = 'none';

    const startBtn = document.getElementById('demoStartBtn');
    if (startBtn) {
      startBtn.innerText = '▶ 음성 자동 시연 시작';
    }

    const badge = document.getElementById('demoStepBadge');
    if (badge) {
      badge.innerText = 'READY';
      badge.style.background = '#e5e5ea';
      badge.style.color = '#3a3a3c';
    }

    const pBar = document.getElementById('demoProgressBar');
    if (pBar) pBar.style.width = '0%';

    const titleEl = document.getElementById('demoTitle');
    if (titleEl) titleEl.innerText = '시연이 종료되었습니다';

    const descEl = document.getElementById('demoDesc');
    if (descEl) descEl.innerText = '언제든 버튼을 눌러 음성 자동 시연을 다시 시작하실 수 있습니다.';

    // 지도 및 모달 원위치
    if (typeof closeDisasterModal === 'function') closeDisasterModal();
    if (window.map) {
      window.map.flyTo([36.1, 127.8], 7.2, { duration: 1.5 });
    }
  }

  // 브라우저 보이스 로드 사전 초기화
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }

  // 전역 API 노출
  window.startInfrastructureAutoDemo = function () {
    const widget = document.getElementById('demoControlWidget');
    if (widget && widget.style.display === 'none') {
      toggleMinimizeWidget();
    }
    startDemo();
  };
  window.stopInfrastructureAutoDemo = stopDemo;
  window.toggleDemoWidget = function () {
    const widget = document.getElementById('demoControlWidget');
    if (!widget) {
      createDemoControllerUI();
      return;
    }
    toggleMinimizeWidget();
  };

  // DOM 로드 완료 후 컨트롤러 생성
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createDemoControllerUI);
  } else {
    createDemoControllerUI();
  }
})();
