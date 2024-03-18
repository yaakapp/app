export function isWorkspace(obj) {
  return isJSObject(obj) && obj._type === 'workspace';
}

export function isRequestGroup(obj) {
  return isJSObject(obj) && obj._type === 'request_group';
}

export function isHttpRequest(obj) {
  return isJSObject(obj) && obj._type === 'request';
}

export function isGrpcRequest(obj) {
  return isJSObject(obj) && obj._type === 'grpc_request';
}

export function isEnvironment(obj) {
  return isJSObject(obj) && obj._type === 'environment';
}

export function isJSObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

export function isJSString(obj) {
  return Object.prototype.toString.call(obj) === '[object String]';
}
