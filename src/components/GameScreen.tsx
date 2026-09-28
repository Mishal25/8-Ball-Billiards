import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  RotateCcw,
  RotateCw,
  RefreshCw,
  LogOut,
  Zap,
} from 'lucide-react';
import {
  GameMode,
  AIDifficulty,
  TurnState,
  Ball,
  PlayerStats,
  SettingsData,
} from '../types';
import {
  TABLE,
  BALL_COLORS,
  getTablePockets,
  createStandardRack,
  updatePhysics,
  computeAimTrajectory,
  calculateAIShot,
} from '../physics';
import { audio } from '../audio';

interface GameScreenProps {
  mode: GameMode;
  difficulty: AIDifficulty;
  settings: SettingsData;
  playerName: string;
  onMatchComplete: (winner: PlayerStats, p1Stats: PlayerStats, coinsEarned: number) => void;
  onExitHome: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  mode,
  difficulty,
  settings,
  playerName,
  onMatchComplete,
  onExitHome,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Match State
  const [turnState, setTurnState] = useState<TurnState>('aiming');
  const [activePlayer, setActivePlayer] = useState<1 | 2>(1);
  const [aimAngle, setAimAngle] = useState<number>(0);
  const [shotPower, setShotPower] = useState<number>(45);
  const [openTable, setOpenTable] = useState<boolean>(true);
  const [isBreakShot, setIsBreakShot] = useState<boolean>(true);
  const [bannerNotice, setBannerNotice] = useState<string>('YOUR TURN - BREAK SHOT');
  const [overlayNotice, setOverlayNotice] = useState<string | null>(null);
  const [isBallInHand, setIsBallInHand] = useState<boolean>(false);

  // Player Records
  const [p1, setP1] = useState<PlayerStats>({
    name: playerName || 'Mishal',
    group: null,
    remaining: 7,
    fouls: 0,
    shots: 0,
    pocketed: 0,
  });

  const [p2, setP2] = useState<PlayerStats>({
    name: mode === 'ai' ? `Royale AI (${difficulty.toUpperCase()})` : 'Player 2',
    group: null,
    remaining: 7,
    fouls: 0,
    shots: 0,
    pocketed: 0,
  });

  // Game Engine mutable references (avoid React re-render lags in 60fps physics loop)
  const ballsRef = useRef<Ball[]>([]);
  const isDraggingAimRef = useRef<boolean>(false);
  const isDraggingCueBallRef = useRef<boolean>(false);
  const turnStateRef = useRef<TurnState>('aiming');
  const activePlayerRef = useRef<1 | 2>(1);
  const aimAngleRef = useRef<number>(0);
  const shotPowerRef = useRef<number>(45);
  const openTableRef = useRef<boolean>(true);
  const isBreakShotRef = useRef<boolean>(true);
  const firstBallHitRef = useRef<Ball | null>(null);
  const pocketedThisTurnRef = useRef<Ball[]>([]);
  const p1Ref = useRef<PlayerStats>(p1);
  const p2Ref = useRef<PlayerStats>(p2);
  const aiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noticeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync refs with state
  useEffect(() => {
    turnStateRef.current = turnState;
  }, [turnState]);
  useEffect(() => {
    activePlayerRef.current = activePlayer;
  }, [activePlayer]);
  useEffect(() => {
    aimAngleRef.current = aimAngle;
  }, [aimAngle]);
  useEffect(() => {
    shotPowerRef.current = shotPower;
  }, [shotPower]);
  useEffect(() => {
    openTableRef.current = openTable;
  }, [openTable]);
  useEffect(() => {
    isBreakShotRef.current = isBreakShot;
  }, [isBreakShot]);
  useEffect(() => {
    p1Ref.current = p1;
  }, [p1]);
  useEffect(() => {
    p2Ref.current = p2;
  }, [p2]);

  const showTempNotice = useCallback((text: string, duration: number = 2000) => {
    setOverlayNotice(text);
    if (noticeTimeoutRef.current) clearTimeout(noticeTimeoutRef.current);
    noticeTimeoutRef.current = setTimeout(() => {
      setOverlayNotice(null);
    }, duration);
  }, []);

