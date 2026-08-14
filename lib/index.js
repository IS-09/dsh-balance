// dsh-balance — Host half (cordis plugin)
// GET /api/dsh-balance -> DeepSeek open-platform /user/balance
// API key is read from ~/.dsh/.credentials.yaml (DEEPSEEK_API_KEY).
// The browser half renders the balance under the composer stats line.
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

export const name = 'dsh-balance';
export const inject = ['webServer'];

function loadKey() {
  try {
    const text = readFileSync(join(homedir(), '.dsh', '.credentials.yaml'), 'utf8');
    const match = text.match(/^DEEPSEEK_API_KEY:\s*["']?([^\s"']+)["']?\s*$/m);
    return match ? match[1] : '';
  } catch {
    return '';
  }
}

export function apply(ctx) {
  ctx.webServer.register({
    kind: 'exact',
    path: '/api/dsh-balance',
    handler(req, res) {
      const done = (status, body) => {
        res.writeHead(status, {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'no-store',
        });
        res.end(JSON.stringify(body));
      };
      const key = loadKey();
      if (!key) {
        done(500, { ok: false, error: 'DEEPSEEK_API_KEY not found in ~/.dsh/.credentials.yaml' });
        return;
      }
      let signal;
      try {
        signal = AbortSignal.timeout(15000);
      } catch {
        signal = undefined;
      }
      fetch('https://api.deepseek.com/user/balance', {
        headers: { Authorization: `Bearer ${key}` },
        signal,
      })
        .then((r) => r.json())
        .then((data) => {
          const info = Array.isArray(data.balance_infos) && data.balance_infos[0] ? data.balance_infos[0] : {};
          done(200, {
            ok: true,
            isAvailable: data.is_available === true,
            balance: info.total_balance ?? null,
            currency: info.currency ?? 'CNY',
            granted: info.granted_balance ?? null,
            toppedUp: info.topped_up_balance ?? null,
          });
        })
        .catch((error) => {
          done(502, { ok: false, error: String(error && error.message ? error.message : error) });
        });
    },
  });
}
