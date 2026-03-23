<script setup>
defineOptions({
  name: 'BrandHomeLanding',
})

const heroTags = [
  '力量不是表演',
  '耐力不是忍耐',
  '纪律不是口号',
]

const philosophyPillars = [
  {
    index: '01',
    title: '力量',
    english: 'POWER',
    description: '不是练出一张吓人的照片，而是练出真正能输出的身体。',
    icon: '/static/my-icons/dumbbell.svg',
  },
  {
    index: '02',
    title: '耐力',
    english: 'ENGINE',
    description: '让体能在长时间消耗里也不失速，把状态留到真正需要的时候。',
    icon: '/static/my-icons/back.svg',
  },
  {
    index: '03',
    title: '纪律',
    english: 'DISCIPLINE',
    description: '把训练从热血冲动改成稳定执行，让每一次重复都留下痕迹。',
    icon: '/static/my-icons/leg.svg',
  },
]

const storyFrames = [
  {
    step: 'A1',
    kicker: '启动',
    title: '先稳住自己的输出。',
    copy: '生存练习不从“看起来更会练”开始，而从“真正能扛住今天”开始。热身、启动、呼吸、重心，先把身体调进可战斗的状态。',
  },
  {
    step: 'A2',
    kicker: '推进',
    title: '然后把极限练成日常。',
    copy: '力量训练、耐力推进和密度控制交替出现。页面滚动像训练节奏本身，短、硬、快，没有一堆解释性废话。',
  },
  {
    step: 'A3',
    kicker: '留下',
    title: '最后让纪律留下痕迹。',
    copy: '真正有价值的不是一次爆发，而是每次都能回来。生存练习想传达的，是一种可以带回日常的身体可靠性。',
  },
]

