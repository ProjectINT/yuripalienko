'use client'

import { useMemo, useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { MeshTransmissionMaterial } from '@react-three/drei'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import * as THREE from 'three'

// STAGE-2, шаг 3: монограмма YP — экструд из SVG + преломляющее стекло.
// Блеск даёт не источник света, а HDRI из <Environment> в HeroScene.

const TARGET_WIDTH = 3.4 // ширина логотипа в мировых единицах (кольцо карточек — R=4.8)
const EXTRUDE_DEPTH = 44 // в единицах SVG, где толщина штриха = 34

function useLogoGeometry() {
  const svg = useLoader(SVGLoader, '/logo/yp.svg')

  return useMemo(() => {
    const shapes = svg.paths.flatMap((path) => SVGLoader.createShapes(path))

    const geometry = new THREE.ExtrudeGeometry(shapes, {
      depth: EXTRUDE_DEPTH,
      bevelEnabled: true,
      bevelThickness: 8,
      bevelSize: 6,
      bevelOffset: 0,
      bevelSegments: 5,
      curveSegments: 24,
    })

    // SVG-координаты идут вниз по Y. Поворот на 180° вокруг X переворачивает
    // геометрию, не ломая направление нормалей (в отличие от scale по -Y).
    geometry.rotateX(Math.PI)
    geometry.center()
    geometry.computeVertexNormals()

    const box = new THREE.Box3().setFromBufferAttribute(
      geometry.attributes.position as THREE.BufferAttribute,
    )
    const size = box.getSize(new THREE.Vector3())

    return { geometry, scale: TARGET_WIDTH / size.x }
  }, [svg])
}

/**
 * Полный вариант: MeshTransmissionMaterial рендерит сцену в буфер, чтобы
 * карточки были видны сквозь стекло. Дорого — samples и resolution занижены.
 */
function GlassLogo() {
  const { geometry, scale } = useLogoGeometry()
  const mesh = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!mesh.current) return
    const t = state.clock.elapsedTime
    // Качание вместо полного оборота: буквы должны оставаться читаемыми
    mesh.current.rotation.y = Math.sin(t * 0.25) * 0.5
    mesh.current.rotation.x = Math.sin(t * 0.19) * 0.12
  })

  return (
    <mesh ref={mesh} geometry={geometry} scale={scale}>
      {/* Толщина и дисторсия занижены намеренно: на чёрном фоне толстое стекло
          преломляет темноту и логотип читается как грязное пятно. */}
      <MeshTransmissionMaterial
        samples={6}
        resolution={512}
        transmission={1}
        thickness={0.35}
        roughness={0.04}
        ior={1.6}
        chromaticAberration={0.22}
        anisotropicBlur={0.1}
        distortion={0.06}
        distortionScale={0.15}
        temporalDistortion={0}
        clearcoat={1}
        clearcoatRoughness={0.05}
        backside
        backsideThickness={0.2}
        backsideResolution={256}
        color="#ffffff"
      />
    </mesh>
  )
}

/**
 * Лёгкий вариант для мобильных и prefers-reduced-motion: хром вместо стекла.
 * Отражение целиком из HDRI, без рендера сцены в буфер — один проход.
 */
function ChromeLogo() {
  const { geometry, scale } = useLogoGeometry()

  return (
    <mesh geometry={geometry} scale={scale} rotation={[0.06, 0.32, 0]}>
      <meshStandardMaterial color="#ffffff" metalness={1} roughness={0.12} />
    </mesh>
  )
}

export default function YpLogo({ animate }: { animate: boolean }) {
  return animate ? <GlassLogo /> : <ChromeLogo />
}