  // Initialize Game & Setup Rack
  const startNewRack = useCallback(() => {
    if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    if (noticeTimeoutRef.current) clearTimeout(noticeTimeoutRef.current);

    ballsRef.current = createStandardRack();
    setTurnState('aiming');
    setActivePlayer(1);
    setOpenTable(true);
    setIsBreakShot(true);
    setIsBallInHand(false);
    setAimAngle(0);
    setShotPower(45);
    setBannerNotice(mode === 'practice' ? 'PRACTICE TABLE - SHOOT FREELY' : 'YOUR TURN - BREAK SHOT');
    setOverlayNotice(null);

    const initialP1: PlayerStats = {
      name: playerName || 'Mishal',
      group: null,
      remaining: 7,
      fouls: 0,
      shots: 0,
      pocketed: 0,
    };
    const initialP2: PlayerStats = {
      name: mode === 'ai' ? `Royale AI (${difficulty.toUpperCase()})` : 'Player 2',
      group: null,
      remaining: 7,
      fouls: 0,
      shots: 0,
      pocketed: 0,
    };
    setP1(initialP1);
    setP2(initialP2);

    audio.playCushionBounce(1.4);
  }, [mode, difficulty, playerName]);

  useEffect(() => {
    startNewRack();
  }, [startNewRack]);

  // Turn Resolution Logic (8-Ball standard competitive rules)
  const resolveTurn = useCallback(() => {
    const balls = ballsRef.current;
    const cueBall = balls.find((b) => b.isCue);
    const pottedBalls = pocketedThisTurnRef.current;
    const firstHit = firstBallHitRef.current;
    const isBreak = isBreakShotRef.current;
    const currentActive = activePlayerRef.current;

    const activeStats = currentActive === 1 ? { ...p1Ref.current } : { ...p2Ref.current };
    const opponentStats = currentActive === 1 ? { ...p2Ref.current } : { ...p1Ref.current };

    if (mode === 'practice') {
      if (cueBall && cueBall.inPocket) {
        cueBall.inPocket = false;
        cueBall.vx = 0;
        cueBall.vy = 0;
        cueBall.x = TABLE.x + TABLE.w * 0.25;
        cueBall.y = TABLE.y + TABLE.h * 0.5;
        showTempNotice('SCRATCH! CUE BALL RESET', 1500);
      }
      setTurnState('aiming');
      return;
    }

    let foul = false;
    let switchTurn = false;
    let matchOver = false;
    let matchWinner: PlayerStats | null = null;

    const pottedCue = pottedBalls.some((b) => b.isCue);
    const pottedEight = pottedBalls.some((b) => b.isEight);
    const objectBallsPotted = pottedBalls.filter((b) => !b.isCue && !b.isEight);

    // 1. Scratch detection
    if (pottedCue) {
      foul = true;
      activeStats.fouls++;
      showTempNotice('FOUL! CUE BALL SCRATCH', 2200);
      audio.playFoul(settings.vibration);
      if (cueBall) {
        cueBall.inPocket = false;
        cueBall.vx = 0;
        cueBall.vy = 0;
        cueBall.x = TABLE.x + TABLE.w * 0.25;
        cueBall.y = TABLE.y + TABLE.h * 0.5;
      }
    }

    // 2. 8-Ball Pocketing detection
    if (pottedEight) {
      if (isBreak) {
        // Respot 8-ball if potted on break
        const eight = balls.find((b) => b.isEight);
        if (eight) {
          eight.inPocket = false;
          eight.vx = 0;
          eight.vy = 0;
          eight.x = TABLE.x + TABLE.w * 0.72;
          eight.y = TABLE.y + TABLE.h * 0.5;
        }
        showTempNotice('8-BALL POCKETED ON BREAK! RE-SPOTTED', 2500);
      } else if (activeStats.remaining === 0 && !pottedCue) {
        // Legitimate 8-ball win!
        matchOver = true;
        matchWinner = activeStats;
      } else {
        // Early 8-ball pocket or scratch while potting 8-ball = loss!
        matchOver = true;
        matchWinner = opponentStats;
        showTempNotice(
          pottedCue ? 'FOUL SCRATCH ON 8-BALL! LOSS' : 'EARLY 8-BALL POCKET! LOSS',
          3000
        );
      }
    }

    // 3. Establish Solids vs. Stripes Groups on open table
    if (openTableRef.current && objectBallsPotted.length > 0 && !isBreak && !foul) {
      const firstPotted = objectBallsPotted[0];
      if (firstPotted.isStriped) {
        activeStats.group = 'stripes';
        opponentStats.group = 'solids';
      } else {
        activeStats.group = 'solids';
        opponentStats.group = 'stripes';
      }
      setOpenTable(false);
      showTempNotice(`${activeStats.name.toUpperCase()} IS ${activeStats.group.toUpperCase()}!`, 2200);
    }

    // 4. Check First Contact Foul (must hit own group ball first once established)
    if (!openTableRef.current && !foul && !isBreak) {
      if (!firstHit) {
        foul = true;
        activeStats.fouls++;
        showTempNotice('FOUL! NO BALL CONTACT', 2000);
        audio.playFoul(settings.vibration);
      } else if (activeStats.remaining > 0) {
        const hitOwnGroup =
          (activeStats.group === 'solids' && !firstHit.isStriped && !firstHit.isEight) ||
          (activeStats.group === 'stripes' && firstHit.isStriped && !firstHit.isEight);
        if (!hitOwnGroup) {
          foul = true;
          activeStats.fouls++;
          showTempNotice('FOUL! WRONG BALL HIT FIRST', 2000);
          audio.playFoul(settings.vibration);
        }
      } else {
        // Targeting 8-ball
        if (!firstHit.isEight) {
          foul = true;
          activeStats.fouls++;
          showTempNotice('FOUL! MUST HIT 8-BALL', 2000);
          audio.playFoul(settings.vibration);
        }
      }
    }

    // Count remaining balls for groups
    const solidsRemaining = balls.filter(
      (b) => !b.inPocket && !b.isCue && !b.isEight && !b.isStriped
    ).length;
    const stripesRemaining = balls.filter(
      (b) => !b.inPocket && !b.isCue && !b.isEight && b.isStriped
    ).length;

    if (activeStats.group === 'solids') {
      activeStats.remaining = solidsRemaining;
      opponentStats.remaining = stripesRemaining;
    } else if (activeStats.group === 'stripes') {
      activeStats.remaining = stripesRemaining;
      opponentStats.remaining = solidsRemaining;
    }

    // 5. Continuation vs Turn Switch
    let madeLegalPocket = false;
    if (!foul && objectBallsPotted.length > 0) {
      if (openTableRef.current) {
        madeLegalPocket = true;
      } else {
        madeLegalPocket = objectBallsPotted.some(
          (b) =>
            (activeStats.group === 'solids' && !b.isStriped) ||
            (activeStats.group === 'stripes' && b.isStriped)
        );
      }
    }

    if (madeLegalPocket) {
      activeStats.pocketed += objectBallsPotted.length;
      showTempNotice('NICE SHOT! KEEP TURN', 1500);
      switchTurn = false;
    } else {
      switchTurn = true;
    }

    if (foul) {
      switchTurn = true;
    }

    // Update state objects
    if (currentActive === 1) {
      setP1(activeStats);
      setP2(opponentStats);
    } else {
      setP2(activeStats);
      setP1(opponentStats);
    }

    setIsBreakShot(false);

    // 6. Handle Match Finished
    if (matchOver && matchWinner) {
      setTurnState('gameover');
      const won = matchWinner.name === p1Ref.current.name;
      onMatchComplete(matchWinner, p1Ref.current, won ? 250 : -50);
      return;
    }

    // 7. Advance Turn
    const nextPlayer = switchTurn ? (currentActive === 1 ? 2 : 1) : currentActive;
    setActivePlayer(nextPlayer);

    if (foul) {
      setIsBallInHand(true);
      setTurnState('in_hand');
      setBannerNotice(
        nextPlayer === 1
          ? 'FOUL BY OPPONENT - BALL IN HAND'
          : mode === 'ai'
          ? 'FOUL! AI HAS BALL IN HAND'
          : 'FOUL! PLAYER 2 BALL IN HAND'
      );
    } else {
      setIsBallInHand(false);
      setTurnState('aiming');
      setBannerNotice(
        nextPlayer === 1
          ? 'YOUR TURN'
          : mode === 'ai'
          ? 'OPPONENT TURN (AI)'
          : 'PLAYER 2 TURN'
      );
    }

    // 8. If next is AI, trigger AI planning
    if (mode === 'ai' && nextPlayer === 2) {
      triggerAiShot();
    }
  }, [mode, settings.vibration, showTempNotice, onMatchComplete]);

