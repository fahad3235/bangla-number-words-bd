/* Bangla Number Words BD — UI wiring + BN/EN toggle. Requires js/words.js */
(function () {
  'use strict';
  var BN = window.BanglaNumbers;

  var I18N = {
    bn: {
      'meta.title': 'বাংলা সংখ্যা-শব্দ টুলকিট | Bangla Number Words',
      'brand.name': 'বাংলা সংখ্যা-শব্দ টুলকিট',
      'brand.tagline': 'সংখ্যা → কথায় · চেক-স্টাইল অঙ্ক · অঙ্ক রূপান্তর · লাখ-কোটি ব্যাখ্যা',
      'common.convert': 'রূপান্তর',
      'common.copy': 'কপি',
      'common.copied': 'কপি হয়েছে ✓',
      'words.title': 'সংখ্যা → কথায়',
      'words.hint': '০ থেকে ৯৯,৯৯,৯৯,৯৯৯ পর্যন্ত পূর্ণসংখ্যা লিখুন',
      'words.result': 'বাংলায়:',
      'words.empty': 'একটি সংখ্যা লিখলে এখানে বাংলায় দেখা যাবে।',
      'words.error': 'শুধু ০–৯৯৯৯৯৯৯৯৯ পর্যন্ত পূর্ণসংখ্যা দিন।',
      'amount.title': 'টাকার অঙ্ক (চেক-স্টাইল)',
      'amount.hint': 'দশমিকসহ টাকার পরিমাণ লিখুন — চেক লেখার মতো কথায় পাবেন',
      'amount.result': 'কথায়:',
      'amount.empty': 'টাকার অঙ্ক লিখলে এখানে “মাত্র”-সহ দেখা যাবে।',
      'amount.error': 'সঠিক টাকার অঙ্ক দিন (যেমন 2500.50), সর্বোচ্চ ৯৯৯৯৯৯৯৯৯.৯৯।',
      'digits.title': 'অঙ্ক রূপান্তরকারী',
      'digits.hint': 'যেকোনো লেখার ভেতরের অঙ্ক English ↔ বাংলা করুন',
      'digits.toBn': 'English → বাংলা',
      'digits.toEn': 'বাংলা → English',
      'digits.result': 'ফলাফল:',
      'digits.empty': 'লেখা দিয়ে বোতাম চাপুন — অঙ্কগুলো রূপান্তরিত হবে।',
      'scale.title': 'বড় সংখ্যা ব্যাখ্যাকারী',
      'scale.hint': 'লাখ-কোটি বনাম মিলিয়ন-বিলিয়ন — এক নজরে',
      'scale.grouping': 'বাংলাদেশি গ্রুপিং',
      'scale.words': 'কথায়',
      'scale.lakh': 'লাখ',
      'scale.crore': 'কোটি',
      'scale.million': 'মিলিয়ন',
      'scale.billion': 'বিলিয়ন',
      'scale.empty': 'সংখ্যা লিখলে লাখ-কোটি ও মিলিয়ন-বিলিয়ন মান দেখা যাবে।',
      'scale.error': 'শুধু ০–৯৯৯৯৯৯৯৯৯ পর্যন্ত পূর্ণসংখ্যা দিন।',
      'footer.note': '১০০% অফলাইন — সব হিসাব আপনার ডিভাইসেই হয়, কোনো তথ্য কোথাও পাঠানো হয় না।',
      'footer.built': 'Bangla Number Words BD · একটি ব্যক্তিগত অফলাইন টুল'
    },
    en: {
      'meta.title': 'Bangla Number Words Toolkit | বাংলা সংখ্যা-শব্দ টুলকিট',
      'brand.name': 'Bangla Number Words Toolkit',
      'brand.tagline': 'Numbers → words · cheque-style amounts · digit conversion · lakh-crore explainer',
      'common.convert': 'Convert',
      'common.copy': 'Copy',
      'common.copied': 'Copied ✓',
      'words.title': 'Number → Words',
      'words.hint': 'Enter a whole number from 0 to 999,999,999',
      'words.result': 'In Bengali:',
      'words.empty': 'Type a number and its Bengali words will appear here.',
      'words.error': 'Enter a whole number from 0 to 999999999 only.',
      'amount.title': 'Money Amount (Cheque Style)',
      'amount.hint': 'Enter an amount with decimals — get it in words, cheque-style',
      'amount.result': 'In words:',
      'amount.empty': 'Type an amount and see it in words with “matro”.',
      'amount.error': 'Enter a valid amount (e.g. 2500.50), max 999999999.99.',
      'digits.title': 'Digit Converter',
      'digits.hint': 'Convert digits inside any text between English ↔ Bengali',
      'digits.toBn': 'English → Bengali',
      'digits.toEn': 'Bengali → English',
      'digits.result': 'Result:',
      'digits.empty': 'Enter text and press a button — digits will be converted.',
      'scale.title': 'Big-Number Explainer',
      'scale.hint': 'Lakh-crore vs million-billion at a glance',
      'scale.grouping': 'BD grouping',
      'scale.words': 'In words',
      'scale.lakh': 'Lakh',
      'scale.crore': 'Crore',
      'scale.million': 'Million',
      'scale.billion': 'Billion',
      'scale.empty': 'Type a number to see lakh-crore and million-billion values.',
      'scale.error': 'Enter a whole number from 0 to 999999999 only.',
      'footer.note': '100% offline — everything is computed on your device, nothing is sent anywhere.',
      'footer.built': 'Bangla Number Words BD · a personal offline tool'
    }
  };

  var NUM_EXAMPLES = ['75', '1000', '25000', '150000', '123456789'];
  var AMT_EXAMPLES = ['2500.50', '100', '150000', '0.75', '999999'];

  var lang = 'bn';
  try { lang = localStorage.getItem('bnw-lang') || 'bn'; } catch (e) {}

  function t(key) { return (I18N[lang] && I18N[lang][key]) || I18N.bn[key] || key; }

  function $(id) { return document.getElementById(id); }

  function applyLang() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var v = t(el.getAttribute('data-i18n'));
      if (el.tagName === 'TITLE') { document.title = v; return; }
      el.textContent = v;
    });
    document.documentElement.lang = lang;
    $('langToggle').textContent = lang === 'bn' ? 'EN' : 'বাং';
    try { localStorage.setItem('bnw-lang', lang); } catch (e) {}
  }

  function showError(el, msgKey) {
    el.textContent = t(msgKey);
    el.hidden = false;
  }
  function hideError(el) { el.hidden = true; }

  function showResult(resultId, emptyId) {
    $(resultId).hidden = false;
    $(emptyId).hidden = true;
  }
  function hideResult(resultId, emptyId) {
    $(resultId).hidden = true;
    $(emptyId).hidden = false;
  }

  function validInt(s) { return /^[0-9]{1,9}$/.test(s.trim()); }
  function validAmount(s) { return /^[0-9]{1,9}(\.[0-9]{1,2})?$/.test(s.trim()); }

  function buildChips(containerId, examples, inputId, goFn) {
    var box = $(containerId);
    box.innerHTML = '';
    examples.forEach(function (ex) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.textContent = ex;
      b.addEventListener('click', function () { $(inputId).value = ex; goFn(); });
      box.appendChild(b);
    });
  }

  function convertNumber() {
    var raw = $('numInput').value;
    hideError($('numError'));
    if (!validInt(raw)) {
      hideResult('numResult', 'numEmpty');
      showError($('numError'), 'words.error');
      return;
    }
    try {
      $('numWords').textContent = BN.numberToWords(parseInt(raw.trim(), 10));
      showResult('numResult', 'numEmpty');
    } catch (e) {
      hideResult('numResult', 'numEmpty');
      showError($('numError'), 'words.error');
    }
  }

  function convertAmount() {
    var raw = $('amtInput').value;
    hideError($('amtError'));
    if (!validAmount(raw)) {
      hideResult('amtResult', 'amtEmpty');
      showError($('amtError'), 'amount.error');
      return;
    }
    try {
      $('amtWords').textContent = BN.amountToWords(parseFloat(raw.trim()));
      showResult('amtResult', 'amtEmpty');
    } catch (e) {
      hideResult('amtResult', 'amtEmpty');
      showError($('amtError'), 'amount.error');
    }
  }

  function convertDigitsDir(dir) {
    var raw = $('digitInput').value;
    if (!raw) { hideResult('digitResult', 'digitEmpty'); return; }
    $('digitOut').textContent = BN.convertDigits(raw, dir);
    showResult('digitResult', 'digitEmpty');
  }

  function explainScale() {
    var raw = $('scaleInput').value;
    hideError($('scaleError'));
    if (!validInt(raw)) {
      hideResult('scaleResult', 'scaleEmpty');
      showError($('scaleError'), 'scale.error');
      return;
    }
    try {
      var n = parseInt(raw.trim(), 10);
      var bd = BN.scaleBreakdown(n);
      $('scaleGrouping').textContent = BN.formatBDGrouping(n);
      $('scaleWords').textContent = BN.numberToWords(n);
      $('scaleLakh').textContent = bd.lakhs;
      $('scaleCrore').textContent = bd.crores;
      $('scaleMillion').textContent = bd.millions;
      $('scaleBillion').textContent = bd.billions;
      showResult('scaleResult', 'scaleEmpty');
    } catch (e) {
      hideResult('scaleResult', 'scaleEmpty');
      showError($('scaleError'), 'scale.error');
    }
  }

  function copyText(targetId, btn) {
    var text = $(targetId).textContent;
    function done() {
      var old = btn.textContent;
      btn.textContent = t('common.copied');
      setTimeout(function () { btn.textContent = old; }, 1200);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, done);
    } else {
      var ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
      done();
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    applyLang();
    buildChips('numExamples', NUM_EXAMPLES, 'numInput', convertNumber);
    buildChips('amtExamples', AMT_EXAMPLES, 'amtInput', convertAmount);

    $('langToggle').addEventListener('click', function () {
      lang = (lang === 'bn') ? 'en' : 'bn';
      applyLang();
    });
    $('numGo').addEventListener('click', convertNumber);
    $('numInput').addEventListener('keydown', function (e) { if (e.key === 'Enter') convertNumber(); });
    $('amtGo').addEventListener('click', convertAmount);
    $('amtInput').addEventListener('keydown', function (e) { if (e.key === 'Enter') convertAmount(); });
    $('toBn').addEventListener('click', function () { convertDigitsDir('en2bn'); });
    $('toEn').addEventListener('click', function () { convertDigitsDir('bn2en'); });
    $('scaleGo').addEventListener('click', explainScale);
    $('scaleInput').addEventListener('keydown', function (e) { if (e.key === 'Enter') explainScale(); });

    document.querySelectorAll('.copy-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { copyText(btn.getAttribute('data-copy'), btn); });
    });
  });
})();
