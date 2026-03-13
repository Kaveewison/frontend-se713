<script setup lang="ts">
import { ref } from 'vue';

const imageLoaded = ref(true);

const handleImageError = () => {
  imageLoaded.value = false;
};
</script>

<template>
  <div class="hero-container">
    <div class="bg-gradient"></div>
    <div class="bg-pattern"></div>
    <div class="bg-glow glow-1"></div>
    <div class="bg-glow glow-2"></div>
    <div class="bg-glow glow-3"></div>

    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>

    <div class="illustration-wrapper scale-fade-in">
      <img
        v-if="imageLoaded"
        src="/images/voting_illustration.svg"
        alt="Voting Illustration"
        class="illustration"
        @error="handleImageError"
      />
      <div v-else class="illustration-fallback">
        <svg viewBox="0 0 200 200" class="fallback-svg">
          <rect
            x="50"
            y="60"
            width="100"
            height="80"
            rx="8"
            fill="rgba(255,255,255,0.15)"
            stroke="rgba(255,255,255,0.3)"
            stroke-width="2"
          />
          <rect
            x="60"
            y="50"
            width="80"
            height="20"
            rx="4"
            fill="rgba(255,255,255,0.2)"
          />
          <rect
            x="70"
            y="80"
            width="60"
            height="8"
            rx="4"
            fill="rgba(255,255,255,0.2)"
          />
          <rect
            x="70"
            y="95"
            width="60"
            height="8"
            rx="4"
            fill="rgba(255,255,255,0.15)"
          />
          <rect
            x="70"
            y="110"
            width="40"
            height="8"
            rx="4"
            fill="rgba(255,255,255,0.1)"
          />
          <circle cx="145" cy="55" r="12" fill="rgba(234, 33, 233, 0.4)" />
          <text
            x="100"
            y="170"
            text-anchor="middle"
            fill="rgba(255,255,255,0.5)"
            font-size="12"
            font-family="Prompt"
          >
            ระบบลงทะเบียน
          </text>
        </svg>
      </div>
    </div>

    <div class="hero-content scale-fade-in"></div>

    <div class="hero-footer scale-fade-in">
      <div class="info-badge">
        <span class="badge-dot"></span>
        <span>ระบบพร้อมใช้งาน</span>
      </div>
      <p class="hero-footer-text">ระบบลงทะเบียนผู้ใช้งาน v1.0</p>
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

/* === Background Layers === */
.bg-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    #4318a3 0%,
    #5931bd 30%,
    #6b3fd4 60%,
    #30177d 100%
  );
  z-index: 0;
}

.bg-pattern {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(
      circle at 20% 50%,
      rgba(255, 255, 255, 0.03) 1px,
      transparent 1px
    ),
    radial-gradient(
      circle at 80% 20%,
      rgba(255, 255, 255, 0.03) 1px,
      transparent 1px
    );
  background-size:
    40px 40px,
    60px 60px;
  z-index: 1;
}

.bg-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  z-index: 1;
}

.glow-1 {
  width: 400px;
  height: 400px;
  background: rgba(139, 92, 246, 0.3);
  top: -15%;
  right: -10%;
  animation: glowFloat 8s ease-in-out infinite alternate;
}

.glow-2 {
  width: 300px;
  height: 300px;
  background: rgba(234, 33, 233, 0.15);
  bottom: -10%;
  left: -5%;
  animation: glowFloat 10s ease-in-out infinite alternate-reverse;
}

.glow-3 {
  width: 200px;
  height: 200px;
  background: rgba(255, 87, 34, 0.12);
  top: 40%;
  right: 20%;
  animation: glowFloat 6s ease-in-out 2s infinite alternate;
}

@keyframes glowFloat {
  0% {
    transform: translate(0, 0) scale(1);
  }

  100% {
    transform: translate(30px, -20px) scale(1.15);
  }
}

/* === Floating Orbs === */
.orb {
  position: absolute;
  border-radius: 50%;
  z-index: 2;
  opacity: 0.5;
}

.orb-1 {
  width: 12px;
  height: 12px;
  background: #c084fc;
  top: 20%;
  left: 15%;
  animation: orbFloat 7s ease-in-out infinite;
}

.orb-2 {
  width: 8px;
  height: 8px;
  background: #ea21e9;
  top: 60%;
  right: 20%;
  animation: orbFloat 5s ease-in-out 1s infinite;
}

.orb-3 {
  width: 6px;
  height: 6px;
  background: #ff5722;
  bottom: 30%;
  left: 30%;
  animation: orbFloat 9s ease-in-out 3s infinite;
}

