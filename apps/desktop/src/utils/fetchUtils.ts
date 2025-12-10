import { invoke, InvokeArgs } from '@tauri-apps/api/core';

type RequestFn = (
  url: string,
  method: string,
  body?: FormData | object
) => Promise<Response>;

export const request: RequestFn = async (url, _method, body) => {
  const result = await invoke(
    url.replace('/', '_'),
    (body as InvokeArgs) ?? {}
  );
  return result as any;
  // any is necessary because the RequestFn type is borrowed from the original web app which
  // uses HTTP requests and this does not so we can't typecheck this without weakening
  // typechecking on the web version.
};
