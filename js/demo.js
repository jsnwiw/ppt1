/**
 * js/demo.js
 * 대한민국 인프라 소외지역 실시간 분석 지도 - 무음 컴팩트 자동 시연(Silent Compact Demo) 모듈
 * (기능 설명 나레이션 및 설명 텍스트 제거 / 순수 지도 인터랙션 중심 자동 시연)
 * 
 * 시연 시나리오:
 * 1. 전국 인프라 지도 베이스맵 개요
 * 2. 실시간 행정구역 검색 (강원 속초시 26km 버퍼 원 & 팝업)
 * 3. 초고위험 소외지역 심층 분석 (경북 의성군 이동 & 패널 진단)
 * 4. 전문 인프라 레이어 다중 투사 (분만공백, 교통단절, 에너지소외)
 * 5. 13대 인프라 카테고리 필터링 (패널 버튼 & 이모지 마커)
 * 6. 지도 핀 숨기기 / 표시하기 토글
 * 7. 글래스모피즘 마커 클러스터링 시연
 * 8. 실시간 자연재해 특보 상황판 연동 (호우/대설 통제구간)
 * 9. 좌측 패널 접기 / 펼치기 (화면 전체화)
 * 10. 실시간 동기화 상태 바 & 타이머 하이라이트
 * 11. 시연 완료 및 초기화 (원위치 복원)
 */

