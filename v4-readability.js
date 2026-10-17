/* FIT55 4.2 — readability controls; independent of user training records. */
(function () {
  'use strict';
  const KEY = 'fit55-text-size';
  const allowed = ['standard', 'comfortable', 'extra'];
  let selected = 'comfortable';
  try {
    const stored = localStorage.getItem(KEY);
    if (allowed.includes(stored)) selected = stored;
  } catch (_) {}
  document.documentElement.dataset.fitText = selected;

  const bar = document.querySelector('.topactions');
  if (!bar) return;
  const root = document.createElement('div');
  root.className = 'type-control-container';
  root.innerHTML =
    '<button type="button" class="roundbtn type-toggle" id="fit-text-toggle" aria-label="Điều chỉnh kích thước chữ" aria-haspopup="true" aria-controls="fit-text-panel" aria-expanded="false" title="Điều chỉnh cỡ chữ">' +
       '<span class="small-aa">A</span><span>Aa</span>' +
    '</button>' +
    '<section class="type-panel" id="fit-text-panel" role="group" aria-label="Tùy chọn cỡ chữ" hidden>' +
      '<div class="type-panel-title">Cỡ chữ hiển thị</div>' +
      '<p class="type-panel-help">Chọn kích thước dễ đọc nhất. Cài đặt được lưu trên thiết bị này.</p>' +
      '<div class="type-options">' +
        '<button type="button" class="type-option" data-size="standard" aria-pressed="false"><span>Tiêu chuẩn</span><span>Aa</span></button>' +
        '<button type="button" class="type-option" data-size="comfortable" aria-pressed="false"><span>Dễ đọc · mặc định</span><span>Aa+</span></button>' +
        '<button type="button" class="type-option" data-size="extra" aria-pressed="false"><span>Rất lớn</span><span>Aa++</span></button>' +
      '</div>' +
    '</section>';

  bar.insertBefore(root, bar.firstChild);
  const toggle = root.querySelector('#fit-text-toggle');
  const panel = root.querySelector('#fit-text-panel');
  const options = [...root.querySelectorAll('[data-size]')];
  function refresh() {
    options.forEach(btn => btn.setAttribute('aria-pressed', String(btn.dataset.size === selected)));
    toggle.title = {
      standard: 'Cỡ chữ: Tiêu chuẩn',
      comfortable: 'Cỡ chữ: Dễ đọc',
      extra: 'Cỡ chữ: Rất lớn',
    }[selected] + ' · Bấm để thay đổi';
  }
  function close() {
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
  }
  function open() {
    panel.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
  }
  toggle.addEventListener('click', () => {
    if (panel.hidden) open();
    else close();
  });
  options.forEach(button => button.addEventListener('click', () => {
    selected = button.dataset.size;
    document.documentElement.dataset.fitText = selected;
    try { localStorage.setItem(KEY, selected); } catch (_) {}
    refresh();
    close();
    toggle.focus();
  }));
  document.addEventListener('click', event => {
    if (!root.contains(event.target)) close();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) {
      close();
      toggle.focus();
    }
  });
  refresh();
})();
