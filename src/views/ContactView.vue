<template>
  <main>
    <div class="container"><div class="breadcrumb"><router-link to="/">{{ t('nav.home') }}</router-link><span>/</span><span>{{ t('nav.contact') }}</span></div></div>
    <section class="section" style="padding-top:48px">
      <div class="container"><div class="section-header"><h1>{{ t('contact.title') }}</h1><p>{{ t('contact.sub') }}</p></div></div>
    </section>
    <section class="section-sm" style="padding-bottom:0">
      <div class="container">
        <div class="contact-info-grid">
          <div class="contact-info-card"><div class="contact-info-icon">📍</div><h4>{{ t('contact.info.address') }}</h4><p>{{ t('contact.info.addressVal') }}</p></div>
          <div class="contact-info-card"><div class="contact-info-icon">📞</div><h4>{{ t('contact.info.phone') }}</h4><p>{{ t('contact.info.phoneVal') }}</p></div>
          <div class="contact-info-card"><div class="contact-info-icon">✉️</div><h4>{{ t('contact.info.email') }}</h4><p>{{ t('contact.info.emailVal') }}</p></div>
        </div>
      </div>
    </section>
    <section class="section-sm">
      <div class="container text-center" style="display:flex;justify-content:center;gap:24px;flex-wrap:wrap">
        <a v-for="s in social" :key="s" href="#" class="btn btn-ghost btn-md">{{ s }}</a>
      </div>
    </section>
    <section class="section" style="background:var(--bg-primary)">
      <div class="container-content">
        <div class="section-header"><h2>{{ t('contact.form.title') }}</h2><p>{{ t('contact.form.sub') }}</p></div>
        <div class="form-container">
          <form @submit.prevent="onSubmit" novalidate>
            <div class="form-group">
              <label class="form-label">{{ t('contact.form.name') }}<span class="required">*</span></label>
              <input v-model="form.name" class="form-input" :class="{ error: errors.name, success: form.name && !errors.name }"
                :placeholder="t('contact.form.namePh')" @blur="validate('name')" @input="clearError('name')" />
              <div class="form-error-msg" v-if="errors.name">{{ errors.name }}</div>
            </div>
            <div class="form-group">
              <label class="form-label">{{ t('contact.form.phone') }}<span class="required">*</span></label>
              <input v-model="form.phone" class="form-input" :class="{ error: errors.phone, success: form.phone && !errors.phone }"
                :placeholder="t('contact.form.phonePh')" @blur="validate('phone')" @input="clearError('phone')" />
              <div class="form-error-msg" v-if="errors.phone">{{ errors.phone }}</div>
            </div>
            <div class="form-group">
              <label class="form-label">{{ t('contact.form.demand') }}<span class="required">*</span></label>
              <textarea v-model="form.demand" class="form-textarea" rows="3" :class="{ error: errors.demand }"
                :placeholder="t('contact.form.demandPh')" @blur="validate('demand')" @input="clearError('demand')"></textarea>
              <div class="form-error-msg" v-if="errors.demand">{{ errors.demand }}</div>
            </div>
            <div class="form-group">
              <label class="form-label">{{ t('contact.form.timeline') }}</label>
              <select v-model="form.timeline" class="form-select">
                <option v-for="(o, i) in timelineOpts" :key="i" :value="i === 0 ? '' : o" :disabled="i === 0">{{ o }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">{{ t('contact.form.budget') }}</label>
              <select v-model="form.budget" class="form-select">
                <option v-for="(o, i) in budgetOpts" :key="i" :value="i === 0 ? '' : o" :disabled="i === 0">{{ o }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">{{ t('contact.form.message') }}</label>
              <textarea v-model="form.message" class="form-textarea" rows="3" maxlength="500" :placeholder="t('contact.form.messagePh')"></textarea>
              <div class="form-char-count"><span>{{ (form.message || '').length }}</span> / 500 {{ t('contact.form.messageCount') }}</div>
            </div>
            <div class="form-error-msg" style="margin-bottom:12px;text-align:center" v-if="submitError">{{ submitError }}</div>
            <button type="submit" class="btn btn-primary btn-lg btn-block" :disabled="submitting">
              {{ submitting ? t('contact.form.submitting') : t('contact.form.submit') }}
            </button>
          </form>
        </div>
      </div>
    </section>
    <Teleport to="body">
      <div class="modal-backdrop" :class="{ open: showSuccess }" @click.self="showSuccess = false">
        <div class="modal">
          <button class="modal-close" @click="showSuccess = false">&times;</button>
          <div class="modal-icon">✓</div>
          <h3>{{ t('contact.success.title') }}</h3>
          <p>{{ t('contact.success.desc') }}</p>
          <button class="btn btn-primary btn-block" @click="showSuccess = false">{{ t('contact.success.close') }}</button>
        </div>
      </div>
    </Teleport>
  </main>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import emailjs from '@emailjs/browser'
const { t, tm, locale } = useI18n()

// ===== EmailJS 配置 =====
// 注册 https://dashboard.emailjs.com/admin 获取以下三个值
const EMAILJS_CONFIG = {
  serviceId:  import.meta.env.VITE_EMAILJS_SERVICE_ID  || 'YOUR_SERVICE_ID',
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'YOUR_TEMPLATE_ID',
  publicKey:  import.meta.env.VITE_EMAILJS_PUBLIC_KEY  || 'YOUR_PUBLIC_KEY',
}

const social = computed(() => tm('contact.social'))
const timelineOpts = computed(() => tm('contact.form.timelineOpts'))
const budgetOpts = computed(() => tm('contact.form.budgetOpts'))

const form = reactive({ name: '', phone: '', demand: '', timeline: '', budget: '', message: '' })
const errors = reactive({ name: '', phone: '', demand: '' })
const submitting = ref(false)
const showSuccess = ref(false)
const submitError = ref('')

function validate(field) {
  const v = form[field]?.trim() || ''
  const msgs = locale.value === 'zh'
    ? { required: '此项为必填', phone: '请输入正确的手机号码', nameMin: '姓名至少2个字符' }
    : { required: 'Required', phone: 'Enter a valid phone number', nameMin: 'Name min 2 chars' }
  if (field === 'name') { if (!v) errors.name = msgs.required; else if (v.length < 2) errors.name = msgs.nameMin; else errors.name = '' }
  if (field === 'phone') { if (!v) errors.phone = msgs.required; else if (!/^1[3-9]\d{9}$/.test(v) && !/^\+?\d{7,15}$/.test(v)) errors.phone = msgs.phone; else errors.phone = '' }
  if (field === 'demand') { errors.demand = v ? '' : msgs.required }
}

function clearError(f) { if (errors[f] && form[f]?.trim()) errors[f] = '' }

async function onSubmit() {
  validate('name'); validate('phone'); validate('demand')
  if (errors.name || errors.phone || errors.demand) return
  
  submitting.value = true
  submitError.value = ''

  try {
    const result = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      {
        from_name:  form.name,
        reply_to:   form.phone,          // EmailJS 用 reply_to 做回复标识
        phone:      form.phone,
        demand:     form.demand,
        timeline:   form.timeline || t('contact.form.timelineOpts')[0],
        budget:     form.budget   || t('contact.form.budgetOpts')[0],
        message:    form.message  || '-',
        lang:       locale.value,
        time:       new Date().toLocaleString('zh-CN'),
      },
      EMAILJS_CONFIG.publicKey
    )

    if (result.status === 200) {
      showSuccess.value = true
      Object.keys(form).forEach(k => form[k] = '')
    } else {
      submitError.value = t('contact.form.error') || '提交失败，请稍后重试'
    }
  } catch (e) {
    console.error('EmailJS error:', e)
    submitError.value = t('contact.form.error') || '提交失败，请稍后重试'
  } finally {
    submitting.value = false
  }
}
</script>
