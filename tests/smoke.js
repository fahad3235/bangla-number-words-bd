'use strict';
/* bangla-number-words-bd — headless-Chrome smoke tests via RAW CDP (no dependencies).
 * Usage: node tests/smoke.js [--viewport=desktop|mobile]
 * Exit code 0 = all checks pass. */
var path = require('path');
var http = require('http');
var child_process = require('child_process');

var VIEWPORT = 'desktop';
process.argv.slice(2).forEach(function (a) {
  if (a.indexOf('--viewport=') === 0) VIEWPORT = a.split('=')[1];
});
var MOBILE = VIEWPORT === 'mobile';
var PORT = MOBILE ? 19233 : 19232;
var CHROME = '/opt/meta-chromium/chrome';
var INDEX = 'file://' + path.resolve(__dirname, '..', 'index.html');

var passed = 0, failed = 0, failures = [], pageErrors = [];

function check(name, cond, extra) {
  if (cond) { passed++; }
  else { failed++; failures.push(name); console.log('FAIL: ' + name + (extra ? ' | ' + extra : '')); }
}
function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

function getVersion() {
  return new Promise(function (resolve, reject) {
    http.get('http://127.0.0.1:' + PORT + '/json/version', function (res) {
      var data = '';
      res.on('data', function (c) { data += c; });
      res.on('end', function () { try { resolve(JSON.parse(data)); } catch (e) { reject(e); } });
    }).on('error', reject);
  });
}

function launchChrome() {
  var args = [
    '--headless=new', '--no-sandbox', '--disable-gpu',
    '--disable-dev-shm-usage', '--no-first-run',
    '--remote-debugging-address=127.0.0.1',
    '--remote-debugging-port=' + PORT,
    '--user-data-dir=/tmp/bnw-smoke-' + VIEWPORT,
    'about:blank'
  ];
  return child_process.spawn(CHROME, args, { stdio: 'ignore', detached: true });
}