@keyframes orbFloat {
  0%,
  100% {
    transform: translateY(0) translateX(0);
  }

  25% {
    transform: translateY(-20px) translateX(10px);
  }

  50% {
    transform: translateY(-10px) translateX(-15px);
  }

  75% {
    transform: translateY(-25px) translateX(5px);
  }
}

/* === Scale Fade In === */
.scale-fade-in {
  animation: scaleFadeIn 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  z-index: 5;
}

@keyframes scaleFadeIn {
  from {
    opacity: 0;
    transform: scale(1.05);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* === Hero Content === */
.hero-content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  z-index: 5;
  flex: 1;
}

/* === Illustration === */
.illustration-wrapper {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 0;
}

.illustration {
  width: 90%;
  height: 90%;
  object-fit: contain;
  opacity: 0.85;
  mask-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.9) 60%,
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.9) 60%,
    transparent 100%
  );
}

.illustration-fallback {
  width: 60%;
  max-width: 300px;
  opacity: 0.7;
}

.fallback-svg {
  width: 100%;
  height: auto;
}

/* === Styled Text Block === */
.styled-text-block {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
}

.demo-text {
  font-family: 'Bangers', cursive;
  font-size: clamp(3rem, 5vw, 5rem);
  color: rgba(255, 255, 255, 0.95);
  letter-spacing: 0.15rem;
  text-shadow:
    0 4px 20px rgba(0, 0, 0, 0.3),
    0 0 40px rgba(139, 92, 246, 0.3);
  margin-left: -12rem;
  transform: rotate(-5deg);
  margin-bottom: 25rem;
}

.crazy-text {
  font-family: 'Caveat', cursive, sans-serif;
  font-size: clamp(3.5rem, 6vw, 6rem);
  color: #ea21e9;
  text-shadow:
    0 4px 20px rgba(234, 33, 233, 0.4),
    0 0 60px rgba(234, 33, 233, 0.2);
  margin-top: -2.5rem;
  z-index: 2;
  transform: rotate(-10deg);
  display: none;
}

.vote-text {
  font-family: 'Bangers', cursive;
  font-size: clamp(4rem, 7vw, 7rem);
  color: #ff5722;
  letter-spacing: 0.3rem;
  text-shadow:
    0 4px 20px rgba(255, 87, 34, 0.4),
    0 0 60px rgba(255, 87, 34, 0.2);
  margin-top: -3.5rem;
  margin-left: 8rem;
  transform: rotate(-2deg);
  display: none;
}

/* Floating animations for text */
.float-anim-1 {
  animation: textFloat 6s ease-in-out infinite;
}

.float-anim-2 {
  animation: textFloat 7s ease-in-out 1s infinite;
}

.float-anim-3 {
  animation: textFloat 5s ease-in-out 0.5s infinite;
}

@keyframes textFloat {
  0%,
  100% {
    transform: translateY(0) rotate(-5deg);
  }

  50% {
    transform: translateY(-8px) rotate(-5deg);
  }
}

/* Override for each text */
.crazy-text.float-anim-2 {
  animation-name: textFloat2;
}

@keyframes textFloat2 {
  0%,
  100% {
    transform: translateY(0) rotate(-10deg);
  }

  50% {
    transform: translateY(-6px) rotate(-10deg);
  }
}

.vote-text.float-anim-3 {
  animation-name: textFloat3;
}

@keyframes textFloat3 {
  0%,
  100% {
    transform: translateY(0) rotate(-2deg);
  }

  50% {
    transform: translateY(-10px) rotate(-2deg);
  }
}

/* === Accent X === */
.accent-x {
  position: absolute;
  font-family: 'Bangers', cursive;
  font-size: clamp(18rem, 30vw, 35rem);
  color: #00ff2a;
  opacity: 0.6;
  top: -8%;
  right: 0%;
  z-index: 1;
  transform: rotate(15deg);
  text-shadow: 0 10px 40px rgba(0, 255, 42, 0.15);
  pointer-events: none;
  animation: accentPulse 4s ease-in-out infinite alternate;
}

@keyframes accentPulse {
  0% {
    opacity: 0.5;
  }

  100% {
    opacity: 0.7;
  }
}

/* === Hero Footer === */
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
  animation-delay: 0.5s;
}

.info-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
}

.badge-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 6px rgba(34, 197, 94, 0.6);
  animation: pulse 2s ease-in-out infinite;
}

.hero-footer-text {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 0.02em;
}
</style>
