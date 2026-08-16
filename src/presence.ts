/**
 * Live visitor count over MQTT 3.1.1 (HiveMQ public broker).
 * Tiny client — connect / subscribe / publish / ping only — so we don't
 * ship the full mqtt.js bundle. Failures fall back to showing 1.
 */

const BROKER = 'wss://broker.hivemq.com:8884/mqtt';
const TOPIC_PREFIX = 'koshur-radio/v1/presence';
const HEARTBEAT_MS = 20_000;
const STALE_MS = 90_000;
const KEEPALIVE_SEC = 30;

const utf8 = new TextEncoder();
const utf8dec = new TextDecoder();

function encodeStr(s: string): Uint8Array {
  const b = utf8.encode(s);
  const out = new Uint8Array(2 + b.length);
  out[0] = (b.length >> 8) & 0xff;
  out[1] = b.length & 0xff;
  out.set(b, 2);
  return out;
}

function remainingLength(n: number): number[] {
  const out: number[] = [];
  do {
    let digit = n % 128;
    n = Math.floor(n / 128);
    if (n > 0) digit |= 0x80;
    out.push(digit);
  } while (n > 0);
  return out;
}

function packet(typeFlags: number, body: Uint8Array): Uint8Array {
  const rl = remainingLength(body.length);
  const out = new Uint8Array(1 + rl.length + body.length);
  out[0] = typeFlags;
  out.set(rl, 1);
  out.set(body, 1 + rl.length);
  return out;
}

function concat(parts: Uint8Array[]): Uint8Array {
  const len = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(len);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

function connectPacket(clientId: string, willTopic: string): Uint8Array {
  const proto = encodeStr('MQTT');
  const client = encodeStr(clientId);
  const willT = encodeStr(willTopic);
  const willM = encodeStr('');
  const variable = new Uint8Array(proto.length + 4);
  variable.set(proto, 0);
  let i = proto.length;
  variable[i++] = 4; // protocol level 3.1.1
  // flags: username 0, password 0, will retain 1, will qos 00, will 1, clean 1, reserved 0
  variable[i++] = 0b00100110;
  variable[i++] = (KEEPALIVE_SEC >> 8) & 0xff;
  variable[i++] = KEEPALIVE_SEC & 0xff;
  return packet(0x10, concat([variable, client, willT, willM]));
}

function subscribePacket(topic: string, packetId: number): Uint8Array {
  const id = new Uint8Array([packetId >> 8, packetId & 0xff]);
  const filter = encodeStr(topic);
  const qos = new Uint8Array([0]);
  return packet(0x82, concat([id, filter, qos]));
}

function publishPacket(topic: string, payload: string, retain: boolean): Uint8Array {
  const body = concat([encodeStr(topic), utf8.encode(payload)]);
  return packet(retain ? 0x31 : 0x30, body);
}

function pingPacket(): Uint8Array {
  return new Uint8Array([0xc0, 0x00]);
}

function disconnectPacket(): Uint8Array {
  return new Uint8Array([0xe0, 0x00]);
}

function readRemainingLength(
  buf: Uint8Array,
  start: number
): { value: number; bytes: number } | null {
  let multiplier = 1;
  let value = 0;
  let bytes = 0;
  for (let i = start; i < buf.length; i++) {
    const digit = buf[i];
    value += (digit & 127) * multiplier;
    bytes += 1;
    if ((digit & 128) === 0) return { value, bytes };
    multiplier *= 128;
    if (bytes > 4) return null;
  }
  return null;
}

interface PublishMsg {
  topic: string;
  payload: string;
}

function parseMessages(buf: Uint8Array): PublishMsg[] {
  const out: PublishMsg[] = [];
  let offset = 0;
  while (offset < buf.length) {
    const header = buf[offset];
    const type = header >> 4;
    const rl = readRemainingLength(buf, offset + 1);
    if (!rl) break;
    const start = offset + 1 + rl.bytes;
    const end = start + rl.value;
    if (end > buf.length) break;
    if (type === 3) {
      const qos = (header >> 1) & 0x03;
      const tlen = (buf[start] << 8) | buf[start + 1];
      let payloadAt = start + 2 + tlen;
      if (qos > 0) payloadAt += 2;
      const topic = utf8dec.decode(buf.subarray(start + 2, start + 2 + tlen));
      const payload = utf8dec.decode(buf.subarray(payloadAt, end));
      out.push({ topic, payload });
    }
    offset = end;
  }
  return out;
}

function startPresence(onCount: (n: number) => void): void {
  onCount(1);

  const id = crypto.randomUUID();
  const topic = `${TOPIC_PREFIX}/${id}`;
  const seen = new Map<string, number>();
  let ws: WebSocket | null = null;
  let heart: number | null = null;
  let ping: number | null = null;
  let packetId = 1;
  let closed = false;

  const recount = (): void => {
    const now = Date.now();
    for (const [key, ts] of seen) {
      if (now - ts > STALE_MS) seen.delete(key);
    }
    seen.set(id, now);
    onCount(Math.max(1, seen.size));
  };

  const send = (data: Uint8Array): void => {
    if (ws?.readyState !== WebSocket.OPEN) return;
    const copy = new Uint8Array(data.byteLength);
    copy.set(data);
    ws.send(copy.buffer);
  };

  const publishOnline = (): void => {
    send(publishPacket(topic, String(Date.now()), true));
  };

  const applyMessage = (msg: PublishMsg): void => {
    if (!msg.topic.startsWith(`${TOPIC_PREFIX}/`)) return;
    const peer = msg.topic.slice(TOPIC_PREFIX.length + 1);
    if (!peer) return;
    if (!msg.payload) {
      seen.delete(peer);
      recount();
      return;
    }
    const ts = Number(msg.payload);
    if (!Number.isFinite(ts) || Date.now() - ts > STALE_MS) {
      seen.delete(peer);
    } else {
      seen.set(peer, ts);
    }
    recount();
  };

  const connect = (): void => {
    if (closed) return;
    try {
      ws = new WebSocket(BROKER, 'mqtt');
    } catch {
      return;
    }
    ws.binaryType = 'arraybuffer';

    ws.onopen = () => {
      send(connectPacket(`koshur-${id.slice(0, 12)}`, topic));
    };

    ws.onmessage = (ev: MessageEvent<ArrayBuffer>) => {
      const buf = new Uint8Array(ev.data);
      if (buf.length === 0) return;
      const type = buf[0] >> 4;
      if (type === 2 && buf.length >= 4 && buf[3] === 0) {
        send(subscribePacket(`${TOPIC_PREFIX}/+`, packetId++));
        publishOnline();
        recount();
      }
      for (const msg of parseMessages(buf)) applyMessage(msg);
    };

    ws.onclose = () => {
      if (closed) return;
      window.setTimeout(connect, 4000);
    };
  };

  heart = window.setInterval(publishOnline, HEARTBEAT_MS);
  ping = window.setInterval(() => send(pingPacket()), KEEPALIVE_SEC * 500);
  connect();

  const drop = (): void => {
    closed = true;
    if (heart !== null) window.clearInterval(heart);
    if (ping !== null) window.clearInterval(ping);
    try {
      send(publishPacket(topic, '', true));
      send(disconnectPacket());
      ws?.close();
    } catch {
      /* ignore */
    }
  };

  window.addEventListener('pagehide', drop);
  window.addEventListener('beforeunload', drop);
}

export function mountPresence(
  listenersEl: HTMLElement,
  countEl: HTMLElement
): void {
  const paint = (n: number): void => {
    countEl.textContent = String(n);
    listenersEl.hidden = false;
  };
  paint(1);
  startPresence(paint);
}
