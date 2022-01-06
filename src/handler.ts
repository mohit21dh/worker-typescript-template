const stg = "http://stg3.dh-discovery-staging.net";
const timeout = 4000;
const headerCluster = "X-DISCO-CLUSTER";
const headerVersion = "X-DISCO-WORKER";
const destinationBaseUrl = "X-DESTINATION-BASE-URL";
const version = "3.1.1";
const fallback = stg;
const redirects = new Map([
  ["HS_SA", stg],
  ["FP_DE", stg]
]);
const newSwimlanesPath = "/swimlanes-shared/api/v3/swimlanes";

export function addGenericHeadersHandler(response: any) {
  response.headers.set('Access-Control-Allow-Headers', '*');
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST');
  response.headers.set('Access-Control-Expose-Headers', 'X-REQUEST-ID');
  response.headers.set(headerVersion, version);
  return response
}

export async function handleEventHandler(event: any) {
  const request = new Request(event.request);
  const cfRequestID = request.headers.get('cf-request-id');
  if (cfRequestID) {
    request.headers.append('X-REQUEST-ID', cfRequestID);
  }
  const requestOpts = {
    method: request.method,
    headers: request.headers
  };

  if (request.method === 'POST') {
    return handleRequestHandler(event, request, requestOpts);
  } else {
    return addGenericHeadersHandler(new Response("Unsupported method", { status: 405 }));
  }
}


export async function handleRequestHandler(event: any, request: Request, requestOpts: any) {
  const body: any = await request.json();

  if (body.gid && body.config) {
    const gid = body.gid;
    const url = new URL(request.url);
    url.search = toQueryParamsStringHandler({
      gid: gid,
      config: body.config
    });
    requestOpts.body = JSON.stringify(body);
    const newRequest = new Request(url.toString(), new Request(request, requestOpts));
    return redirectHandler(event, newRequest, requestOpts, gid);
  } else {
    return addGenericHeadersHandler(new Response("Missing gid or configuration", { status: 400 }));
  }
}

export function toQueryParamsStringHandler(params: any) {
  return "?" + Object.keys(params).map(key => `${key}=${params[key]}`).join('&');
}

export async function redirectHandler(event: any, request: Request, requestOpts: any, gid: any) {
  const base = redirects.get(gid) || fallback;
  const url = new URL(request.url);
  const baseUrl = base + newSwimlanesPath;
  const destinationURL = baseUrl + url.search;
  const newRequest = fetch(new Request(destinationURL, requestOpts));
  const timeoutPromise = new Promise(resolve => setTimeout(resolve, timeout, 0));

  let response: any = await Promise.race([newRequest, timeoutPromise]);
  const cluster = base.substring(base.lastIndexOf("/") + 1, base.indexOf("."));
  response = new Response(response.body, response);
  response.headers.set(headerCluster, cluster);
  response.headers.set(destinationBaseUrl, baseUrl);

  return addGenericHeadersHandler(response);
}

export function fetchHandler(event: any) {
  const method = event.request.method;
  if (method === "POST") {
    event.respondWith(handleEventHandler(event));
  }
}
