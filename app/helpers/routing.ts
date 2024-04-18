export function urlWithParams(url: string, params: { [key: string]: string }) {
  if (Object.keys(params).length == 0) {
    return url;
  } else {
    const urlSearchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
      urlSearchParams.set(key, value);
    }

    return `${url}?${urlSearchParams.toString()}`;
  }
}
