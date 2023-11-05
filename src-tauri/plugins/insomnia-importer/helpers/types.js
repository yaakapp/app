export function isWorkspace(obj) {
  return isJSObject(obj) && obj._type === 'workspace';
}

export function isRequestGroup(obj) {
  return isJSObject(obj) && obj._type === 'request_group';
}

export function isRequest(obj) {
  return isJSObject(obj) && obj._type === 'request';
}

export function isEnvironment(obj) {
  return isJSObject(obj) && obj._type === 'environment';
}

export function isJSObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}
