<script setup lang="ts">
const features = [
  { label: 'ปลอดภัย', desc: 'ข้อมูลถูกเข้ารหัสทุกขั้นตอน' },
  { label: 'รวดเร็ว', desc: 'เข้าสู่ระบบได้ภายในไม่กี่วินาที' },
  { label: 'เชื่อถือได้', desc: 'รองรับผู้ใช้งานหลายล้านคน' },
];
</script>

<template>
  <div class="hero-container">
    <!-- Animated Background Layers -->
    <div class="bg-gradient"></div>
    <div class="bg-mesh"></div>
    <div class="bg-glow glow-1"></div>
    <div class="bg-glow glow-2"></div>
    <div class="bg-glow glow-3"></div>

    <!-- Floating Geometric Shapes -->
    <div class="shape shape-1"></div>
    <div class="shape shape-2"></div>
    <div class="shape shape-3"></div>
    <div class="shape shape-4"></div>

    <!-- Main Content -->
    <div class="hero-content scale-fade-in">
      <!-- Large Lock Icon -->
      <div class="lock-visual">
        <div class="lock-ring">
          <div class="lock-ring-inner">
            <svg viewBox="0 0 64 64" fill="none" class="lock-svg">
              <rect x="8" y="28" width="48" height="32" rx="6" fill="rgba(255,255,255,0.15)"
                stroke="rgba(255,255,255,0.5)" stroke-width="2" />
              <path d="M18 28V20a14 14 0 0128 0v8" stroke="rgba(255,255,255,0.5)" stroke-width="3"
                stroke-linecap="round" fill="none" />
              <circle cx="32" cy="44" r="5" fill="rgba(255,255,255,0.6)" />
              <line x1="32" y1="49" x2="32" y2="54" stroke="rgba(255,255,255,0.6)" stroke-width="3"
                stroke-linecap="round" />
            </svg>
          </div>
        </div>

        <!-- Orbiting dots -->
        <div class="orbit">
          <div class="orbit-dot dot-1"></div>
          <div class="orbit-dot dot-2"></div>
          <div class="orbit-dot dot-3"></div>
        </div>
      </div>

      <!-- Text Section -->
      <div class="hero-text">
        <h2 class="hero-title">ยินดีต้อนรับ</h2>
        <p class="hero-subtitle">เข้าสู่ระบบลงทะเบียนผู้มีสิทธิเลือกตั้ง</p>
      </div>

      <!-- Feature List -->
      <div class="features-list">
        <div class="feature-item" v-for="(feature, i) in features" :key="i"
          :style="{ animationDelay: `${0.6 + i * 0.15}s` }">
          <div class="feature-icon">
            <svg v-if="i === 0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <svg v-else-if="i === 1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12,6 12,12 16,14" />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87" />
              <path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
          </div>
          <div class="feature-text">
            <span class="feature-label">{{ feature.label }}</span>
            <span class="feature-desc">{{ feature.desc }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Badge -->
    <div class="hero-footer scale-fade-in">
      <div class="info-badge">
        <span class="badge-dot"></span>
        <span>ระบบปลอดภัย 100%</span>
      </div>
      <p class="footer-text">Demo CraZy Vote System v1.0</p>
    </div>
  </div>
</template>

<style scoped>
.hero-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* === Backgrounds === */
.bg-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(155deg, #1a0a3e 0%, #2d1470 25%, #4318a3 50%, #5931bd 75%, #3a1a8a 100%);
  z-index: 0;
}

.bg-mesh {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 25% 25%, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(234, 33, 233, 0.06) 0%, transparent 50%);
  z-index: 1;
}

.bg-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  z-index: 1;
}

.glow-1 {
  width: 350px;
  height: 350px;
  background: rgba(139, 92, 246, 0.25);
  top: -10%;
  left: -5%;
  animation: glowDrift 10s ease-in-out infinite alternate;
}