  // AI Execution Pipeline
  const triggerAiShot = useCallback(() => {
    setBannerNotice('OPPONENT TURN - AI CALCULATING...');

    if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    const delay = difficulty === 'easy' ? 1200 : difficulty === 'medium' ? 1400 : 1600;

    aiTimeoutRef.current = setTimeout(() => {
      const balls = ballsRef.current;
      const cueBall = balls.find((b) => b.isCue);
      if (!cueBall) return;

      // Handle AI Ball in hand
      if (isBallInHand) {
        cueBall.inPocket = false;
        cueBall.vx = 0;
        cueBall.vy = 0;
        cueBall.x = TABLE.x + TABLE.w * 0.25;
        cueBall.y = TABLE.y + TABLE.h * 0.5;
        setIsBallInHand(false);
        setTurnState('aiming');
      }

      const plan = calculateAIShot(
        cueBall,
        balls,
        p2Ref.current.group,
        p2Ref.current.remaining,
        openTableRef.current,
        difficulty
      );

      if (plan) {
        setAimAngle(plan.aimAngle);
        setShotPower(plan.power);
      }

      // Brief aiming pause before release
      setTimeout(() => {
        executeShoot();
      }, 550);
    }, delay);
  }, [difficulty, isBallInHand]);

  // Execute Shoot
  const executeShoot = useCallback(() => {
    if (turnStateRef.current !== 'aiming' && turnStateRef.current !== 'in_hand') return;
    const cueBall = ballsRef.current.find((b) => b.isCue);
    if (!cueBall || cueBall.inPocket) return;

    // Register shot count
    if (activePlayerRef.current === 1) {
      setP1((prev) => ({ ...prev, shots: prev.shots + 1 }));
    } else {
      setP2((prev) => ({ ...prev, shots: prev.shots + 1 }));
    }

    // Velocity vector: 4 to 28 units/frame
    const speed = 4.5 + (shotPowerRef.current / 100) * 24.5;
    cueBall.vx = Math.cos(aimAngleRef.current) * speed;
    cueBall.vy = Math.sin(aimAngleRef.current) * speed;

    audio.playCueStrike(shotPowerRef.current / 100);

    firstBallHitRef.current = null;
    pocketedThisTurnRef.current = [];
    setIsBallInHand(false);
    setTurnState('moving');
  }, []);