(function () {
  'use strict';

  // 시연 시나리오 단계 정의 (설명 나레이션 없이 순수 기능 액션 실행)
  const demoSteps = [
    {
      title: "1. 전국 베이스맵 개요",
      action: (next) => {
        if (typeof closeDisasterModal === 'function') closeDisasterModal();
        if (typeof closeSearchAlert === 'function') closeSearchAlert();
        if (typeof closeTutorial === 'function') closeTutorial();

        if (window.map) {
          window.map.closePopup();
          window.map.flyTo([36.2, 127.8], 7.1, { duration: 1.2 });
        }
        setTimeout(next, 3200);
      }
    },
    {
      title: "2. 행정구역 검색 & 26km 버퍼 (속초시)",
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
          setTimeout(next, 3800);
        }, 800);
      }
    },
    {
      title: "3. 초고위험 소외지역 분석 (경북 의성군)",
      action: (next) => {
        if (typeof allRegionsComprehensiveData !== 'undefined') {
          const uiseongIdx = allRegionsComprehensiveData.findIndex(r => r.name.includes('의성'));
          if (uiseongIdx !== -1 && typeof selectAndInspectRegion === 'function') {
            selectAndInspectRegion(uiseongIdx, true);
          } else if (typeof executeSearchButton === 'function') {
            const input = document.getElementById('searchInput');
            if (input) input.value = "경북 의성군";
            executeSearchButton();
          }
        }
        setTimeout(next, 3800);
      }
    },
    {
      title: "4. 전문 인프라 분석 레이어 투사",
      action: (next) => {
        if (window.map) {
          window.map.flyTo([36.0, 128.2], 8.2, { duration: 1.0 });
        }

        setTimeout(() => {
          if (typeof toggleOverlayLayer === 'function') {
            toggleOverlayLayer('maternal'); // 분만공백 ON
            setTimeout(() => {
              toggleOverlayLayer('transit'); // 교통단절 ON
              setTimeout(() => {
                toggleOverlayLayer('energy'); // 에너지소외 ON
                setTimeout(next, 3600);
              }, 900);
            }, 900);
          } else {
            next();
          }
        }, 700);
      }
    },
    {
      title: "5. 13대 인프라 카테고리 필터링",
      action: (next) => {
        if (typeof toggleInfraOnMap === 'function') {
          toggleInfraOnMap('🚨 응급의료');
          setTimeout(() => {
            toggleInfraOnMap('🚨 응급의료'); // 해제
            toggleInfraOnMap('🚆 교통/철도'); // 교통/철도 ON
            setTimeout(next, 3400);
          }, 1400);
        } else {
          next();
        }
      }
    },
    {
      title: "6. 지도 핀 숨김 / 표시 토글",
      action: (next) => {
        if (typeof toggleCategoryPins === 'function') {
          toggleCategoryPins(); // 핀 숨김
          setTimeout(() => {
            toggleCategoryPins(); // 핀 복원
            setTimeout(next, 3200);
          }, 1500);
        } else {
          next();
        }
      }
    },
    {
      title: "7. 마커 클러스터링 (핀 겹침 방지)",
      action: (next) => {
        if (window.map) {
          window.map.flyTo([36.3, 127.8], 7.0, { duration: 1.2 });
        }
        setTimeout(next, 3400);
      }
    },
    {
      title: "8. 실시간 자연재해 특보 상황판",
      action: (next) => {
        if (typeof openDisasterModal === 'function') {
          openDisasterModal();
        }
        setTimeout(() => {
          if (typeof triggerRainSnowDisaster === 'function') {
            triggerRainSnowDisaster();
          }
          setTimeout(next, 3800);
        }, 1200);
      }
    },
    {
      title: "9. 좌측 패널 접기 / 펼치기",
      action: (next) => {
        if (typeof toggleSidebarPanel === 'function') {
          toggleSidebarPanel(); // 패널 접기
          setTimeout(() => {
            toggleSidebarPanel(); // 패널 펼치기
            setTimeout(next, 3000);
          }, 1400);
        } else {
          next();
        }
      }
    },
    {
      title: "10. 실시간 동기화 상태 바 & 타이머",
      action: (next) => {
        const statusBar = document.querySelector('.sync-status-bar');
        if (statusBar) {
          statusBar.style.boxShadow = '0 0 16px rgba(0, 122, 255, 0.7)';
          statusBar.style.borderColor = '#007aff';
          setTimeout(() => {
            statusBar.style.boxShadow = '';
            statusBar.style.borderColor = '';
          }, 2000);
        }
        setTimeout(next, 2800);
      }
    },
    {
      title: "11. 시연 완료 및 초기화",
      action: (next) => {
        cleanupDemoState();
        setTimeout(next, 2200);
      }
    }
  ];

  // 시연 상태 정리 및 원위치 복원 함수
  function cleanupDemoState() {
    // 1. 열린 모달 닫기
    if (typeof closeDisasterModal === 'function') closeDisasterModal();
    if (typeof closeTutorial === 'function') closeTutorial();
    if (typeof closeSearchAlert === 'function') closeSearchAlert();

    // 2. 팝업 닫기
    if (window.map) {
      window.map.closePopup();
    }

    // 3. 인프라 버튼 필터 해제
    if (typeof activeInfraFilterKeys !== 'undefined' && activeInfraFilterKeys.size > 0) {
      const keys = Array.from(activeInfraFilterKeys);
      keys.forEach(k => {
        if (typeof toggleInfraOnMap === 'function') toggleInfraOnMap(k);
      });
    }

    // 4. 지도 핀 표시 복원
    if (typeof areCategoryPinsVisible !== 'undefined' && !areCategoryPinsVisible) {
      if (typeof showCategoryMarkersOnMap === 'function') showCategoryMarkersOnMap();
    }

    // 5. 추가된 오버레이 레이어 끄기
    if (typeof overlayLayers !== 'undefined') {
      if (overlayLayers.maternal && map.hasLayer(overlayLayers.maternal.group)) toggleOverlayLayer('maternal');
      if (overlayLayers.transit && map.hasLayer(overlayLayers.transit.group)) toggleOverlayLayer('transit');
      if (overlayLayers.energy && map.hasLayer(overlayLayers.energy.group)) toggleOverlayLayer('energy');
      if (overlayLayers.banking && map.hasLayer(overlayLayers.banking.group)) toggleOverlayLayer('banking');
      if (overlayLayers.disasterRainSnow && map.hasLayer(overlayLayers.disasterRainSnow.group)) toggleOverlayLayer('disasterRainSnow');
    }

    // 6. 검색 마커 및 26km 버퍼 원 제거
    if (typeof liveRegionBufferGroup !== 'undefined') {
      liveRegionBufferGroup.clearLayers();
    }
    if (typeof currentMarker !== 'undefined' && currentMarker && window.map) {
      map.removeLayer(currentMarker);
      currentMarker = null;
    }

    // 7. 검색창 초기화
    const input = document.getElementById('searchInput');
    if (input) input.value = '';

    // 8. 카메라 원위치
    if (window.map) {
      window.map.flyTo([36.1, 127.8], 7.2, { duration: 1.5 });
    }
  }

  let currentStepIndex = 0;
  let isRunning = false;
  let isPaused = false;
  let isMinimized = false;

  // 플로팅 시연 컨트롤러 UI 생성 (설명 텍스트 제거된 슬림 컴팩트 디자인)
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
      border-radius: 18px;
      padding: 12px 16px;
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.18), 0 2px 8px rgba(0, 0, 0, 0.08);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      width: 290px;
      box-sizing: border-box;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    `;

    widget.innerHTML = `
      <!-- 헤더 (타이틀 & 배지 & 최소화 버튼) -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <div style="display:flex; align-items:center; gap:6px;">
          <span style="font-size:15px;">🎬</span>
          <span style="font-weight:800; font-size:13px; color:#1d1d1f; letter-spacing:-0.2px;">자동 시연</span>
        </div>
        <div style="display:flex; align-items:center; gap:6px;">
          <span id="demoStepBadge" style="font-size:10.5px; font-weight:700; padding:2px 8px; border-radius:10px; background:#e5e5ea; color:#3a3a3c;">
            READY
          </span>
          <button id="demoMinimizeBtn" title="최소화" style="background:none; border:none; cursor:pointer; font-size:12px; color:#8e8e93; padding:2px; line-height:1;">
            ✕
          </button>
        </div>
      </div>

      <!-- 프로그레스 바 -->
      <div style="width:100%; height:3.5px; background:rgba(0,0,0,0.06); border-radius:2px; margin-bottom:9px; overflow:hidden;">
        <div id="demoProgressBar" style="width:0%; height:100%; background:linear-gradient(90deg, #007aff, #5856d6); transition:width 0.35s ease; border-radius:2px;"></div>
      </div>

      <!-- 현재 실행 중인 단계명 (설명문 제거됨) -->
      <div id="demoTitle" style="font-size:12.5px; font-weight:700; color:#007aff; margin-bottom:10px; line-height:1.3; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
        원터치 자동 시연 모드
      </div>

      <!-- 컨트롤 버튼 영역 -->
      <div id="demoBtnGroupReady" style="display:flex; gap:6px;">
        <button id="demoStartBtn" style="flex:1; padding:8px 12px; border:none; border-radius:10px; background:linear-gradient(135deg, #007aff, #0056b3); color:#fff; font-size:12px; font-weight:800; cursor:pointer; box-shadow:0 3px 10px rgba(0,122,255,0.3); transition:all 0.2s;">
          ▶ 자동 시연 시작
        </button>
      </div>

      <div id="demoBtnGroupRunning" style="display:none; gap:5px; flex-wrap:wrap;">
        <button id="demoPrevBtn" style="flex:1; padding:6px 6px; border:1px solid #d1d1d6; border-radius:7px; background:#fff; color:#1d1d1f; font-size:11px; font-weight:600; cursor:pointer;">
          ◀ 이전
        </button>
        <button id="demoPauseBtn" style="flex:1.2; padding:6px 6px; border:none; border-radius:7px; background:#ff9500; color:#fff; font-size:11px; font-weight:700; cursor:pointer;">
          ⏸ 일시정지
        </button>
        <button id="demoNextBtn" style="flex:1; padding:6px 6px; border:1px solid #d1d1d6; border-radius:7px; background:#fff; color:#1d1d1f; font-size:11px; font-weight:600; cursor:pointer;">
          다음 ▶
        </button>
        <button id="demoStopBtn" style="width:100%; margin-top:3px; padding:5px; border:none; border-radius:7px; background:rgba(255,59,48,0.12); color:#ff3b30; font-size:11px; font-weight:700; cursor:pointer;">
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
      border-radius: 20px;
      padding: 7px 14px;
      font-size: 11.5px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 6px 20px rgba(0, 122, 255, 0.35);
      display: flex;
      align-items: center;
      gap: 5px;
      transition: all 0.2s ease;
    `;
    miniPill.innerHTML = `🎬 자동 시연 ${isRunning ? `(${currentStepIndex + 1}/${demoSteps.length})` : ''}`;
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
      pauseBtn.innerText = "▶ 재개";
      pauseBtn.style.background = "#34c759";
      const titleEl = document.getElementById('demoTitle');
      if (titleEl) titleEl.innerText = "[일시정지됨] 클릭 시 계속 진행";
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
    isPaused = false;
    const pauseBtn = document.getElementById('demoPauseBtn');
    if (pauseBtn) {
      pauseBtn.innerText = "⏸ 일시정지";
      pauseBtn.style.background = "#ff9500";
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
  }

  // 시연 강제 종료
  function stopDemo() {
    isRunning = false;
    isPaused = false;
    currentStepIndex = 0;

    cleanupDemoState();

    document.getElementById('demoBtnGroupReady').style.display = 'flex';
    document.getElementById('demoBtnGroupRunning').style.display = 'none';

    const startBtn = document.getElementById('demoStartBtn');
    if (startBtn) {
      startBtn.innerText = '▶ 자동 시연 시작';
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
