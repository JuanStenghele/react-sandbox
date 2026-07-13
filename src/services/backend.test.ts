import { describe, it, expect } from 'vitest'
import MockAdapter from 'axios-mock-adapter';
import backend from './backend';
import { userManager } from './auth';
import { vi } from 'vitest';
import { buildAuthUser } from '../test/utils';

vi.mock('react-oidc-context');

describe('backend', () => {
  it('attaches a Bearer token to every request', async () => {
    const testToken = 'test-token';
    const mock = new MockAdapter(backend)
    vi.spyOn(userManager, 'getUser').mockResolvedValue(buildAuthUser({ expired: false, access_token: testToken }));

    let capturedConfig;
    mock.onGet('/test').reply((config) => {
      capturedConfig = config;
      return [200, {}];
    });

    await backend.get('/test');

    expect(capturedConfig).not.toBeUndefined();
    expect(capturedConfig!.headers['Authorization']).toBe(`Bearer ${testToken}`);
  });
});
