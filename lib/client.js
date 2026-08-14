// dsh-balance — Browser half (client module)
// Renders the DeepSeek balance as its own item in the "conversation.composer.dock"
// slot (below the built-in stats line): green "余额 ¥X", refreshed every 60s,
// gray "余额 --" while loading / on failure. No core-package patching needed.
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
      const style = {
        color: balance === null ? '#9ca3af' : '#22c55e',
        fontSize: '12px',
        lineHeight: '20px',
        textAlign: 'right',
        paddingRight: '16px',
        width: '100%',
        boxSizing: 'border-box',
        fontWeight: 600,
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap',
      };
      return react_jsx_runtime.jsx('div', {
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