  // Main Canvas Render & Physics Loop
  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const balls = ballsRef.current;
      const pockets = getTablePockets();
      const cueBall = balls.find((b) => b.isCue);

      // Step physics if moving
      if (turnStateRef.current === 'moving') {
        const result = updatePhysics(
          balls,
          pockets,
          4,
          firstBallHitRef.current,
          settings.vibration
        );

        if (result.firstHit && !firstBallHitRef.current) {
          firstBallHitRef.current = result.firstHit;
        }

        if (result.newPocketed.length > 0) {
          pocketedThisTurnRef.current.push(...result.newPocketed);
        }

        if (!result.anyMoving) {
          resolveTurn();
        }
      }

      // Clear & Draw
      ctx.clearRect(0, 0, 900, 450);

      // 1. Table Outer Wood Frame & Cushions
      drawTable(ctx, pockets, settings.feltColor);

      // 2. Trajectory Guide (when aiming)
      if (
        turnStateRef.current === 'aiming' &&
        settings.aimGuide &&
        cueBall &&
        !cueBall.inPocket
      ) {
        drawTrajectoryGuide(ctx, cueBall, aimAngleRef.current, balls);
      }

      // 3. Balls (with shadows, glossy spherical highlights, numbers)
      drawBalls(ctx, balls);

      // 4. Cue Stick (animates back based on shot power)
      if (
        turnStateRef.current === 'aiming' &&
        cueBall &&
        !cueBall.inPocket &&
        !(mode === 'ai' && activePlayerRef.current === 2)
      ) {
        drawCueStick(ctx, cueBall, aimAngleRef.current, shotPowerRef.current);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [settings.feltColor, settings.aimGuide, settings.vibration, mode, resolveTurn]);