function scrollToAnchor(anchor) {
  if (typeof document === 'undefined')
    return
  const target = document.querySelector(`[data-anchor="${anchor}"]`)
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<template>
  <view class="brand-home">
    <view class="brand-grid" />
    <view class="brand-glow brand-glow--left" />
    <view class="brand-glow brand-glow--right" />

    <view class="hero-shell">
      <view class="topbar">
        <view class="brand-mark">
          <text class="brand-mark__cn">生存练习</text>
          <text class="brand-mark__en">SURVIVAL PRACTICE</text>
        </view>
        <view class="topbar-nav">
          <text class="topbar-link" @click="scrollToAnchor('system')">理念</text>
          <text class="topbar-link" @click="scrollToAnchor('story')">体系</text>
          <text class="topbar-link topbar-link--strong" @click="scrollToAnchor('cta')">开始了解</text>
        </view>
      </view>

      <view class="hero-stage">
        <view class="hero-copy">
          <text class="hero-label">FIELD CONDITIONING FOR THE YOUNG</text>
          <text class="hero-title">把身体\n练成武器</text>
          <text class="hero-subtitle">
            生存练习不是传统健身房话术，而是一套面向年轻训练者的体能宣言。
            你练出的不是样子，是更能扛、更能稳、更能持续输出的身体。
          </text>
          <view class="hero-actions">
            <view class="hero-button hero-button--solid" @click="scrollToAnchor('system')">
              查看训练体系
            </view>
            <view class="hero-button hero-button--ghost" @click="scrollToAnchor('story')">
              认识生存练习
            </view>
          </view>
        </view>

        <view class="hero-visual" aria-hidden="true">
          <view class="hero-target hero-target--outer" />
          <view class="hero-target hero-target--inner" />
          <view class="hero-figure">
            <view class="hero-figure__head" />
            <view class="hero-figure__torso" />
            <view class="hero-figure__arm hero-figure__arm--left" />
            <view class="hero-figure__arm hero-figure__arm--right" />
            <view class="hero-figure__weight" />
            <view class="hero-figure__leg hero-figure__leg--left" />
            <view class="hero-figure__leg hero-figure__leg--right" />
          </view>
          <view class="hero-stripe">
            <text>ACTIVE BODY</text>
            <text>DISCIPLINED MIND</text>
          </view>
        </view>
      </view>

      <view class="hero-band">
        <text v-for="tag in heroTags" :key="tag" class="hero-band__item">{{ tag }}</text>
      </view>
    </view>

    <view class="philosophy-section" data-anchor="system">
      <view class="section-header">
        <text class="section-label">TRAINING PHILOSOPHY</text>
        <text class="section-title">三条主线，撑起整个训练人格。</text>
      </view>
      <view class="philosophy-grid">
        <view v-for="pillar in philosophyPillars" :key="pillar.index" class="pillar">
          <view class="pillar-top">
            <text class="pillar-index">{{ pillar.index }}</text>
            <image class="pillar-icon" :src="pillar.icon" mode="aspectFit" />
          </view>
          <text class="pillar-english">{{ pillar.english }}</text>
          <text class="pillar-title">{{ pillar.title }}</text>
          <text class="pillar-description">{{ pillar.description }}</text>
        </view>
      </view>
    </view>

    <view class="story-section" data-anchor="story">
      <view class="story-heading">
        <text class="section-label">STORY SEQUENCE</text>
        <text class="story-kicker">不是一页官网，是一段训练现场。</text>
      </view>
      <view class="story-sequence">
        <view v-for="frame in storyFrames" :key="frame.step" class="story-frame">
          <view class="story-visual">
            <text class="story-step">{{ frame.step }}</text>
            <text class="story-chip">{{ frame.kicker }}</text>
          </view>
          <view class="story-copy">
            <text class="story-title">{{ frame.title }}</text>
            <text class="story-description">{{ frame.copy }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="cta-section" data-anchor="cta">
      <text class="section-label">FINAL CALL</text>
      <text class="cta-title">练得够狠，日常才稳。</text>
      <text class="cta-copy">
        如果你想先理解一种更有纪律、更能输出、也更有品牌态度的训练方式，
        生存练习就是从这里开始。
      </text>
      <view class="cta-actions">
        <view class="hero-button hero-button--solid" @click="scrollToAnchor('system')">
          完整了解训练方法
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.brand-home {
  --bg: #090b08;
  --bg-soft: #12160f;
  --line: rgba(212, 255, 77, 0.16);
  --text: #f4f1e8;
  --muted: rgba(244, 241, 232, 0.7);
  --accent: #d4ff4d;
  --headline: 'DIN Alternate', 'Arial Narrow', 'Impact', sans-serif;
  --sans: 'SF Pro Display', 'PingFang SC', 'HarmonyOS Sans SC', 'MiSans', 'Noto Sans SC', sans-serif;

  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(circle at 18% 12%, rgba(212, 255, 77, 0.15), transparent 30%),
    radial-gradient(circle at 80% 24%, rgba(212, 255, 77, 0.12), transparent 24%),
    linear-gradient(180deg, #141911 0%, #090b08 40%, #0d100c 100%);
  color: var(--text);
  font-family: var(--sans);
}

.brand-grid,
.brand-grid::before,
.brand-grid::after {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.brand-grid {
  background:
    linear-gradient(rgba(212, 255, 77, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(212, 255, 77, 0.05) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.78), transparent 100%);
}

.brand-grid::before {
  content: '';
  background: linear-gradient(90deg, transparent, rgba(212, 255, 77, 0.08), transparent);
  transform: translateX(-45%);
  animation: scanLine 11s linear infinite;
}

.brand-grid::after {
  content: '';
  background: radial-gradient(circle, rgba(255, 255, 255, 0.22) 0, transparent 56%);
  opacity: 0.1;
  mix-blend-mode: screen;
}

.brand-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.55;
  pointer-events: none;
}

.brand-glow--left {
  width: 360px;
  height: 360px;
  top: -120px;
  left: -80px;
  background: rgba(212, 255, 77, 0.16);
}

.brand-glow--right {
  width: 420px;
  height: 420px;
  right: -160px;
  top: 18vh;
  background: rgba(124, 165, 30, 0.18);
}

.hero-shell {
  position: relative;
  min-height: 100svh;
  padding: max(24px, env(safe-area-inset-top)) clamp(20px, 4vw, 52px) 42px;
  display: flex;
  flex-direction: column;
}

.topbar {
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.brand-mark {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.brand-mark__cn {
  font-size: clamp(20px, 2vw, 28px);
  font-weight: 700;
  letter-spacing: 0.08em;
}

.brand-mark__en,
.section-label,
.hero-label,
.pillar-index,
.pillar-english,
.story-step,
.story-chip {
  font-size: 12px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: rgba(212, 255, 77, 0.88);
}

.topbar-nav {
  display: flex;
  align-items: center;
  gap: 22px;
  flex-wrap: wrap;
}

.topbar-link {
  position: relative;
  font-size: 13px;
  color: var(--muted);
  cursor: pointer;
  transition: color 0.24s ease;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: -5px;
    height: 1px;
    background: var(--accent);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.24s ease;
  }

  &:hover {
    color: var(--text);

    &::after {
      transform: scaleX(1);
    }
  }
}

.topbar-link--strong {
  color: var(--text);
}

.hero-stage {
  position: relative;
  z-index: 2;
  flex: 1;
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(360px, 0.85fr);
  gap: clamp(28px, 5vw, 72px);
  align-items: center;
  padding: clamp(48px, 9vh, 120px) 0 24px;
}

.hero-copy {
  max-width: 560px;
  animation: heroRise 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.hero-title {
  display: block;
  margin-top: 18px;
  font-family: var(--headline);
  font-size: clamp(68px, 10vw, 146px);
  line-height: 0.88;
  letter-spacing: -0.06em;
  white-space: pre-line;
  text-transform: uppercase;
}

.hero-subtitle {
  display: block;
  margin-top: 24px;
  max-width: 480px;
  font-size: clamp(16px, 1.7vw, 21px);
  line-height: 1.75;
  color: var(--muted);
}

.hero-actions,
.cta-actions {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  margin-top: 28px;
}

.hero-button {
  min-width: 176px;
  padding: 15px 22px;
  border-radius: 999px;
  border: 1px solid rgba(212, 255, 77, 0.28);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-align: center;
  cursor: pointer;
  transition: transform 0.24s ease, border-color 0.24s ease, background 0.24s ease;

  &:hover {
    transform: translateY(-2px);
  }
}

.hero-button--solid {
  background: linear-gradient(90deg, var(--accent), #e6ff9b);
  color: #0b0d08;
  border-color: transparent;
  box-shadow: 0 18px 36px rgba(212, 255, 77, 0.22);
}

.hero-button--ghost {
  background: rgba(255, 255, 255, 0.02);
  color: var(--text);

  &:hover {
    border-color: rgba(212, 255, 77, 0.6);
    background: rgba(212, 255, 77, 0.06);
  }
}

.hero-visual {
  position: relative;
  min-height: clamp(420px, 70vh, 760px);
  animation: heroVisualIn 1.1s cubic-bezier(0.18, 0.9, 0.22, 1) 0.1s both;
}

.hero-target {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(212, 255, 77, 0.12);
}

.hero-target--outer {
  width: clamp(360px, 42vw, 600px);
  height: clamp(360px, 42vw, 600px);
  right: 4%;
  top: 8%;
}

.hero-target--inner {
  width: clamp(260px, 28vw, 400px);
  height: clamp(260px, 28vw, 400px);
  right: 16%;
  top: 20%;
}

.hero-figure {
  position: absolute;
  right: 6%;
  bottom: 0;
  width: min(36vw, 420px);
  height: min(70vh, 720px);
  filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.5));
}

.hero-figure__head,
.hero-figure__torso,
.hero-figure__arm,
.hero-figure__weight,
.hero-figure__leg {
  position: absolute;
  background: linear-gradient(180deg, rgba(243, 247, 229, 0.94), rgba(212, 255, 77, 0.12));
}

.hero-figure__head {
  top: 4%;
  left: 46%;
  width: 18%;
  height: 12%;
  border-radius: 50% 50% 45% 45%;
  box-shadow: 0 0 30px rgba(212, 255, 77, 0.2);
}

.hero-figure__torso {
  top: 15%;
  left: 31%;
  width: 38%;
  height: 40%;
  border-radius: 42% 44% 24% 30%;
  transform: rotate(8deg);
}

.hero-figure__arm {
  top: 18%;
  width: 18%;
  height: 36%;
  border-radius: 999px;
}

.hero-figure__arm--left {
  left: 17%;
  transform: rotate(18deg);
}

.hero-figure__arm--right {
  right: 11%;
  transform: rotate(-16deg);
}

.hero-figure__weight {
  top: 29%;
  left: 8%;
  width: 84%;
  height: 7%;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(212, 255, 77, 0.4), rgba(255, 255, 255, 0.95), rgba(212, 255, 77, 0.4));
}

.hero-figure__leg {
  top: 48%;
  width: 20%;
  height: 42%;
  border-radius: 999px;
}

.hero-figure__leg--left {
  left: 28%;
  transform: rotate(8deg);
}

.hero-figure__leg--right {
  right: 27%;
  transform: rotate(-8deg);
}

.hero-stripe {
  position: absolute;
  left: 0;
  bottom: 10%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-left: 16px;
  border-left: 2px solid rgba(212, 255, 77, 0.26);

  text {
    font-family: var(--headline);
    font-size: clamp(18px, 2.1vw, 30px);
    line-height: 0.9;
    letter-spacing: 0.08em;
    color: rgba(244, 241, 232, 0.7);
  }
}

.hero-band {
  position: relative;
  z-index: 2;
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  padding-top: 18px;
  border-top: 1px solid rgba(212, 255, 77, 0.16);
}

.hero-band__item {
  padding: 9px 14px;
  border-radius: 999px;
  border: 1px solid rgba(212, 255, 77, 0.16);
  background: rgba(212, 255, 77, 0.05);
  font-size: 12px;
  letter-spacing: 0.16em;
  color: rgba(244, 241, 232, 0.8);
}

.philosophy-section,
.story-section,
.cta-section {
  position: relative;
  z-index: 1;
  padding: clamp(72px, 10vw, 128px) clamp(20px, 4vw, 52px);
}

.philosophy-section {
  background: linear-gradient(180deg, rgba(14, 17, 12, 0.92), rgba(9, 11, 8, 0.96));
}

.section-header,
.story-heading {
  display: grid;
  gap: 14px;
  margin-bottom: clamp(28px, 4vw, 44px);
}

.section-title,
.story-kicker,
.cta-title {
  font-family: var(--headline);
  font-size: clamp(40px, 5.5vw, 84px);
  line-height: 0.95;
  letter-spacing: -0.05em;
  text-transform: uppercase;
  max-width: 980px;
}

.philosophy-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 26px;
}

.pillar {
  min-height: 360px;
  padding: 26px 0 0;
  border-top: 1px solid var(--line);
  display: grid;
  align-content: start;
  gap: 14px;
  transition: transform 0.24s ease;

  &:hover {
    transform: translateY(-6px);
  }
}

.pillar-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.pillar-icon {
  width: 34px;
  height: 34px;
  opacity: 0.72;
  filter: brightness(0) saturate(100%) invert(91%) sepia(16%) saturate(1721%) hue-rotate(21deg) brightness(106%) contrast(103%);
}

.pillar-title {
  font-family: var(--headline);
  font-size: clamp(38px, 4vw, 62px);
  line-height: 0.9;
  letter-spacing: -0.04em;
  text-transform: uppercase;
}

.pillar-description,
.story-description,
.cta-copy {
  max-width: 420px;
  font-size: 16px;
  line-height: 1.85;
  color: var(--muted);
}

.story-section {
  display: grid;
  grid-template-columns: minmax(0, 0.64fr) minmax(0, 1fr);
  gap: clamp(28px, 4vw, 64px);
}

.story-heading {
  position: sticky;
  top: 28px;
  align-self: start;
}

.story-sequence {
  display: grid;
  gap: 22px;
}

.story-frame {
  display: grid;
  grid-template-columns: minmax(220px, 0.72fr) minmax(0, 1fr);
  gap: 24px;
  padding: 18px 0 28px;
  border-top: 1px solid rgba(212, 255, 77, 0.12);
}

.story-visual {
  position: relative;
  min-height: 240px;
  padding: 22px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background:
    linear-gradient(155deg, rgba(212, 255, 77, 0.12), rgba(212, 255, 77, 0.02)),
    linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02));
  overflow: hidden;
}

