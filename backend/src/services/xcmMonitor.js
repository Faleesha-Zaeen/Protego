const { ApiPromise, WsProvider } = require('@polkadot/api');

const RPC_ENDPOINT = 'wss://rpc.polkadot.io';
const MAX_EVENTS = 30;
const xcmSections = new Set(['xcmPallet', 'xcmpQueue', 'dmpQueue', 'polkadotXcm']);

let events = [];
let apiInstance;
let monitorStarted = false;

const DESTINATION_KEYS = ['destination', 'dest', 'paraid', 'parachain', 'target', 'chain'];
const SENDER_KEYS = ['sender', 'account', 'who', 'origin', 'source'];
const AMOUNT_KEYS = ['amount', 'value', 'balance', 'fungible'];

function traversePayload(node, visitor, key = null) {
  if (node === undefined || node === null) {
    return undefined;
  }
  const directResult = visitor(node, key);
  if (directResult !== undefined) {
    return directResult;
  }

  if (Array.isArray(node)) {
    for (const item of node) {
      const nested = traversePayload(item, visitor);
      if (nested !== undefined) {
        return nested;
      }
    }
    return undefined;
  }

  if (typeof node === 'object') {
    for (const [childKey, childValue] of Object.entries(node)) {
      const nested = traversePayload(childValue, visitor, childKey);
      if (nested !== undefined) {
        return nested;
      }
    }
  }

  return undefined;
}

function extractDestinationChain(payload) {
  const result = traversePayload(payload, (value, key) => {
    if (!key) {
      return undefined;
    }
    const normalizedKey = key.toLowerCase();
    if (DESTINATION_KEYS.includes(normalizedKey)) {
      return formatDestination(value);
    }
    if (normalizedKey.includes('parachain')) {
      return formatDestination(value);
    }
    return undefined;
  });

  return result || 'unknown';
}

function formatDestination(value) {
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number') {
    return `Parachain ${value}`;
  }
  if (typeof value === 'object') {
    if (typeof value.Parachain === 'number' || typeof value.parachain === 'number') {
      const chainId = value.Parachain ?? value.parachain;
      return `Parachain ${chainId}`;
    }
    if (value.interior?.X1?.length) {
      const x1 = value.interior.X1[0];
      if (typeof x1?.Parachain === 'number') {
        return `Parachain ${x1.Parachain}`;
      }
      if (typeof x1?.parachain === 'number') {
        return `Parachain ${x1.parachain}`;
      }
    }
    if (value.id) {
      return String(value.id);
    }
  }
  return null;
}

function extractSender(payload) {
  return (
    traversePayload(payload, (value, key) => {
      if (!key) {
        return undefined;
      }
      if (SENDER_KEYS.includes(key.toLowerCase())) {
        if (typeof value === 'string') {
          return value;
        }
        if (value?.id) {
          return value.id;
        }
        if (value?.address) {
          return value.address;
        }
      }
      return undefined;
    }) || 'unknown'
  );
}

function extractAmount(payload) {
  const result = traversePayload(payload, (value, key) => {
    if (!key) {
      return undefined;
    }
    if (AMOUNT_KEYS.includes(key.toLowerCase())) {
      return coerceNumeric(value);
    }
    if (typeof value === 'object' && value?.Fungible !== undefined) {
      return coerceNumeric(value.Fungible);
    }
    return undefined;
  });

  return result ?? 0;
}

function coerceNumeric(value) {
  if (value === undefined || value === null) {
    return 0;
  }
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const normalized = value.replace(/[^0-9.]/g, '');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (typeof value === 'bigint') {
    return Number(value);
  }
  if (typeof value === 'object') {
    if (value?.toNumber) {
      try {
        return value.toNumber();
      } catch (err) {
        return 0;
      }
    }
  }
  return 0;
}

async function initXcmMonitor() {
  try {
    const provider = new WsProvider(RPC_ENDPOINT);
    apiInstance = await ApiPromise.create({ provider });

    await apiInstance.isReady;

    apiInstance.query.system.events(async (records) => {
      try {
        const header = await apiInstance.rpc.chain.getHeader();
        const blockNumber = header.number.toNumber();
        const timestamp = Date.now();

        records.forEach(({ event }) => {
          const section = event.section;
          if (!xcmSections.has(section)) {
            return;
          }

          const humanData = event.toHuman ? event.toHuman() : null;
          const entry = {
            blockNumber,
            section,
            method: event.method,
            timestamp,
            destinationChain: extractDestinationChain(humanData),
            amount: extractAmount(humanData),
            sender: extractSender(humanData),
          };

          events.unshift(entry);
          if (events.length > MAX_EVENTS) {
            events = events.slice(0, MAX_EVENTS);
          }

          console.log('[XCM]', entry);
        });
      } catch (err) {
        console.error('Failed to process XCM events', err);
      }
    });
  } catch (err) {
    console.error('Failed to initialize XCM monitor', err);
  }
}

async function startXcmMonitor() {
  if (monitorStarted) {
    return;
  }
  monitorStarted = true;
  await initXcmMonitor();
}

function getXcmEvents() {
  return events;
}

startXcmMonitor();

module.exports = {
  getXcmEvents,
  startXcmMonitor,
};
