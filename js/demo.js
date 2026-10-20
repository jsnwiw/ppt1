/**
 * js/demo.js
 * 대한민국 인프라 소외지역 실시간 분석 지도 - 풀코스(Full-Course) 자동 시연 모듈
 * (구글 TTS 음성 나레이션 & 전 기능 자동 완결 시연 엔진)
 * 
 * 시연 시나리오 (총 12단계 전 기능 완전 시연):
 * 1. 전국 인프라 지도 개요 (Esri 초고화질 위성 & 한국어 지명 라벨)
 * 2. 실시간 행정구역 검색 (강원 속초시 검색, 26km 버퍼 원, 13대 지표 팝업)
 * 3. 초고위험 소외지역 심층 분석 (경북 의성군 소멸위험 & 결핍 진단)
 * 4. 전문 인프라 7대 분석 레이어 시각화 (응급사각, 분만공백, 교통단절, 에너지소외)
 * 5. 13대 인프라 카테고리 필터링 (사이드바 인프라 버튼 클릭 & 이모지 마커)
 * 6. 핀 숨기기 / 표시하기 토글 (결핍 권역 버퍼 원 단독 시각화)
 * 7. 글래스모피즘 마커 클러스터링 (핀 겹침 방지 및 줌 연동)
 * 8. 실시간 자연재해/기상특보 상황판 연동 (호우/대설 통제구간 지도 투사)
 * 9. 사용방법(튜토리얼) 가이드 시스템 소개 (인앱 가이드 워크스루)
 * 10. 반응형 인터페이스 & 좌측 패널 접기/펼치기 (화면 극대화)
 * 11. 실시간 트래픽 스트림 & 10분 동기화 타이머 안내
 * 12. 풀코스 시연 완료 및 초기화
 */