.story-visual::after {
  content: '';
  position: absolute;
  inset: auto 12% -12% 12%;
  height: 54%;
  border-radius: 999px 999px 16px 16px;
  background: linear-gradient(180deg, rgba(244, 241, 232, 0.34), rgba(212, 255, 77, 0.04));
  transform: skew(-10deg);
}

.story-chip {
  position: relative;
  z-index: 1;
  padding: 8px 10px;
  border: 1px solid rgba(212, 255, 77, 0.18);
  border-radius: 999px;
  background: rgba(9, 11, 8, 0.45);
}

.story-copy {
  display: grid;
  align-content: center;
  gap: 16px;
}

.story-title {
  font-family: var(--headline);
  font-size: clamp(34px, 4vw, 58px);
  line-height: 0.96;
  letter-spacing: -0.04em;
  text-transform: uppercase;
}

.cta-section {
  padding-top: clamp(88px, 10vw, 136px);
  padding-bottom: clamp(96px, 11vw, 152px);
  background:
    radial-gradient(circle at 50% 0%, rgba(212, 255, 77, 0.12), transparent 30%),
    linear-gradient(180deg, rgba(9, 11, 8, 0.9), rgba(9, 11, 8, 1));
  text-align: center;
}

.cta-title {
  display: block;
  margin: 14px auto 0;
  max-width: 760px;
}

