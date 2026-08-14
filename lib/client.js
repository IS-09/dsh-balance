// dsh-balance — Browser half (client module)
// Renders the DeepSeek balance as its own item in the "conversation.composer.dock"
// slot (below the built-in stats line). The leading "余" is aligned to the "输"
// of the "输入 X tok · 输出 Y tok" group in the stats line above (measured live).
// Green "余额 ¥X", refreshed every 60s; gray "余额 --" while loading / on failure.
// No core-package patching needed.
window.__ModuleLoader__.load({
  id: 'dsh-balance',
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

    let react = require('react');
    let react_jsx_runtime = require('react/jsx-runtime');

    const BalanceLine = react.memo(function BalanceLine() {
      const [balance, setBalance] = react.useState(null);
      const [offset, setOffset] = react.useState(null);
      const ref = react.useRef(null);

      react.useEffect(() => {
        let alive = true;
        const refresh = () => {
          fetch('/api/dsh-balance', { headers: { accept: 'application/json' } })
            .then((r) => {
              if (!r.ok) throw new Error('http ' + r.status);
              return r.json();
            })
            .then((data) => {
              if (alive) setBalance(data && data.ok ? String(data.balance) : null);
            })
            .catch(() => {
              if (alive) setBalance(null);
            });
        };
        refresh();
        const timer = setInterval(refresh, 60000);
        return () => {
          alive = false;
          clearInterval(timer);
        };
      }, []);

      // 对齐测量（实时跟随）：统计行是居中布局，token 数字变化会让 "输入" 左右漂移。
      // 监听 dock 容器子树 DOM 变更（统计行更新必然产生变更）+ rAF 合并重测，
      // 另加 2 秒兜底轮询 —— 保证 "余" 始终与 "输" 对齐。
      react.useEffect(() => {
        const el0 = ref.current;
        const parent0 = el0 !== null && el0.parentElement !== null ? el0.parentElement : null;
        let raf = 0;
        const measure = () => {
          const el = ref.current;
          if (el === null) return;
          const parent = el.parentElement;
          if (parent === null) return;
          let tokens = null;
          for (const child of parent.children) {
            if (tokens !== null) break;
            const spans = child.querySelectorAll ? Array.from(child.querySelectorAll('span')) : [];
            for (const s of spans) {
              const text = s.textContent || '';
              if (text.indexOf('\u8f93\u5165') === 0 || text.indexOf('Input') === 0) {
                tokens = s;
                break;
              }
            }
          }
          if (tokens !== null) {
            setOffset(tokens.getBoundingClientRect().left - el.getBoundingClientRect().left);
          }
        };
        const schedule = () => {
          if (raf !== 0) return;
          raf = requestAnimationFrame(() => {
            raf = 0;
            measure();
          });
        };
        measure();
        let mo = null;
        if (typeof MutationObserver !== 'undefined' && parent0 !== null) {
          mo = new MutationObserver(schedule);
          mo.observe(parent0, { childList: true, subtree: true, characterData: true });
        }
        let ro = null;
        if (typeof ResizeObserver !== 'undefined') {
          ro = new ResizeObserver(schedule);
          ro.observe(document.body);
        }
        const timer = setInterval(measure, 2000);
        return () => {
          if (raf !== 0) cancelAnimationFrame(raf);
          if (mo !== null) mo.disconnect();
          if (ro !== null) ro.disconnect();
          clearInterval(timer);
        };
      }, []);

      const style = {
        color: balance === null ? '#9ca3af' : '#22c55e',
        fontSize: '12px',
        lineHeight: '20px',
        textAlign: 'left',
        paddingLeft: offset === null ? 0 : offset + 'px',
        width: '100%',
        boxSizing: 'border-box',
        fontWeight: 600,
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap',
      };
      return react_jsx_runtime.jsx('div', {
        ref,
        style,
        children: balance === null ? '\u4f59\u989d --' : '\u4f59\u989d \u00a5' + balance,
      });
    });

    const NS = 'dsh-balance';
    const zh = {
      'stats.balance': '余额 {balance} {currency}',
      'stats.balanceEmpty': '余额 --',
      'settings.title': '余额显示',
    };
    const en = {
      'stats.balance': 'Balance {balance} {currency}',
      'stats.balanceEmpty': 'Balance --',
      'settings.title': 'Balance display',
    };
    const inject = ['slots', 'locale'];

    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-balance: dictionaries');
      ctx.slots.register(
        {
          name: 'conversation.composer.dock',
          id: 'dsh-balance',
          order: 1,
          locale: NS,
        },
        BalanceLine,
      );
    }

    exports.BalanceLine = BalanceLine;
    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  },
});