(function () {
  'use strict';

  // 구글 TTS 제어 상태
  let ttsEnabled = true;
  let currentAudio = null;

  // 구글 TTS 음성 발화 함수
  function speakText(text, onEnd) {
    if (!ttsEnabled) {
      if (typeof onEnd === 'function') onEnd();
      return;
    }
    stopTTS();

    const cleanText = text
      .replace(/<[^>]*>/g, '')
      .replace(/[🚨📉👶🚆🌊🎬🎉✨📍📌ℹ️◀▶⏸⏹↺💡👥🔍⚡🏦🔥🚢⛰️]/g, '')
      .trim();

    if (!cleanText) {
      if (typeof onEnd === 'function') onEnd();
      return;
    }

    // 1차: 구글 번역 공식 TTS 오디오 스트림 시도
    const encoded = encodeURIComponent(cleanText);
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=ko&q=${encoded}`;

    try {
      const audio = new Audio(googleTtsUrl);
      currentAudio = audio;

      audio.onended = () => {
        currentAudio = null;
        if (typeof onEnd === 'function') onEnd();
      };

      audio.onerror = () => {
        fallbackGoogleWebSpeech(cleanText, onEnd);
      };

      audio.play().catch(() => {
        fallbackGoogleWebSpeech(cleanText, onEnd);
      });
    } catch (e) {
      fallbackGoogleWebSpeech(cleanText, onEnd);
    }
  }

  // Google 한국어 보이스 Web Speech API fallback
  function fallbackGoogleWebSpeech(cleanText, onEnd) {
    if (!('speechSynthesis' in window)) {
      if (typeof onEnd === 'function') onEnd();
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(cleanText);
      utter.lang = 'ko-KR';
      utter.rate = 1.05;
      utter.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const googleVoice = voices.find(v => v.lang.startsWith('ko') && v.name.toLowerCase().includes('google'));
      const koVoice = googleVoice || voices.find(v => v.lang === 'ko-KR' || v.lang.startsWith('ko'));
      if (koVoice) utter.voice = koVoice;

      utter.onend = () => { if (typeof onEnd === 'function') onEnd(); };
      utter.onerror = () => { if (typeof onEnd === 'function') onEnd(); };

      window.speechSynthesis.speak(utter);
    } catch (e) {
      if (typeof onEnd === 'function') onEnd();
    }
  }

  // 음성 즉시 정지
  function stopTTS() {
    if (currentAudio) {
      try {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      } catch (e) {}
      currentAudio = null;
    }
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
  }

  // 전체 핵심 기능 12단계 시연 시나리오 정의
  const demoSteps = [
    {
      title: "1. 전국 인프라 지도 베이스맵 개요",
      desc: "초고화질 위성 영상과 도로선이 배제된 선명한 한국어 행정 지명 라벨이 상시 가동되는 대한민국 전역 지도를 확인합니다.",
      tts: "1단계, 전국 인프라 지도 개요입니다. 초고화질 위성 영상과 선명한 한국어 지명이 적용된 대한민국 전역 지도를 확인합니다.",
      action: (next) => {
        if (typeof closeDisasterModal === 'function') closeDisasterModal();
        if (typeof closeSearchAlert === 'function') closeSearchAlert();
        if (typeof closeTutorial === 'function') closeTutorial();

        if (window.map) {
          window.map.flyTo([36.2, 127.8], 7.1, { duration: 1.5 });
        }
        setTimeout(next, 4200);
      }
    },
    {
      title: "2. 전국 229개 시군구 실시간 검색 & 26km 버퍼",
      desc: "검색창에 '속초시'를 입력하여 26km 집중 분석 버퍼 원과 13대 핵심 인프라 결핍 진단 팝업을 즉시 호출합니다.",
      tts: "2단계, 실시간 행정구역 검색입니다. 속초시를 검색하여 26킬로미터 분석 반경과 13대 인프라 진단 팝업을 호출합니다.",
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
          setTimeout(next, 4800);
        }, 1200);
      }
    },
    {
      title: "3. 초고위험 소외지역 심층 분석 (경북 의성군)",
      desc: "인구소멸위험지수가 0.14로 가장 심각한 경북 의성군으로 이동하여 분만실 부재, 의료 접근성 등 핵심 결핍 지표를 진단합니다.",
      tts: "3단계, 초고위험 소외지역 분석입니다. 소멸위험지수가 가장 높은 경북 의성군으로 이동하여 13대 결핍 지표를 정밀 진단합니다.",
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
      title: "4. 전문 인프라 7대 분석 레이어 시각화",
      desc: "상단 빠른 토글에서 분만공백(분만실 1시간 초과), 교통단절, 에너지소외 레이어를 순차적으로 켜서 결핍 권역을 투사합니다.",
      tts: "4단계, 전문 인프라 분석 레이어 시각화입니다. 분만공백과 대중교통 단절, 에너지 소외 레이어를 지도 위에 순차적으로 투사합니다.",
      action: (next) => {
        if (window.map) {
          window.map.flyTo([36.0, 128.2], 8.2, { duration: 1.2 });
        }

        setTimeout(() => {
          if (typeof toggleOverlayLayer === 'function') {
            toggleOverlayLayer('maternal'); // 분만공백 ON
            setTimeout(() => {
              toggleOverlayLayer('transit'); // 교통단절 ON
              setTimeout(() => {
                toggleOverlayLayer('energy'); // 에너지소외 ON
                setTimeout(next, 4800);
              }, 1200);
            }, 1200);
          } else {
            next();
          }
        }, 1000);
      }
    },
    {
      title: "5. 좌측 패널 13대 인프라 카테고리 필터링",
      desc: "좌측 패널에서 특정 인프라 버튼을 클릭하여 결핍 지역만 필터링하고 전용 이모지 마커로 실시간 갱신합니다.",
      tts: "5단계, 13대 인프라 카테고리 필터링입니다. 패널에서 인프라 지표를 선택하여 해당 소외지역들을 지도에 즉시 필터링합니다.",
      action: (next) => {
        if (typeof toggleInfraOnMap === 'function') {
          toggleInfraOnMap('🚨 응급의료');
          setTimeout(() => {
            toggleInfraOnMap('🚆 교통/철도');
            setTimeout(next, 4500);
          }, 1500);
        } else {
          next();
        }
      }
    },
    {
      title: "6. 지도 핀(마커) 원터치 숨김 시스템",
      desc: "패널의 '📌 핀 숨기기' 버튼을 클릭하여 마커를 일시 숨기고, 인프라 결핍 권역 버퍼 원만을 깔끔하게 조망합니다.",
      tts: "6단계, 핀 숨기기 시스템입니다. 핀을 원터치로 숨겨 인프라 결핍 권역 버퍼만을 깔끔하게 시각화한 후 복원합니다.",
      action: (next) => {
        if (typeof toggleCategoryPins === 'function') {
          toggleCategoryPins(); // 핀 숨기기
          setTimeout(() => {
            toggleCategoryPins(); // 다시 표시하기
            setTimeout(next, 4200);
          }, 2000);
        } else {
          next();
        }
      }
    },
    {
      title: "7. 핀 겹침 방지 글래스모피즘 클러스터링",
      desc: "지도를 광역으로 줌아웃하여 밀집된 수많은 마커들이 파랑, 주황, 빨강의 숫자 클러스터 배지로 스마트하게 통합되는 모습을 확인합니다.",
      tts: "7단계, 마커 클러스터링입니다. 지도를 축소하여 밀집된 마커들이 숫자 클러스터 배지로 깔끔하게 자동 통합되는 모습을 시연합니다.",
      action: (next) => {
        if (window.map) {
          window.map.flyTo([36.3, 127.8], 7.0, { duration: 1.5 });
        }
        setTimeout(next, 4500);
      }
    },
    {
      title: "8. 실시간 자연재해 & 기상특보 상황판 연동",
      desc: "상단 '🚨 재해' 상황판을 열고 도서·산간 호우/대설 통제구간 및 여객선 결항 정보를 지도에 펄스 마커로 즉시 시각화합니다.",
      tts: "8단계, 실시간 자연재해 특보 연동입니다. 호우 대설 통제구간과 여객선 결항 정보를 상황판과 연동하여 지도에 즉시 표시합니다.",
      action: (next) => {
        if (typeof openDisasterModal === 'function') {
          openDisasterModal();
        }
        setTimeout(() => {
          if (typeof triggerRainSnowDisaster === 'function') {
            triggerRainSnowDisaster();
          }
          setTimeout(next, 5000);
        }, 1600);
      }
    },
    {
      title: "9. 사용방법 가이드 & 자동 넘김 워크스루",
      desc: "상단 'ℹ️ 사용방법' 튜토리얼을 오픈하여 11단계 인앱 가이드와 자동 슬라이드 넘김 기능을 소개합니다.",
      tts: "9단계, 사용방법 가이드 시스템입니다. 초보자를 위한 11단계 안내 모달과 자동 넘김 기능을 소개합니다.",
      action: (next) => {
        if (typeof openTutorial === 'function') {
          openTutorial();
        }
        setTimeout(() => {
          if (typeof closeTutorial === 'function') {
            closeTutorial();
          }
          setTimeout(next, 3800);
        }, 2200);
      }
    },
    {
      title: "10. 좌측 패널 접기/펼치기 (지도 뷰 극대화)",
      desc: "사이드바 우측에 밀착된 ◀/▶ 플로팅 핸들을 클릭하여 패널을 부드럽게 접어 지도를 화면 전체로 극대화합니다.",
      tts: "10단계, 좌측 패널 접기 및 펼치기 제어입니다. 원터치 핸들로 패널을 접어 몰입감 높은 지도 전체 화면을 구현합니다.",
      action: (next) => {
        if (typeof toggleSidebarPanel === 'function') {
          toggleSidebarPanel(); // 접기
          setTimeout(() => {
            toggleSidebarPanel(); // 다시 펼치기
            setTimeout(next, 4200);
          }, 2000);
        } else {
          next();
        }
      }
    },
    {
      title: "11. 실시간 트래픽 스트림 & 10분 동기화 타이머",
      desc: "상단 LIVE 상태 바에서 전국 18대 인프라 트래픽 스트림과 10분 주기 자동 동기화 카운트다운 타이머를 확인합니다.",
      tts: "11단계, 실시간 트래픽 스트림입니다. 상단 상태 바에서 전국 인프라 데이터의 실시간 동기화 주기와 타이머를 관리합니다.",
      action: (next) => {
        const statusBar = document.querySelector('.sync-status-bar');
        if (statusBar) {
          statusBar.style.boxShadow = '0 0 16px rgba(0, 122, 255, 0.6)';
          statusBar.style.borderColor = '#007aff';
          setTimeout(() => {
            statusBar.style.boxShadow = '';
            statusBar.style.borderColor = '';
          }, 2500);
        }
        setTimeout(next, 4000);
      }
    },
    {
      title: "12. 풀코스 시연 완료 및 초기화",
      desc: "모든 핵심 기능 시연이 성공적으로 완료되었습니다! 지도를 초기 상태로 복구하며, 전국 229개 지역을 자유롭게 분석해 보세요.",
      tts: "대한민국 인프라 소외지역 분석 플랫폼의 모든 기능 시연이 완료되었습니다. 전국 지도를 자유롭게 탐색해 보세요.",
      action: (next) => {
        // 열린 모달 정리
        if (typeof closeDisasterModal === 'function') closeDisasterModal();
        if (typeof closeTutorial === 'function') closeTutorial();

        // 추가 레이어 정리
        if (typeof overlayLayers !== 'undefined') {
          if (overlayLayers.maternal && map.hasLayer(overlayLayers.maternal.group)) toggleOverlayLayer('maternal');
          if (overlayLayers.transit && map.hasLayer(overlayLayers.transit.group)) toggleOverlayLayer('transit');
          if (overlayLayers.energy && map.hasLayer(overlayLayers.energy.group)) toggleOverlayLayer('energy');
          if (overlayLayers.disasterRainSnow && map.hasLayer(overlayLayers.disasterRainSnow.group)) toggleOverlayLayer('disasterRainSnow');
        }

        // 카메라 원위치
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
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.7);
      border-radius: 20px;
      padding: 16px 20px;
      box-shadow: 0 14px 40px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.08);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      width: 340px;
      box-sizing: border-box;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    `;

    widget.innerHTML = `
      <!-- 헤더 -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:17px;">🎬</span>
          <span style="font-weight:800; font-size:14px; color:#1d1d1f; letter-spacing:-0.2px;">전 기능 풀코스 자동 시연</span>
        </div>
        <div style="display:flex; align-items:center; gap:6px;">
          <!-- 구글 TTS 토글 버튼 -->
          <button id="demoTtsToggleBtn" title="구글 TTS 안내 켜기/끄기" style="background:rgba(0,122,255,0.1); border:1px solid rgba(0,122,255,0.3); border-radius:12px; font-size:11px; font-weight:700; color:#007aff; padding:3px 8px; cursor:pointer; display:flex; align-items:center; gap:3px; transition:all 0.2s;">
            <span id="demoTtsIcon">🔊</span> <span id="demoTtsText">구글 TTS ON</span>
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
      <div id="demoTitle" style="font-size:13.5px; font-weight:800; color:#007aff; margin-bottom:5px; line-height:1.35; word-break:keep-all;">
        12단계 핵심 기능 자동 시연
      </div>
      <div id="demoDesc" style="font-size:11.5px; color:#636366; margin-bottom:14px; line-height:1.45; min-height:36px; word-break:keep-all;">
        버튼을 누르면 전국 지도, 행정구역 검색, 7대 인프라 레이어, 마커 클러스터링, 재해 상황판까지 전 기능이 음성과 함께 자동 실행됩니다.
      </div>

      <!-- 컨트롤 버튼 영역 -->
      <div id="demoBtnGroupReady" style="display:flex; gap:6px;">
        <button id="demoStartBtn" style="flex:1; padding:10px 14px; border:none; border-radius:12px; background:linear-gradient(135deg, #007aff, #0056b3); color:#fff; font-size:13px; font-weight:800; cursor:pointer; box-shadow:0 4px 14px rgba(0,122,255,0.35); transition:all 0.2s;">
          ▶ 전 기능 자동 시연 시작
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

  // 구글 TTS 토글 기능
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
      if (text) text.innerText = '구글 TTS ON';
      if (isRunning && !isPaused && demoSteps[currentStepIndex]) {
        speakText(demoSteps[currentStepIndex].tts || demoSteps[currentStepIndex].desc);
      }
    } else {
      stopTTS();
      btn.style.background = 'rgba(142,142,147,0.12)';
      btn.style.borderColor = 'rgba(142,142,147,0.3)';
      btn.style.color = '#8e8e93';
      if (icon) icon.innerText = '🔇';
      if (text) text.innerText = '구글 TTS OFF';
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

  // 최소화 시 우측 하단 플로팅 알약 버튼
  function createMinimizedFloatingButton() {
    if (document.getElementById('demoFloatingMiniPill')) return;
    const miniPill = document.createElement('button');
    miniPill.id = 'demoFloatingMiniPill';
    miniPill.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 10000;
      background: rgba(0, 122, 255, 0.92);
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
    miniPill.innerHTML = `🎬 풀코스 시연 ${ttsEnabled ? '🔊' : '🔇'} ${isRunning ? `(${currentStepIndex + 1}/${demoSteps.length})` : ''}`;
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

  // 각 단계 자동 실행 및 다음 단계 자동 연계
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

    // 구글 TTS 음성 재생
    speakText(step.tts || step.desc);

    // 액션 실행 ➔ 완료 시 자동으로 다음 단계 실행
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
      if (descEl) descEl.innerText = "[일시정지됨] '재개' 버튼을 누르시면 자동 시연이 계속 진행됩니다.";
    } else {
      isPaused = false;
      pauseBtn.innerText = "⏸ 일시정지";
      pauseBtn.style.background = "#ff9500";
      currentStepIndex++;
      runStep();
    }
  }

  // 수동 이전 단계 (자동 넘김 모드 유지)
  function prevStep() {
    if (!isRunning) return;
    stopTTS();
    isPaused = false;
    const pauseBtn = document.getElementById('demoPauseBtn');
    if (pauseBtn) {
      pauseBtn.innerText = "⏸ 일시정지";
      pauseBtn.style.background = "#ff9500";
    }
    currentStepIndex = Math.max(0, currentStepIndex - 1);
    runStep();
  }

  // 수동 다음 단계 (자동 넘김 모드 유지)
  function nextStep() {
    if (!isRunning) return;
    stopTTS();
    isPaused = false;
    const pauseBtn = document.getElementById('demoPauseBtn');
    if (pauseBtn) {
      pauseBtn.innerText = "⏸ 일시정지";
      pauseBtn.style.background = "#ff9500";
    }
    currentStepIndex = Math.min(demoSteps.length - 1, currentStepIndex + 1);
    runStep();
  }

  // 풀코스 시연 정상 완료
  function completeDemo() {
    isRunning = false;
    isPaused = false;
    currentStepIndex = 0;

    document.getElementById('demoBtnGroupReady').style.display = 'flex';
    document.getElementById('demoBtnGroupRunning').style.display = 'none';

    const startBtn = document.getElementById('demoStartBtn');
    if (startBtn) {
      startBtn.innerText = '↺ 전 기능 자동 시연 다시 시작';
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
    if (titleEl) titleEl.innerText = '모든 핵심 기능 시연이 완료되었습니다 ✨';

    const descEl = document.getElementById('demoDesc');
    if (descEl) descEl.innerText = '전국 229개 행정구역 검색, 7대 인프라 레이어, 마커 클러스터링, 자연재해 상황판까지 전 기능 시연이 끝났습니다. 자유롭게 탐색해 보세요!';

    speakText('대한민국 인프라 소외지역 분석 플랫폼의 모든 기능 시연이 완료되었습니다. 전국 지도를 자유롭게 탐색해 보세요.');
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
      startBtn.innerText = '▶ 전 기능 자동 시연 시작';
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
    if (descEl) descEl.innerText = '언제든 버튼을 눌러 풀코스 자동 시연을 다시 시작하실 수 있습니다.';

    // 지도 및 모달 원위치
    if (typeof closeDisasterModal === 'function') closeDisasterModal();
    if (typeof closeTutorial === 'function') closeTutorial();
    if (window.map) {
      window.map.flyTo([36.1, 127.8], 7.2, { duration: 1.5 });
    }
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
