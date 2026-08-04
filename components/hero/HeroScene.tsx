'use client'

import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// STAGE-2, шаг 2 роадмапа: плоскости-заглушки по цилиндру + вращение + параллакс.
// Без стекла, без шейдеров, без постобработки — это шаги 3–4.

const CARD_COUNT = 10
const RADIUS = 4
const CARD_W = 2
const CARD_H = CARD_W / 1.5 // пропорция 3:2 под будущие скриншоты 1200×800
const SPIN_SPEED = 0.08 // рад/с — полный оборот ~80 секунд

// Детерминированный псевдорандом, чтобы сцена не менялась между кадрами и рендерами
function seeded(i: number) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

// Процедурная текстура-заглушка «скриншот кейса».
// STAGE-2, шаг 2+: заменить на THREE.TextureLoader / drei useTexture со скриншотами работ.
function makeCardTexture(index: number): THREE.CanvasTexture {
  const w = 600
  const h = 400
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#151515'
  ctx.fillRect(0, 0, w, h)

  // Верхняя панель «окна браузера»
  ctx.fillStyle = '#1d1d1d'
  ctx.fillRect(0, 0, w, 44)
  for (let d = 0; d < 3; d++) {
    ctx.beginPath()
    ctx.arc(26 + d * 22, 22, 5, 0, Math.PI * 2)
    ctx.fillStyle = '#3a3a3a'
    ctx.fill()
  }

  // Фейковые строки контента
  let y = 84
  for (let row = 0; row < 7; row++) {
    const width = (0.25 + seeded(index * 31 + row) * 0.55) * (w - 96)
    ctx.fillStyle = row === 0 ? '#4a4a4a' : '#2a2a2a'
    ctx.fillRect(48, y, width, row === 0 ? 22 : 12)
    y += row === 0 ? 48 : 34
  }

  // Крупный полупрозрачный номер кейса
  ctx.fillStyle = 'rgba(245,245,245,0.07)'
  ctx.font = 'bold 170px ui-monospace, monospace'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(String(index + 1).padStart(2, '0'), w - 28, h - 24)

  ctx.strokeStyle = '#2e2e2e'
  ctx.lineWidth = 2
  ctx.strokeRect(1, 1, w - 2, h - 2)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

function baseY(index: number) {
  return (index % 2 === 0 ? 0.45 : -0.45) + (seeded(index) - 0.5) * 0.3
}

function Card({ index }: { index: number }) {
  const texture = useMemo(() => makeCardTexture(index), [index])
  const angle = (index / CARD_COUNT) * Math.PI * 2

  return (
    <mesh
      position={[Math.sin(angle) * RADIUS, baseY(index), Math.cos(angle) * RADIUS]}
      rotation={[0, angle, (seeded(index + 50) - 0.5) * 0.12]}
    >
      {/* STAGE-2, шаг 4: сегменты 32×32 понадобятся вершинному шейдеру изгиба */}
      <planeGeometry args={[CARD_W, CARD_H, 1, 1]} />
      <meshBasicMaterial map={texture} side={THREE.DoubleSide} toneMapped={false} />
    </mesh>
  )
}

function Cards({ animate }: { animate: boolean }) {
  const group = useRef<THREE.Group>(null)

  // Лёгкое «дыхание» карточек по вертикали
  useFrame((state) => {
    if (!animate || !group.current) return
    group.current.children.forEach((card, i) => {
      card.position.y = baseY(i) + Math.sin(state.clock.elapsedTime * 0.6 + i * 1.7) * 0.08
    })
  })

  return (
    <group ref={group}>
      {Array.from({ length: CARD_COUNT }, (_, i) => (
        <Card key={i} index={i} />
      ))}
    </group>
  )
}

// STAGE-2, шаг 3: заменить куб на экструд логотипа YP с MeshTransmissionMaterial + HDRI
function LogoPlaceholder({ animate }: { animate: boolean }) {
  const mesh = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    if (!animate || !mesh.current) return
    mesh.current.rotation.x += delta * 0.15
    mesh.current.rotation.y -= delta * 0.2
  })

  return (
    <mesh ref={mesh} rotation={[0.4, 0.6, 0]}>
      <boxGeometry args={[1.1, 1.1, 1.1]} />
      <meshStandardMaterial color="#e8e8e8" roughness={0.35} metalness={0.15} />
    </mesh>
  )
}

function Rig({ animate }: { animate: boolean }) {
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
    <group ref={tilt}>
      <LogoPlaceholder animate={animate} />
      <group ref={spin}>
        <Cards animate={animate} />
      </group>
    </group>
  )
}

export default function HeroScene({ animate }: { animate: boolean }) {
  return (
    <Canvas
      // В статичном режиме (мобильные, prefers-reduced-motion) рендерим один кадр
      frameloop={animate ? 'always' : 'demand'}
      dpr={animate ? [1, 2] : [1, 1.5]}
      // На узких экранах (статичный режим) камера дальше, иначе ближняя карточка заполняет весь кадр
      camera={{ position: [0, -0.4, animate ? 9.6 : 13], fov: 35 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      className="pointer-events-none"
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 5]} intensity={2.2} />
      <directionalLight position={[-4, -2, -3]} intensity={0.4} />
      <Rig animate={animate} />
    </Canvas>
  )
}