.cta-copy {
  display: block;
  margin: 18px auto 0;
  max-width: 560px;
}

.cta-actions {
  justify-content: center;
}

@keyframes heroRise {
  from {
    opacity: 0;
    transform: translateY(36px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes heroVisualIn {
  from {
    opacity: 0;
    transform: translateX(36px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes scanLine {
  from {
    transform: translateX(-45%);
  }
  to {
    transform: translateX(145%);
  }
}

@media (max-width: 1080px) {
  .hero-stage,
  .story-section,
  .story-frame,
  .philosophy-grid {
    grid-template-columns: 1fr;
  }

  .hero-stage {
    padding-top: 54px;
  }

  .hero-visual {
    min-height: 420px;
  }

  .hero-figure {
    right: 8%;
    width: min(60vw, 360px);
    height: 460px;
  }

  .story-heading {
    position: static;
  }

  .pillar {
    min-height: auto;
  }
}

@media (max-width: 720px) {
  .hero-shell,
  .philosophy-section,
  .story-section,
  .cta-section {
    padding-left: 18px;
    padding-right: 18px;
  }

  .topbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .topbar-nav {
    gap: 16px;
  }

  .hero-title {
    font-size: clamp(54px, 20vw, 84px);
  }

  .hero-subtitle,
  .pillar-description,
  .story-description,
  .cta-copy {
    font-size: 15px;
  }

  .hero-visual {
    min-height: 360px;
  }

  .hero-target--outer {
    width: 260px;
    height: 260px;
  }

  .hero-target--inner {
    width: 180px;
    height: 180px;
  }

  .hero-figure {
    width: 240px;
    height: 340px;
  }

  .hero-stripe {
    left: auto;
    right: 0;
    bottom: 4%;
  }

  .section-title,
  .story-kicker,
  .cta-title {
    font-size: clamp(34px, 14vw, 58px);
  }
}
</style>
