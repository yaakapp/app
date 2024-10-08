import { useSetAtom } from 'jotai/index';
import { useEffect } from 'react';
import { invokeCmd } from '../lib/tauri';
import { useActiveWorkspace } from './useActiveWorkspace';
import { cookieJarsAtom } from './useCookieJars';
import { environmentsAtom } from './useEnvironments';
import { foldersAtom } from './useFolders';
import { grpcConnectionsAtom } from './useGrpcConnections';
import { grpcRequestsAtom } from './useGrpcRequests';
import { httpRequestsAtom } from './useHttpRequests';
import { httpResponsesAtom } from './useHttpResponses';

export function useSyncWorkspaceChildModels() {
  const setCookieJars = useSetAtom(cookieJarsAtom);
  const setFolders = useSetAtom(foldersAtom);
  const setHttpRequests = useSetAtom(httpRequestsAtom);
  const setHttpResponses = useSetAtom(httpResponsesAtom);
  const setGrpcConnections = useSetAtom(grpcConnectionsAtom);
  const setGrpcRequests = useSetAtom(grpcRequestsAtom);
  const setEnvironments = useSetAtom(environmentsAtom);

  const workspace = useActiveWorkspace();
  const workspaceId = workspace?.id ?? 'n/a';
  useEffect(() => {
    (async function () {
      setCookieJars(await invokeCmd('cmd_list_cookie_jars', { workspaceId }));
      setFolders(await invokeCmd('cmd_list_folders', { workspaceId }));
      setHttpRequests(await invokeCmd('cmd_list_http_requests', { workspaceId }));
      setHttpResponses(await invokeCmd('cmd_list_http_responses', { workspaceId }));
      setGrpcConnections(await invokeCmd('cmd_list_grpc_connections', { workspaceId }));
      setGrpcRequests(await invokeCmd('cmd_list_grpc_requests', { workspaceId }));
      setEnvironments(await invokeCmd('cmd_list_environments', { workspaceId }));
    })().catch(console.error);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);
}