function main() {
  var chrome = launchChrome();
  var ws = null, nextId = 1;
  var pending = new Map();

  function send(method, params, sessionId) {
    return new Promise(function (resolve, reject) {
      var id = nextId++;
      pending.set(id, { resolve: resolve, reject: reject });
      var msg = { id: id, method: method, params: params || {} };
      if (sessionId) msg.sessionId = sessionId;
      ws.send(JSON.stringify(msg));
      setTimeout(function () {
        if (pending.has(id)) { pending.delete(id); reject(new Error('CDP timeout: ' + method)); }
      }, 15000);
    });
  }

  function onMessage(data) {
    var msg;
    try { msg = JSON.parse(data.toString()); } catch (e) { return; }
    if (msg.id && pending.has(msg.id)) {
      var p = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) p.reject(new Error(JSON.stringify(msg.error)));
      else p.resolve(msg.result || {});
      return;
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      var d = msg.params.exceptionDetails || {};
      pageErrors.push('exception: ' + (d.text || '') + ' ' + ((d.exception && d.exception.description) || ''));
    }
    if (msg.method === 'Log.entryAdded') {
      var e = msg.params.entry || {};
      if (e.level === 'error') pageErrors.push('log: ' + (e.text || '') + ' ' + (e.url || ''));
    }
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      var args = msg.params.args || [];
      pageErrors.push('console.error: ' + args.map(function (a) { return a.value || a.description || ''; }).join(' '));
    }
  }

  (async function () {
    try {
      var version = null;
      for (var i = 0; i < 50 && !version; i++) {
        try { version = await getVersion(); } catch (e) { await sleep(200); }
      }
      if (!version) throw new Error('Chrome DevTools endpoint did not come up');

      ws = new WebSocket(version.webSocketDebuggerUrl);
      await new Promise(function (res, rej) { ws.onopen = res; ws.onerror = rej; });
      ws.onmessage = function (ev2) { onMessage(ev2.data); };

      var target = await send('Target.createTarget', { url: 'about:blank' });
      var targetId = target.targetId;
      var attach = await send('Target.attachToTarget', { targetId: targetId, flatten: true });
      var session = attach.sessionId;

      await send('Runtime.enable', {}, session);
      await send('Page.enable', {}, session);
      await send('Log.enable', {}, session);
      await send('Emulation.setDeviceMetricsOverride',
        MOBILE
          ? { width: 390, height: 844, deviceScaleFactor: 1, mobile: true }
          : { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false },
        session);
      await send('Page.navigate', { url: INDEX }, session);

      function ev(expr) {
        return send('Runtime.evaluate', { expression: expr, returnByValue: true }, session)
          .then(function (res) {
            if (res.exceptionDetails) throw new Error('evaluate failed: ' + JSON.stringify(res.exceptionDetails));
            return res.result.value;
          });
      }

      var ready = false;
      for (var w = 0; w < 60 && !ready; w++) {
        ready = await ev('typeof window.BanglaNumbers === "object" && document.readyState === "complete" ? "yes" : "no"') === 'yes';
        if (!ready) await sleep(200);
      }
      check('app boots (BanglaNumbers loaded, DOM complete)', ready);

      // 1. Default language is Bengali.
      var h1 = await ev('document.querySelector(".brand h1").textContent');
      check('default UI language is Bengali', h1 === 'বাংলা সংখ্যা-শব্দ টুলকিট', JSON.stringify(h1));

      // 2. Empty states visible initially, results hidden.
      var empties = await ev('[["numEmpty"],["amtEmpty"],["digitEmpty"],["scaleEmpty"]].map(function(a){return !document.getElementById(a[0]).hidden;})');
      check('all 4 empty states visible initially', JSON.stringify(empties) === '[true,true,true,true]');

      // 3. Number → words: 123456789.
      await ev('document.getElementById("numInput").value="123456789"; document.getElementById("numGo").click();');
      await sleep(200);
      var words = await ev('document.getElementById("numWords").textContent');
      check('123456789 → full Bengali words',
        words === 'বারো কোটি চৌত্রিশ লক্ষ ছাপ্পান্ন হাজার সাতশত ঊননব্বই', JSON.stringify(words));
      var resShown = await ev('!document.getElementById("numResult").hidden && document.getElementById("numEmpty").hidden');
      check('number result panel shows, empty state hides', resShown === true);

      // 4. Example chip fills input and converts.
      await ev('document.querySelector("#numExamples .chip").click();');
      await sleep(200);
      var chipVal = await ev('document.getElementById("numInput").value');
      var chipWords = await ev('document.getElementById("numWords").textContent');
      check('example chip converts (75 → পঁচাত্তর)', chipVal === '75' && chipWords === 'পঁচাত্তর',
        JSON.stringify(chipVal) + ' / ' + JSON.stringify(chipWords));

      // 5. Invalid number input → error, result hidden.
      await ev('document.getElementById("numInput").value="abc"; document.getElementById("numGo").click();');
      await sleep(200);
      var errShown = await ev('!document.getElementById("numError").hidden && document.getElementById("numResult").hidden');
      check('invalid number shows error and hides result', errShown === true);
      await ev('document.getElementById("numInput").value="9999999999"; document.getElementById("numGo").click();');
      await sleep(200);
      var errShown2 = await ev('!document.getElementById("numError").hidden');
      check('10-digit number rejected', errShown2 === true);

      // 6. Amount → cheque words: 2500.50.
      await ev('document.getElementById("amtInput").value="2500.50"; document.getElementById("amtGo").click();');
      await sleep(200);
      var amt = await ev('document.getElementById("amtWords").textContent');
      check('2500.50 → cheque-style words', amt === 'দুই হাজার পাঁচশত টাকা পঞ্চাশ পয়সা মাত্র', JSON.stringify(amt));
      await ev('document.getElementById("amtInput").value="12.345"; document.getElementById("amtGo").click();');
      await sleep(200);
      var amtErr = await ev('!document.getElementById("amtError").hidden');
      check('3-decimal amount rejected', amtErr === true);

      // 7. Digit converter both directions.
      await ev('document.getElementById("digitInput").value="Order 123, total 45"; document.getElementById("toBn").click();');
      await sleep(200);
      var dout = await ev('document.getElementById("digitOut").textContent');
      check('EN→BN digit conversion', dout === 'Order ১২৩, total ৪৫', JSON.stringify(dout));
      await ev('document.getElementById("toEn").click();');
      await sleep(200);
      var dout2 = await ev('document.getElementById("digitOut").textContent');
      check('BN→EN digit conversion', dout2 === 'Order 123, total 45', JSON.stringify(dout2));

      // 8. Scale explainer: 25000000.
      await ev('document.getElementById("scaleInput").value="25000000"; document.getElementById("scaleGo").click();');
      await sleep(200);
      var sg = await ev('document.getElementById("scaleGrouping").textContent');
      var sw = await ev('document.getElementById("scaleWords").textContent');
      var sl = await ev('document.getElementById("scaleLakh").textContent');
      var sc = await ev('document.getElementById("scaleCrore").textContent');
      var sm = await ev('document.getElementById("scaleMillion").textContent');
      var sb = await ev('document.getElementById("scaleBillion").textContent');
      check('BD grouping 25000000 → 2,50,00,000', sg === '2,50,00,000', JSON.stringify(sg));
      check('scale words correct', sw === 'দুই কোটি পঞ্চাশ লক্ষ', JSON.stringify(sw));
      check('scale lakh/crore/million/billion correct',
        sl === '250' && sc === '2.5' && sm === '25' && sb === '0.03',
        [sl, sc, sm, sb].join('/'));

      // 9. Language toggle → English, persists via localStorage after reload.
      await ev('document.getElementById("langToggle").click();');
      await sleep(200);
      var h1en = await ev('document.querySelector(".brand h1").textContent');
      check('toggle switches to English UI', h1en === 'Bangla Number Words Toolkit', JSON.stringify(h1en));
      var stored = await ev('localStorage.getItem("bnw-lang")');
      check('language persisted in localStorage', stored === 'en', JSON.stringify(stored));
      await send('Page.navigate', { url: INDEX }, session);
      await sleep(1200);
      var h1re = await ev('document.querySelector(".brand h1").textContent');
      check('English UI survives reload', h1re === 'Bangla Number Words Toolkit', JSON.stringify(h1re));
      await ev('document.getElementById("langToggle").click();');
      await sleep(200);

      // 10. Copy buttons present (3 cards).
      var copies = await ev('document.querySelectorAll(".copy-btn").length');
      check('3 copy buttons present', copies === 3, 'got ' + copies);

      // 11. No horizontal overflow at this viewport.
      var overflow = await ev('document.documentElement.scrollWidth <= window.innerWidth');
      var swpx = await ev('document.documentElement.scrollWidth');
      check('no horizontal overflow (scrollWidth ' + swpx + ' <= innerWidth)', overflow === true);

      // 12. Zero console/page errors across the whole session.
      check('zero console/page errors', pageErrors.length === 0, pageErrors.slice(0, 3).join(' | '));

      try { await send('Target.closeTarget', { targetId: targetId }); } catch (e) {}
    } catch (err) {
      failed++;
      failures.push('smoke harness error: ' + err.message);
      console.log('HARNESS ERROR: ' + (err.stack || err.message));
    } finally {
      try { ws && ws.close(); } catch (e) {}
      try { chrome.kill('SIGKILL'); } catch (e) {}
      console.log('smoke (' + VIEWPORT + '): ' + passed + ' passed, ' + failed + ' failed, ' + (passed + failed) + ' total');
      if (failures.length > 0) console.log('Failures: ' + failures.join('; '));
      process.exit(failed > 0 ? 1 : 0);
    }
  })();
}

main();
