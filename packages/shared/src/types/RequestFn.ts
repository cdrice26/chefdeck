export interface IPCResponse {
  json: () => Promise<object>;
  text: () => Promise<string>;
  ok: boolean;
  status: number;
}

type RequestFn = (
  url: string,
  method: string,
  body?: FormData | object
) => Promise<IPCResponse | Response>;

export default RequestFn;
