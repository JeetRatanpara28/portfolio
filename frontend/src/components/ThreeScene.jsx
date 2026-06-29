import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const PARTICLE_COUNT = 80
const MAX_CONNECTIONS = 700
const CONNECTION_DIST = 2.3
const SPHERE_RADIUS_MIN = 1.5
const SPHERE_RADIUS_MAX = 4.0

export default function ThreeScene() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const W = mount.clientWidth
    const H = mount.clientHeight

    // ── Scene ──────────────────────────────────────────────
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100)
    camera.position.set(0, 0, 8)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mount.appendChild(renderer.domElement)

    // ── Particles ──────────────────────────────────────────
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const velocities = new Float32Array(PARTICLE_COUNT * 3)
    const sizes = new Float32Array(PARTICLE_COUNT)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Spherical shell distribution
      const u = Math.random()
      const v = Math.random()
      const theta = 2 * Math.PI * u
      const phi = Math.acos(2 * v - 1)
      const r = SPHERE_RADIUS_MIN + Math.random() * (SPHERE_RADIUS_MAX - SPHERE_RADIUS_MIN)

      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi) * 0.55 // flatten Z

      velocities[i * 3]     = (Math.random() - 0.5) * 0.010
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.010
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.005

      sizes[i] = 0.05 + Math.random() * 0.06
    }

    const pGeo = new THREE.BufferGeometry()
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    // Circular sprite texture
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    grad.addColorStop(0, 'rgba(100,220,255,1)')
    grad.addColorStop(0.4, 'rgba(100,220,255,0.6)')
    grad.addColorStop(1, 'rgba(100,220,255,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 64, 64)
    const sprite = new THREE.CanvasTexture(canvas)

    const pMat = new THREE.PointsMaterial({
      color: 0x64dcff,
      size: 0.12,
      map: sprite,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    })

    const particles = new THREE.Points(pGeo, pMat)
    scene.add(particles)

    // ── Line connections ────────────────────────────────────
    const linePos = new Float32Array(MAX_CONNECTIONS * 6)
    const lGeo = new THREE.BufferGeometry()
    lGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3))
    lGeo.setDrawRange(0, 0)

    const lMat = new THREE.LineBasicMaterial({
      color: 0x64dcff,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    const lines = new THREE.LineSegments(lGeo, lMat)
    scene.add(lines)

    // ── Subtle purple accent particles ──────────────────────
    const accentCount = 20
    const accentPos = new Float32Array(accentCount * 3)
    for (let i = 0; i < accentCount; i++) {
      accentPos[i * 3]     = (Math.random() - 0.5) * 9
      accentPos[i * 3 + 1] = (Math.random() - 0.5) * 9
      accentPos[i * 3 + 2] = (Math.random() - 0.5) * 4
    }
    const aGeo = new THREE.BufferGeometry()
    aGeo.setAttribute('position', new THREE.BufferAttribute(accentPos, 3))
    const aMat = new THREE.PointsMaterial({
      color: 0x8b5cf6,
      size: 0.08,
      map: sprite,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    })
    scene.add(new THREE.Points(aGeo, aMat))

    // ── Mouse tracking ──────────────────────────────────────
    let mouseX = 0, mouseY = 0
    const onMouseMove = (e) => {
      const rect = mount.getBoundingClientRect()
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1
    }
    mount.addEventListener('mousemove', onMouseMove)

    // ── Animation loop ──────────────────────────────────────
    let raf
    let t = 0
    const BOUNDARY_R2 = 18 // soft boundary radius² ≈ 4.25²

    const animate = () => {
      raf = requestAnimationFrame(animate)
      t += 0.003

      const pos = pGeo.attributes.position.array
      const mx = mouseX * 4.5
      const my = mouseY * 4.5

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2

        pos[ix] += velocities[ix]
        pos[iy] += velocities[iy]
        pos[iz] += velocities[iz]

        // Elastic sphere boundary — pull back gently
        const r2 = pos[ix] ** 2 + pos[iy] ** 2 + pos[iz] ** 2
        if (r2 > BOUNDARY_R2) {
          velocities[ix] -= pos[ix] * 0.0005
          velocities[iy] -= pos[iy] * 0.0005
          velocities[iz] -= pos[iz] * 0.0003
        }

        // Mouse repulsion
        const dx = pos[ix] - mx
        const dy = pos[iy] - my
        const d2 = dx * dx + dy * dy
        if (d2 < 2.89 && d2 > 0.001) {
          const d = Math.sqrt(d2)
          const f = (1.7 - d) * 0.006 / d
          velocities[ix] += dx * f
          velocities[iy] += dy * f
        }

        // Damping
        velocities[ix] *= 0.997
        velocities[iy] *= 0.997
        velocities[iz] *= 0.998
      }
      pGeo.attributes.position.needsUpdate = true

      // Build line segments
      let conn = 0
      for (let i = 0; i < PARTICLE_COUNT && conn < MAX_CONNECTIONS; i++) {
        for (let j = i + 1; j < PARTICLE_COUNT && conn < MAX_CONNECTIONS; j++) {
          const dx = pos[i*3]   - pos[j*3]
          const dy = pos[i*3+1] - pos[j*3+1]
          const dz = pos[i*3+2] - pos[j*3+2]
          if (dx*dx + dy*dy + dz*dz < CONNECTION_DIST * CONNECTION_DIST) {
            linePos[conn*6]   = pos[i*3];   linePos[conn*6+1] = pos[i*3+1]; linePos[conn*6+2] = pos[i*3+2]
            linePos[conn*6+3] = pos[j*3];   linePos[conn*6+4] = pos[j*3+1]; linePos[conn*6+5] = pos[j*3+2]
            conn++
          }
        }
      }
      lGeo.setDrawRange(0, conn * 2)
      lGeo.attributes.position.needsUpdate = true

      // Pulse line opacity
      lMat.opacity = 0.14 + Math.sin(t * 2.5) * 0.06

      // Gentle camera drift
      camera.position.x = Math.sin(t * 0.18) * 0.7
      camera.position.y = Math.cos(t * 0.13) * 0.45
      camera.lookAt(0, 0, 0)

      renderer.render(scene, camera)
    }

    animate()

    // ── Resize ──────────────────────────────────────────────
    const onResize = () => {
      const w = mount.clientWidth
      const h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }

    const ro = new ResizeObserver(onResize)
    ro.observe(mount)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      mount.removeEventListener('mousemove', onMouseMove)
      pGeo.dispose()
      lGeo.dispose()
      aGeo.dispose()
      pMat.dispose()
      lMat.dispose()
      aMat.dispose()
      sprite.dispose()
      renderer.dispose()
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [])

  return <div ref={mountRef} className="absolute inset-0 w-full h-full" />
}
