import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await req.text();
    console.log('Raw ITN body received:', body);

    const params = new URLSearchParams(body);

    // ── Step 1: Check payment status ───────────────────────────────
    const paymentStatus = params.get('payment_status');
    if (paymentStatus !== 'COMPLETE') {
      console.log('Payment not complete, status:', paymentStatus);
      return new Response('OK', { status: 200 });
    }

    // ── Step 2: Rebuild signature in ORIGINAL received order ────────
    // Critical: iterate URLSearchParams directly to preserve field order
    // Never convert to plain object before building the hash string
    const passphrase = Deno.env.get('PAYFAST_PASSPHRASE')!;
    const receivedSignature = params.get('signature');

    const hashParts: string[] = [];
    params.forEach((value, key) => {
      if (key === 'signature') return; // exclude signature field
      hashParts.push(
        `${key}=${encodeURIComponent(value.trim()).replace(/%20/g, '+')}`
      );
    });

    const stringToHash = `${hashParts.join('&')}&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`;
    
    console.log('String being hashed:', stringToHash);
    const calculatedSignature = md5(stringToHash);
    console.log('Calculated signature:', calculatedSignature);
    console.log('Received signature:  ', receivedSignature);

    if (calculatedSignature !== receivedSignature) {
      console.error('Signature mismatch — possible fraud attempt');
      return new Response('Invalid signature', { status: 400 });
    }

    // ── Step 3: Verify with PayFast server ──────────────────────────
    const verifyUrl = 'https://sandbox.payfast.co.za/eng/query/validate';

    const verifyResponse = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body,
    });

    const verifyResult = await verifyResponse.text();
    console.log('PayFast verification result:', verifyResult);

    if (verifyResult !== 'VALID') {
      console.error('PayFast rejected ITN as invalid:', verifyResult);
      return new Response('Invalid ITN', { status: 400 });
    }

    // ── Step 4: Update booking in Supabase ──────────────────────────
    const bookingId = params.get('m_payment_id');
    const payfastPaymentId = params.get('pf_payment_id');

    if (!bookingId) {
      console.error('No booking ID in ITN');
      return new Response('Missing booking ID', { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { error } = await supabase
      .from('bookings')
      .update({
        status: 'confirmed',
        payfast_payment_id: payfastPaymentId,
      })
      .eq('id', bookingId);

    if (error) {
      console.error('Failed to update booking:', error);
      return new Response('Database error', { status: 500 });
    }

    console.log('Booking confirmed successfully:', bookingId);
    return new Response('OK', { status: 200 });

  } catch (error) {
    console.error('ITN handler error:', error);
    return new Response('Internal error', { status: 500 });
  }
});