  // Canvas Resize handler
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const maxW = Math.min(1000, container.clientWidth - 24);
      const maxH = maxW * 0.5;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = 900 * dpr;
      canvas.height = 450 * dpr;
      canvas.style.width = `${maxW}px`;
      canvas.style.height = `${maxH}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.resetTransform();
        ctx.scale(dpr, dpr);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Pointer / Mouse / Touch Aiming Controls
  const getCanvasCoords = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 900,
      y: ((clientY - rect.top) / rect.height) * 450,
    };
  };

  const handlePointerDown = (clientX: number, clientY: number) => {
    if (turnState !== 'aiming' && turnState !== 'in_hand') return;
    if (mode === 'ai' && activePlayer === 2) return;

    const coords = getCanvasCoords(clientX, clientY);
    const cueBall = ballsRef.current.find((b) => b.isCue);
    if (!cueBall) return;

    if (turnState === 'in_hand') {
      const dist = Math.hypot(coords.x - cueBall.x, coords.y - cueBall.y);
      if (dist < cueBall.radius * 3) {
        isDraggingCueBallRef.current = true;
      }
      return;
    }

    isDraggingAimRef.current = true;
    const dx = coords.x - cueBall.x;
    const dy = coords.y - cueBall.y;
    setAimAngle(Math.atan2(dy, dx));
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    const coords = getCanvasCoords(clientX, clientY);
    const cueBall = ballsRef.current.find((b) => b.isCue);
    if (!cueBall) return;

    if (turnState === 'in_hand' && isDraggingCueBallRef.current) {
      const minX = TABLE.x + TABLE.cushionWidth + cueBall.radius;
      const maxX = TABLE.x + TABLE.w - TABLE.cushionWidth - cueBall.radius;
      const minY = TABLE.y + TABLE.cushionWidth + cueBall.radius;
      const maxY = TABLE.y + TABLE.h - TABLE.cushionWidth - cueBall.radius;
      cueBall.x = Math.max(minX, Math.min(maxX, coords.x));
      cueBall.y = Math.max(minY, Math.min(maxY, coords.y));
      return;
    }

    if (turnState === 'aiming') {
      if (mode === 'ai' && activePlayer === 2) return;
      // On desktop mouse movement continually points cue; on mobile requires active touch drag
      if (isDraggingAimRef.current || !('ontouchstart' in window)) {
        const dx = coords.x - cueBall.x;
        const dy = coords.y - cueBall.y;
        setAimAngle(Math.atan2(dy, dx));
      }
    }
  };

  const handlePointerUp = () => {
    if (isDraggingCueBallRef.current) {
      isDraggingCueBallRef.current = false;
      setIsBallInHand(false);
      setTurnState('aiming');
      showTempNotice('CUE BALL PLACED - READY TO STRIKE', 1800);
    }
    isDraggingAimRef.current = false;
  };

  // Keyboard shortcut: Space to strike
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && turnState === 'aiming') {
        e.preventDefault();
        executeShoot();
      } else if (e.code === 'ArrowLeft' && turnState === 'aiming') {
        e.preventDefault();
        setAimAngle((prev) => prev - 0.02);
      } else if (e.code === 'ArrowRight' && turnState === 'aiming') {
        e.preventDefault();
        setAimAngle((prev) => prev + 0.02);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [turnState, executeShoot]);

  return (
    <section className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center gap-2 h-full py-1">
      {/* TOP MATCH HUD */}
      <div className="w-full bg-[#11171f]/90 border border-white/10 rounded-xl p-2.5 sm:p-3 shadow-glass-box flex flex-wrap items-center justify-between gap-2 backdrop-blur-md">
        {/* Player 1 Card */}
        <div
          className={`flex items-center gap-2 sm:gap-3 px-3 py-1.5 rounded-lg border transition-all ${
            activePlayer === 1
              ? 'border-amber-500/80 bg-amber-500/20 shadow-gold-glow'
              : 'border-white/10 bg-white/5 opacity-70'
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-700 flex items-center justify-center text-xs font-black text-black">
            P1
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs sm:text-sm text-white">{p1.name}</span>
              {activePlayer === 1 && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-gray-300">
              <span className="font-semibold text-amber-300">
                {p1.group ? p1.group.toUpperCase() : 'Open Group'}
              </span>
              <span className="text-gray-400">Balls: {p1.remaining}</span>
            </div>
          </div>
        </div>

        {/* Center Banner & Match Mode */}
        <div className="flex flex-col items-center justify-center order-last sm:order-none w-full sm:w-auto my-1 sm:my-0">
          <div
            className={`px-4 py-1 rounded-full text-xs font-black tracking-widest uppercase transition-all shadow-md ${
              activePlayer === 1
                ? 'bg-amber-400 text-black shadow-gold-glow'
                : 'bg-sky-400 text-black shadow-md'
            }`}
          >
            {bannerNotice}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-1 font-mono">
            <span>
              {mode === 'ai'
                ? `VS AI (${difficulty.toUpperCase()})`
                : mode === 'pvp'
                ? '2 PLAYER LOCAL'
                : 'PRACTICE TABLE'}
            </span>
            <span>•</span>
            <span
              className={
                turnState === 'moving'
                  ? 'text-yellow-400 font-bold'
                  : turnState === 'in_hand'
                  ? 'text-emerald-400 font-bold'
                  : 'text-gray-300 font-bold'
              }
            >
              {turnState === 'moving'
                ? 'BALLS IN MOTION'
                : turnState === 'in_hand'
                ? 'BALL IN HAND'
                : mode === 'ai' && activePlayer === 2
                ? 'AI THINKING...'
                : 'READY TO STRIKE'}
            </span>
          </div>
        </div>

        {/* Player 2 / AI Card */}
        <div
          className={`flex items-center gap-2 sm:gap-3 px-3 py-1.5 rounded-lg border transition-all ${
            activePlayer === 2
              ? 'border-sky-500/80 bg-sky-500/20 shadow-md'
              : 'border-white/10 bg-white/5 opacity-70'
          }`}
        >
          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5">
              <span className="font-bold text-xs sm:text-sm text-gray-200">{p2.name}</span>
              {activePlayer === 2 && (
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 text-[10px] text-gray-300">
              <span className="text-gray-400">Balls: {p2.remaining}</span>
              <span className="font-semibold text-sky-300">
                {p2.group ? p2.group.toUpperCase() : 'Open Group'}
              </span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-700 flex items-center justify-center text-xs font-black text-white">
            {mode === 'ai' ? 'AI' : 'P2'}
          </div>
        </div>
      </div>

      {/* MAIN PLAY AREA: TABLE CANVAS + DESKTOP POWER RACK */}
      <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-3 my-auto relative">
        {/* CANVAS CONTAINER */}
        <div
          ref={containerRef}
          className="relative w-full max-w-[1000px] flex items-center justify-center rounded-2xl overflow-hidden p-2 sm:p-4 bg-[#140b07] table-wood-frame"
        >
          {/* Wood Rim Inlay Diamond Markers */}
          <div className="absolute inset-0 border-[14px] sm:border-[20px] border-[#2b160d] rounded-2xl pointer-events-none z-20">
            <div className="absolute top-1 left-1/4 w-1.5 h-1.5 bg-amber-200/50 rotate-45"></div>
            <div className="absolute top-1 left-2/4 w-1.5 h-1.5 bg-amber-200/50 rotate-45"></div>
            <div className="absolute top-1 left-3/4 w-1.5 h-1.5 bg-amber-200/50 rotate-45"></div>
            <div className="absolute bottom-1 left-1/4 w-1.5 h-1.5 bg-amber-200/50 rotate-45"></div>
            <div className="absolute bottom-1 left-2/4 w-1.5 h-1.5 bg-amber-200/50 rotate-45"></div>
            <div className="absolute bottom-1 left-3/4 w-1.5 h-1.5 bg-amber-200/50 rotate-45"></div>
          </div>

          {/* HTML5 Pool Canvas */}
          <canvas
            ref={canvasRef}
            onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
            onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
            onMouseUp={handlePointerUp}
            onTouchStart={(e) => {
              if (e.touches[0]) handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
            }}
            onTouchMove={(e) => {
              if (e.touches[0]) handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
            }}
            onTouchEnd={handlePointerUp}
            className="w-full h-auto cursor-crosshair rounded-xl z-10 shadow-2xl block"
          />

          {/* Canvas Floating Notice */}
          {overlayNotice && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 px-6 py-2.5 rounded-xl bg-black/85 border border-amber-500/60 text-amber-300 font-cinzel text-lg sm:text-2xl font-black tracking-widest uppercase shadow-gold-glow backdrop-blur-md animate-fade-in pointer-events-none">
              {overlayNotice}
            </div>
          )}

          {/* Ball in Hand Drag Tip Banner */}
          {isBallInHand && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 px-4 py-1.5 rounded-full bg-emerald-950/90 border border-emerald-500 text-emerald-300 text-xs font-semibold tracking-wide backdrop-blur-md shadow-lg pointer-events-none">
              Ball in Hand: Drag or tap cue ball to reposition anywhere
            </div>
          )}
        </div>

        {/* DESKTOP SIDE POWER RACK */}
        <div className="hidden lg:flex flex-col items-center justify-between bg-[#11171f]/85 border border-white/10 rounded-2xl p-4 h-[420px] shadow-glass-box backdrop-blur-md w-36 shrink-0">
          <div className="text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
              Shot Power
            </span>
            <span className="font-mono text-2xl font-black text-amber-400">{shotPower}%</span>
          </div>

          {/* Vertical Power Gauge Bar with Overlay Slider */}
          <div className="relative flex items-center justify-center h-[230px] my-2 w-full">
            <div className="w-5 h-full bg-black/60 rounded-full border border-white/10 relative overflow-hidden flex flex-col justify-end p-0.5">
              <div
                className="w-full bg-gradient-to-t from-emerald-500 via-amber-400 to-rose-600 rounded-full transition-all duration-75"
                style={{ height: `${shotPower}%` }}
              ></div>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              value={shotPower}
              onChange={(e) => setShotPower(parseInt(e.target.value, 10))}
              className="absolute inset-0 opacity-0 cursor-pointer h-full w-full"
              style={{ WebkitAppearance: 'slider-vertical' }}
            />
          </div>

          {/* Big Strike Button */}
          <button
            onClick={executeShoot}
            disabled={turnState !== 'aiming' || (mode === 'ai' && activePlayer === 2)}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-cinzel font-black text-sm tracking-wider rounded-xl shadow-gold-glow active:scale-95 transition cursor-pointer"
          >
            STRIKE
          </button>
        </div>
      </div>

      {/* BOTTOM CONTROL TRAY (RESPONSIVE) */}
      <div className="w-full bg-[#11171f]/90 border border-white/10 rounded-xl p-3 shadow-glass-box flex flex-wrap items-center justify-between gap-3 backdrop-blur-md">
        {/* Mobile / Tablet Power Controls */}
        <div className="flex-1 flex items-center gap-3 min-w-[220px]">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 w-28 shrink-0">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Power:</span>
            <span className="font-mono font-bold text-amber-400 text-sm">{shotPower}%</span>
          </div>
          <input
            type="range"
            min="5"
            max="100"
            value={shotPower}
            onChange={(e) => setShotPower(parseInt(e.target.value, 10))}
            className="power-slider flex-1"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Strike button on mobile */}
          <button
            onClick={executeShoot}
            disabled={turnState !== 'aiming' || (mode === 'ai' && activePlayer === 2)}
            className="lg:hidden flex-1 sm:flex-none px-6 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 disabled:opacity-40 text-black font-cinzel font-black text-sm rounded-lg shadow-gold-glow active:scale-95 transition cursor-pointer"
          >
            STRIKE CUE
          </button>

          {/* Stepper Buttons for Fine Aiming */}
          <div className="flex items-center bg-black/40 border border-white/10 rounded-lg p-0.5">
            <button
              onClick={() => setAimAngle((prev) => prev - 0.02)}
              className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded transition cursor-pointer"
              title="Fine Aim Left"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setAimAngle((prev) => prev + 0.02)}
              className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded transition cursor-pointer"
              title="Fine Aim Right"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          {/* Re-rack / Restart Button */}
          <button
            onClick={startNewRack}
            className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            title="Re-rack / Restart"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden md:inline">Re-rack</span>
          </button>