.glow-2 {
  width: 280px;
  height: 280px;
  background: rgba(192, 132, 252, 0.15);
  bottom: -8%;
  right: -5%;
  animation: glowDrift 8s ease-in-out 2s infinite alternate-reverse;
}

.glow-3 {
  width: 180px;
  height: 180px;
  background: rgba(234, 33, 233, 0.1);
  top: 45%;
  left: 50%;
  animation: glowDrift 12s ease-in-out 4s infinite alternate;
}

@keyframes glowDrift {
  0% {
    transform: translate(0, 0) scale(1);
  }

  100% {
    transform: translate(25px, -15px) scale(1.1);
  }
}

/* === Floating Shapes === */
.shape {
  position: absolute;
  z-index: 2;
  opacity: 0.08;
}

.shape-1 {
  width: 120px;
  height: 120px;
  border: 2px solid white;
  border-radius: 24px;
  top: 12%;
  right: 15%;
  transform: rotate(25deg);
  animation: shapeFloat 9s ease-in-out infinite;
}

.shape-2 {
  width: 60px;
  height: 60px;
  border: 2px solid white;
  border-radius: 50%;
  bottom: 20%;
  left: 12%;
  animation: shapeFloat 7s ease-in-out 1s infinite;
}

.shape-3 {
  width: 80px;
  height: 80px;
  border: 2px solid white;
  border-radius: 16px;
  bottom: 35%;
  right: 8%;
  transform: rotate(-15deg);
  animation: shapeFloat 11s ease-in-out 3s infinite;
}

.shape-4 {
  width: 40px;
  height: 40px;
  border: 2px solid white;
  border-radius: 50%;
  top: 30%;
  left: 8%;
  animation: shapeFloat 6s ease-in-out 2s infinite;
}

@keyframes shapeFloat {

  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }

  50% {
    transform: translateY(-18px) rotate(8deg);
  }
}

/* === Main Content === */
.hero-content {
  position: relative;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5rem;
  padding: 2rem;
}

.scale-fade-in {
  animation: scaleFadeIn 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

@keyframes scaleFadeIn {
  from {
    opacity: 0;
    transform: scale(1.04);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* === Lock Visual === */
.lock-visual {
  position: relative;
  width: 140px;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lock-ring {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: lockPulse 3s ease-in-out infinite;
}

@keyframes lockPulse {

  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.3);
  }

  50% {
    box-shadow: 0 0 0 15px rgba(139, 92, 246, 0);
  }
}

.lock-ring-inner {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}

.lock-svg {
  width: 44px;
  height: 44px;
}

/* Orbiting Dots */
.orbit {
  position: absolute;
  inset: -10px;
  animation: orbitSpin 12s linear infinite;
}

.orbit-dot {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.dot-1 {
  background: #c084fc;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}

.dot-2 {
  background: #ea21e9;
  bottom: 10%;
  right: 5%;
}

.dot-3 {
  background: #8b5cf6;
  bottom: 10%;
  left: 5%;
}

@keyframes orbitSpin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* === Text === */
.hero-text {
  text-align: center;
}

.hero-title {
  font-family: var(--font-heading);
  font-size: 2rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  letter-spacing: -0.02em;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
}

.hero-subtitle {
  font-size: 0.92rem;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.5;
}

/* === Features === */
.features-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  width: 100%;
  max-width: 280px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  animation: slideIn 0.5s ease both;
  transition: background var(--transition-fast), transform var(--transition-fast);
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(4px);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-16px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.feature-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: rgba(139, 92, 246, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.feature-icon svg {
  width: 17px;
  height: 17px;
  color: #c084fc;
}

.feature-text {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.feature-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.feature-desc {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.45);
}

/* === Footer === */
.hero-footer {
  position: absolute;
  bottom: 2rem;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  z-index: 10;
  animation-delay: 0.6s;
}

.info-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 1rem;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.badge-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 6px rgba(34, 197, 94, 0.6);
  animation: dotPulse 2s ease-in-out infinite;
}

@keyframes dotPulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

.footer-text {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.3);
  letter-spacing: 0.02em;
}
</style>
