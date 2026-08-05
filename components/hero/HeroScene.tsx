'use client'

import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import type { HeroCard } from '@/types/content'
import YpLogo from './YpLogo'

// STAGE-2, шаги 2–3 роадмапа: скриншоты работ по цилиндру + вращение + параллакс,
// в центре — стеклянная монограмма YP на HDRI-окружении.
// Изгиб карточек вершинным шейдером — шаг 4, постобработка — Этап 3.

const RADIUS = 5.2
const CARD_W = 1.5
const CARD_H = (CARD_W * 9) / 16 // скриншоты обрезаны до 16:9
const SPIN_SPEED = 0.08 // рад/с — полный оборот ~80 секунд
const CARD_TINT = '#7d7d7d'

// Туман цвета фона страницы: дальняя половина кольца растворяется в чёрном,
// ближняя остаётся читаемой. Это и глубина, и способ не давать пятнадцати
// карточкам одновременно спорить за внимание с логотипом.
const FOG_NEAR = 12
const FOG_FAR = 26

// Камера дальше + узкий fov: иначе ближняя карточка оказывается вдвое ближе
// логотипа и перспектива раздувает её так, что центр сцены не читается.
const CAMERA_Z = 15
const CAMERA_FOV = 28

// Детерминированный псевдорандом, чтобы сцена не менялась между кадрами и рендерами
function seeded(i: number) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

// Два пояса — над логотипом и под ним. Смещение подобрано так, чтобы нижний край
// верхнего пояса шёл выше верхушки монограммы: иначе карточка проезжает прямо
// по буквам и центр сцены каждые несколько секунд теряется.
function baseY(index: number) {
  return (index % 2 === 0 ? 1.5 : -1.5) + (seeded(index) - 0.5) * 0.6
}

// Скриншоты приходят сгруппированными по проектам (четыре подряд toprentapp,
// три kvartly и так далее). Раскладываем их по кольцу шагом, взаимно простым
// с длиной списка: соседние карточки гарантированно из разных проектов.
function ringOrder<T>(items: T[]): T[] {
  const step = items.length % 7 === 0 ? 5 : 7
  if (items.length < step) return items
  return items.map((_, i) => items[(i * step) % items.length])
}

function Card({ index, count, texture }: { index: number; count: number; texture: THREE.Texture }) {
  const angle = (index / count) * Math.PI * 2

  return (
    <mesh
      position={[Math.sin(angle) * RADIUS, baseY(index), Math.cos(angle) * RADIUS]}
      rotation={[0, angle, (seeded(index + 50) - 0.5) * 0.12]}
    >
      {/* STAGE-2, шаг 4: сегменты 32×32 понадобятся вершинному шейдеру изгиба */}
      <planeGeometry args={[CARD_W, CARD_H, 1, 1]} />
      {/* Большинство скриншотов — светлые макеты. В полную яркость на чёрной
          странице они перебивают логотип, поэтому гасим умножением на серый. */}
      <meshBasicMaterial
        map={texture}
        color={CARD_TINT}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  )
}

function Cards({ animate, cards }: { animate: boolean; cards: HeroCard[] }) {
  const group = useRef<THREE.Group>(null)
  const ordered = useMemo(() => ringOrder(cards), [cards])
  // Грузится внутри той же Suspense-границы, что и HDRI: сцена появляется целиком
  const textures = useTexture(ordered.map((card) => card.src))

  // Скриншоты — цветные изображения, а материал без освещения и тонмаппинга:
  // так карточка выглядит ровно так же, как исходный PNG.
  useMemo(() => {
    textures.forEach((texture) => {
      texture.colorSpace = THREE.SRGBColorSpace
      texture.anisotropy = 8
    })
  }, [textures])

  // Лёгкое «дыхание» карточек по вертикали
  useFrame((state) => {
    if (!animate || !group.current) return
    group.current.children.forEach((card, i) => {
      card.position.y = baseY(i) + Math.sin(state.clock.elapsedTime * 0.6 + i * 1.7) * 0.08
    })
  })

  return (
    <group ref={group}>
      {ordered.map((card, i) => (
        <Card key={card.src} index={i} count={ordered.length} texture={textures[i]} />
      ))}
    </group>
  )
}

// Все ассеты сцены (HDRI, SVG логотипа) грузятся через Suspense. Дети границы
// монтируются разом, когда она разрешилась, — значит момент маунта и есть
// «сцена готова». В статичном режиме нужен ручной invalidate: frameloop="demand"
// сам по себе кадр после загрузки не нарисует.
function Ready({ onReady }: { onReady: () => void }) {
  const invalidate = useThree((state) => state.invalidate)

  useEffect(() => {
    invalidate()
    onReady()
  }, [invalidate, onReady])

  return null
}

function Rig({ animate, cards }: { animate: boolean; cards: HeroCard[] }) {
  const tilt = useRef<THREE.Group>(null)
  const spin = useRef<THREE.Group>(null)
  // Курсор слушаем на window: канвас стоит с pointer-events-none,
  // чтобы не перехватывать клики по ссылкам поверх сцены
  const pointer = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (!animate) return
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [animate])

  useFrame((_, delta) => {
    if (!animate) return
    if (spin.current) spin.current.rotation.y += delta * SPIN_SPEED
    if (tilt.current) {
      // Параллакс от курсора с демпфированием — плавное затухание, не резкое следование
      tilt.current.rotation.x = THREE.MathUtils.damp(
        tilt.current.rotation.x,
        pointer.current.y * 0.1,
        3,
        delta,
      )
      tilt.current.rotation.y = THREE.MathUtils.damp(
        tilt.current.rotation.y,
        pointer.current.x * 0.15,
        3,
        delta,
      )
    }
  })

  return (
    // Приподнимаем всю сцену: снизу блок с именем и ссылками, туда карточкам нельзя
    <group ref={tilt} position={[0, 0.45, 0]}>
      <YpLogo animate={animate} />
      <group ref={spin}>
        <Cards animate={animate} cards={cards} />
      </group>
    </group>
  )
}

export default function HeroScene({
  animate,
  cards,
  onReady,
}: {
  animate: boolean
  cards: HeroCard[]
  onReady: () => void
}) {
  return (
    <Canvas
      // В статичном режиме (мобильные, prefers-reduced-motion) рендерим один кадр
      frameloop={animate ? 'always' : 'demand'}
      dpr={animate ? [1, 2] : [1, 1.5]}
      // На узких экранах (статичный режим) камера дальше, иначе ближняя карточка заполняет весь кадр
      camera={{ position: [0, -0.4, animate ? CAMERA_Z : CAMERA_Z + 3], fov: CAMERA_FOV }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      className="pointer-events-none"
    >
      <fog attach="fog" args={['#0a0a0a', FOG_NEAR, FOG_FAR]} />
      <Suspense fallback={null}>
        {/* Своя HDRI в /public вместо preset: preset тянет карту со стороннего
            CDN прямо в критическом пути рендера. Карточки материалом не освещаются
            (meshBasicMaterial), так что источников света в сцене нет вообще. */}
        <Environment files="/hdri/studio.hdr" environmentIntensity={1.8} />
        <Rig animate={animate} cards={cards} />
        <Ready onReady={onReady} />
      </Suspense>
    </Canvas>
  )
}