          {/* Exit to Menu Button */}
          <button
            onClick={onExitHome}
            className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Exit</span>
          </button>
        </div>
      </div>
    </section>
  );
};

// ================= CANVAS DRAWING HELPERS =================

function drawTable(
  ctx: CanvasRenderingContext2D,
  pockets: ReturnType<typeof getTablePockets>,
  feltStyle: SettingsData['feltColor']
) {
  const { x, y, w, h, cushionWidth } = TABLE;

  // Outer dark mahogany frame
  ctx.fillStyle = '#1b0e07';
  ctx.fillRect(0, 0, 900, 450);

  // Cushion wood border
  ctx.fillStyle = '#28150c';
  ctx.fillRect(x, y, w, h);

  // Cloth colors
  let feltPrimary = '#0b5a32';
  let feltShadow = '#05331c';
  if (feltStyle === 'tournament') {
    feltPrimary = '#12487c';
    feltShadow = '#072442';
  } else if (feltStyle === 'midnight') {
    feltPrimary = '#1a222d';
    feltShadow = '#0c1017';
  }

  // Cloth bed with radial illumination from overhead lamp
  const feltGrad = ctx.createRadialGradient(
    x + w / 2,
    y + h / 2,
    60,
    x + w / 2,
    y + h / 2,
    w * 0.6
  );
  feltGrad.addColorStop(0, feltPrimary);
  feltGrad.addColorStop(1, feltShadow);

  ctx.fillStyle = feltGrad;
  ctx.fillRect(x + cushionWidth, y + cushionWidth, w - cushionWidth * 2, h - cushionWidth * 2);

  // Inner felt cushion shadow
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.lineWidth = 5;
  ctx.strokeRect(
    x + cushionWidth + 2.5,
    y + cushionWidth + 2.5,
    w - cushionWidth * 2 - 5,
    h - cushionWidth * 2 - 5
  );

  // Head String (dashed line at 25% table length)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(x + w * 0.25, y + cushionWidth);
  ctx.lineTo(x + w * 0.25, y + h - cushionWidth);
  ctx.stroke();
  ctx.setLineDash([]);

  // Foot Spot (dot at 72% table length)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.beginPath();
  ctx.arc(x + w * 0.72, y + h * 0.5, 3, 0, Math.PI * 2);
  ctx.fill();

  // 6 Pockets
  pockets.forEach((p) => {
    // Leather mouth
    ctx.fillStyle = '#080808';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();

    // Deep cavity
    const cavity = ctx.createRadialGradient(p.x, p.y, p.r * 0.2, p.x, p.y, p.r);
    cavity.addColorStop(0, '#000000');
    cavity.addColorStop(1, '#151515');
    ctx.fillStyle = cavity;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * 0.85, 0, Math.PI * 2);
    ctx.fill();

    // Brass rim
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
    ctx.lineWidth = 2;
    ctx.stroke();
  });
}

