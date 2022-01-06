import { addGenericHeadersHandler } from '../src/handler'
import makeServiceWorkerEnv from 'service-worker-mock'

declare var global: any



describe('worker', () => {
  beforeEach(() => {
    // Merge the Cloudflare Worker Environment into the global scope.
    Object.assign(global, makeServiceWorkerEnv());
    // Clear all module imports.
    jest.resetModules();
  });

  it('should test generic handler', () => {
    const resp = new Response();
    const outputResponse = addGenericHeadersHandler(resp)
    expect(resp.headers.get("Access-Control-Allow-Methods")).toBe("POST")
    expect(outputResponse.headers.get("Access-Control-Allow-Methods")).toBe("POST")
  })
});
