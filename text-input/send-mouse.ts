/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

type MouseCommand =
  | {type: 'move'; position: [number, number]}
  | {type: 'down' | 'up'};

export async function sendMouse(payload: MouseCommand) {
  const sessionId = new URL(window.location.href).searchParams.get(
    'wtr-session-id',
  );
  if (typeof sessionId !== 'string') {
    throw new Error('Web Test Runner session is missing.');
  }
  const socketUrl = '/__web-dev-server__web-socket.js';
  const webSocketModule: {
    sendMessageWaitForResponse(message: object): Promise<{executed?: boolean}>;
  } = await import(socketUrl);
  const response = await webSocketModule.sendMessageWaitForResponse({
    type: 'wtr-command',
    sessionId,
    command: 'send-mouse',
    payload,
  });
  if (!response.executed) {
    throw new Error('Unknown command send-mouse.');
  }
}