function drawTrajectoryGuide(
  ctx: CanvasRenderingContext2D,
  cueBall: Ball,
  aimAngle: number,
  balls: Ball[]
) {
  const traj = computeAimTrajectory(cueBall, aimAngle, balls);

  // Main laser line from cue ball
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.85)';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(cueBall.x, cueBall.y);
  ctx.lineTo(traj.endX, traj.endY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Projected Ghost Ball at contact
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(traj.endX, traj.endY, cueBall.radius, 0, Math.PI * 2);
  ctx.stroke();

  // Deflected target ball trajectory
  if (traj.hitBall && traj.targetDeflectionAngle !== null) {
    const tNormX = Math.cos(traj.targetDeflectionAngle);
    const tNormY = Math.sin(traj.targetDeflectionAngle);

    ctx.strokeStyle = 'rgba(16, 185, 129, 0.8)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(traj.hitBall.x, traj.hitBall.y);
    ctx.lineTo(traj.hitBall.x + tNormX * 70, traj.hitBall.y + tNormY * 70);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

function drawBalls(ctx: CanvasRenderingContext2D, balls: Ball[]) {
  // Drop shadows
  balls.forEach((b) => {
    if (b.inPocket) return;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(b.x + 3, b.y + 4, b.radius, b.radius * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // Spheres
  balls.forEach((b) => {
    if (b.inPocket) return;

    ctx.save();
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.clip();

    if (b.isCue) {
      // Cue ball
      const cueGrad = ctx.createRadialGradient(
        b.x - b.radius * 0.35,
        b.y - b.radius * 0.35,
        b.radius * 0.1,
        b.x,
        b.y,
        b.radius
      );
      cueGrad.addColorStop(0, '#FFFFFF');
      cueGrad.addColorStop(0.7, '#ECEFF1');
      cueGrad.addColorStop(1, '#B0BEC5');
      ctx.fillStyle = cueGrad;
      ctx.fill();

      // Red dot for spin
      ctx.fillStyle = '#D32F2F';
      ctx.beginPath();
      ctx.arc(b.x + 2, b.y - 1, 1.8, 0, Math.PI * 2);
      ctx.fill();
    } else if (b.isStriped) {
      // Striped ball
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();

      ctx.fillStyle = b.color;
      ctx.fillRect(b.x - b.radius, b.y - b.radius * 0.55, b.radius * 2, b.radius * 1.1);
    } else {
      // Solid ball
      ctx.fillStyle = b.color;
      ctx.fill();
    }

    // Number circle badge
    if (!b.isCue) {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius * 0.45, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#111111';
      ctx.font = 'bold 8px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(b.num.toString(), b.x, b.y + 0.5);
    }

    // Spherical specular highlight
    const spec = ctx.createRadialGradient(
      b.x - b.radius * 0.4,
      b.y - b.radius * 0.4,
      1,
      b.x,
      b.y,
      b.radius
    );
    spec.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
    spec.addColorStop(0.4, 'rgba(255, 255, 255, 0.15)');
    spec.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
    ctx.fillStyle = spec;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });
}

function drawCueStick(
  ctx: CanvasRenderingContext2D,
  cueBall: Ball,
  aimAngle: number,
  power: number
) {
  ctx.save();
  ctx.translate(cueBall.x, cueBall.y);
  ctx.rotate(aimAngle + Math.PI); // Orient toward cue ball

  // Drawback distance based on power
  const setback = cueBall.radius + 14 + (power / 100) * 24;
  const cueLength = 250;
  const tipWidth = 5;
  const buttWidth = 10;

  // Blue chalk tip
  ctx.fillStyle = '#0288D1';
  ctx.fillRect(setback, -tipWidth / 2, 4, tipWidth);

  // White ferrule
  ctx.fillStyle = '#ECEFF1';
  ctx.fillRect(setback + 4, -tipWidth / 2, 8, tipWidth);

  // Maple wood tapered shaft
  const shaftGrad = ctx.createLinearGradient(setback + 12, 0, setback + cueLength, 0);
  shaftGrad.addColorStop(0, '#F5DEB3');
  shaftGrad.addColorStop(0.6, '#D2B48C');
  shaftGrad.addColorStop(1, '#3E2723');
  ctx.fillStyle = shaftGrad;

  ctx.beginPath();
  ctx.moveTo(setback + 12, -tipWidth / 2);
  ctx.lineTo(setback + cueLength, -buttWidth / 2);
  ctx.lineTo(setback + cueLength, buttWidth / 2);
  ctx.lineTo(setback + 12, tipWidth / 2);
  ctx.closePath();
  ctx.fill();

  // Black wrap grip
  ctx.fillStyle = '#1A1A1A';
  ctx.fillRect(setback + cueLength - 70, -buttWidth / 2, 50, buttWidth);

  // Gold rings
  ctx.fillStyle = '#D4AF37';
  ctx.fillRect(setback + cueLength - 72, -buttWidth / 2, 2, buttWidth);
  ctx.fillRect(setback + cueLength - 20, -buttWidth / 2, 2, buttWidth);

  ctx.restore();
}