function md5(input: string): string {
  const str = unescape(encodeURIComponent(input));

  function safeAdd(x: number, y: number): number {
    const lsw = (x & 0xffff) + (y & 0xffff);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
  }

  function bitRotateLeft(num: number, cnt: number): number {
    return (num << cnt) | (num >>> (32 - cnt));
  }

  function md5cmn(q: number, a: number, b: number, x: number, s: number, t: number): number {
    return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
  }

  function md5ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn((b & c) | (~b & d), a, b, x, s, t); }
  function md5gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn((b & d) | (c & ~d), a, b, x, s, t); }
  function md5hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn(b ^ c ^ d, a, b, x, s, t); }
  function md5ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn(c ^ (b | ~d), a, b, x, s, t); }

  function str2binl(str: string): number[] {
    const bin: number[] = [];
    const mask = (1 << 8) - 1;
    for (let i = 0; i < str.length * 8; i += 8) {
      bin[i >> 5] |= (str.charCodeAt(i / 8) & mask) << i % 32;
    }
    return bin;
  }

  function binl2hex(binarray: number[]): string {
    const hexTab = '0123456789abcdef';
    let str = '';
    for (let i = 0; i < binarray.length * 4; i++) {
      str += hexTab.charAt((binarray[i >> 2] >> ((i % 4) * 8 + 4)) & 0xf) +
             hexTab.charAt((binarray[i >> 2] >> ((i % 4) * 8)) & 0xf);
    }
    return str;
  }

  function coreMD5(m: number[], l: number): number[] {
    m[l >> 5] |= 0x80 << l % 32;
    m[(((l + 64) >>> 9) << 4) + 14] = l;
    let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
    for (let i = 0; i < m.length; i += 16) {
      const olda = a, oldb = b, oldc = c, oldd = d;
      a = md5ff(a,b,c,d,m[i+0],7,-680876936); d = md5ff(d,a,b,c,m[i+1],12,-389564586);
      c = md5ff(c,d,a,b,m[i+2],17,606105819); b = md5ff(b,c,d,a,m[i+3],22,-1044525330);
      a = md5ff(a,b,c,d,m[i+4],7,-176418897); d = md5ff(d,a,b,c,m[i+5],12,1200080426);
      c = md5ff(c,d,a,b,m[i+6],17,-1473231341); b = md5ff(b,c,d,a,m[i+7],22,-45705983);
      a = md5ff(a,b,c,d,m[i+8],7,1770035416); d = md5ff(d,a,b,c,m[i+9],12,-1958414417);
      c = md5ff(c,d,a,b,m[i+10],17,-42063); b = md5ff(b,c,d,a,m[i+11],22,-1990404162);
      a = md5ff(a,b,c,d,m[i+12],7,1804603682); d = md5ff(d,a,b,c,m[i+13],12,-40341101);
      c = md5ff(c,d,a,b,m[i+14],17,-1502002290); b = md5ff(b,c,d,a,m[i+15],22,1236535329);
      a = md5gg(a,b,c,d,m[i+1],5,-165796510); d = md5gg(d,a,b,c,m[i+6],9,-1069501632);
      c = md5gg(c,d,a,b,m[i+11],14,643717713); b = md5gg(b,c,d,a,m[i+0],20,-373897302);
      a = md5gg(a,b,c,d,m[i+5],5,-701558691); d = md5gg(d,a,b,c,m[i+10],9,38016083);
      c = md5gg(c,d,a,b,m[i+15],14,-660478335); b = md5gg(b,c,d,a,m[i+4],20,-405537848);
      a = md5gg(a,b,c,d,m[i+9],5,568446438); d = md5gg(d,a,b,c,m[i+14],9,-1019803690);
      c = md5gg(c,d,a,b,m[i+3],14,-187363961); b = md5gg(b,c,d,a,m[i+8],20,1163531501);
      a = md5gg(a,b,c,d,m[i+13],5,-1444681467); d = md5gg(d,a,b,c,m[i+2],9,-51403784);
      c = md5gg(c,d,a,b,m[i+7],14,1735328473); b = md5gg(b,c,d,a,m[i+12],20,-1926607734);
      a = md5hh(a,b,c,d,m[i+5],4,-378558); d = md5hh(d,a,b,c,m[i+8],11,-2022574463);
      c = md5hh(c,d,a,b,m[i+11],16,1839030562); b = md5hh(b,c,d,a,m[i+14],23,-35309556);
      a = md5hh(a,b,c,d,m[i+1],4,-1530992060); d = md5hh(d,a,b,c,m[i+4],11,1272893353);
      c = md5hh(c,d,a,b,m[i+7],16,-155497632); b = md5hh(b,c,d,a,m[i+10],23,-1094730640);
      a = md5hh(a,b,c,d,m[i+13],4,681279174); d = md5hh(d,a,b,c,m[i+0],11,-358537222);
      c = md5hh(c,d,a,b,m[i+3],16,-722521979); b = md5hh(b,c,d,a,m[i+6],23,76029189);
      a = md5hh(a,b,c,d,m[i+9],4,-640364487); d = md5hh(d,a,b,c,m[i+12],11,-421815835);
      c = md5hh(c,d,a,b,m[i+15],16,530742520); b = md5hh(b,c,d,a,m[i+2],23,-995338651);
      a = md5ii(a,b,c,d,m[i+0],6,-198630844); d = md5ii(d,a,b,c,m[i+7],10,1126891415);
      c = md5ii(c,d,a,b,m[i+14],15,-1416354905); b = md5ii(b,c,d,a,m[i+5],21,-57434055);
      a = md5ii(a,b,c,d,m[i+12],6,1700485571); d = md5ii(d,a,b,c,m[i+3],10,-1894986606);
      c = md5ii(c,d,a,b,m[i+10],15,-1051523); b = md5ii(b,c,d,a,m[i+1],21,-2054922799);
      a = md5ii(a,b,c,d,m[i+8],6,1873313359); d = md5ii(d,a,b,c,m[i+15],10,-30611744);
      c = md5ii(c,d,a,b,m[i+6],15,-1560198380); b = md5ii(b,c,d,a,m[i+13],21,1309151649);
      a = md5ii(a,b,c,d,m[i+4],6,-145523070); d = md5ii(d,a,b,c,m[i+11],10,-1120210379);
      c = md5ii(c,d,a,b,m[i+2],15,718787259); b = md5ii(b,c,d,a,m[i+9],21,-343485551);
      a = safeAdd(a,olda); b = safeAdd(b,oldb); c = safeAdd(c,oldc); d = safeAdd(d,oldd);
    }
    return [a, b, c, d];
  }

  return binl2hex(coreMD5(str2binl(str), str.length * 8));
}