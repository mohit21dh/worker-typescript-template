import { addGenericHeadersHandler, fetchHandler, handleEventHandler, handleRequestHandler, redirectHandler, toQueryParamsStringHandler } from './handler'


function addGenericHeaders(response: Response) {
    return addGenericHeadersHandler(response)
}

async function handleEvent(event: any) {
    return handleEventHandler(event)
}

async function handleRequest(event: any, request: Request, requestOpts: any) {
    return handleRequestHandler(event, request, requestOpts)
}

function toQueryParamsString(params: any) {
    return toQueryParamsStringHandler(params)
}

async function redirect(event: any, request: Request, requestOpts: any, gid: any) {
    return redirectHandler(event, request, requestOpts, gid)
}

addEventListener("fetch", fetchHandler);
